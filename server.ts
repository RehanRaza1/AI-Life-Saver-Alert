import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import twilio from 'twilio';
import { db } from './src/db/firebase.js';
import { retrieveRAGDocs, RAG_CORPUS } from './src/db/rag.js';

const app = express();
const PORT = 3000;

// Enable JSON and URL-encoded body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Lazy-loaded Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is required');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function generateContentWithFallback(ai: any, params: any) {
  const modelsToTry = [
    params.model,
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro',
    'gemini-3.1-pro-preview'
  ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i); // unique list of models

  let lastError: any = null;

  for (const model of modelsToTry) {
    let retries = 3;
    let delay = 500; // 500ms initial delay

    while (retries > 0) {
      try {
        console.log(`Attempting generateContent with model: ${model}, retries remaining: ${retries}`);
        return await ai.models.generateContent({
          ...params,
          model: model
        });
      } catch (error: any) {
        lastError = error;
        const errorMessage = String(error?.message || error || '').toLowerCase();

        // Quota / Rate limit error means we should NOT retry this model. Switch immediately to a different model's quota pool.
        const isQuotaOrRateLimit = errorMessage.includes('429') ||
                                   errorMessage.includes('limit') ||
                                   errorMessage.includes('quota') ||
                                   errorMessage.includes('resource_exhausted') ||
                                   errorMessage.includes('resourceexhausted') ||
                                   errorMessage.includes('exhausted');

        const isTransient = errorMessage.includes('503') || 
                            errorMessage.includes('unavailable') || 
                            errorMessage.includes('high demand') || 
                            errorMessage.includes('temporary');

        if (isQuotaOrRateLimit) {
          console.warn(`Model ${model} hit quota or rate limit. Switching model immediately to utilize alternative quota...`, error);
          break; // Switch to the next model immediately
        }

        if (isTransient && retries > 1) {
          console.warn(`Transient error on model ${model} (503/UNAVAILABLE). Retrying in ${delay}ms...`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          retries--;
        } else {
          console.warn(`Model ${model} failed permanently or exhausted retries. Trying next model...`, error);
          break; // Try the next model
        }
      }
    }
  }

  throw lastError || new Error("All fallback models failed to generate content.");
}

function cleanAndFormatHistory(history: any[]): any[] {
  const cleaned: any[] = [];
  let expectedRole: 'user' | 'model' = 'user';
  
  for (const msg of history) {
    const role = msg.role === 'user' ? 'user' : 'model';
    if (role === expectedRole) {
      const textContent = (msg.content || '').trim();
      
      // Critical Gemini requirement: never send empty text values in a part
      const safeText = textContent || (msg.imageSrc ? "User shared a clinical visual image for diagnostic analysis." : "Hello doctor");
      
      cleaned.push({
        role: role,
        parts: [{ text: safeText }]
      });
      expectedRole = expectedRole === 'user' ? 'model' : 'user';
    }
  }
  
  // Make sure it ends with a model response so the next message we append can be 'user'
  while (cleaned.length > 0 && cleaned[cleaned.length - 1].role === 'user') {
    cleaned.pop();
  }
  
  return cleaned;
}

// Lazy-loaded Twilio client with dynamic config support
interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  sandboxKeyword: string;
  emergencyNumber: string;
}

async function getTwilioConfig(): Promise<TwilioConfig> {
  let dbConfig: any = {};
  try {
    const doc = await db.collection('twilio_settings').doc('global_config').get();
    if (doc.exists) {
      dbConfig = doc.data() || {};
    }
  } catch (err) {
    console.warn('Could not load Twilio config from Firestore:', err);
  }

  const accountSid = dbConfig.accountSid || process.env.TWILIO_ACCOUNT_SID || '';
  const authToken = dbConfig.authToken || process.env.TWILIO_AUTH_TOKEN || '';
  const fromNumber = dbConfig.fromNumber || process.env.TWILIO_FROM_NUMBER || '+14155238886';
  
  let sandboxKeyword = dbConfig.sandboxKeyword || process.env.TWILIO_SANDBOX_KEYWORD || 'join mile-sale';
  if (!sandboxKeyword.toLowerCase().startsWith('join ')) {
    sandboxKeyword = `join ${sandboxKeyword}`;
  }

  const emergencyNumber = dbConfig.emergencyNumber || process.env.TWILIO_EMERGENCY_NUMBER || '';

  return {
    accountSid,
    authToken,
    fromNumber,
    sandboxKeyword,
    emergencyNumber
  };
}

async function getTwilioClient() {
  const config = await getTwilioConfig();
  if (!config.accountSid || !config.authToken) {
    throw new Error('Twilio credentials (TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN) are missing. Please configure them in the Twilio Settings panel.');
  }
  return twilio(config.accountSid, config.authToken);
}

// Global TTS Buffer Cache for crisis call
let ttsCache: Buffer | null = null;

// Types for session mapping
interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageSrc?: string;
  timestamp: string;
  escalationTriggered?: boolean;
  toolUsed?: string;
}

interface MoodEntry {
  id: string;
  timestamp: string;
  mood: string;
  note: string;
}

interface SessionData {
  messages: Message[];
  moods: MoodEntry[];
}

interface Therapist {
  name: string;
  address: string;
  phone?: string;
}

// Load and save sessions in Firestore
async function getSessionData(id: string): Promise<SessionData> {
  try {
    const docRef = db.collection('sessions').doc(id);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      return {
        messages: data?.messages || [],
        moods: data?.moods || [],
      };
    }
  } catch (error) {
    console.error(`Error fetching session data for ${id}:`, error);
  }
  return { messages: [], moods: [] };
}

async function saveSessionData(id: string, data: SessionData): Promise<void> {
  try {
    const docRef = db.collection('sessions').doc(id);
    await docRef.set(data, { merge: true });
  } catch (error) {
    console.error(`Error saving session data for ${id}:`, error);
  }
}

// Google Maps Therapist Search
async function searchTherapists(locationName: string, customApiKey?: string): Promise<Therapist[]> {
  const apiKey = customApiKey || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_MAPS_API_KEY / customApiKey is missing');
    return [];
  }
  try {
    // 1. Geocode location name
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(locationName)}&key=${apiKey}`;
    const geoRes = await fetch(geocodeUrl);
    if (!geoRes.ok) throw new Error('Geocoding request failed');
    const geoData: any = await geoRes.json();
    if (!geoData.results || geoData.results.length === 0) {
      return [];
    }
    const { lat, lng } = geoData.results[0].geometry.location;

    // 2. Search nearby places (radius 5km)
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=Psychotherapist&key=${apiKey}`;
    const placesRes = await fetch(placesUrl);
    if (!placesRes.ok) throw new Error('Places nearby search failed');
    const placesData: any = await placesRes.json();
    const results = placesData.results || [];
    const topResults = results.slice(0, 5);

    // 3. Fetch Place details (phone numbers) in parallel
    const therapists: Therapist[] = await Promise.all(
      topResults.map(async (place: any): Promise<Therapist> => {
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number&key=${apiKey}`;
        try {
          const detailRes = await fetch(detailUrl);
          if (detailRes.ok) {
            const detailData: any = await detailRes.json();
            const p = detailData.result;
            return {
              name: p.name || place.name,
              address: p.formatted_address || place.vicinity || 'Address not available',
              phone: p.formatted_phone_number || 'Phone not available',
            };
          }
        } catch (e) {
          console.error(`Error fetching place details for ${place.place_id}:`, e);
        }
        return {
          name: place.name,
          address: place.vicinity || 'Address not available',
          phone: 'Phone not available',
        };
      })
    );
    return therapists;
  } catch (error) {
    console.error('Failed to search therapists:', error);
    return [];
  }
}

// Google Text-to-Speech API Integration
async function generateTTS(text: string, customApiKey?: string): Promise<Buffer | null> {
  const apiKey = customApiKey || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY / customApiKey is missing, skipping Google Cloud TTS. System will fall back to Twilio built-in TTS.');
    return null;
  }
  try {
    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: {
          languageCode: 'en-US',
          name: 'en-US-Neural2-F',
          ssmlGender: 'FEMALE',
        },
        audioConfig: {
          audioEncoding: 'MP3',
        },
      }),
    });
    if (!response.ok) {
      const errBody = await response.text();
      console.warn('Google Text-to-Speech API is not available or restricted on this key. Falling back gracefully to Twilio built-in <Say> TTS. API response:', errBody);
      return null;
    }
    const data: any = await response.json();
    if (data.audioContent) {
      return Buffer.from(data.audioContent, 'base64');
    }
  } catch (error) {
    console.error('Error in Google Text-to-Speech generation, falling back to Twilio built-in TTS:', error);
  }
  return null;
}

// System instructions for the therapist and medical agent
const SYSTEM_PROMPT = `
You are "AI Life Saver Alert" (also known as "AI Psychologist & Medical Doctor Assistant"), an empathetic, warm, and professional clinical psychologist and medical health consultant developed by Rehan (represented by a soothing 'R' logo branding).

Your main responsibility is to support the user's mental wellbeing and physical health with active listening, clinical expertise, accurate diagnoses, medical explanations, and evidence-informed practical techniques. You act as an expert general medical companion (with the precision of MedGemma) as well as an empathetic psychologist.

CRITICAL BEHAVIORS:
1. Always be empathetic, non-judgmental, clear, and medically accurate. Keep responses natural, concise, and highly helpful.
2. Do NOT restrict yourself to only mental psychology. If the user asks about physical symptoms, body diseases, hair/skin problems, hospitals, or any other physical medical issue, you MUST provide correct, detailed, clinical medical answers and treatment guidance. Never deflect or state that you cannot diagnose physical conditions. Always answer like a caring, knowledgeable doctor.
3. If the user mentions current feelings or check-ins, trigger the "log_mood" tool.
4. If the user asks about how they have been doing, review their recent mood history (provided in system context) and weave insights in naturally.
5. If the user is anxious or asks for coping help, offer/trigger "coping_exercise" ("breathing" 4-7-8, "grounding" 5-4-3-2-1, or "journaling" prompts).
6. If the user asks for professional help in a location, trigger "find_therapist" with the location name.
7. CRITICAL SAFETY PROTOCOL: If the user expresses active, current intent to self-harm, suicidal ideation, or is in an active life-threatening crisis, trigger "emergency_escalation" immediately. Explicitly mention in your response that you are triggering an emergency contact line for them. Do NOT escalate silently.
8. Redirect unrelated non-health requests (e.g. programming, math, general trivia) politely back to medical and mental health topics.
9. When analyzing health/medical/clinical images (such as hair/skin problems, scalp issues, dandruff, rashes, body diseases, etc.), perform a professional clinical visual assessment and provide an accurate medical analysis. In your "reply" text, you MUST clearly organize your response with the following human-friendly medical guide:
   - **Probable Condition / Identification**: (e.g. Dandruff, Seborrheic Dermatitis, Psoriasis, eczema, etc.)
   - **Symptom Overview**: (What are the common symptoms of this condition)
   - **Prevention & Causes**: (What causes it and how to prevent it)
   - **Care & Remedies**: (Daily routine adjustments, over-the-counter remedies, and supportive self-care)
   - **Doctor Consultation Recommendation**: (A brief disclaimer recommending seeking a professional clinic if symptoms persist or worsen)

You MUST respond strictly in JSON matching the specified schema.
`;

// API Endpoints

// Patient Authentication & Profile APIs
app.post('/api/auth/register', async (req, res) => {
  const { name, phone, emergencyContactName, emergencyContactPhone, passcode, sessionId } = req.body;
  if (!name || !phone || !emergencyContactName || !emergencyContactPhone || !passcode || !sessionId) {
    res.status(400).json({ error: 'All fields are required.' });
    return;
  }

  try {
    const phoneNormalized = phone.trim().replace(/\D/g, '');
    const patientRef = db.collection('patients').doc(phoneNormalized);
    const patientSnap = await patientRef.get();

    if (patientSnap.exists) {
      res.status(400).json({ error: 'A patient with this mobile number is already registered.' });
      return;
    }

    const patientData = {
      id: phoneNormalized,
      name: name.trim(),
      phone: phone.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      passcode: passcode.trim(),
      createdAt: new Date().toISOString()
    };

    await patientRef.set(patientData);

    // Link current session to this patient
    const sessionRef = db.collection('sessions').doc(sessionId);
    await sessionRef.set({
      patientId: phoneNormalized,
      patient: {
        name: patientData.name,
        phone: patientData.phone,
        emergencyContactName: patientData.emergencyContactName,
        emergencyContactPhone: patientData.emergencyContactPhone
      }
    }, { merge: true });

    res.status(200).json({ message: 'Registration successful', patient: patientData });
  } catch (err: any) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: err.message || 'Failed to register patient.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { phone, passcode, sessionId } = req.body;
  if (!phone || !passcode || !sessionId) {
    res.status(400).json({ error: 'Phone number, passcode, and session ID are required.' });
    return;
  }

  try {
    const phoneNormalized = phone.trim().replace(/\D/g, '');
    const patientRef = db.collection('patients').doc(phoneNormalized);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      res.status(404).json({ error: 'Patient with this mobile number not found.' });
      return;
    }

    const patientData = patientSnap.data();
    if (patientData?.passcode !== passcode.trim()) {
      res.status(401).json({ error: 'Invalid passcode.' });
      return;
    }

    // Link current session to this patient
    const sessionRef = db.collection('sessions').doc(sessionId);
    await sessionRef.set({
      patientId: phoneNormalized,
      patient: {
        name: patientData.name,
        phone: patientData.phone,
        emergencyContactName: patientData.emergencyContactName,
        emergencyContactPhone: patientData.emergencyContactPhone
      }
    }, { merge: true });

    res.status(200).json({ message: 'Login successful', patient: patientData });
  } catch (err: any) {
    console.error('Login failed:', err);
    res.status(500).json({ error: err.message || 'Failed to login.' });
  }
});

app.post('/api/auth/reset-passcode', async (req, res) => {
  const { phone, emergencyPhone, newPasscode } = req.body;
  if (!phone || !emergencyPhone || !newPasscode) {
    res.status(400).json({ error: 'Registered phone, emergency contact phone, and new passcode are required.' });
    return;
  }

  try {
    const phoneNormalized = phone.trim().replace(/\D/g, '');
    const emergencyPhoneNormalized = emergencyPhone.trim().replace(/\D/g, '');
    
    const patientRef = db.collection('patients').doc(phoneNormalized);
    const patientSnap = await patientRef.get();

    if (!patientSnap.exists) {
      res.status(404).json({ error: 'Patient with this registered phone number was not found.' });
      return;
    }

    const patientData = patientSnap.data();
    const storedEmergencyPhone = (patientData?.emergencyContactPhone || '').trim().replace(/\D/g, '');

    if (storedEmergencyPhone !== emergencyPhoneNormalized) {
      res.status(400).json({ error: 'Verification failed. The emergency contact phone number does not match our records.' });
      return;
    }

    // Update the passcode
    await patientRef.set({
      passcode: newPasscode.trim()
    }, { merge: true });

    res.status(200).json({ message: 'Passcode successfully reset.' });
  } catch (err: any) {
    console.error('Passcode reset failed:', err);
    res.status(500).json({ error: err.message || 'Failed to reset passcode.' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const { sessionId } = req.query;
  if (!sessionId) {
    res.status(400).json({ error: 'Session ID is required.' });
    return;
  }

  try {
    const sessionRef = db.collection('sessions').doc(sessionId as string);
    const sessionSnap = await sessionRef.get();
    
    if (sessionSnap.exists) {
      const sData = sessionSnap.data();
      if (sData?.patientId) {
        const patientSnap = await db.collection('patients').doc(sData.patientId).get();
        if (patientSnap.exists) {
          res.status(200).json({ patient: patientSnap.data() });
          return;
        }
      } else if (sData?.patient) {
        res.status(200).json({ patient: sData.patient });
        return;
      }
    }
    res.status(404).json({ error: 'No active patient login found for this session.' });
  } catch (err: any) {
    console.error('Failed to get current patient profile:', err);
    res.status(500).json({ error: err.message || 'Failed to load profile.' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    res.status(400).json({ error: 'Session ID is required.' });
    return;
  }

  try {
    const sessionRef = db.collection('sessions').doc(sessionId);
    await sessionRef.set({
      patientId: null,
      patient: null
    }, { merge: true });
    res.status(200).json({ message: 'Successfully signed out from session.' });
  } catch (err: any) {
    console.error('Logout failed:', err);
    res.status(500).json({ error: err.message || 'Failed to logout.' });
  }
});

app.get('/api/session/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    res.status(400).json({ error: 'Session ID is required.' });
    return;
  }
  try {
    const sessionData = await getSessionData(sessionId);
    res.status(200).json({
      messages: sessionData.messages || [],
      moods: sessionData.moods || []
    });
  } catch (err: any) {
    console.error('Failed to fetch session history:', err);
    res.status(500).json({ error: err.message || 'Failed to load session history.' });
  }
});

// 1. Chat Response API
app.post('/api/chat', async (req, res) => {
  const { message, image, sessionId, googleMapsApiKey } = req.body;
  if (!sessionId) {
    res.status(400).json({ error: 'Session ID is required.' });
    return;
  }

  try {
    // Retrieve session data from Firestore
    const sessionData = await getSessionData(sessionId);
    const { messages: history, moods } = sessionData;

    // Add current message (and image if uploaded)
    const safeUserMessage = (message || '').trim() || (image ? "Please analyze this clinical/medical image. Provide your professional clinical diagnosis, symptoms, causes, prevention, and care recommendations." : "Hello doctor");

    // Perform RAG retrieval to get grounded clinical or psychological context
    const retrievedDocs = retrieveRAGDocs(safeUserMessage, 2);
    let ragContext = '';
    if (retrievedDocs.length > 0) {
      ragContext = `\n\n[RETRIEVED CLINICAL KNOWLEDGE FACTS (RAG GROUNDING)]\n` + 
        retrievedDocs.map(doc => `Topic: ${doc.title}\nCategory: ${doc.category}\nContent Reference:\n${doc.content}`).join('\n---\n');
    }

    // Load recent mood entries context
    const recentMoodsContext = moods.slice(-14).map(m => `[${m.timestamp}] Mood: ${m.mood}. Note: ${m.note}`).join('\n');

    // Build contents for Gemini with safe, alternating history
    const contents = cleanAndFormatHistory(history.slice(-20));
    
    // Add context system prompt with RAG context
    const fullSystemInstruction = `${SYSTEM_PROMPT}\n\n[USER RECENT MOOD HISTORY]\n${recentMoodsContext || 'No mood logs recorded yet.'}${ragContext}`;

    if (image) {
      // image is expected as "data:image/png;base64,..." or similar
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const base64Data = matches[2];
        contents.push({
          role: 'user',
          parts: [
            { text: safeUserMessage },
            {
              inlineData: {
                mimeType,
                data: base64Data
              }
            }
          ]
        });
      } else {
        contents.push({
          role: 'user',
          parts: [{ text: safeUserMessage }]
        });
      }
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: safeUserMessage }]
      });
    }

    let finalReply = '';
    let escalationTriggered = false;
    let toolUsed = 'none';
    let parsed: any = null;

    try {
      // Call Gemini API with JSON mode
      const ai = getAI();
      const result = await generateContentWithFallback(ai, {
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction: fullSystemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              reply: { type: 'STRING' },
              toolUsed: { type: 'STRING', enum: ['none', 'log_mood', 'find_therapist', 'emergency_escalation', 'coping_exercise'] },
              toolParams: {
                type: 'OBJECT',
                properties: {
                  mood: { type: 'STRING' },
                  moodNote: { type: 'STRING' },
                  location: { type: 'STRING' },
                  exerciseType: { type: 'STRING', enum: ['breathing', 'grounding', 'journaling'] },
                  escalationReason: { type: 'STRING' }
                }
              },
              escalationTriggered: { type: 'BOOLEAN' }
            },
            required: ['reply', 'toolUsed', 'escalationTriggered']
          }
        }
      });

      const responseText = result?.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini');
      }

      parsed = JSON.parse(responseText);
      finalReply = parsed.reply;
      escalationTriggered = parsed.escalationTriggered || false;
      toolUsed = parsed.toolUsed || 'none';
    } catch (primaryErr) {
      console.warn('Primary Gemini call with JSON schema failed. Falling back to plain text model request to prevent app error or crash:', primaryErr);
      
      try {
        // Fallback call: Simple generateContent without strict responseSchema or JSON mode
        const ai = getAI();
        const fallbackResult = await generateContentWithFallback(ai, {
          model: 'gemini-3.5-flash',
          contents,
          config: {
            systemInstruction: `${SYSTEM_PROMPT}\n\nIMPORTANT: Since structured JSON mode has failed, you must analyze the user message and clinical image directly, and output a friendly, highly professional clinical medical response in empathetic plain text. Do not output JSON. Clearly identify the probable condition and outline its Symptoms, Prevention & Causes, and Care & Remedies, acting like an expert caring physician.`,
          }
        });

        const fallbackText = fallbackResult?.text || '';
        if (fallbackText) {
          finalReply = fallbackText;
          toolUsed = 'none';
          escalationTriggered = false;
        } else {
          throw new Error('Fallback response was also empty');
        }
      } catch (secondaryErr) {
        console.error('All Gemini API attempts failed:', secondaryErr);
        // Extremely safe RAG fallback to ensure the app never crashes and works fast
        if (retrievedDocs.length > 0) {
          finalReply = retrievedDocs[0].instantFallback;
        } else {
          finalReply = "I am right here with you. It seems we are having some difficulty analyzing this at the moment, but please know that your wellbeing is the most important thing. If you are experiencing a skin, scalp, or physical symptom, it is always a good idea to seek guidance from a qualified healthcare professional. If you are in distress, please let me know or contact 988.";
        }
        toolUsed = 'none';
        escalationTriggered = false;
      }
    }

    // Handle tool execution server-side
    if (toolUsed === 'log_mood' && parsed?.toolParams?.mood) {
      const newMood: MoodEntry = {
        id: `mood_${Date.now()}`,
        timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        mood: parsed.toolParams.mood,
        note: parsed?.toolParams?.moodNote || ''
      };
      sessionData.moods.push(newMood);
      finalReply += `\n\n*(Logged mood: ${newMood.mood} - "${newMood.note}")*`;
    } 
    else if (toolUsed === 'find_therapist' && parsed?.toolParams?.location) {
      const location = parsed.toolParams.location;
      finalReply += `\n\nSearching for psychotherapists near ${location}...`;
      const therapists = await searchTherapists(location, googleMapsApiKey);
      if (therapists.length > 0) {
        finalReply += `\n\nHere are some professionals I found nearby:\n` + 
          therapists.map((t, idx) => `${idx + 1}. **${t.name}**\n📍 ${t.address}\n📞 Phone: ${t.phone || 'N/A'}`).join('\n\n');
      } else {
        finalReply += `\n\nI couldn't locate any therapist listings nearby on Google Maps. Please ensure the location name is clear or call emergency hotlines if you need immediate support.`;
      }
    } 
    else if (toolUsed === 'coping_exercise' && parsed?.toolParams?.exerciseType) {
      const type = parsed.toolParams.exerciseType;
      if (type === 'breathing') {
        finalReply += `\n\n**Let's practice the 4-7-8 Breathing technique together:**\n1. 🌬️ **Exhale** completely through your mouth with a whoosh sound.\n2. 🌸 **Inhale** quietly through your nose for **4 seconds**.\n3. 🧘 **Hold** your breath for **7 seconds**.\n4. 💨 **Exhale** completely through your mouth for **8 seconds**.\n\n*Repeat this cycle 4 times. Focus on your breathing.*`;
      } else if (type === 'grounding') {
        finalReply += `\n\n**Let's try the 5-4-3-2-1 Grounding exercise to focus on the present:**\n👁️ **5 things** you can see around you.\n🖐️ **4 things** you can touch.\n👂 **3 things** you can hear.\n👃 **2 things** you can smell.\n👅 **1 thing** you can taste.\n\n*Take a deep breath once you identify each item.*`;
      } else if (type === 'journaling') {
        finalReply += `\n\n**Here are 3 quick reflective journaling prompts to help you center:**\n1. 🪵 What is something heavy weighing on your mind right now?\n2. 🌟 What are you genuinely grateful for today?\n3. 🌱 What is one small, simple thing you can do to care for yourself in the next hour?\n\n*Take your time to write or reflect on these.*`;
      }
    } 
    else if (toolUsed === 'emergency_escalation' || escalationTriggered) {
      escalationTriggered = true;
      const reason = parsed?.toolParams?.escalationReason || 'Active crisis indication';

      // 1. Audit Trail Logging (Cloud Logging + Firestore audit_logs)
      console.warn(`[AUDIT TRAIL] EMERGENCY CRISIS ESCALATION TRIGGERED!
        Session: ${sessionId}
        Time: ${new Date().toISOString()}
        Reason: ${reason}`);

      try {
        const auditRef = db.collection('audit_logs').doc(`${sessionId}_${Date.now()}`);
        await auditRef.set({
          sessionId,
          timestamp: new Date().toISOString(),
          reason,
          type: 'emergency_escalation'
        });
      } catch (firestoreErr) {
        console.error('Audit trail Firestore logging failed:', firestoreErr);
      }

      // Try to fetch patient details from the session document to dial their specific emergency contact
      let patientPhone = '';
      let patientName = '';
      let emergencyContactName = '';
      let emergencyContact = process.env.TWILIO_EMERGENCY_NUMBER || '';

      try {
        const sessionRef = db.collection('sessions').doc(sessionId);
        const sessionSnap = await sessionRef.get();
        if (sessionSnap.exists) {
          const sData = sessionSnap.data();
          if (sData?.patientId) {
            const patientSnap = await db.collection('patients').doc(sData.patientId).get();
            if (patientSnap.exists) {
              const pData = patientSnap.data();
              patientName = pData?.name || '';
              patientPhone = pData?.phone || '';
              emergencyContactName = pData?.emergencyContactName || '';
              if (pData?.emergencyContactPhone) {
                emergencyContact = pData.emergencyContactPhone;
              }
            }
          } else if (sData?.patient) {
            patientName = sData.patient.name || '';
            patientPhone = sData.patient.phone || '';
            emergencyContactName = sData.patient.emergencyContactName || '';
            if (sData.patient.emergencyContactPhone) {
              emergencyContact = sData.patient.emergencyContactPhone;
            }
          }
        }
      } catch (err) {
        console.error('Failed to resolve dynamic emergency patient/contact details:', err);
      }

      // 2. Synthesize High-Quality Speech via Google Text-to-Speech API
      let alertSpeechText = '';
      if (patientName && patientPhone) {
        alertSpeechText = `Emergency crisis alert from Rehan's AI Life Saver Alert system. The patient, ${patientName}, whose mobile number is ${patientPhone}, is experiencing an active mental health crisis and needs immediate wellness check. Their emergency contact listed is ${emergencyContactName || 'not specified'}. The crisis details are: ${reason}. Please check on them immediately.`;
      } else {
        alertSpeechText = `Emergency crisis alert from Rehan's AI Life Saver Alert system. A user is experiencing an active mental health crisis and needs immediate wellness check. The crisis details are: ${reason}. Please call them or check on them immediately.`;
      }

      // Reset the TTS Cache for this call to prevent playing old messages
      ttsCache = null;

      const audioBuffer = await generateTTS(alertSpeechText, googleMapsApiKey);
      if (audioBuffer) {
        ttsCache = audioBuffer;
      }

      // 3. Trigger Twilio Emergency Call
      try {
        const config = await getTwilioConfig();
        const twilioClient = await getTwilioClient();
        
        // Clean 'whatsapp:' prefix if present in fromNumber
        let rawFromNumber = config.fromNumber || '';
        let fromNumber = rawFromNumber.replace(/^whatsapp:/i, '').trim();
        
        // If fromNumber is empty, fallback to env or standard default
        if (!fromNumber) {
          fromNumber = (process.env.TWILIO_FROM_NUMBER || '+14155238886').replace(/^whatsapp:/i, '').trim();
        }

        const xForwardedHost = req.headers['x-forwarded-host'] as string;
        let host = xForwardedHost || req.get('host') || 'ais-dev-rpka44subedt7sno2m6577-864539915487.asia-southeast1.run.app';
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
          host = 'ais-dev-rpka44subedt7sno2m6577-864539915487.asia-southeast1.run.app';
        }
        const appUrl = process.env.APP_URL || `https://${host}`;

        const targetNumber = config.emergencyNumber || process.env.TWILIO_EMERGENCY_NUMBER || emergencyContact;

        const isSandboxFrom = fromNumber.includes('4155238886');
        if (isSandboxFrom) {
          console.warn(`Twilio voice call skipped: Sender phone number ${fromNumber} is identified as the Twilio WhatsApp Sandbox number, which does not support outbound voice calling. Please configure a verified Twilio phone number or Outbound Caller ID in Twilio Outbound Emergency Setup to receive emergency calls.`);
        } else if (fromNumber && targetNumber) {
          // If we successfully synthesized neural TTS audio, play it; otherwise, speak the fallback text
          const twimlUrl = `${appUrl}/api/twilio/twiml?` + 
            (ttsCache ? `audioUrl=${encodeURIComponent(`${appUrl}/api/tts/escalation.mp3`)}&` : '') +
            `fallbackText=${encodeURIComponent(alertSpeechText)}`;
          
          await twilioClient.calls.create({
            url: twimlUrl,
            to: targetNumber,
            from: fromNumber
          });
          console.log(`Twilio call triggered to emergency number: ${targetNumber} (for patient: ${patientName || 'anonymous'}). Mode: ${ttsCache ? 'Neural Audio' : 'Twilio Say Voice'}`);
        } else {
          console.error('Twilio settings (Voice From/To) are missing, cannot initiate call.');
        }
      } catch (twilioErr) {
        console.error('Failed to trigger Twilio Call:', twilioErr);
      }
    }

    // To prevent Firestore 1MB document size limit crash, we safeguard stored image size.
    // If the image is large, we store a truncated representation for database safety.
    // (The Gemini API has already completed processing of the full-resolution image).
    let safeImageForDb = image || undefined;
    if (safeImageForDb && safeImageForDb.length > 100000) {
      console.warn('Image base64 is larger than 100KB. Truncating stored representation for database stability.');
      safeImageForDb = safeImageForDb.slice(0, 5000) + "...[Truncated for Firestore Stability]...";
    }

    // Update conversation history
    const userMessageObj: Message = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: message || '',
      imageSrc: safeImageForDb,
      timestamp: new Date().toISOString()
    };

    const assistantMessageObj: Message = {
      id: `msg_m_${Date.now()}`,
      role: 'model',
      content: finalReply,
      timestamp: new Date().toISOString(),
      escalationTriggered,
      toolUsed
    };

    sessionData.messages.push(userMessageObj, assistantMessageObj);
    await saveSessionData(sessionId, sessionData);

    res.json({ message: assistantMessageObj });

  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'An internal error occurred.',
      fallbackMessage: "I'm here for you, but I'm having a little trouble connecting right now. Please take a deep breath. If you are feeling overwhelmed, remember you can reach out to local professional support or a trusted friend immediately."
    });
  }
});

// 2. TTS audio provider
app.get('/api/tts/escalation.mp3', (req, res) => {
  if (ttsCache) {
    res.set('Content-Type', 'audio/mpeg');
    res.send(ttsCache);
  } else {
    // Fallback static crisis audio alert or message
    res.status(404).send('Audio not found yet');
  }
});

// 3. Twilio TwiML fetcher
app.get('/api/twilio/twiml', (req, res) => {
  const audioUrl = req.query.audioUrl as string;
  const fallbackText = req.query.fallbackText as string || "Emergency crisis alert from Rehan's AI Life Saver Alert system. Please help immediate wellness check.";
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${audioUrl ? `<Play>${audioUrl}</Play>` : `<Say voice="alice">${fallbackText}</Say>`}
</Response>`);
});

// GET Twilio WhatsApp Connection Config (Dynamic support)
app.get('/api/twilio/config', async (req, res) => {
  try {
    const config = await getTwilioConfig();
    const fromNumberRaw = config.fromNumber || '+14155238886';
    const cleanFromNumber = fromNumberRaw.replace('whatsapp:', '').replace(/\D/g, '');
    const isSandbox = fromNumberRaw.includes('4155238886') || !config.accountSid || !fromNumberRaw.toLowerCase().startsWith('whatsapp:');
    
    const xForwardedHost = req.headers['x-forwarded-host'] as string;
    let host = xForwardedHost || req.get('host') || 'ais-dev-rpka44subedt7sno2m6577-864539915487.asia-southeast1.run.app';
    
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      host = 'ais-dev-rpka44subedt7sno2m6577-864539915487.asia-southeast1.run.app';
    }

    const protocol = req.protocol || 'https';
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https' || host.includes('run.app');
    const finalProtocol = isHttps ? 'https' : protocol;
    const webhookUrl = `${finalProtocol}://${host}/whatsapp`;

    res.json({
      rawFromNumber: fromNumberRaw,
      cleanFromNumber: cleanFromNumber,
      isSandbox: isSandbox,
      sandboxKeyword: config.sandboxKeyword,
      globalSandboxNumber: '+14155238886',
      globalSandboxClean: '14155238886',
      webhookUrl: webhookUrl,
      hasCredentials: !!(config.accountSid && config.authToken),
      accountSid: config.accountSid,
      authToken: config.authToken ? '••••••••' : '',
      emergencyNumber: config.emergencyNumber
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Save Twilio Configuration
app.post('/api/twilio/save-settings', async (req, res) => {
  try {
    const { accountSid, authToken, fromNumber, sandboxKeyword, emergencyNumber } = req.body;
    
    if (!accountSid || !authToken) {
      return res.status(400).json({ error: 'Account SID and Auth Token are required.' });
    }

    const payload: any = {
      accountSid: accountSid.trim(),
      fromNumber: (fromNumber || '+14155238886').trim(),
      sandboxKeyword: (sandboxKeyword || 'join mile-sale').trim(),
      emergencyNumber: (emergencyNumber || '').trim(),
      updatedAt: new Date().toISOString()
    };

    // If authToken contains dots/bullets, preserve the existing token from DB
    if (authToken.includes('•') || authToken.trim() === '••••••••') {
      const existingDoc = await db.collection('twilio_settings').doc('global_config').get();
      if (existingDoc.exists) {
        payload.authToken = existingDoc.data()?.authToken;
      }
    } else {
      payload.authToken = authToken.trim();
    }

    await db.collection('twilio_settings').doc('global_config').set(payload, { merge: true });

    res.json({ success: true, message: 'Twilio configuration successfully saved!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Clear/Reset Twilio Configuration
app.post('/api/twilio/reset-settings', async (req, res) => {
  try {
    await db.collection('twilio_settings').doc('global_config').set({});
    res.json({ success: true, message: 'Twilio configuration successfully reset to defaults!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Trigger Emergency Test Call
app.post('/api/twilio/trigger-test-call', async (req, res) => {
  try {
    const config = await getTwilioConfig();
    const twilioClient = await getTwilioClient();

    // Clean 'whatsapp:' prefix if present in fromNumber
    let rawFromNumber = config.fromNumber || '';
    let fromNumber = rawFromNumber.replace(/^whatsapp:/i, '').trim();

    // If fromNumber is empty, fallback to env or standard default
    if (!fromNumber) {
      fromNumber = (process.env.TWILIO_FROM_NUMBER || '+14155238886').replace(/^whatsapp:/i, '').trim();
    }

    // Prioritize the TWILIO_EMERGENCY_NUMBER environment variable (secret code) or fallback to database config
    const targetNumber = process.env.TWILIO_EMERGENCY_NUMBER || config.emergencyNumber;

    if (!targetNumber) {
      return res.status(400).json({ error: 'Twilio emergency number (target) is not configured in secrets or settings.' });
    }

    const isSandboxFrom = fromNumber.includes('4155238886');
    if (isSandboxFrom) {
      return res.status(400).json({
        error: `Voice call skipped: Sender number ${fromNumber} is the Twilio WhatsApp Sandbox number, which does not support voice calling. Please configure a verified Twilio sender phone number or Outbound Caller ID.`
      });
    }

    const xForwardedHost = req.headers['x-forwarded-host'] as string;
    let host = xForwardedHost || req.get('host') || 'ais-dev-rpka44subedt7sno2m6577-864539915487.asia-southeast1.run.app';
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      host = 'ais-dev-rpka44subedt7sno2m6577-864539915487.asia-southeast1.run.app';
    }
    const appUrl = process.env.APP_URL || `https://${host}`;

    const testSpeechText = `This is a secure connection test from your AI Life Saver emergency modal. The outbound dialer system has successfully triggered a voice call to your emergency number under the secret code. Your safety check system is active and fully functional.`;

    // Try to generate TTS
    let ttsUrlParam = '';
    try {
      const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';
      const audioBuffer = await generateTTS(testSpeechText, googleMapsApiKey);
      if (audioBuffer) {
        ttsCache = audioBuffer;
        ttsUrlParam = `audioUrl=${encodeURIComponent(`${appUrl}/api/tts/escalation.mp3`)}&`;
      }
    } catch (ttsErr) {
      console.warn('TTS synthesis failed for test call, using fallback Say voice:', ttsErr);
    }

    const twimlUrl = `${appUrl}/api/twilio/twiml?` + ttsUrlParam + `fallbackText=${encodeURIComponent(testSpeechText)}`;

    await twilioClient.calls.create({
      url: twimlUrl,
      to: targetNumber,
      from: fromNumber
    });

    console.log(`Twilio test call triggered to emergency number: ${targetNumber} from: ${fromNumber}`);
    res.json({ success: true, message: `Successfully initiated Twilio voice call to your secret emergency number: ${targetNumber}` });
  } catch (err: any) {
    console.error('Failed to trigger Twilio test call:', err);
    res.status(500).json({ error: err.message || 'Failed to place Twilio test call.' });
  }
});

// POST send WhatsApp connection link via Twilio (Dynamic support)
app.post('/api/twilio/send-whatsapp-link', async (req, res) => {
  const { userPhone, forceSandbox } = req.body;
  if (!userPhone) {
    res.status(400).json({ error: 'Phone number is required.' });
    return;
  }

  try {
    const config = await getTwilioConfig();
    let rawFromNumber = config.fromNumber || '+14155238886';
    let isSandbox = rawFromNumber.includes('4155238886') || !config.accountSid || !rawFromNumber.toLowerCase().startsWith('whatsapp:');
    const sandboxKeyword = config.sandboxKeyword;

    if (forceSandbox === true || isSandbox) {
      rawFromNumber = 'whatsapp:+14155238886';
      isSandbox = true;
    }

    const cleanFromNumber = rawFromNumber.replace('whatsapp:', '').replace(/\D/g, '');
    const cleanUserPhone = userPhone.replace(/\D/g, '');
    const waLink = `https://wa.me/${cleanFromNumber}?text=${encodeURIComponent(isSandbox ? sandboxKeyword : 'Hello Doctor')}`;
    
    let sentVia = 'none';
    let errorMessage = '';

    try {
      const twilioClient = await getTwilioClient();
      const formattedTo = userPhone.startsWith('+') ? userPhone : `+${cleanUserPhone}`;
      const whatsappFrom = rawFromNumber.startsWith('whatsapp:') ? rawFromNumber : `whatsapp:${rawFromNumber}`;
      const whatsappTo = `whatsapp:${formattedTo}`;

      await twilioClient.messages.create({
        from: whatsappFrom,
        to: whatsappTo,
        body: `Hello from AI Life Saver! Connect to our active mental health & crisis counselor service on WhatsApp. Click this link to start your chat: ${waLink}`
      });
      sentVia = 'whatsapp';
    } catch (waErr: any) {
      console.warn('Could not send via Twilio WhatsApp, trying Twilio SMS:', waErr.message);
      errorMessage = waErr.message || String(waErr);
      
      try {
        const twilioClient = await getTwilioClient();
        const formattedTo = userPhone.startsWith('+') ? userPhone : `+${cleanUserPhone}`;
        const smsFrom = rawFromNumber.replace('whatsapp:', '');

        await twilioClient.messages.create({
          from: smsFrom,
          to: formattedTo,
          body: `Hi from AI Life Saver! To start chatting with the AI Counselor on your WhatsApp, tap here: ${waLink}`
        });
        sentVia = 'sms';
      } catch (smsErr: any) {
        console.error('Twilio SMS fallback failed:', smsErr.message);
        errorMessage += ` | SMS fail: ${smsErr.message || smsErr}`;
      }
    }

    if (sentVia !== 'none') {
      res.json({ 
        success: true, 
        sentVia, 
        waLink,
        message: sentVia === 'whatsapp' 
          ? 'Link sent directly to your WhatsApp number!' 
          : 'WhatsApp link sent to your phone via SMS!'
      });
    } else {
      res.json({
        success: false,
        waLink,
        error: `Could not deliver message via Twilio: ${errorMessage}. But you can use the instant redirect link below!`
      });
    }

  } catch (err: any) {
    console.error('Twilio Send Link Endpoint Error:', err);
    const config = await getTwilioConfig();
    const defaultFrom = '+14155238886';
    const cleanDefault = '14155238886';
    const keyword = config.sandboxKeyword;
    const waLink = `https://wa.me/${cleanDefault}?text=${encodeURIComponent(keyword)}`;

    res.json({
      success: false,
      waLink,
      error: `Twilio service not fully configured. Please use the instant redirection link instead: ${err.message || err}`
    });
  }
});

// Helper for escaping XML characters
function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function logDebug(message: string, meta?: any) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message} ${meta ? JSON.stringify(meta) : ''}\n`;
  try {
    fs.appendFileSync(path.join(process.cwd(), 'debug.log'), logLine);
    console.log(`[DEBUG LOG] ${message}`, meta || '');
  } catch (err) {
    console.error('Failed to write to debug.log:', err);
  }
}

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

// REST debug-logs API
app.get('/api/debug-logs', (req, res) => {
  try {
    const logPath = path.join(process.cwd(), 'debug.log');
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf8');
      res.setHeader('Content-Type', 'text/plain');
      res.send(content);
    } else {
      res.status(200).send('No logs recorded yet.');
    }
  } catch (err: any) {
    res.status(500).send(`Error reading logs: ${err.message}`);
  }
});

// Endpoint to fetch latest Firestore-backed Webhook hits for live debugging
app.get('/api/webhook-debug-logs', async (req, res) => {
  try {
    const snapshot = await db.collection('webhook_logs').get();
    const rawLogs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const logs = rawLogs
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);
    res.json({ logs });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. WhatsApp Webhook (Twilio form-encoded payload, handles both POST and GET)
const handleWhatsAppWebhook = async (req: any, res: any) => {
  const fromWhatsApp = req.body.From || req.query.From; // sender's whatsapp number, e.g. "whatsapp:+14155552345"
  const messageText = req.body.Body || req.query.Body || '';
  let retrievedDocs: any[] = [];

  logDebug(`WhatsApp request received on path: ${req.path}`, {
    from: fromWhatsApp,
    body: messageText,
    contentType: req.headers['content-type'],
    method: req.method,
    query: req.query
  });

  // Log incoming requests to Firestore for persistent diagnostics visible to the user
  try {
    await db.collection('webhook_logs').add({
      timestamp: new Date().toISOString(),
      from: fromWhatsApp || 'Missing/Empty',
      body: messageText || '',
      path: req.path,
      method: req.method,
      contentType: req.headers['content-type'] || 'None',
      userAgent: req.headers['user-agent'] || 'None'
    });
  } catch (firestoreErr) {
    console.error('Failed to write webhook_log to Firestore:', firestoreErr);
  }

  if (!fromWhatsApp) {
    // If it's a request to root '/' but doesn't look like a Twilio request, pass through or return 400
    if (req.path === '/' || req.path === '/whatsapp' || req.path === '/whatsapp/') {
      // For GET request without parameters from browser, return a friendly confirmation
      if (req.method === 'GET') {
        res.status(200).send('WhatsApp Webhook Endpoint is Active! Send a WhatsApp message to test.');
        return;
      }
      res.status(400).send('Not a valid Twilio request');
      return;
    }
    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>Sender number missing.</Message></Response>`);
    return;
  }

  try {
    // Sanitize session ID for Firestore to prevent any character-related issues with pluses or colons
    const safeSessionId = fromWhatsApp.replace(/[^a-zA-Z0-9_-]/g, '_');
    logDebug(`Fetching session data for sanitized ID: ${safeSessionId} (original: ${fromWhatsApp})`);

    const sessionData = await getSessionData(safeSessionId);
    const { messages: history, moods } = sessionData;

    logDebug(`Found history length: ${history.length}, moods length: ${moods.length}`);

    // Retrieve matching RAG documents for WhatsApp user query
    retrievedDocs = retrieveRAGDocs(messageText || '', 2);
    let ragContext = '';
    if (retrievedDocs.length > 0) {
      ragContext = `\n\n[RETRIEVED CLINICAL KNOWLEDGE FACTS (RAG GROUNDING)]\n` + 
        retrievedDocs.map(doc => `Topic: ${doc.title}\nCategory: ${doc.category}\nContent Reference:\n${doc.content}`).join('\n---\n');
    }

    const recentMoodsContext = moods.slice(-14).map(m => `[${m.timestamp}] Mood: ${m.mood}. Note: ${m.note}`).join('\n');
    const fullSystemInstruction = `${SYSTEM_PROMPT}\n\n[USER RECENT MOOD HISTORY]\n${recentMoodsContext || 'No mood logs recorded yet.'}${ragContext}`;

    const contents = cleanAndFormatHistory(history.slice(-16));
    contents.push({
      role: 'user',
      parts: [{ text: messageText }]
    });

    logDebug('Invoking Gemini API...');
    const ai = getAI();
    const result = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction: fullSystemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            reply: { type: 'STRING' },
            toolUsed: { type: 'STRING', enum: ['none', 'log_mood', 'find_therapist', 'emergency_escalation', 'coping_exercise'] },
            toolParams: {
              type: 'OBJECT',
              properties: {
                mood: { type: 'STRING' },
                moodNote: { type: 'STRING' },
                location: { type: 'STRING' },
                exerciseType: { type: 'STRING', enum: ['breathing', 'grounding', 'journaling'] },
                escalationReason: { type: 'STRING' }
              }
            },
            escalationTriggered: { type: 'BOOLEAN' }
          },
          required: ['reply', 'toolUsed', 'escalationTriggered']
        }
      }
    });

    logDebug('Gemini API success. Parsing response text...');
    const rawText = result.text || '';
    logDebug('Raw response text:', rawText);

    const cleanedText = cleanJsonString(rawText);
    const parsed = JSON.parse(cleanedText || '{}');

    let reply = parsed.reply || "I am here to support your mental wellbeing. How are you holding up today?";
    let toolUsed = parsed.toolUsed || 'none';
    let escalationTriggered = parsed.escalationTriggered || false;

    logDebug('Parsed response values', { reply, toolUsed, escalationTriggered });

    // Execute minimal mood log/escalation action for WhatsApp too
    if (toolUsed === 'log_mood' && parsed.toolParams?.mood) {
      const newMood: MoodEntry = {
        id: `mood_${Date.now()}`,
        timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
        mood: parsed.toolParams.mood,
        note: parsed.toolParams.moodNote || ''
      };
      sessionData.moods.push(newMood);
      reply += `\n\n(Logged mood: ${newMood.mood} - "${newMood.note}")`;
    } 
    else if (toolUsed === 'find_therapist' && parsed.toolParams?.location) {
      const location = parsed.toolParams.location;
      logDebug(`Executing find_therapist for location: ${location}`);
      const therapists = await searchTherapists(location);
      if (therapists.length > 0) {
        reply += `\n\nNearby Professionals:\n` + 
          therapists.map((t, idx) => `${idx + 1}. ${t.name}\n📍 ${t.address}\n📞 ${t.phone || 'N/A'}`).join('\n\n');
      } else {
        reply += `\n\nNo therapists were located nearby. Please try another city or call standard hotlines.`;
      }
    } 
    else if (toolUsed === 'emergency_escalation' || escalationTriggered) {
      escalationTriggered = true;
      const reason = parsed.toolParams?.escalationReason || 'Crisis via WhatsApp';
      
      logDebug('EMERGENCY ESCALATION TRIGGERED VIA WHATSAPP!', { reason });
      console.warn(`[AUDIT TRAIL] EMERGENCY ESCALATION TRIGGERED VIA WHATSAPP!
        Sender: ${fromWhatsApp}
        Reason: ${reason}`);

      try {
        const auditRef = db.collection('audit_logs').doc(`${safeSessionId}_${Date.now()}`);
        await auditRef.set({
          sessionId: safeSessionId,
          timestamp: new Date().toISOString(),
          reason,
          type: 'emergency_escalation'
        });
      } catch (e) {
        logDebug('Audit trail write failed via WhatsApp', e);
        console.error('Audit trail write failed via WhatsApp:', e);
      }

      // Voice call trigger
      try {
        const config = await getTwilioConfig();
        const twilioClient = await getTwilioClient();
        
        // Clean 'whatsapp:' prefix if present in fromNumber
        let rawFromNumber = config.fromNumber || '';
        let fromNumber = rawFromNumber.replace(/^whatsapp:/i, '').trim();
        
        // If fromNumber is empty, fallback to env or standard default
        if (!fromNumber) {
          fromNumber = (process.env.TWILIO_FROM_NUMBER || '+14155238886').replace(/^whatsapp:/i, '').trim();
        }

        const emergencyContact = config.emergencyNumber || process.env.TWILIO_EMERGENCY_NUMBER;
        const xForwardedHost = req.headers['x-forwarded-host'] as string;
        let host = xForwardedHost || req.get('host') || 'ais-dev-rpka44subedt7sno2m6577-864539915487.asia-southeast1.run.app';
        if (host.includes('localhost') || host.includes('127.0.0.1')) {
          host = 'ais-dev-rpka44subedt7sno2m6577-864539915487.asia-southeast1.run.app';
        }
        const appUrl = process.env.APP_URL || `https://${host}`;

        const isSandboxFrom = fromNumber.includes('4155238886');
        if (isSandboxFrom) {
          const sandboxMsg = `Twilio Voice call skipped: Sender phone number ${fromNumber} is identified as the Twilio WhatsApp Sandbox number, which does not support outbound voice calling. Please configure a verified Twilio phone number or Outbound Caller ID in Twilio Outbound Emergency Setup to receive emergency calls.`;
          console.warn(sandboxMsg);
          logDebug(sandboxMsg);
        } else if (fromNumber && emergencyContact) {
          const alertSpeechText = `Emergency crisis alert from Rehan's AI Life Saver Alert system. A WhatsApp user with number ${fromWhatsApp} is experiencing an active crisis: ${reason}. Please call them or check on them immediately.`;
          
          // Clear TTS Cache for this call to prevent stale audio
          ttsCache = null;
          const audioBuffer = await generateTTS(alertSpeechText);
          if (audioBuffer) {
            ttsCache = audioBuffer;
          }

          // If we successfully synthesized neural TTS audio, play it; otherwise, speak the fallback text
          const twimlUrl = `${appUrl}/api/twilio/twiml?` + 
            (ttsCache ? `audioUrl=${encodeURIComponent(`${appUrl}/api/tts/escalation.mp3`)}&` : '') +
            `fallbackText=${encodeURIComponent(alertSpeechText)}`;

          await twilioClient.calls.create({
            url: twimlUrl,
            to: emergencyContact,
            from: fromNumber
          });
          logDebug(`Twilio Voice call triggered successfully. Mode: ${ttsCache ? 'Neural Audio' : 'Twilio Say Voice'}`);
        } else {
          logDebug('Twilio Voice call skipped: missing TWILIO_FROM_NUMBER or TWILIO_EMERGENCY_NUMBER');
        }
      } catch (twilioErr) {
        logDebug('Failed to trigger Twilio Voice call for WhatsApp', twilioErr);
        console.error('Failed to trigger Twilio Voice call for WhatsApp:', twilioErr);
      }
    }

    // Save WhatsApp conversation history
    const userMessageObj: Message = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    const assistantMessageObj: Message = {
      id: `msg_m_${Date.now()}`,
      role: 'model',
      content: reply,
      timestamp: new Date().toISOString(),
      escalationTriggered,
      toolUsed
    };

    sessionData.messages.push(userMessageObj, assistantMessageObj);
    logDebug(`Saving session data to Firestore for: ${safeSessionId}`);
    await saveSessionData(safeSessionId, sessionData);

    logDebug('Sending TwiML response back to Twilio:', reply);
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(reply)}</Message>
</Response>`);

  } catch (error: any) {
    logDebug('WhatsApp Endpoint Error', { error: error?.message || error });
    console.error('WhatsApp Endpoint Error:', error);
    
    // Utilize matching RAG document fallback if available
    let fallbackReply = "I am here for you, but I'm having a connection issue. If you're in crisis, please text a crisis line or call local emergency support.";
    if (typeof retrievedDocs !== 'undefined' && retrievedDocs.length > 0) {
      fallbackReply = retrievedDocs[0].instantFallback;
    }

    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(fallbackReply)}</Message>
</Response>`);
  }
};

app.post('/whatsapp', handleWhatsAppWebhook);
app.get('/whatsapp', handleWhatsAppWebhook);
app.post('/whatsapp/', handleWhatsAppWebhook);
app.get('/whatsapp/', handleWhatsAppWebhook);
app.post('/', handleWhatsAppWebhook);
app.get('/', (req, res, next) => {
  // Only route / to webhook if it has Twilio query parameters (e.g. From)
  if (req.query.From) {
    return handleWhatsAppWebhook(req, res);
  }
  next();
});

// Configure Vite integration for serving frontend assets and boot server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
