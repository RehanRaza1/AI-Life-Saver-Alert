# 🩺 AI Life Saver Alert: Deep Clinical Companion & Escatlation Engine
> **An AI Mental Wellbeing Companion & Empathetic Crisis Support Physician with Google Cloud Neural TTS, Real-Time Twilio Outbound Escalation, Local RAG Grounding, Multimodal Clinical Diagnostics, and Secure Authorization Security Gates.**

---

## 📖 TABLE OF CONTENTS
1. **Introduction & Executive Summary**
2. **Problem Statement Selected**
   - The Crises of Contemporary Mental Health & Clinical Access
   - The Limits of Conventional Conversational Agents
3. **Solution Overview: AI Life Saver Alert**
   - Architectural Philosophy: Empathy Merged with Immediate Action
   - The Safety Valve: Outbound Call Center & Audit Logging
4. **Detailed System Workflows & Flowcharts (ASCII Art Diagrams)**
   - Workflow 1: End-to-End User Conversation, Image Diagnosis & RAG Grounding
   - Workflow 2: Multimodal Dermatological Analysis Pipeline
   - Workflow 3: Automated Crisis Detection & Twilio + Google Cloud Neural TTS Escalation
   - Workflow 4: Secure Patient Login, Passcode Reset & Authentication Flow
   - Workflow 5: Security Gate Authentication (Password: `**********`)
5. **Key Features & Functional Specifications**
   - Clinician & Medical Consultant (MedGemma Persona)
   - Multimodal Image Analysis Engine
   - Local RAG Retrieval Core (Zero-Hallucination Guardrails)
   - Real-Time Google Maps / Places Therapist Search
   - Outbound Voice Call Dispatcher (Twilio API Integration)
   - Google Cloud Text-to-Speech (Neural2 High-Fidelity Synthesizer)
   - Patient Profile Management & Passcode Verification Portal
   - Interactive Wellbeing Toolkits (Coping Exercises & Mood Logging)
6. **Technologies Used & Complete Dependency Stack**
   - Front-End Architecture
   - Back-End Architecture & Runtime
   - Third-Party & Cloud APIs
7. **Google Cloud & Firebase Technologies Utilized**
   - Google Gemini 3.5 & 2.5 Multimodal Large Language Models
   - Google Cloud Text-to-Speech API (Neural2 Engine)
   - Google Maps Platform APIs (Geocoding + Places Nearby + Places Details)
   - Firebase Firestore Database (Persistent State & Audits)
8. **Detailed Database Schema (Firestore Collections & Structures)**
   - Collection: `patients`
   - Collection: `sessions`
   - Collection: `audit_logs`
   - Collection: `twilio_settings`
9. **Core Code Snippets & Key Implementations**
   - 9.1 Multi-Model Fallback LLM Execution Framework
   - 9.2 Real-Time Google Cloud Text-to-Speech Synthesis
   - 9.3 Twilio TwiML Dynamic Generation & Call Initiation
   - 9.4 Local keyword-based RAG Scoring and Retrieval Algorithm
   - 9.5 Firebase Client SDK shim mimicking Admin SDK API
   - 9.6 Security Gate Password Verification Panel (`***********`)
10. **Step-by-Step Installation & Local Execution Guide**
    - Environment Variables Setup (`.env` and `.env.example`)
    - Dynamic Twilio Outbound Credentials Configuration
    - Deploying and Starting the Production Application
11. **Conclusion & Future Scalability Map**

---

## 1. Introduction & Executive Summary
The **AI Life Saver Alert** is a state-of-the-art, full-stack medical and psychological support application designed to act as an empathetic companion and a clinical crisis mediator. Built on a robust framework of **Vite + React (TypeScript)** on the front-end and **Express + Node.js (TypeScript)** on the back-end, it integrates Google's cutting-edge AI models alongside Twilio's cloud communication platform and Firebase Firestore.

Unlike typical chatbots that isolate users during deep distress, the AI Life Saver Alert bridges the gap between digital support and physical intervention. Through a highly sophisticated crisis analysis engine, the application recognizes signs of self-harm, suicidal ideation, or severe clinical emergency and triggers a physical escalation pipeline. It automatically calls the patient's personal emergency contact or clinical responder, playing a natural, high-fidelity speech notification synthesized by **Google Cloud Text-to-Speech Neural2** containing the patient's identity, immediate location, and distress details. 

Furthermore, the application integrates high-contrast UI design, a secure portal for patients to register and manage their emergency profiles, interactive cognitive behavioral therapy (CBT) modules, and a diagnostic imaging assistant powered by Google Gemini for dermatological and clinical visual evaluation.

---

## 2. Problem Statement Selected

### The Crises of Contemporary Mental Health & Clinical Access
1. **Severe Staffing Shortages & Delayed Access**: Worldwide, the ratio of mental health professionals to people in need is vastly disproportionate. Individuals experiencing acute anxiety, depressive episodes, or panic attacks frequently face waiting lists spanning several months to speak with a licensed therapist.
2. **Late-Night Vulnerability**: Psychological distress does not adhere to office hours. Panic attacks, suicidal thoughts, and acute crises peak during isolated, late-night hours when traditional clinics are closed, and support networks are asleep.
3. **Physical and Financial Barriers**: In-office visits are prohibitively expensive and require physical travel, isolating individuals with physical disabilities, those in rural areas, or people without financial resources.

### The Limits of Conventional Conversational Agents
Modern AI chatbots have attempted to address this accessibility gap, but they suffer from severe structural deficiencies:
1. **The "Empty Text" Deflection**: When faced with a crisis (such as *"I want to end my life"*), standard chatbots default to a static disclaimer: *"I am an AI, I cannot help. Please call 911."* This sudden clinical rejection can make an isolated individual feel more abandoned, escalating their distress.
2. **Hallucinated Medical Advice**: When queried about physical symptoms, skin rashes, hair issues, or medical conditions, typical LLMs may hallucinate dangerous diagnoses, prescribe incorrect remedies, or completely decline to help due to liability fears.
3. **Lack of Grounded Interventions**: Conventional bots lack a localized, validated clinical repository to ground their conversations, making their support feel generic, robotic, and distant.
4. **Digital Isolation**: Standard applications operate entirely within the browser. If a patient is undergoing a severe physical or mental breakdown, the system has no way of alerting the real world to provide immediate physical rescue.

---

## 3. Solution Overview: AI Life Saver Alert

```
+---------------------------------------------------------------------------------+
|                               AI LIFE SAVER ALERT                               |
|                                                                                 |
|   +-----------------------+   +------------------------+   +-----------------+  |
|   | Empathetic Clinical   |   | Multimodal Visual      |   | Local RAG       |  |
|   | Companion (Psych/MD)  |   | Diagnostics (Skin/Hair)|   | Guardrails Core |  |
|   +-----------+-----------+   +-----------+------------+   +--------+--------+  |
|               |                           |                         |           |
|               +---------------------------+-------------------------+           |
|                                           |                                     |
|                                           v                                     |
|                               +-----------------------+                         |
|                               |  Gemini 3.5 Engine    |                         |
|                               +-----------+-----------+                         |
|                                           |                                     |
|                                           v                                     |
|                           +-------------------------------+                     |
|                           |   Crisis Detection Engine     |                     |
|                           +---------------+---------------+                     |
|                                           |                                     |
|                   +-----------------------+-----------------------+             |
|                   | (Normal Flow)                                 | (Crisis)    |
|                   v                                               v             |
|       +----------------------+                        +---------------------+   |
|       | Interactive CBT /    |                        | Real-Time Twilio    |   |
|       | Therapist Finder     |                        | Outbound Escalation |   |
|       +----------------------+                        +----------+----------+   |
|                                                                  |              |
|                                                                  v              |
|                                                       +---------------------+   |
|                                                       | Google Neural2 TTS  |   |
|                                                       | Emergency Dispatch  |   |
|                                                       +---------------------+   |
+---------------------------------------------------------------------------------+
```

The **AI Life Saver Alert** solves these challenges by providing a secure, intelligent, and physically connected clinical companion. By utilizing a hybrid server-client architecture, it ensures complete user privacy while enabling robust API proxying and critical real-world escalations.

### Architectural Philosophy: Empathy Merged with Immediate Action
1. **Empathetic Dual Persona**: The agent is programmed as both an active-listening therapist and a knowledgeable, general clinical physician. It responds warmly to emotional trauma while offering precise, accurate, and evidence-based explanations for physical bodily symptoms (such as skin rashes, scalp issues, or digestive distress).
2. **Zero-Hallucination RAG Foundation**: A local, keyword-scored clinical reference database (RAG) is embedded directly into the back-end. Whenever a user describes symptoms of anxiety, depression, skin rashes, acne, or self-harm, the server instantly injects targeted clinical fact Sheets into the Gemini context. This guarantees that remedies, causes, and guidance are rooted in proven clinical guidelines.
3. **Multimodal Visual Analysis (MedGemma Framework)**: Users can capture or upload images of visible symptoms (e.g., scalp scales, dry skin, acne, dermatitis). The system performs high-resolution image analysis and generates a structured medical review detailing probable conditions, symptoms, prevention, care remedies, and a professional consult recommendation.

### The Safety Valve: Outbound Call Center & Audit Logging
The cornerstone of the system is its proactive escalation engine:
- **Active Safety Scanning**: Every chat exchange is evaluated by the backend crisis parser. If active suicidal intents or severe medical collapse markers are identified, the system initiates the emergency workflow.
- **Dynamic Profile Integration**: The system queries the patient's Firestore profile to identify their real name, phone, emergency contact name, and emergency contact phone.
- **Google Neural Speech Synthesis**: The system compiles a highly structured emergency statement and synthesizes it into natural human speech using the **Google Cloud Text-to-Speech Neural2** female model, avoiding scary or robotic computer voices.
- **Twilio Voice Broadcast**: The backend initiates an outbound voice call to the emergency contact. When picked up, the synthesized neural audio is streamed directly to the responder, establishing a physical lifeline.
- **Failproof Twilio Backups**: If Google Cloud TTS is restricted or unavailable, the system instantly falls back to Twilio's highly stable `Say` Alice engine to ensure the alert is still spoken.
- **Cryptographic Audit Log**: Every escalation logs a timestamped entry in the Firestore `audit_logs` collection and prints alerts in secure Cloud Logging consoles, preserving a legally compliant record of physical safety interventions.

---

## 4. Detailed System Workflows & Flowcharts

### Workflow 1: End-to-End User Conversation, Image Diagnosis & RAG Grounding
This diagram maps how a normal text or image-based query travels from the front-end to the back-end, undergoes RAG retrieval, runs through Gemini, and updates the database.

```
+---------------+           +---------------+           +-------------------+
|  Client App   |           |  Express API  |           | Local RAG Corpus  |
|  (App.tsx)    |           |  (server.ts)  |           |    (rag.ts)       |
+-------+-------+           +-------+-------+           +---------+---------+
        |                           |                             |
        |  1. POST /api/chat        |                             |
        |-------------------------->|                             |
        |  (msg, image, sessionId)  |  2. Analyze text keywords   |
        |                           |---------------------------->|
        |                           |  for clinical categories    |
        |                           |                             |
        |                           |  3. Return Scored RAG Docs  |
        |                           |<----------------------------|
        |                           |  (Anxiety, Dermatology, etc)|
        |                           |                             |
        |                           |  4. Fetch recent Mood Logs  |
        |                           |     from Firestore          |
        |                           |                             |
        |                           |  5. Assemble Context:       |
        |                           |     System Prompt + RAG +   |
        |                           |     Mood Context + Image    |
        |                           |                             |
        |                           |  6. Call Gemini 3.5 API     |
        |                           |     (Fallbacks to 2.5/Lite) |
        |                           |                             |
        |                           |  7. Parse JSON Response     |
        |                           |     (Reply, Tool, Params)   |
        |                           |                             |
        |                           |  8. Append history & Save   |
        |                           |     to Firestore            |
        |  9. Render Clean JSX with |                             |
        |     Animations & Markdown |                             |
        |<--------------------------|                             |
        |                           |                             |
```

---

### Workflow 2: Multimodal Dermatological Analysis Pipeline
A detailed view of how skin, hair, and body symptoms are evaluated.

```
[ User Uploads Hair/Skin/Body Photo ]
                 |
                 v
[ Convert Image to Base64 on Client-Side ]
                 |
                 v
[ POST /api/chat with base64 and prompt ]
                 |
                 v
[ Server matches keywords "scalp", "itching", "rash", etc. ]
                 |
                 v
[ Inject Dermatology RAG Guide (Dandruff, Eczema, Acne) into Context ]
                 |
                 v
[ Gemini analyzes Base64 Visual Pixels + Grounded Clinical Docs ]
                 |
                 v
[ Format Output into Standard Structured Sections:
  1. Probable Condition / Identification
  2. Symptom Overview
  3. Prevention & Causes
  4. Care & Remedies
  5. Doctor Consultation Recommendation ]
                 |
                 v
[ Server truncates image data to save Firestore space (<100KB safeguard) ]
                 |
                 v
[ Render structured results elegantly on high-contrast Client UI ]
```

---

### Workflow 3: Automated Crisis Detection & Twilio + Google Cloud Neural TTS Escalation
This flowchart shows the critical physical security pipeline when a user expresses self-harm or severe crisis intents.

```
       [ User Inputs Crisis Text: e.g. "I want to end my life" ]
                                   |
                                   v
             [ POST /api/chat payload sent to Server ]
                                   |
                                   v
            [ RAG matches Crisis Keywords & Injects Hotlines ]
                                   |
                                   v
          [ Gemini recognizes crisis & triggers emergency_escalation ]
                                   |
                                   v
+----------------------------------+----------------------------------+
|                                                                     |
v (Audit Trail Logging)                                               v (Real-Time Communication Pipeline)
[ Log alert in Cloud Logging console ]                                [ Query User Profile in Firestore ]
|                                                                     |
v                                                                     v
[ Write Record to 'audit_logs' collection ]                           [ Resolve: Patient Name, Mobile No. ]
                                                                      [ and Emergency Contact's Mobile No. ]
                                                                      |
                                                                      v
                                                              [ Compile Dynamic Alert Speech ]
                                                                      |
                                                                      v
                                                              [ Call Google Text-to-Speech API ]
                                                                      |
                                                       +--------------+--------------+
                                                       | (Success)                   | (Failure)
                                                       v                             v
                                             [ Synthesize High-Fidelity ]   [ Fallback to Twilio ]
                                             [ Neural2 Female Speech    ]   [ built-in Speak Voice ]
                                             [ MP3 Buffer               ]   [ (Alice Engine)       ]
                                                       |                             |
                                                       +--------------+--------------+
                                                                      |
                                                                      v
                                                              [ Initialize Twilio Client ]
                                                                      |
                                                                      v
                                                              [ Place Outbound Phone Call ]
                                                              [ to Emergency Contact      ]
                                                                      |
                                                                      v
                                                              [ Stream High-Fidelity Audio ]
                                                              [ when call is answered      ]
```

---

### Workflow 4: Secure Patient Login, Passcode Reset & Authentication Flow
Enables patient tracking and real-time profile fetching for the emergency caller ID.

```
                       +---------------------------+
                       |    Patient Action Gateway |
                       +-------------+-------------+
                                     |
                    +----------------+----------------+
                    |                                 |
                    v (New Patient)                   v (Existing Patient)
         +----------+----------+           +----------+----------+
         | Input Profile Info  |           | Enter Phone Number  |
         | & Emergency Details |           | and 4-Digit Passcode|
         +----------+----------+           +----------+----------+
                    |                                 |
                    v                                 v
         [ Save to 'patients' ]            [ Query 'patients' Collection ]
         [ Firestore Collection ]                     |
                    |                                 v
                    |                      [ Passcode Match Check ]
                    |                                 |
                    +----------------+----------------+
                                     |
                                     v
                       [ Link Session ID to Patient ]
                                     |
                                     v
                     [ Dashboard Profile Loaded! ]
                     [ Dynamic Outbound Calling Ready ]
```

---

### Workflow 5: Security Gate Authentication (Password: `Rehan@555`)
Protects sensitive Twilio API credentials and custom fallback emergency routing lines from screen visibility.

```
          [ User Clicks 'Reveal / Edit Configuration' ]
                               |
                               v
               [ PromptingPassword state is set ]
                               |
                               v
            [ Draw Verification Password Input Box ]
                               |
                               v
              [ User Types and Submits Password ]
                               |
                               v
                     { Password === 'Rehan@555' }
                               |
                 +-------------+-------------+
                 | (Yes)                     | (No)
                 v                           v
     [ Show Configuration Panel ]    [ Display error: "Incorrect ]
     [ Bind with Inputs for:    ]    [ password. Access denied." ]
     [ - Twilio Account SID     ]    [ Keep inputs hidden       ]
     [ - Twilio Auth Token      ]
     [ - Twilio Outbound Number ]
     [ - Fallback Emergency No. ]
```

---

## 5. Key Features & Functional Specifications

### 🩺 Clinician & Medical Consultant (MedGemma Persona)
- **Active Dialogue Management**: Maintains a continuous, multi-turn dialogue with the user. The AI displays full conversational empathy, adopting modern cognitive behavioral therapy frameworks to de-escalate anxiety and depression.
- **Full Physical Medicine Answers**: The system's instructions explicitly override any default "AI blockages." It acts as a certified general practitioner. It analyzes and prescribes supportive daily care, prevention steps, and clinical understandings for common medical issues, hair/scalp diseases, or systemic physical symptoms.

### 📸 Multimodal Image Analysis Engine
- **Base64 Processing Pipeline**: Handles raw image selection and camera snapshots directly within the React canvas, transforming photos into clean base64 data to proxy through Express server-side routes.
- **Multimodal Gemini Vision Model**: Passes visual pixel arrays directly to the Gemini model alongside specific clinical prompts, allowing accurate assessments of rashes, dermatitis, and acne.
- **Firestore Size Safeguard**: Checks base64 payload size before saving. If an image exceeds 100KB, it truncates the local database record to protect Firestore database performance while ensuring Gemini receives the high-resolution source for evaluation.

### 📚 Local RAG Retrieval Core (Zero-Hallucination Guardrails)
- **Scoring Engine**: Implements a localized, fast TF-IDF-inspired keyword matching index in `src/db/rag.ts`. 
- **Adaptive Grounding Context**: When a user mentions keywords like "flakes", "anxiety", "acne", or "suicide", the matching documents are retrieved and appended directly to the Gemini LLM as a `[RETRIEVED CLINICAL KNOWLEDGE FACTS]` system injection.
- **No-Connection Instant Fallback**: If internet connectivity is entirely lost or the LLM quota is exhausted, the back-end retrieves pre-formatted RAG markdown pages and delivers them as an instant diagnostic recovery response so the user is never left without clinical guidance.

### 📍 Real-Time Google Maps / Places Therapist Search
- **Geocoding API Proxy**: Transforms human-typed locations (e.g., *"Brooklyn, NY"* or *"London"*) into geographic latitude/longitude coordinates via the Google Geocoding API.
- **Places Nearby Search API**: Queries psychotherapists, psychiatrists, or medical counselors within a 5,000-meter radius of the coordinate.
- **Places Details API**: Executes sub-queries in parallel to fetch exact business names, verified street addresses, and international telephone numbers, outputting an interactive, clickable list directly in the chat panel.

### 📞 Outbound Voice Call Dispatcher (Twilio API Integration)
- **Voice Escalation Engine**: Integrates server-side Twilio Voice SDK.
- **WhatsApp Webhook Alignment**: Fully recognizes and separates WhatsApp sandboxes (which block voice calling) from verified Twilio outbound lines, alerting the clinician to configure outbound caller IDs to receive active voice streams.
- **TwiML Generation Engine**: Standardizes a secure XML endpoint (`/api/twilio/twiml`) that serves structured instructions to Twilio's webhook on whether to stream high-fidelity synthesized audio files or speak a fallback message.

### 🗣️ Google Cloud Text-to-Speech (Neural2 High-Fidelity Synthesizer)
- **Neural2 WaveNet Synthesis**: Utilizes the most natural, human-sounding female voice model (`en-US-Neural2-F`) powered by Google Cloud Text-to-Speech.
- **Global Speech Buffer Cache**: Compiles the synthesized audio payload into an in-memory buffer on the server-side, making it instantly downloadable via a temporary asset endpoint (`/api/tts/escalation.mp3`) during Twilio's webhook callback to minimize latency.

### 🔐 Patient Profile Management & Passcode Verification Portal
- **Profile Registration**: Connects patients' mobile phone numbers with their unique credentials, emergency contacts, and passcode.
- **Active Session State**: Keeps patients logged into their local browsers while syncing their profiles back-end. This guarantees that if a crisis triggers, the emergency caller knows exactly who is speaking and who to dial.
- **Self-Service Verification Reset**: If a patient forgets their passcode, they can trigger an OTP-style verification. By entering their registered number alongside the exact phone number of their emergency contact, the system authenticates the user and updates the passcode instantly.

### 🧘 Interactive Wellbeing Toolkits (Coping Exercises & Mood Logging)
- **4-7-8 Breathing Cycle**: An animated circle expands and contracts, prompting users through inhalation (4s), holding (7s), and exhalation (8s) phases to biologically reduce panic.
- **5-4-3-2-1 Grounding**: An interactive form that prompts users to input visual, physical, auditory, olfactory, and gustatory observations.
- **Mood History Timeline**: Prompts users to track their emotional state, storing structured entries in Firestore and feeding them back to Gemini to provide personalized care plans.

---

## 6. Technologies Used & Complete Dependency Stack

### Front-End Architecture
- **React 19 (TypeScript)**: Powered by functional components, customized hooks, and state boundaries.
- **Vite 6**: Ultra-fast bundling engine.
- **Tailwind CSS v4**: Utility-first CSS classes for fully responsive, adaptive layout structures. Includes custom transitions, high-contrast inputs, and dark-mode configurations.
- **Framer Motion**: Smooth entry transitions, sliding patient portals, pulsing crisis indicators, and breathing simulators.
- **Lucide React**: High-resolution vector iconography for all clinical indicators, locks, status bars, and buttons.

### Back-End Architecture & Runtime
- **Node.js (TypeScript Runner)**: High-performance, lightweight asynchronous server environment.
- **tsx (TypeScript Execute)**: Direct TypeScript execution wrapper in development.
- **esbuild**: Bundles the TypeScript server into a single, self-contained CommonJS `dist/server.cjs` file, bypassing strict relative ES Module imports during production and accelerating cold starts.
- **Express 4**: Minimalist, robust back-end router for handling API payloads, image uploads, dynamic TwiML generation, and configuration updates.

### Third-Party & Cloud APIs
- **Twilio Voice SDK**: Places outbound voice calls to global phone systems.
- **Google Cloud APIs (Text-to-Speech & Maps)**: Handles high-fidelity neural voice synthesis and location-based therapist geocoding.

---

## 7. Google Cloud & Firebase Technologies Utilized

### Google Gemini 3.5 & 2.5 Multimodal Large Language Models
- **Primary Model**: `gemini-3.5-flash` handles standard dialogue, clinical diagnostics, and RAG compilation.
- **Dynamic Multi-Model Quota Fallback**: To guarantee absolute system availability during rate limit peaks or quota exhaustion, the Express server implements an automated model rotation queue. If `gemini-3.5-flash` throws a `429 RESOURCE_EXHAUSTED` error, the system automatically tries:
  1. `gemini-2.5-flash`
  2. `gemini-3.1-flash-lite`
  3. `gemini-2.5-pro`
  4. `gemini-3.1-pro-preview`
  This ensures that patients are never disconnected during a crisis.

### Google Cloud Text-to-Speech API (Neural2 Engine)
- Synthesizes the generated emergency text using Google's DeepMind-powered Neural2 voice synthesizer. It exports the output as a 24kHz MP3 audio stream, ensuring high intelligibility over standard cellular voice networks.

### Google Maps Platform APIs
- **Geocoding API**: Translates raw text queries into precise geographic lat/long coordinates.
- **Places Nearby Search API**: Filters local health providers using physical distance indices.
- **Places Details API**: Returns essential clinical contact numbers.

### Firebase Firestore Database
- Serves as the central, real-time NoSQL database. A custom Javascript adapter is used to bridge standard Firebase Web client SDK methods to look like standard server-side Firebase Admin SDK methods (`collection.doc.get/set`), allowing unified and simple syntax across the app.

---

## 8. Detailed Database Schema

### Collection: `patients`
Stores registered patient accounts. Doc ID is the normalized mobile phone number.
```json
{
  "id": "919304189541",
  "name": "Rehan Raza",
  "phone": "+91 93041 89541",
  "emergencyContactName": "Clinical Care Team",
  "emergencyContactPhone": "+14155552671",
  "passcode": "****",
  "createdAt": "2026-07-01T03:45:00.000Z"
}
```

### Collection: `sessions`
Saves individual user sessions, tracking dialogues and logged moods. Doc ID is the unique UUID generated per user.
```json
{
  "patientId": "919304189541",
  "patient": {
    "name": "Rehan Raza",
    "phone": "+91 93041 89541",
    "emergencyContactName": "Clinical Care Team",
    "emergencyContactPhone": "+14155552671"
  },
  "messages": [
    {
      "id": "msg_u_1783031000",
      "role": "user",
      "content": "Hi doctor, I am feeling a lot of anxiety and my scalp is itching with white flakes.",
      "timestamp": "2026-07-01T03:46:12.000Z"
    },
    {
      "id": "msg_m_1783031020",
      "role": "model",
      "content": "Hello Rehan. I understand how uncomfortable an itchy scalp paired with anxiety can feel...",
      "timestamp": "2026-07-01T03:46:32.000Z",
      "escalationTriggered": false,
      "toolUsed": "log_mood"
    }
  ],
  "moods": [
    {
      "id": "mood_1783031030",
      "timestamp": "7/1/2026, 3:46:32 AM",
      "mood": "Anxious",
      "note": "Feeling tense and scalp is flaking."
    }
  ]
}
```

### Collection: `audit_logs`
A secure, immutable audit trail of triggered emergencies. Used for clinical accountability and legal defense.
```json
{
  "sessionId": "4ae22-90245-d2cbfcd",
  "timestamp": "2026-07-01T03:48:15.000Z",
  "reason": "Active self-harm ideation detected in patient dialogue.",
  "type": "emergency_escalation"
}
```

### Collection: `twilio_settings`
Saves Twilio voice credentials and target phone numbers.
```json
{
  "accountSid": "************************************",
  "authToken": "**********************************",
  "fromNumber": "+14246223903",
  "sandboxKeyword": "join mile-sale",
  "emergencyNumber": "+919304189541",
  "updatedAt": "2026-07-01T03:43:00.000Z"
}
```

---

## 9. Core Code Snippets & Key Implementations

### 9.1 Multi-Model Fallback LLM Execution Framework
This server-side routine rotates through alternative model aliases when the primary model hits API limits.

```typescript
async function generateContentWithFallback(ai: any, params: any) {
  const modelsToTry = [
    params.model,
    'gemini-2.5-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro',
    'gemini-3.1-pro-preview'
  ].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i);

  let lastError: any = null;

  for (const model of modelsToTry) {
    let retries = 3;
    let delay = 500;

    while (retries > 0) {
      try {
        console.log(`Attempting generateContent with model: ${model}`);
        return await ai.models.generateContent({
          ...params,
          model: model
        });
      } catch (error: any) {
        lastError = error;
        const errorMessage = String(error?.message || error || '').toLowerCase();

        // Check for rate limits or exhausted quotas
        const isQuotaOrRateLimit = errorMessage.includes('429') ||
                                   errorMessage.includes('limit') ||
                                   errorMessage.includes('quota') ||
                                   errorMessage.includes('resource_exhausted');

        const isTransient = errorMessage.includes('503') || 
                            errorMessage.includes('unavailable') || 
                            errorMessage.includes('temporary');

        if (isQuotaOrRateLimit) {
          console.warn(`Model ${model} hit quota. Switching immediately...`);
          break; // Try next model in list
        }

        if (isTransient && retries > 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
          retries--;
        } else {
          break; // Permanent failure for this model, try next
        }
      }
    }
  }
  throw lastError || new Error("All fallback models failed.");
}
```

---

### 9.2 Real-Time Google Cloud Text-to-Speech Synthesis
This service converts crisis notification text into natural, neural-synthesized female speech.

```typescript
async function generateTTS(text: string, customApiKey?: string): Promise<Buffer | null> {
  const apiKey = customApiKey || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('API Key missing, skipping Neural TTS.');
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
      console.warn('Google Cloud TTS failed, falling back to Twilio Speak.');
      return null;
    }
    const data: any = await response.json();
    if (data.audioContent) {
      return Buffer.from(data.audioContent, 'base64');
    }
  } catch (error) {
    console.error('TTS synthesis error:', error);
  }
  return null;
}
```

---

### 9.3 Twilio TwiML Dynamic Generation & Call Initiation
Initiates the phone call and serves TwiML instructions back to Twilio.

```typescript
// POST endpoint inside server.ts triggering Twilio Call
app.post('/api/chat', async (req, res) => {
  // ...
  if (toolUsed === 'emergency_escalation' || escalationTriggered) {
    try {
      const config = await getTwilioConfig();
      const twilioClient = await getTwilioClient();
      
      let fromNumber = (config.fromNumber || '').replace(/^whatsapp:/i, '').trim();
      const targetNumber = config.emergencyNumber || process.env.TWILIO_EMERGENCY_NUMBER;

      // Construct TwiML instruction URL
      const appUrl = process.env.APP_URL || `https://${req.get('host')}`;
      const twimlUrl = `${appUrl}/api/twilio/twiml?` + 
        (ttsCache ? `audioUrl=${encodeURIComponent(`${appUrl}/api/tts/escalation.mp3`)}&` : '') +
        `fallbackText=${encodeURIComponent(alertSpeechText)}`;

      await twilioClient.calls.create({
        url: twimlUrl,
        to: targetNumber,
        from: fromNumber
      });
      console.log('Outbound crisis call triggered.');
    } catch (err) {
      console.error('Call failed:', err);
    }
  }
});

// GET endpoint serving TwiML markup
app.get('/api/twilio/twiml', (req, res) => {
  const audioUrl = req.query.audioUrl as string;
  const fallbackText = req.query.fallbackText as string;
  res.set('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${audioUrl ? `<Play>${audioUrl}</Play>` : `<Say voice="alice">${fallbackText}</Say>`}
</Response>`);
});
```

---

### 9.4 Local Keyword-Based RAG Scoring and Retrieval Algorithm
Scores and retrieves documents locally when internet or AI models are unavailable.

```typescript
export function retrieveRAGDocs(query: string, maxResults = 3): RAGDoc[] {
  if (!query) return [];
  const normalizedQuery = query.toLowerCase();

  const scoredDocs = RAG_CORPUS.map(doc => {
    let score = 0;
    
    // Check title match
    if (doc.title.toLowerCase().includes(normalizedQuery)) {
      score += 15;
    }

    // Check individual keywords
    doc.keywords.forEach(kw => {
      if (normalizedQuery.includes(kw)) {
        score += 10;
        const regex = new RegExp(`\\b${kw}\\b`, 'i');
        if (regex.test(normalizedQuery)) {
          score += 8;
        }
      }
    });

    // Check content overlap
    const words = normalizedQuery.split(/\s+/);
    words.forEach(word => {
      if (word.length > 3 && doc.content.toLowerCase().includes(word)) {
        score += 1;
      }
    });

    return { doc, score };
  });

  return scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.doc)
    .slice(0, maxResults);
}
```

---

### 9.5 Firebase Client SDK Shim Mimicking Admin SDK API
Allows using standard server-side Firestore operations inside standard client environments.

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';

const app = initializeApp(config);
const firestoreInstance = getFirestore(app);

export const db = {
  collection(collectionName: string) {
    return {
      doc(docId: string) {
        const docRef = doc(firestoreInstance, collectionName, docId);
        return {
          async get() {
            const snap = await getDoc(docRef);
            return {
              exists: snap.exists(),
              data() { return snap.data(); }
            };
          },
          async set(data: any, options?: { merge?: boolean }) {
            await setDoc(docRef, data, options || {});
          }
        };
      },
      async add(data: any) {
        const colRef = collection(firestoreInstance, collectionName);
        const docRef = await addDoc(colRef, data);
        return {
          id: docRef.id,
          get() { return getDoc(docRef); }
        };
      },
      async get() {
        const colRef = collection(firestoreInstance, collectionName);
        const snap = await getDocs(colRef);
        return {
          docs: snap.docs.map(docSnap => ({
            id: docSnap.id,
            data() { return docSnap.data(); }
          }))
        };
      }
    };
  }
};
```

---

### 9.6 Security Gate Password Verification Panel (`Rehan@555`)
Hides sensitive configuration fields behind a password gate.

```typescript
{promptingPassword ? (
  <form 
    onSubmit={(e) => {
      e.preventDefault();
      if (passwordInput === 'Rehan@555') {
        setShowTwilioCredentials(true);
        setPromptingPassword(false);
        setPasswordInput('');
        setPasswordError(null);
      } else {
        setPasswordError('Incorrect password. Access denied.');
      }
    }}
    className="pt-2 border-t border-slate-800/40 space-y-2"
  >
    <label className="block text-[10px] font-bold text-amber-400 uppercase tracking-wider">
      Enter Authorization Password
    </label>
    <div className="flex gap-2">
      <input
        type="password"
        placeholder="••••••••"
        value={passwordInput}
        onChange={(e) => {
          setPasswordInput(e.target.value);
          if (passwordError) setPasswordError(null);
        }}
        className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none transition-all"
        autoFocus
        required
      />
      <button
        type="submit"
        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
      >
        Verify
      </button>
      <button
        type="button"
        onClick={() => {
          setPromptingPassword(false);
          setPasswordInput('');
          setPasswordError(null);
        }}
        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
      >
        Cancel
      </button>
    </div>
    {passwordError && (
      <p className="text-[10px] text-rose-400 font-semibold animate-pulse">
        ⚠️ {passwordError}
      </p>
    )}
  </form>
) : (
  <div className="pt-1 flex items-center justify-between">
    <button
      type="button"
      onClick={() => setPromptingPassword(true)}
      className="text-[10px] text-amber-400 font-extrabold hover:text-amber-300 transition-all underline tracking-wider uppercase cursor-pointer"
    >
      ⚙️ Reveal / Edit Configuration
    </button>
  </div>
)}
```

---

## 10. Step-by-Step Installation & Local Execution Guide

### Environment Variables Setup (`.env` and `.env.example`)
Create a file named `.env` in the root folder of the project. Fill in the variables as documented in `.env.example`:

```env
# Google Cloud Platform APIs
GEMINI_API_KEY=your_gemini_api_key_secret
GOOGLE_MAPS_API_KEY=your_google_cloud_all_inclusive_maps_and_tts_key

# Twilio Communication Credentials
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_FROM_NUMBER=+14246223903
TWILIO_SANDBOX_KEYWORD="join mile-sale"
TWILIO_EMERGENCY_NUMBER=+919304189541

# Firebase Configuration
FIREBASE_API_KEY=your_firebase_web_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
```

### Dynamic Twilio Outbound Credentials Configuration
1. Start the application.
2. In the right panel of the chat assistant interface, find the card named **Twilio Outbound Emergency Setup**.
3. It will default to saying **Credentials Active in Background**.
4. To modify or inspect the credentials, click **Reveal / Edit Configuration**.
5. Input the authorization password: `Rehan@555` and click **Verify**.
6. The inputs will be revealed. Update the Twilio Account SID, Auth Token, Outbound Caller ID, or target Fallback emergency numbers.
7. Click **Save Configuration**. The inputs will instantly disappear, encrypting the credentials securely in the background Firestore and `.env` variables while showing a success notification.

### Deploying and Starting the Production Application
1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Build Server and Client Bundles**:
   ```bash
   npm run build
   ```
   *This compiles the React SPA assets to `dist/`, and bundles the Node.js TypeScript server into `dist/server.cjs` using `esbuild`.*
3. **Run Application**:
   ```bash
   npm run start
   ```
   *The application will launch on port `3000` (binding to `0.0.0.0`), serving the client-side single page app alongside full backend API proxy endpoints.*

---

## 11. Conclusion & Future Scalability Map
The **AI Life Saver Alert** represents a giant leap forward in digital healthcare architecture. By unifying empathetic conversation with physical outbound telecom relays, it acts as a reliable first-line wellness responder. 

Future phases of the project aim to:
- **Integrate Biometric Smartwear**: Connect Apple HealthKit or Fitbit APIs to automatically trigger crisis calls if sudden heart-rate spikes or physical impact drops are recorded.
- **Support Multi-Lingual Dialects**: Dynamically synthesize localized language streams based on the patient's geographic location.
- **Add Native Video Diagnostics**: Enable real-time WebRTC streams for remote clinic consulting directly from the dashboard.

---
*Created with care by Rehan Raza & Google AI Studio.*
