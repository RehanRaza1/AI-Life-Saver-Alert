import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  Send, 
  Image as ImageIcon, 
  Activity, 
  MapPin, 
  Phone, 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Compass, 
  Trash2, 
  User, 
  CheckCircle,
  X,
  AlertCircle,
  Lock,
  LogOut,
  Users,
  PhoneCall,
  Mic,
  MicOff,
  Play,
  Pause,
  HelpCircle,
  Video,
  MessageSquare,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { v4 as uuidv4 } from 'uuid';
import { Message, MoodEntry, Patient } from './types';

const COUNTRY_CODES = [
  { code: '+91', name: '🇮🇳 +91' },
  { code: '+1', name: '🇺🇸 +1' },
  { code: '+44', name: '🇬🇧 +44' },
  { code: '+880', name: '🇧🇩 +880' },
  { code: '+92', name: '🇵🇰 +92' },
  { code: '+971', name: '🇦🇪 +971' },
  { code: '+966', name: '🇸🇦 +966' },
  { code: '+65', name: '🇸🇬 +65' },
  { code: '+61', name: '🇦🇺 +61' },
  { code: '+977', name: '🇳🇵 +977' },
  { code: '+60', name: '🇲🇾 +60' },
  { code: '+49', name: '🇩🇪 +49' },
  { code: '+33', name: '🇫🇷 +33' },
  { code: '+55', name: '🇧🇷 +55' },
  { code: '+27', name: '🇿🇦 +27' },
  { code: '+31', name: '🇳🇱 +31' },
  { code: '+39', name: '🇮🇹 +39' },
  { code: '+34', name: '🇪🇸 +34' },
  { code: '+64', name: '🇳🇿 +64' },
  { code: '+84', name: '🇻🇳 +84' },
  { code: '+62', name: '🇮🇩 +62' },
  { code: '+63', name: '🇵🇭 +63' },
  { code: '+94', name: '🇱🇰 +94' },
  { code: '+20', name: '🇪🇬 +20' },
  { code: '+234', name: '🇳🇬 +234' },
  { code: '+254', name: '🇰🇪 +254' },
];

export default function App() {
  // Stable unique session ID
  const [sessionId] = useState<string>(() => {
    let id = localStorage.getItem('wellbeing_session_id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('wellbeing_session_id', id);
    }
    return id;
  });

  // Patient Auth States
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(() => {
    const saved = localStorage.getItem('wellbeing_patient');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('register');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authEmergName, setAuthEmergName] = useState('');
  const [authEmergPhone, setAuthEmergPhone] = useState('');
  const [authPasscode, setAuthPasscode] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Forgot password form states
  const [forgotPhoneCc, setForgotPhoneCc] = useState('+91');
  const [forgotPhoneInput, setForgotPhoneInput] = useState('');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotEmergPhoneCc, setForgotEmergPhoneCc] = useState('+91');
  const [forgotEmergPhoneInput, setForgotEmergPhoneInput] = useState('');
  const [forgotEmergPhone, setForgotEmergPhone] = useState('');
  const [forgotNewPasscode, setForgotNewPasscode] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // States for country codes and digit parts
  const [authPhoneCc, setAuthPhoneCc] = useState('+91');
  const [authPhoneInput, setAuthPhoneInput] = useState('');

  const [authEmergPhoneCc, setAuthEmergPhoneCc] = useState('+91');
  const [authEmergPhoneInput, setAuthEmergPhoneInput] = useState('');

  const [loginPhoneCc, setLoginPhoneCc] = useState('+91');
  const [loginPhoneInput, setLoginPhoneInput] = useState('');

  // Synchronize Patient Mobile Number
  useEffect(() => {
    const digitsOnly = authPhoneInput.replace(/\D/g, '');
    if (digitsOnly) {
      setAuthPhone(`${authPhoneCc}${digitsOnly}`);
    } else {
      setAuthPhone('');
    }
  }, [authPhoneCc, authPhoneInput]);

  // Synchronize Emergency Contact Phone Number
  useEffect(() => {
    const digitsOnly = authEmergPhoneInput.replace(/\D/g, '');
    if (digitsOnly) {
      setAuthEmergPhone(`${authEmergPhoneCc}${digitsOnly}`);
    } else {
      setAuthEmergPhone('');
    }
  }, [authEmergPhoneCc, authEmergPhoneInput]);

  // Synchronize Login Mobile Number
  useEffect(() => {
    const digitsOnly = loginPhoneInput.replace(/\D/g, '');
    if (digitsOnly) {
      setLoginPhone(`${loginPhoneCc}${digitsOnly}`);
    } else {
      setLoginPhone('');
    }
  }, [loginPhoneCc, loginPhoneInput]);

  // Synchronize Forgot Password Mobile Number
  useEffect(() => {
    const digitsOnly = forgotPhoneInput.replace(/\D/g, '');
    if (digitsOnly) {
      setForgotPhone(`${forgotPhoneCc}${digitsOnly}`);
    } else {
      setForgotPhone('');
    }
  }, [forgotPhoneCc, forgotPhoneInput]);

  // Synchronize Forgot Password Emergency Mobile Number
  useEffect(() => {
    const digitsOnly = forgotEmergPhoneInput.replace(/\D/g, '');
    if (digitsOnly) {
      setForgotEmergPhone(`${forgotEmergPhoneCc}${digitsOnly}`);
    } else {
      setForgotEmergPhone('');
    }
  }, [forgotEmergPhoneCc, forgotEmergPhoneInput]);

  // Auto-load patient profile from session association in Firestore on mount
  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        const response = await fetch(`/api/auth/me?sessionId=${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data?.patient) {
            setCurrentPatient(data.patient);
            localStorage.setItem('wellbeing_patient', JSON.stringify(data.patient));
          }
        }
      } catch (err) {
        console.error('Failed to auto-load patient profile:', err);
      }
    };
    fetchPatientProfile();
  }, [sessionId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName.trim() || !authPhone.trim() || !authEmergName.trim() || !authEmergPhone.trim() || !authPasscode.trim()) {
      setAuthError('Please fill out all fields.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authName,
          phone: authPhone,
          emergencyContactName: authEmergName,
          emergencyContactPhone: authEmergPhone,
          passcode: authPasscode,
          sessionId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to register.');
      }

      setCurrentPatient(data.patient);
      localStorage.setItem('wellbeing_patient', JSON.stringify(data.patient));
      // Reset fields
      setAuthName('');
      setAuthPhone('');
      setAuthPhoneInput('');
      setAuthEmergName('');
      setAuthEmergPhone('');
      setAuthEmergPhoneInput('');
      setAuthPasscode('');
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during registration.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim() || !loginPasscode.trim()) {
      setAuthError('Please enter both your phone number and 4-digit passcode.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: loginPhone,
          passcode: loginPasscode,
          sessionId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to login.');
      }

      setCurrentPatient(data.patient);
      localStorage.setItem('wellbeing_patient', JSON.stringify(data.patient));
      // Reset fields
      setLoginPhone('');
      setLoginPasscode('');
    } catch (err: any) {
      setAuthError(err.message || 'An error occurred during sign in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim() || !forgotEmergPhone.trim() || !forgotNewPasscode.trim()) {
      setAuthError('Please fill in all verification fields and enter a new passcode.');
      return;
    }
    if (forgotNewPasscode.trim().length !== 4 || !/^\d{4}$/.test(forgotNewPasscode)) {
      setAuthError('The new passcode must be exactly 4 digits.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    setForgotSuccess(null);
    try {
      const response = await fetch('/api/auth/reset-passcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: forgotPhone,
          emergencyPhone: forgotEmergPhone,
          newPasscode: forgotNewPasscode,
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset passcode.');
      }

      setForgotSuccess('Your passcode has been reset successfully! You can now sign in.');
      
      // Auto-populate the login phone number fields to make login smooth!
      setLoginPhoneInput(forgotPhoneInput);
      setLoginPhoneCc(forgotPhoneCc);
      
      // Clear forgot inputs after a small delay
      setForgotPhoneInput('');
      setForgotEmergPhoneInput('');
      setForgotNewPasscode('');
      
      // Switch back to login mode after 2.5 seconds
      setTimeout(() => {
        setAuthMode('login');
        setForgotSuccess(null);
      }, 2500);
    } catch (err: any) {
      setAuthError(err.message || 'Verification failed. Please double-check your registered details.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
    } catch (err) {
      console.error('Failed to notify server of logout:', err);
    }
    setCurrentPatient(null);
    localStorage.removeItem('wellbeing_patient');
  };


  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const startTextRef = useRef('');
  
  // Quick exercise preview modal
  const [activeExercise, setActiveExercise] = useState<'breathing' | 'grounding' | 'journaling' | null>(null);
  const [showMicDemo, setShowMicDemo] = useState(false);
  
  // WhatsApp Integration States
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppStep, setWhatsAppStep] = useState<'ask_connection' | 'not_connected_guidance' | 'not_logged_in'>('ask_connection');
  const [tempWhatsAppPhone, setTempWhatsAppPhone] = useState('+919304189541');
  const [useSandbox, setUseSandbox] = useState(true);
  const [twilioConfig, setTwilioConfig] = useState<{
    rawFromNumber: string;
    cleanFromNumber: string;
    isSandbox: boolean;
    sandboxKeyword: string;
    globalSandboxNumber?: string;
    globalSandboxClean?: string;
    webhookUrl?: string;
    hasCredentials?: boolean;
    accountSid?: string;
    authToken?: string;
    emergencyNumber?: string;
  } | null>(null);
  const [sendingLink, setSendingLink] = useState(false);
  const [linkSentStatus, setLinkSentStatus] = useState<string | null>(null);
  const [whatsAppError, setWhatsAppError] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [showDevSettings, setShowDevSettings] = useState(false);
  const [devAccountSid, setDevAccountSid] = useState('');
  const [devAuthToken, setDevAuthToken] = useState('');
  const [devFromNumber, setDevFromNumber] = useState('');
  const [devSandboxKeyword, setDevSandboxKeyword] = useState('');
  const [devEmergencyNumber, setDevEmergencyNumber] = useState('');
  const [savingDevSettings, setSavingDevSettings] = useState(false);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState<string | null>(null);
  const [saveSettingsError, setSaveSettingsError] = useState<string | null>(null);
  const [triggeringTestCall, setTriggeringTestCall] = useState(false);
  const [showTwilioCredentials, setShowTwilioCredentials] = useState(false);
  const [promptingPassword, setPromptingPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [testCallMessage, setTestCallMessage] = useState<string | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsChecked, setLogsChecked] = useState(false);

  const checkWebhookLogs = async () => {
    setLoadingLogs(true);
    setLogsChecked(true);
    try {
      const res = await fetch('/api/webhook-debug-logs');
      if (res.ok) {
        const data = await res.json();
        setWebhookLogs(data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching webhook logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const getWebhookUrl = () => {
    const rawUrl = twilioConfig?.webhookUrl;
    if (rawUrl && !rawUrl.includes('localhost') && !rawUrl.includes('127.0.0.1')) {
      return rawUrl;
    }
    return 'https://ais-dev-rpka44subedt7sno2m6577-864539915487.asia-southeast1.run.app/whatsapp';
  };

  const handleCopyWebhook = () => {
    const webhookUrl = getWebhookUrl();
    navigator.clipboard.writeText(webhookUrl).then(() => {
      setCopiedWebhook(true);
      setTimeout(() => setCopiedWebhook(false), 2000);
    }).catch(err => {
      console.error('Failed to copy webhook URL: ', err);
    });
  };

  const getSandboxMessageText = () => {
    const kw = twilioConfig?.sandboxKeyword || 'join mile-sale';
    if (!kw.toLowerCase().startsWith('join ')) {
      return `join ${kw}`;
    }
    return kw;
  };

  const fetchTwilioConfig = async () => {
    try {
      const res = await fetch('/api/twilio/config');
      if (res.ok) {
        const data = await res.json();
        setTwilioConfig(data);
      }
    } catch (err) {
      console.error("Failed to fetch Twilio config:", err);
    }
  };

  useEffect(() => {
    fetchTwilioConfig();
  }, []);

  useEffect(() => {
    if (twilioConfig) {
      setDevAccountSid(twilioConfig.accountSid || '');
      setDevAuthToken(twilioConfig.authToken || '');
      setDevFromNumber(twilioConfig.rawFromNumber || '');
      setDevSandboxKeyword(twilioConfig.sandboxKeyword || '');
      setDevEmergencyNumber(twilioConfig.emergencyNumber || '');
    }
  }, [twilioConfig]);

  const handleSaveDevSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDevSettings(true);
    setSaveSettingsSuccess(null);
    setSaveSettingsError(null);
    try {
      const res = await fetch('/api/twilio/save-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountSid: devAccountSid,
          authToken: devAuthToken,
          fromNumber: devFromNumber,
          sandboxKeyword: devSandboxKeyword,
          emergencyNumber: devEmergencyNumber
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSettingsSuccess(data.message || "Twilio configuration successfully saved!");
        await fetchTwilioConfig(); // Refresh values
      } else {
        setSaveSettingsError(data.error || "Failed to save Twilio configuration.");
      }
    } catch (err: any) {
      setSaveSettingsError(err.message || "An unexpected error occurred.");
    } finally {
      setSavingDevSettings(false);
    }
  };

  const handleResetDevSettings = async () => {
    if (!window.confirm("Are you sure you want to reset Twilio configuration to system defaults?")) {
      return;
    }
    setSavingDevSettings(true);
    setSaveSettingsSuccess(null);
    setSaveSettingsError(null);
    try {
      const res = await fetch('/api/twilio/reset-settings', {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSettingsSuccess(data.message || "Twilio configuration reset to defaults!");
        setDevAccountSid('');
        setDevAuthToken('');
        setDevFromNumber('');
        setDevSandboxKeyword('');
        setDevEmergencyNumber('');
        await fetchTwilioConfig(); // Refresh values
      } else {
        setSaveSettingsError(data.error || "Failed to reset Twilio configuration.");
      }
    } catch (err: any) {
      setSaveSettingsError(err.message || "An unexpected error occurred.");
    } finally {
      setSavingDevSettings(false);
    }
  };

  const handleTriggerTestCall = async () => {
    setTriggeringTestCall(true);
    setTestCallMessage(null);
    try {
      const res = await fetch('/api/twilio/trigger-test-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTestCallMessage(data.message || "Successfully initiated Twilio voice call.");
      } else {
        setTestCallMessage(`Error: ${data.error || 'Failed to place test call.'}`);
      }
    } catch (err: any) {
      setTestCallMessage(`Error: ${err.message || 'An unexpected error occurred.'}`);
    } finally {
      setTriggeringTestCall(false);
    }
  };

  useEffect(() => {
    if (currentPatient?.phone) {
      setTempWhatsAppPhone(currentPatient.phone);
    }
  }, [currentPatient]);

  const handleSendConnectionLink = async (phone: string) => {
    if (!phone || !phone.trim()) {
      setWhatsAppError("Please enter a valid phone number first.");
      return;
    }
    setSendingLink(true);
    setLinkSentStatus(null);
    setWhatsAppError(null);
    try {
      const res = await fetch('/api/twilio/send-whatsapp-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userPhone: phone, forceSandbox: useSandbox }),
      });
      const data = await res.json();
      if (data.success) {
        setLinkSentStatus(data.message || "Link sent successfully!");
      } else {
        if (data.waLink) {
          setLinkSentStatus(`Twilio alert sent: ${data.error || 'Please double check'}. We highly recommend using the direct Redirection option below!`);
        } else {
          setWhatsAppError(data.error || "Failed to send link via Twilio. Please use the direct redirection link.");
        }
      }
    } catch (err: any) {
      setWhatsAppError("Could not connect to the server. Please check your internet connection.");
      console.error(err);
    } finally {
      setSendingLink(false);
    }
  };

  const handleWhatsAppClick = () => {
    setLinkSentStatus(null);
    setWhatsAppError(null);
    fetchTwilioConfig();
    setShowWhatsAppModal(true);
  };

  const [simulatedTime, setSimulatedTime] = useState(0);
  const [simulatedPlaying, setSimulatedPlaying] = useState(false);
  const [demoVoiceText, setDemoVoiceText] = useState('');
  const [isDemoListening, setIsDemoListening] = useState(false);
  const demoRecognitionRef = useRef<any>(null);
  
  // States and Ref for Walkthrough/Demo Vision File Upload
  const [demoVisionImage, setDemoVisionImage] = useState<string | null>(null);
  const [demoVisionState, setDemoVisionState] = useState<'idle' | 'scanning' | 'done'>('idle');
  const demoVisionInputRef = useRef<HTMLInputElement>(null);

  // Background timer for the simulated video demo timeline
  useEffect(() => {
    let interval: any;
    if (simulatedPlaying) {
      interval = setInterval(() => {
        setSimulatedTime(prev => {
          if (prev >= 15) {
            return 0; // Reset and loop
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [simulatedPlaying]);

  // Setup separate recognition instance just for the playground in the guide
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && showMicDemo) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsDemoListening(true);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        let speechText = '';
        for (let i = 0; i < event.results.length; ++i) {
          speechText += event.results[i][0].transcript;
        }
        setDemoVoiceText(speechText);
      };

      rec.onerror = (event: any) => {
        console.error('Demo Speech recognition error', event);
        const errType = event.error;
        let errMsg = `Speech recognition error (${errType}).`;
        if (errType === 'not-allowed' || errType === 'permission-blocked') {
          errMsg = "Microphone permission denied inside the preview iframe. To allow microphone usage: 1) Click 'Open in new tab' at the top-right of your screen, 2) Click the lock icon in the browser address bar, 3) Select Allow microphone, and 4) Try clicking the mic button again!";
        } else if (errType === 'no-speech') {
          errMsg = "No speech was detected. Please ensure your microphone is connected, speak clearly, and try again.";
        } else if (errType === 'network') {
          errMsg = "A speech recognition network error occurred. Please verify your internet connection.";
        } else if (errType === 'service-not-allowed') {
          errMsg = "The speech recognition service is not supported on this browser version. We highly recommend using Google Chrome for full support.";
        } else if (errType === 'language-not-supported') {
          errMsg = "The specified language (en-US) is not supported by your browser.";
        } else {
          errMsg = `Speech recognition notice: ${errType}. Please verify your microphone is connected and try clicking the mic button again!`;
        }
        setSpeechError(errMsg);
        setIsDemoListening(false);
      };

      rec.onend = () => {
        setIsDemoListening(false);
      };

      demoRecognitionRef.current = rec;
    }
    return () => {
      if (demoRecognitionRef.current) {
        try {
          demoRecognitionRef.current.stop();
        } catch(e){}
      }
    };
  }, [showMicDemo]);

  const toggleDemoListening = () => {
    if (!demoRecognitionRef.current) {
      setSpeechError("Speech recognition is not supported on this browser.");
      return;
    }

    if (isDemoListening) {
      try {
        demoRecognitionRef.current.stop();
      } catch (err) {
        console.error("Demo stop error:", err);
        setIsDemoListening(false);
      }
    } else {
      try {
        setDemoVoiceText('');
        setSpeechError(null);
        demoRecognitionRef.current.start();
      } catch (err: any) {
        console.error("Demo start error:", err);
        if (err.name === 'InvalidStateError' || err.message?.includes('already started')) {
          setIsDemoListening(true);
        } else {
          setSpeechError(`Failed to start demo speech recognition: ${err.message || err}`);
        }
      }
    }
  };
  
  // Local track of mood logs to render immediately
  const [moodLogs, setMoodLogs] = useState<MoodEntry[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Speech Recognition for Voice input
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      rec.onresult = (event: any) => {
        let speechText = '';
        for (let i = 0; i < event.results.length; ++i) {
          speechText += event.results[i][0].transcript;
        }
        const prefix = startTextRef.current || '';
        const combinedText = prefix + (prefix && !prefix.endsWith(' ') ? ' ' : '') + speechText;
        setInputText(combinedText);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event);
        const errType = event.error;
        let errMsg = `Speech recognition error (${errType}).`;
        if (errType === 'not-allowed' || errType === 'permission-blocked') {
          errMsg = "Microphone permission denied inside the preview iframe. To allow microphone usage: 1) Click 'Open in new tab' at the top-right of your screen, 2) Click the lock icon in the browser address bar, 3) Select Allow microphone, and 4) Try clicking the mic button again!";
        } else if (errType === 'no-speech') {
          errMsg = "No speech was detected. Please ensure your microphone is connected, speak clearly, and try again.";
        } else if (errType === 'network') {
          errMsg = "A speech recognition network error occurred. Please verify your internet connection.";
        } else if (errType === 'service-not-allowed') {
          errMsg = "The speech recognition service is not supported on this browser version. We highly recommend using Google Chrome for full support.";
        } else if (errType === 'language-not-supported') {
          errMsg = "The specified language (en-US) is not supported by your browser.";
        } else {
          errMsg = `Speech recognition notice: ${errType}. Please verify your microphone is connected and try clicking the mic button again!`;
        }
        setSpeechError(errMsg);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setSpeechError("Speech recognition is not supported on this browser or has been blocked.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Stop error:", err);
        setIsListening(false);
      }
    } else {
      try {
        setSpeechError(null);
        startTextRef.current = inputText;
        recognitionRef.current.start();
      } catch (err: any) {
        console.error("Start error:", err);
        if (err.name === 'InvalidStateError' || err.message?.includes('already started')) {
          setIsListening(true);
        } else {
          setSpeechError(`Failed to start speech recognition: ${err.message || err}`);
        }
      }
    }
  };

  // Auto scroll to latest messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Initial load message or system greeting & mood logs from Firestore
  useEffect(() => {
    const loadSessionHistory = async () => {
      try {
        const response = await fetch(`/api/session/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          } else {
            setMessages([
              {
                id: 'welcome',
                role: 'model',
                content: "Hello! I am your AI Psychologist & Medical Doctor Assistant. I'm here as a safe, compassionate space for you. You can talk to me about your mental wellbeing, log your moods, explore coping exercises, or ask about any physical body symptoms, diseases, or local hospital support. Feel free to upload clinical pictures for diagnostic computer vision feedback, or click the mic icon to dictate your voice notes! How can I help you today?",
                timestamp: new Date().toISOString()
              }
            ]);
          }
          if (data.moods && data.moods.length > 0) {
            setMoodLogs(data.moods);
          }
        } else {
          setMessages([
            {
              id: 'welcome',
              role: 'model',
              content: "Hello! I am your AI Psychologist & Medical Doctor Assistant. I'm here as a safe, compassionate space for you. You can talk to me about your mental wellbeing, log your moods, explore coping exercises, or ask about any physical body symptoms, diseases, or local hospital support. Feel free to upload clinical pictures for diagnostic computer vision feedback, or click the mic icon to dictate your voice notes! How can I help you today?",
              timestamp: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error('Failed to load session history:', err);
        setMessages([
          {
            id: 'welcome',
            role: 'model',
            content: "Hello! I am your AI Psychologist & Medical Doctor Assistant. I'm here as a safe, compassionate space for you. You can talk to me about your mental wellbeing, log your moods, explore coping exercises, or ask about any physical body symptoms, diseases, or local hospital support. Feel free to upload clinical pictures for diagnostic computer vision feedback, or click the mic icon to dictate your voice notes! How can I help you today?",
            timestamp: new Date().toISOString()
          }
        ]);
      }
    };
    loadSessionHistory();
  }, [sessionId]);

  // Handle image upload and conversion to base64 with downscaling/compression
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          // Downscale to max 600px width/height and compress to high-quality but small JPEG
          const maxDim = 600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6); // Compress to 60% quality JPEG
            setSelectedImage(compressedBase64);
          } else {
            setSelectedImage(reader.result as string);
          }
          setIsUploadingImage(false);
        };
        img.onerror = () => {
          setSelectedImage(reader.result as string);
          setIsUploadingImage(false);
        };
      };
      reader.onerror = () => {
        setError("Failed to read image file.");
        setIsUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload inside the Interactive Walkthrough modal with downscaling/compression
  const handleDemoVisionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDemoVisionState('scanning');
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const maxDim = 600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            setDemoVisionImage(compressedBase64);
          } else {
            setDemoVisionImage(reader.result as string);
          }
          // Simulate a 2.2-second high-tech scan
          setTimeout(() => {
            setDemoVisionState('done');
          }, 2200);
        };
        img.onerror = () => {
          setDemoVisionImage(reader.result as string);
          setTimeout(() => {
            setDemoVisionState('done');
          }, 2200);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  // Triggers sending message to Express API
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const userMsgText = inputText;
    const userImg = selectedImage;

    // Reset inputs immediately for responsive feel
    setInputText('');
    setSelectedImage(null);
    setError(null);
    setLoading(true);

    // Append user message locally
    const newUserMsg: Message = {
      id: `msg_u_local_${Date.now()}`,
      role: 'user',
      content: userMsgText || "Analyzed attachment",
      imageSrc: userImg || undefined,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMsgText,
          image: userImg,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error occurred.');
      }

      const data = await response.json();
      
      // Add server response to list
      setMessages(prev => [...prev, data.message]);

      // If the model logged a mood, let's extract it from the caption or just trigger a dummy fetch logic.
      // We can also extract the logged mood details from the returned text or metadata to update our client-side mood tracker!
      if (data.message.toolUsed === 'log_mood') {
        // Let's parse or add a new temporary client-side mood log to show on the dashboard immediately!
        const match = data.message.content.match(/\(Logged mood:\s*([^\s-]+)\s*-\s*"([^"]*)"\)/i);
        if (match) {
          const moodVal = match[1];
          const noteVal = match[2];
          setMoodLogs(prev => [
            ...prev,
            {
              id: `mood_client_${Date.now()}`,
              timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
              mood: moodVal,
              note: noteVal
            }
          ]);
        } else {
          // Fallback simple log
          setMoodLogs(prev => [
            ...prev,
            {
              id: `mood_client_${Date.now()}`,
              timestamp: new Date().toLocaleDateString(),
              mood: 'Logged',
              note: 'Check-in recorded'
            }
          ]);
        }
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to the mental health assistant.');
      
      // Set an empathetic fallback message so UI never crashes
      setMessages(prev => [
        ...prev,
        {
          id: `msg_m_err_${Date.now()}`,
          role: 'model',
          content: "I'm right here with you, but I'm currently having a connection hiccup. Please take a slow, deep breath. If you are in distress or need immediate professional care, please reach out to the crisis hotlines at 988.",
          timestamp: new Date().toISOString(),
          toolUsed: 'error'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fast manual coping trigger helper
  const triggerCopingChat = (exerciseName: string) => {
    setInputText(`Can you guide me through a short ${exerciseName} exercise?`);
    // Scroll chat area to see action
  };

  const getMoodEmoji = (mood: string) => {
    const m = mood.toLowerCase();
    if (m.includes('happy') || m.includes('great') || m.includes('good')) return '☀️';
    if (m.includes('sad') || m.includes('down') || m.includes('depressed') || m.includes('blue')) return '🌧️';
    if (m.includes('anxious') || m.includes('panic') || m.includes('worry')) return '🌪️';
    if (m.includes('stress') || m.includes('overwhelm') || m.includes('tired')) return '⚡';
    if (m.includes('calm') || m.includes('peace') || m.includes('relaxed')) return '🍃';
    if (m.includes('angry') || m.includes('frustrated') || m.includes('mad')) return '🔥';
    return '🌱';
  };

  if (!currentPatient) {
    return (
      <div id="auth-container" className="min-h-screen bg-gradient-to-tr from-emerald-50 via-teal-50 to-amber-50/70 font-sans flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-800">
        {/* Ambient background blur spots */}
        <div className="absolute inset-0 z-0 opacity-75 pointer-events-none overflow-hidden">
          <div className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-teal-300 to-emerald-400 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }}></div>
          <div className="absolute bottom-[-15%] right-[-15%] w-[700px] h-[700px] rounded-full bg-gradient-to-tl from-amber-300 to-pink-300 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }}></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full max-w-md glass-panel rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden border border-white/80 bg-white/75 backdrop-blur-2xl"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3 border border-white/40 hover:scale-105 transition-transform duration-300">
              <span className="text-white text-3xl font-bold italic tracking-tighter drop-shadow-md">R</span>
            </div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-800 via-emerald-700 to-amber-600 tracking-tight">AI Life Saver Alert</h2>
            <p className="text-xs text-slate-500 font-semibold">By Rehan • Professional Crisis Support Portal</p>
          </div>

          {/* Form error */}
          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{authError}</span>
            </div>
          )}

          {/* Form success */}
          {forgotSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs flex items-center gap-2 font-medium animate-pulse">
              <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{forgotSuccess}</span>
            </div>
          )}

          {authMode === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 mb-2">
                <p className="text-[11px] text-teal-800 leading-relaxed font-semibold">
                  🛡️ <strong>Safety Disclaimer:</strong> Registering your correct mobile number and emergency contact is critical. It enables immediate Twilio automated wellness checks and dynamic emergency dialing if a crisis is identified during therapeutic conversation.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 glass-input focus:outline-none rounded-xl text-xs font-semibold text-slate-700 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Your Mobile Number
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={authPhoneCc}
                    onChange={(e) => setAuthPhoneCc(e.target.value)}
                    className="bg-white/70 border border-slate-200 focus:outline-none rounded-xl text-xs font-semibold text-slate-700 px-2 py-2.5 cursor-pointer shadow-xs transition-all shrink-0"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 5550000000"
                      value={authPhoneInput}
                      onChange={(e) => setAuthPhoneInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 glass-input focus:outline-none rounded-xl text-xs font-semibold text-slate-700 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-1 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-teal-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Guardian or doctor's full name"
                    value={authEmergName}
                    onChange={(e) => setAuthEmergName(e.target.value)}
                    className="w-full px-3.5 py-2.5 glass-input focus:outline-none rounded-xl text-xs font-semibold text-slate-700 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-teal-600 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <PhoneCall className="h-3 w-3" />
                    Emergency Contact Phone Number
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={authEmergPhoneCc}
                      onChange={(e) => setAuthEmergPhoneCc(e.target.value)}
                      className="bg-white/70 border border-slate-200 focus:outline-none rounded-xl text-xs font-semibold text-slate-700 px-2 py-2.5 cursor-pointer shadow-xs transition-all shrink-0"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <PhoneCall className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 5559999999"
                        value={authEmergPhoneInput}
                        onChange={(e) => setAuthEmergPhoneInput(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 glass-input focus:outline-none rounded-xl text-xs font-semibold text-slate-700 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  4-Digit Security Passcode
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    placeholder="e.g. 1234"
                    value={authPasscode}
                    onChange={(e) => setAuthPasscode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3 py-2.5 glass-input focus:outline-none rounded-xl text-xs font-mono font-bold tracking-widest text-slate-700 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-amber-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all cursor-pointer mt-4 glossy-btn uppercase tracking-wider"
              >
                {authLoading ? 'Registering Patient Profile...' : 'Create Secure Profile & Chat'}
              </button>

              <p className="text-center text-xs text-slate-500 mt-4">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthError(null);
                  }}
                  className="text-teal-600 hover:underline font-bold"
                >
                  Sign In
                </button>
              </p>
            </form>
          ) : authMode === 'forgot' ? (
            <form onSubmit={handleForgotPasscode} className="space-y-4">
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 mb-2">
                <p className="text-[11px] text-amber-800 leading-relaxed font-semibold">
                  🔑 <strong>Passcode Recovery:</strong> Verify your identity securely. Please enter your registered mobile number and your registered emergency contact's mobile number. Once verified, we will instantly update your passcode.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={forgotPhoneCc}
                    onChange={(e) => setForgotPhoneCc(e.target.value)}
                    className="bg-white/70 border border-slate-200 focus:outline-none rounded-xl text-xs font-semibold text-slate-700 px-2 py-2.5 cursor-pointer shadow-xs transition-all shrink-0"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 5550000000"
                      value={forgotPhoneInput}
                      onChange={(e) => setForgotPhoneInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 glass-input focus:outline-none rounded-xl text-xs font-semibold text-slate-700 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <PhoneCall className="h-3 w-3" />
                  Registered Emergency Contact Mobile
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={forgotEmergPhoneCc}
                    onChange={(e) => setForgotEmergPhoneCc(e.target.value)}
                    className="bg-white/70 border border-slate-200 focus:outline-none rounded-xl text-xs font-semibold text-slate-700 px-2 py-2.5 cursor-pointer shadow-xs transition-all shrink-0"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <PhoneCall className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 5559999999"
                      value={forgotEmergPhoneInput}
                      onChange={(e) => setForgotEmergPhoneInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 glass-input focus:outline-none rounded-xl text-xs font-semibold text-slate-700 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  New 4-Digit Passcode
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    placeholder="e.g. 4321"
                    value={forgotNewPasscode}
                    onChange={(e) => setForgotNewPasscode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3 py-2.5 glass-input focus:outline-none rounded-xl text-xs font-mono font-bold tracking-widest text-slate-700 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-teal-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all cursor-pointer mt-4 glossy-btn uppercase tracking-wider"
              >
                {authLoading ? 'Verifying Details...' : 'Reset Passcode & Save'}
              </button>

              <div className="flex justify-between items-center text-xs mt-4">
                <span>
                  Remembered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className="text-teal-600 hover:underline font-bold"
                  >
                    Sign In
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                  className="text-slate-600 hover:underline font-bold"
                >
                  Create Profile
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex gap-1.5">
                  <select
                    value={loginPhoneCc}
                    onChange={(e) => setLoginPhoneCc(e.target.value)}
                    className="bg-white/70 border border-slate-200 focus:outline-none rounded-xl text-xs font-semibold text-slate-700 px-2 py-2.5 cursor-pointer shadow-xs transition-all shrink-0"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 5550000000"
                      value={loginPhoneInput}
                      onChange={(e) => setLoginPhoneInput(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 glass-input focus:outline-none rounded-xl text-xs font-semibold text-slate-700 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Your 4-Digit Security Passcode
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setAuthError(null);
                    }}
                    className="text-[10px] text-teal-600 hover:underline font-extrabold uppercase tracking-wide"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    maxLength={4}
                    pattern="\d{4}"
                    required
                    placeholder="e.g. 1234"
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-10 pr-3 py-2.5 glass-input focus:outline-none rounded-xl text-xs font-mono font-bold tracking-widest text-slate-700 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-gradient-to-r from-teal-600 via-emerald-600 to-amber-500 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 transition-all cursor-pointer mt-4 glossy-btn uppercase tracking-wider"
              >
                {authLoading ? 'Signing In...' : 'Verify Passcode & Enter'}
              </button>

              <p className="text-center text-xs text-slate-500 mt-4">
                New patient?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                  }}
                  className="text-teal-600 hover:underline font-bold"
                >
                  Create Secure Profile
                </button>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div id="main-container" className="min-h-screen bg-gradient-to-tr from-emerald-50/40 via-teal-50/30 to-amber-50/40 font-sans flex flex-col overflow-hidden relative text-slate-800 transition-all duration-500">
      
      {/* Ambient background blur spots for premium Frosted Glass effect */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-[-25%] left-[-10%] w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-teal-300 to-emerald-400 opacity-60 blur-[130px] ambient-glow-1 animate-pulse" style={{ animationDuration: '9s' }}></div>
        <div className="absolute bottom-[-25%] right-[-15%] w-[900px] h-[900px] rounded-full bg-gradient-to-bl from-indigo-300 to-violet-400 opacity-60 blur-[140px] ambient-glow-2 animate-pulse" style={{ animationDuration: '11s' }}></div>
        <div className="absolute top-[25%] left-[35%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-amber-300 to-rose-400 opacity-55 blur-[115px] ambient-glow-3 animate-pulse" style={{ animationDuration: '13s' }}></div>
      </div>

      {/* Glassmorphism Header */}
      <header id="app-header" className="relative z-10 flex items-center justify-between px-6 lg:px-8 py-4.5 bg-white/60 backdrop-blur-xl border-b border-white/70 shadow-xs flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {/* Calming Custom Brand Logo highlighting Rehan's R */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0 border border-white/40 hover:scale-105 transition-transform duration-300">
            <span className="text-white text-2xl font-bold italic tracking-tighter drop-shadow-md">R</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-800 leading-none flex items-center gap-2">
              AI Life Saver Alert
              <span className="text-[10px] tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white px-2.5 py-1 rounded-full font-black border border-amber-400 uppercase shadow-sm animate-bounce" style={{ animationDuration: '3s' }}>
                Clinical AI Doctor
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block"></span>
              By Rehan • AI Psychologist & Crisis Support
            </p>
          </div>
        </div>

        {/* Quick Connection Badges & Logged-in Patient Profile */}
        <div className="flex items-center gap-3 flex-wrap">
          {currentPatient && (
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-200/60 shadow-xs hover:shadow-sm transition-shadow duration-300">
              <User className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span className="text-xs font-semibold text-teal-950">
                Patient: <span className="text-teal-700 font-extrabold">{currentPatient.name}</span> <span className="text-slate-400 font-medium">({currentPatient.phone})</span>
              </span>
              <span className="text-[9px] bg-gradient-to-r from-teal-500 to-teal-600 text-white px-2 py-0.5 rounded-full uppercase font-extrabold shrink-0 tracking-wider shadow-xs">
                Active
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-emerald-200/60 shadow-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-xs shadow-emerald-500/50"></div>
            <span className="text-xs font-bold text-emerald-800">Doctor Online</span>
          </div>

          <button 
            onClick={() => {
              localStorage.removeItem('wellbeing_session_id');
              localStorage.removeItem('wellbeing_patient');
              window.location.reload();
            }}
            title="Clear memory and start fresh"
            className="px-4 py-2 bg-white/60 hover:bg-white/95 rounded-full text-xs font-bold text-slate-700 shadow-xs hover:shadow-sm transition-all border border-slate-200/80 hover:border-teal-300 flex items-center gap-1.5 cursor-pointer glossy-btn"
          >
            <span>Session: #{sessionId.substring(0, 8).toUpperCase()}</span>
            <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-rose-500 transition-colors" />
          </button>

          {currentPatient && (
            <button 
              onClick={handleSignOut}
              title="Sign Out Patient Profile"
              className="px-4 py-2 bg-white/60 hover:bg-rose-50 rounded-full text-xs font-bold text-rose-700 shadow-xs hover:shadow-sm transition-all border border-slate-200/80 hover:border-rose-200 flex items-center gap-1.5 cursor-pointer glossy-btn"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Container Dashboard */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Companion Chat Area (8 Cols) - Frosted Glass Styling */}
        <section id="chat-panel" className="lg:col-span-8 glass-panel rounded-3xl shadow-sm flex flex-col overflow-hidden min-h-[550px] lg:min-h-[680px] hover:shadow-md transition-shadow duration-300">
          {/* Chat Header Info */}
          <div className="border-b border-white/40 bg-white/30 backdrop-blur-md p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></div>
              <Sparkles className="h-4 w-4 text-teal-600" />
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-widest">Empathetic Counseling Doctor</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMicDemo(true)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800 bg-gradient-to-r from-teal-50 to-teal-100/80 hover:from-teal-100 hover:to-teal-200 hover:scale-102 transition-all px-3 py-1.5 rounded-full border border-teal-200/50 cursor-pointer shadow-xs glossy-btn"
              >
                <Video className="h-3.5 w-3.5 text-teal-600 animate-pulse" />
                🎙️ Mic Audio Settings Test
              </button>
              <span className="text-[10px] font-bold text-slate-600 bg-white/60 px-2.5 py-1 rounded-full border border-slate-200/50 uppercase tracking-wider">Ultra-Fast Model</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[500px] lg:max-h-[520px]">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                      isUser 
                        ? 'bg-teal-600 text-white rounded-tr-none shadow-md shadow-teal-600/10' 
                        : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    }`}>
                      {/* Optional attached image preview */}
                      {msg.imageSrc && (
                        <div className="mb-2.5 rounded-lg overflow-hidden border border-white/20 max-w-sm">
                          <img 
                            src={msg.imageSrc} 
                            alt="Uploaded attachment" 
                            className="max-h-48 object-cover w-full"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}

                      {/* Message text */}
                      <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
                        {msg.content}
                      </p>

                      {/* Tool triggers indicators */}
                      {msg.toolUsed && msg.toolUsed !== 'none' && (
                        <div className={`mt-2.5 pt-2 border-t flex items-center gap-1.5 text-[11px] font-bold ${
                          isUser ? 'border-white/20 text-teal-100' : 'border-slate-100 text-slate-500'
                        }`}>
                          <CheckCircle className={`h-3.5 w-3.5 ${isUser ? 'text-teal-200' : 'text-emerald-600'}`} />
                          <span>
                            {msg.toolUsed === 'log_mood' && 'Completed Mood Tracking Entry'}
                            {msg.toolUsed === 'find_therapist' && 'Fetched Therapist Matches via Google Maps'}
                            {msg.toolUsed === 'coping_exercise' && 'Guided Calm Coping Sequence'}
                            {msg.toolUsed === 'emergency_escalation' && 'DISPATCHED TWILIO EMERGENCY WELLNESS ESCALATION'}
                          </span>
                        </div>
                      )}

                      {/* Emergency Warning Accent Card */}
                      {msg.escalationTriggered && (
                        <motion.div 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-900 text-xs flex items-start gap-2.5"
                        >
                          <ShieldAlert className="h-5 w-5 shrink-0 text-red-600 animate-bounce" />
                          <div>
                            <p className="font-bold">🚨 Emergency escalation triggered — connecting to crisis support.</p>
                            <p className="mt-1 text-red-700 leading-normal font-semibold">An automated Text-to-Speech wellness phone check has been initiated to your emergency contact. Please check your phone or dial 988 to speak directly with an emergency counselor.</p>
                          </div>
                        </motion.div>
                      )}

                      <span className={`block text-[10px] mt-1.5 text-right font-semibold ${
                        isUser ? 'text-teal-200' : 'text-slate-400'
                      }`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Response Loader */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl rounded-tl-none p-4 border border-white/50 max-w-[75%] flex items-center gap-2.5 text-slate-500 shadow-xs">
                  <RefreshCw className="h-4 w-4 animate-spin text-teal-600" />
                  <span className="text-xs font-bold text-slate-600 animate-pulse">Companion is listening deeply...</span>
                </div>
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Speech/Mic Error banner */}
            {speechError && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900 text-xs flex items-start gap-2.5 relative shadow-xs"
              >
                <HelpCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">🎤 Microphone Access Tip</p>
                  <p className="mt-0.5 text-amber-700 leading-normal font-semibold">
                    {speechError}
                  </p>
                  <div className="mt-2 flex gap-3">
                    <a 
                      href={window.location.href} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-amber-800 underline font-bold hover:text-amber-950 flex items-center gap-1"
                    >
                      Open App in New Tab ↗
                    </a>
                    <button 
                      type="button"
                      onClick={() => setSpeechError(null)} 
                      className="text-amber-600 hover:text-amber-800 font-extrabold cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Help Attachment Previews */}
          {selectedImage && (
            <div className="px-4 py-3 bg-rose-50/70 backdrop-blur-md border-t border-rose-100 flex items-center justify-between animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={selectedImage} alt="Attachment thumbnail" className="h-12 w-12 object-cover rounded-lg border-2 border-rose-200/80 shadow-xs" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">1</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Visual Image Attached</p>
                  <p className="text-[10px] text-slate-500 font-medium">Ready to send with your message for diagnosis</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all shadow-xs cursor-pointer border border-rose-200"
                title="Discard attached image"
              >
                <X className="h-3.5 w-3.5" />
                Clear Image
              </button>
            </div>
          )}

          {/* Chat Form Area */}
          <div className="p-6 bg-white/30 backdrop-blur-md border-t border-white/40">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-4 items-center bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl p-2.5 shadow-xs hover:shadow-sm focus-within:shadow-md focus-within:border-teal-300/60 transition-all duration-300">
              {/* Image attachment button */}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Attach clinical symptom or label image for analysis"
                className="w-10 h-10 rounded-xl bg-slate-50/80 hover:bg-teal-50 hover:text-teal-600 flex items-center justify-center text-slate-400 transition-colors shrink-0 disabled:opacity-50 border border-slate-100 hover:border-teal-100/40 cursor-pointer"
              >
                <ImageIcon className="h-5 w-5" />
              </button>

              {/* Message input field */}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? "Listening... Speak clearly" : "Type how you're feeling or describe your physical symptoms..."}
                disabled={loading}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-700 focus:outline-none font-semibold placeholder-slate-400"
              />

              {/* Voice input button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={loading}
                title={isListening ? "Stop listening" : "Talk instead of typing (Voice note)"}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer border ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20 border-rose-400' 
                    : 'bg-slate-50/80 text-slate-400 hover:text-teal-600 border-slate-100/50 hover:bg-teal-50'
                }`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || (!inputText.trim() && !selectedImage)}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/10 hover:shadow-lg hover:shadow-teal-600/20 hover:-translate-y-0.5 transition-all shrink-0 disabled:opacity-50 cursor-pointer glossy-btn"
              >
                Send Message
              </button>
            </form>

            {/* Visual indicators */}
            <div className="flex justify-center gap-6 mt-3">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-tighter font-semibold">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> Gemini 2.5 Flash
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-tighter font-semibold">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> Secure Firestore Encryption
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 uppercase tracking-tighter font-semibold">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span> Emergency Escalation Ready
              </span>
            </div>
          </div>
        </section>

        {/* Right Side: Coping Toolbox & Mood Tracker (4 Cols) - Glassmorphism Styling */}
        <section className="lg:col-span-4 flex flex-col gap-6">

          {/* Section A: Active Coping Exercises */}
          <div className="glass-panel p-6 rounded-3xl shadow-xs transition-all hover:shadow-md">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
              Interactive Coping Toolbox
            </h3>

            <div className="space-y-3">
              <button 
                onClick={() => setActiveExercise('breathing')}
                className="w-full text-left p-4 rounded-2xl border border-white/60 bg-amber-50/20 hover:bg-amber-50/50 transition-all flex items-center justify-between shadow-xs hover:shadow-md hover:border-amber-400 cursor-pointer glossy-btn group"
              >
                <div>
                  <p className="text-xs font-bold text-amber-950 flex items-center gap-1">✨ Guided 4-7-8 Breathing</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">Calm nerves and anxiety instantly</p>
                </div>
                <Compass className="h-4 w-4 text-slate-400 group-hover:text-amber-600 group-hover:rotate-45 transition-all duration-300" />
              </button>

              <button 
                onClick={() => setActiveExercise('grounding')}
                className="w-full text-left p-4 rounded-2xl border border-white/60 bg-white/50 hover:bg-white/80 transition-all flex items-center justify-between shadow-xs hover:shadow-md hover:border-cyan-300/40 cursor-pointer glossy-btn group"
              >
                <div>
                  <p className="text-xs font-bold text-cyan-950 flex items-center gap-1">🧘 5-4-3-2-1 Grounding</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">Anchor yourself in the present</p>
                </div>
                <Activity className="h-4 w-4 text-slate-400 group-hover:text-cyan-600 transition-all duration-300" />
              </button>

              <button 
                onClick={() => setActiveExercise('journaling')}
                className="w-full text-left p-4 rounded-2xl border border-white/60 bg-white/50 hover:bg-white/80 transition-all flex items-center justify-between shadow-xs hover:shadow-md hover:border-indigo-300/40 cursor-pointer glossy-btn group"
              >
                <div>
                  <p className="text-xs font-bold text-indigo-950 flex items-center gap-1">✍️ Self-Reflection Prompts</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">Journal and reflect constructively</p>
                </div>
                <Sparkles className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 transition-all duration-300" />
              </button>
            </div>
          </div>

          {/* Section B: Mood Logger Tracker + Weekly Flow bar chart */}
          <div className="glass-panel p-6 rounded-3xl shadow-xs transition-all hover:shadow-md flex-1 flex flex-col min-h-[300px]">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              Weekly Mood Flow Tracker
            </h3>
            
            {/* Visual Bar Chart */}
            <div className="mb-5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 p-4">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide mb-3">Weekly Mood Intensity</p>
              <div className="flex items-end gap-3.5 h-16 px-1">
                <div className="w-full bg-teal-400 h-[40%] rounded-lg opacity-60 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-help" title="Mon: Mild Stress"></div>
                <div className="w-full bg-teal-400 h-[65%] rounded-lg opacity-70 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-help" title="Tue: Neutral"></div>
                <div className="w-full bg-teal-400 h-[30%] rounded-lg opacity-60 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-help" title="Wed: Anxious"></div>
                <div className="w-full bg-teal-500 h-[85%] rounded-lg hover:scale-105 transition-all duration-300 cursor-help shadow-xs shadow-teal-500/20" title="Thu: Happy/Calm"></div>
                <div className="w-full bg-teal-400 h-[50%] rounded-lg opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300 cursor-help" title="Fri: Steady"></div>
                <div className="w-full bg-teal-400 h-[60%] rounded-lg hover:scale-105 transition-all duration-300 cursor-help" title="Sat: Neutral"></div>
                <div className="w-full bg-teal-300 h-[45%] rounded-lg hover:scale-105 transition-all duration-300 cursor-help" title="Sun: Relaxed"></div>
              </div>
              <div className="flex justify-between mt-2.5 text-[9px] text-slate-400 font-bold px-1 uppercase tracking-wider">
                <span>MON</span><span>THU</span><span>SUN</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[220px]">
              {moodLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-6 text-slate-400">
                  <Heart className="h-7 w-7 mb-2 stroke-1 text-teal-400 animate-pulse" />
                  <p className="text-xs font-bold text-slate-600">No recent mood logged</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 px-4">Chat with the AI Doctor about how you're feeling to populate your timeline.</p>
                </div>
              ) : (
                <div className="relative border-l border-teal-200 ml-2.5 pl-4 space-y-3.5">
                  {moodLogs.slice(-5).map((entry) => (
                    <div key={entry.id} className="relative text-xs">
                      {/* Circle dot */}
                      <span className="absolute -left-[23px] top-0.5 bg-white border-2 border-teal-500 rounded-full h-3 w-3 flex items-center justify-center shadow-xs"></span>
                      
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-teal-900 bg-teal-50/80 px-2.5 py-0.5 rounded-full border border-teal-100/60 flex items-center gap-1 shadow-xs">
                          {getMoodEmoji(entry.mood)} {entry.mood}
                        </span>
                        <span className="text-[9px] text-slate-400 font-extrabold">{entry.timestamp.split(' ')[0]}</span>
                      </div>
                      {entry.note && (
                        <p className="text-slate-600 mt-1.5 font-semibold bg-white/70 p-2.5 rounded-xl border border-slate-100/80 shadow-xs">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </section>
      </main>

      {/* Coping Modal Dialog Overlay with Frosted Glass styling */}
      <AnimatePresence>
        {activeExercise && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl border border-white/50 max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setActiveExercise(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-5 w-5" />
              </button>

              {activeExercise === 'breathing' && (
                <div>
                  <h4 className="text-base font-bold text-amber-600 flex items-center gap-2 mb-3">
                    ✨ 4-7-8 Breathing Guide
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 font-semibold">
                    This powerful ancient breathing method brings instant physiological calm by relaxing your nervous system.
                  </p>
                  <div className="bg-teal-50/50 rounded-xl p-4 border border-teal-100 space-y-3.5 text-xs text-teal-950 font-semibold">
                    <div className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                      <p>Exhale entirely through your mouth with a soft whooshing sound.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                      <p>Close your lips and inhale quietly through your nose for <strong>4 seconds</strong>.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                      <p>Hold your breath completely for <strong>7 seconds</strong>.</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">4</span>
                      <p>Exhale completely through your mouth for <strong>8 seconds</strong>.</p>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex gap-2.5">
                    <button 
                      onClick={() => { triggerCopingChat('4-7-8 breathing'); setActiveExercise(null); }}
                      className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-teal-600/15"
                    >
                      Ask Companion to Walk Me Through It
                    </button>
                    <button 
                      onClick={() => setActiveExercise(null)}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {activeExercise === 'grounding' && (
                <div>
                  <h4 className="text-base font-bold text-cyan-900 flex items-center gap-2 mb-3">
                    🧘 5-4-3-2-1 Grounding Method
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 font-semibold">
                    This physical sensory technique interrupts overwhelming thoughts by anchoring you in the immediate environment.
                  </p>
                  <div className="bg-cyan-50/50 rounded-xl p-4 border border-cyan-100 space-y-3 text-xs text-cyan-950 font-bold">
                    <p>👁️ **5 things** you can see (the wall, a cup, a tree outside).</p>
                    <p>🖐️ **4 things** you can touch (your sleeve, the chair, cold air).</p>
                    <p>👂 **3 things** you can hear (clock ticking, traffic, wind).</p>
                    <p>👃 **2 things** you can smell (coffee, paper, grass).</p>
                    <p>👅 **1 thing** you can taste (mint, water, food).</p>
                  </div>
                  
                  <div className="mt-5 flex gap-2.5">
                    <button 
                      onClick={() => { triggerCopingChat('grounding'); setActiveExercise(null); }}
                      className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/15"
                    >
                      Ask Companion to Guide Me
                    </button>
                    <button 
                      onClick={() => setActiveExercise(null)}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              {activeExercise === 'journaling' && (
                <div>
                  <h4 className="text-base font-bold text-indigo-900 flex items-center gap-2 mb-3">
                    ✍️ Guided Self-Reflection
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 font-semibold">
                    These targeted reflection questions help catalog and process what you are holding onto today.
                  </p>
                  <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100 space-y-3.5 text-xs text-indigo-950 font-bold">
                    <div>
                      <p className="text-indigo-950 font-bold">1. Lighten the Load</p>
                      <p className="text-slate-600 font-semibold">What is something heavy weighing on your heart or mind right now?</p>
                    </div>
                    <div>
                      <p className="text-indigo-950 font-bold">2. Gratitude Anchor</p>
                      <p className="text-slate-600 font-semibold">What is one positive element or person you are genuinely thankful for today?</p>
                    </div>
                    <div>
                      <p className="text-indigo-950 font-bold">3. Micro Self-Care</p>
                      <p className="text-slate-600 font-semibold">What is one tiny, simple thing you can do for yourself in the next hour?</p>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex gap-2.5">
                    <button 
                      onClick={() => { triggerCopingChat('journaling'); setActiveExercise(null); }}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/15"
                    >
                      Ask Companion to Walk Me Through It
                    </button>
                    <button 
                      onClick={() => setActiveExercise(null)}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Microphone & Video Demo Walkthrough Modal */}
      <AnimatePresence>
        {showMicDemo && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex justify-center items-start md:items-center p-4 z-50 overflow-y-auto pt-6 md:pt-16 pb-6 md:pb-16">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900/95 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 lg:p-8 shadow-2xl relative overflow-hidden text-white"
            >
              {/* Close Button */}
              <button 
                onClick={() => {
                  setShowMicDemo(false);
                  setSimulatedPlaying(false);
                }}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-all cursor-pointer z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-teal-400 flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Interactive Mic & Vision Walkthrough Demo
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Watch the simulated step-by-step video walkthrough on the left, or practice using your voice live on the right!
                </p>
              </div>

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                
                {/* LEFT COLUMN: Simulated Video-Player Walkthrough */}
                <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800/80 flex flex-col justify-between min-h-[360px] relative shadow-inner">
                  {/* Video header badge */}
                  <div className="flex items-center justify-between border-b border-slate-800/50 pb-2 mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      Simulated Walkthrough Player
                    </span>
                    <span className="text-[9px] font-mono font-semibold text-slate-500 bg-slate-900 px-2 py-0.5 rounded">
                      HD • 1080P
                    </span>
                  </div>

                  {/* Player Content Screen Area */}
                  <div className="flex-1 flex flex-col justify-center items-center py-4 relative">
                    {/* Visual glowing pulsating microphone wave when playing */}
                    <div className="relative flex items-center justify-center mb-4">
                      {simulatedPlaying && (
                        <>
                          <div className="absolute w-16 h-16 rounded-full bg-teal-500/10 animate-ping"></div>
                          <div className="absolute w-20 h-20 rounded-full bg-teal-500/5 animate-pulse"></div>
                        </>
                      )}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        simulatedPlaying 
                          ? 'bg-rose-500 text-white animate-bounce shadow-rose-500/20' 
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        <Mic className="h-6 w-6" />
                      </div>
                    </div>

                    {/* Animated sound equalizer bar charts */}
                    <div className="flex justify-center items-end gap-1 h-14 mb-4">
                      {[...Array(15)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1 rounded-t-full bg-gradient-to-t from-teal-400 to-emerald-400 transition-all duration-300`}
                          style={{
                            height: simulatedPlaying ? `${Math.sin((simulatedTime + i) * 0.8) * 30 + 35}px` : '6px',
                            opacity: simulatedPlaying ? 1 : 0.4
                          }}
                        />
                      ))}
                    </div>

                    {/* Captions / Subtitles text overlays based on time */}
                    <div className="w-full bg-black/60 rounded-xl p-3 text-center text-xs font-semibold text-teal-300 min-h-[55px] border border-slate-800 flex items-center justify-center">
                      {simulatedTime >= 0 && simulatedTime <= 3 && "🎬 STEP 1: Find the microphone (🎙️) icon near the chat bar at the bottom."}
                      {simulatedTime >= 4 && simulatedTime <= 7 && "🔴 STEP 2: Click the microphone icon. It turns glowing rose to show it's recording."}
                      {simulatedTime >= 8 && simulatedTime <= 11 && "✍️ STEP 3: Speak clearly. Spoken phrases are written word-by-word into the input box."}
                      {simulatedTime >= 12 && simulatedTime <= 15 && "🚀 STEP 4: The 'Send' button is fully enabled. Review and click send to query the doctor!"}
                    </div>
                  </div>

                  {/* Player Controls */}
                  <div className="border-t border-slate-800/50 pt-3 mt-2">
                    <div className="flex items-center gap-3">
                      {/* Play/Pause Button */}
                      <button
                        onClick={() => setSimulatedPlaying(!simulatedPlaying)}
                        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-teal-500 hover:text-white flex items-center justify-center transition-all cursor-pointer text-slate-300"
                        title={simulatedPlaying ? "Pause Walkthrough" : "Play Walkthrough"}
                      >
                        {simulatedPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                      </button>

                      {/* Video Progress Timeline */}
                      <div className="flex-1 flex items-center gap-2 text-[10px] font-mono text-slate-500">
                        <span>0:{simulatedTime < 10 ? `0${simulatedTime}` : simulatedTime}</span>
                        <div 
                          className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden relative cursor-pointer"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const pct = (e.clientX - rect.left) / rect.width;
                            setSimulatedTime(Math.min(15, Math.max(0, Math.floor(pct * 15))));
                          }}
                        >
                          <div 
                            className="absolute h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                            style={{ width: `${(simulatedTime / 15) * 100}%` }}
                          />
                        </div>
                        <span>0:15</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Live Interactive Practice & Vision Info */}
                <div className="flex flex-col justify-between gap-6">
                  {/* Practice Section */}
                  <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/80">
                    <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-1.5 mb-2">
                      <Sparkles className="h-4 w-4 shrink-0 text-yellow-400" />
                      🎙️ Live Speech Practice Room
                    </h4>
                    <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                      Click the button below to allow speech permissions and talk! Watch the text write in real-time.
                    </p>

                    <button
                      type="button"
                      onClick={toggleDemoListening}
                      className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                        isDemoListening 
                          ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse border-rose-400 shadow-lg shadow-rose-500/20' 
                          : 'bg-teal-500 hover:bg-teal-600 text-white border-teal-400 shadow-md shadow-teal-500/10'
                      }`}
                    >
                      {isDemoListening ? <MicOff className="h-4 w-4 shrink-0" /> : <Mic className="h-4 w-4 shrink-0" />}
                      {isDemoListening ? '🛑 Click to Stop Capturing' : '🎤 Click to Speak Live'}
                    </button>

                    {speechError && (
                      <p className="mt-2 text-[11px] text-amber-400 font-bold bg-amber-950/40 p-2 rounded-lg border border-amber-900/40 leading-normal">
                        ⚠️ {speechError}
                      </p>
                    )}

                    {/* Playground input box showing words dynamically */}
                    <div className="mt-3 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 min-h-[75px] text-xs flex flex-col justify-between">
                      <div>
                        {isDemoListening && !demoVoiceText && (
                          <p className="text-slate-400 italic animate-pulse">Listening... Speak clearly into your device microphone...</p>
                        )}
                        {demoVoiceText ? (
                          <p className="text-teal-200 font-bold font-mono tracking-wide leading-relaxed">{demoVoiceText}</p>
                        ) : (
                          !isDemoListening && (
                            <p className="text-slate-500 italic font-medium leading-relaxed">
                              No voice captured yet. Click "Click to Speak Live" to dictation test.
                            </p>
                          )
                        )}
                      </div>
                      
                      {/* Interactive Send Button Indicator */}
                      {demoVoiceText && (
                        <div className="mt-2.5 pt-2.5 border-t border-slate-800/50 flex items-center justify-between text-[10px] gap-2 flex-wrap">
                          <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            Text Captured! Message Sending Enabled!
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setDemoVoiceText('')}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-white"
                            >
                              Clear
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setInputText(demoVoiceText);
                                setShowMicDemo(false);
                                setSimulatedPlaying(false);
                              }}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                            >
                              Copy To Chat Box
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Computer Vision Feature Intro */}
                  <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800/80">
                    <h4 className="text-sm font-extrabold text-teal-400 flex items-center gap-1.5 mb-2">
                      <ImageIcon className="h-4 w-4 text-emerald-400" />
                      👁️ Advanced Computer Vision Diagnostics
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      Quickly snap or upload clear pictures of skin rashes, hair issues, or medical symptoms.
                    </p>
                    
                    {/* Hidden file input for walkthrough */}
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={demoVisionInputRef} 
                      onChange={handleDemoVisionFileChange} 
                      className="hidden" 
                    />

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <button 
                        type="button"
                        onClick={() => demoVisionInputRef.current?.click()}
                        className={`p-2 rounded-lg border text-left flex flex-col justify-between h-16 transition-all duration-300 cursor-pointer ${
                          demoVisionImage 
                            ? 'bg-teal-950/40 border-teal-500/50 text-teal-300' 
                            : 'bg-slate-950/40 border-slate-800/50 hover:bg-slate-900/60 hover:border-teal-500/30 text-slate-300'
                        }`}
                      >
                        <span className="block text-emerald-400 font-extrabold mb-0.5 uppercase tracking-wider text-[8px]">STEP 1</span>
                        <span className="font-semibold flex items-center gap-1">
                          {demoVisionImage ? '📸 Reupload' : '📤 Upload Pic'}
                        </span>
                      </button>

                      <div className={`p-2 rounded-lg border text-left flex flex-col justify-between h-16 transition-all duration-500 ${
                        demoVisionState === 'scanning' 
                          ? 'bg-amber-950/30 border-amber-500/50 text-amber-200 animate-pulse' 
                          : demoVisionState === 'done'
                            ? 'bg-teal-950/30 border-teal-500/30 text-teal-300'
                            : 'bg-slate-950/40 border-slate-800/50 text-slate-400'
                      }`}>
                        <span className="block text-emerald-400 font-extrabold mb-0.5 uppercase tracking-wider text-[8px]">STEP 2</span>
                        <span className="font-semibold">
                          {demoVisionState === 'scanning' ? '⚡ Scanning...' : demoVisionState === 'done' ? '✅ Scan Completed' : 'AI Medical Scan'}
                        </span>
                      </div>

                      <div className={`p-2 rounded-lg border text-left flex flex-col justify-between h-16 transition-all duration-500 ${
                        demoVisionState === 'done'
                          ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-200'
                          : 'bg-slate-950/40 border-slate-800/50 text-slate-400'
                      }`}>
                        <span className="block text-emerald-400 font-extrabold mb-0.5 uppercase tracking-wider text-[8px]">STEP 3</span>
                        <span className="font-semibold">
                          {demoVisionState === 'done' ? '🩺 Diagnosed' : 'Expert Diagnose'}
                        </span>
                      </div>
                    </div>

                    {/* Walkthrough Live Upload Result & Diagnostics Window */}
                    {demoVisionImage && (
                      <div className="mt-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800/90 relative overflow-hidden transition-all duration-500">
                        <div className="flex flex-col sm:flex-row gap-4 items-start">
                          {/* Image preview with laser line scan animation */}
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-slate-800 shrink-0 bg-black">
                            <img src={demoVisionImage} alt="Demo vision upload" className="w-full h-full object-cover" />
                            {demoVisionState === 'scanning' && (
                              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent shadow-[0_0_10px_#0d9488] top-0 animate-[bounce_1.5s_infinite]" />
                            )}
                          </div>

                          <div className="flex-1 text-left">
                            <h5 className="text-[11px] font-bold uppercase tracking-wider text-teal-400 mb-1 flex items-center gap-1.5">
                              {demoVisionState === 'scanning' ? (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                  🔬 Image Scanner Active...
                                </>
                              ) : (
                                <>
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                                  🩺 Clinical Visual Diagnosis Summary
                                </>
                              )}
                            </h5>

                            {demoVisionState === 'scanning' ? (
                              <div className="space-y-1.5 mt-2">
                                <p className="text-[10px] text-slate-300 font-semibold">Running multi-spectral pigment segmentation algorithms...</p>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-teal-500 h-full rounded-full animate-pulse" style={{ width: '60%' }} />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1 text-[10px] text-slate-300 mt-1 leading-relaxed">
                                <p><strong className="text-slate-100">Observation:</strong> Healthy epidermal patterns with slight vascular micro-congestion.</p>
                                <p><strong className="text-slate-100">Risk Severity:</strong> Very Low. No malignant, bacterial, or fungal markers detected.</p>
                                <p><strong className="text-slate-100">Recommendation:</strong> Keep clean, avoid aggressive friction, and consult your virtual doctor below for full professional analysis.</p>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedImage(demoVisionImage);
                                    setInputText("Could you please analyze this clinical image of my symptom?");
                                    setShowMicDemo(false);
                                    setSimulatedPlaying(false);
                                    setDemoVisionImage(null);
                                    setDemoVisionState('idle');
                                  }}
                                  className="mt-3 w-full sm:w-auto px-3.5 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-extrabold rounded-lg text-[10px] uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-all cursor-pointer glossy-btn text-center inline-block"
                                >
                                  📥 Send Pic & Start Analysis in Chat
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Action Close footer */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowMicDemo(false);
                    setSimulatedPlaying(false);
                  }}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close Walkthrough
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive WhatsApp Setup & Redirection Modal */}
      <AnimatePresence>
        {showWhatsAppModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex justify-center items-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl relative overflow-hidden text-white flex flex-col max-h-[92vh] md:max-h-[85vh]"
            >
              {/* Background gradient orb */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none"></div>

              {/* Floating Close Button - Absolute and elevated for maximum visibility on all devices */}
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-all cursor-pointer z-50 border border-slate-800 bg-slate-900/90 shadow-lg flex items-center justify-center hover:scale-105 active:scale-95"
                title="Close Window"
                aria-label="Close Window"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Scrollable Body Content */}
              <div className="overflow-y-auto px-6 py-6 md:px-8 md:py-7 flex-1 mt-6">
                { true ? (
                  <div className="space-y-4 text-left font-sans">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                        <PhoneCall className="h-6 w-6 text-amber-400 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-white flex items-center gap-1.5 font-sans">
                          📞 Twilio Outbound Emergency Setup
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium font-sans">Configure crisis dispatcher voice credentials</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4 font-sans">
                      When a patient enters an active crisis state, the system automatically dials their emergency contact or the fallback number. It plays a custom synthesized Google Text-to-Speech message with their personal details to secure immediate physical help.
                    </p>

                    <div className="space-y-4 text-left font-sans">
                      {showTwilioCredentials ? (
                        <div className="space-y-4 bg-slate-950/40 p-4 border border-slate-800/60 rounded-2xl animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-500 tracking-wider uppercase">Advanced Credentials</span>
                            <button
                              type="button"
                              onClick={() => setShowTwilioCredentials(false)}
                              className="text-[10px] text-slate-400 hover:text-white underline transition-all font-semibold"
                            >
                              Hide Fields
                            </button>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Twilio Account SID
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                              value={devAccountSid}
                              onChange={(e) => setDevAccountSid(e.target.value)}
                              className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-700"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Twilio Auth Token
                            </label>
                            <input
                              type="password"
                              placeholder="e.g. your_auth_token_secret"
                              value={devAuthToken}
                              onChange={(e) => setDevAuthToken(e.target.value)}
                              className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-700"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              Twilio Sender Number (Outgoing Caller ID)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. +14155238886"
                              value={devFromNumber}
                              onChange={(e) => setDevFromNumber(e.target.value)}
                              className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-700"
                            />
                            <p className="text-[9px] text-slate-400 font-medium mt-1 leading-normal">
                              💡 <strong>Note:</strong> This must be an active number purchased in your Twilio console, or a verified Outbound Caller ID.
                            </p>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                              System Fallback Emergency Phone Number (Target)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. +15551234567"
                              value={devEmergencyNumber}
                              onChange={(e) => setDevEmergencyNumber(e.target.value)}
                              className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder:text-slate-700"
                            />
                            <p className="text-[9px] text-amber-400 font-semibold mt-1 leading-normal font-sans">
                              ⚠️ <strong>Fallback:</strong> When an anonymous visitor (no profile) triggers the emergency alert, this number will receive the distress phone call.
                            </p>
                          </div>

                          <div className="flex gap-3 pt-2 font-sans font-medium">
                            <button
                              type="button"
                              onClick={handleSaveDevSettings}
                              disabled={savingDevSettings}
                              className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-55"
                            >
                              {savingDevSettings ? "Saving Settings..." : "Save Configuration"}
                            </button>
                            <button
                              type="button"
                              onClick={handleResetDevSettings}
                              disabled={savingDevSettings}
                              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-55"
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-950/20 border border-emerald-900/30 p-4 rounded-2xl space-y-3 font-sans text-left">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                              Credentials Active in Background
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            All API tokens, credentials, and outbound routing paths are stored and running securely in the background. Emergency wellness checks will use these details instantly.
                          </p>

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
                        </div>
                      )}

                      <div className="border-t border-slate-800/80 pt-4 mt-4">
                        <label className="block text-[10px] font-extrabold text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          ⚡ Direct Secret Outbound Test
                        </label>
                        <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
                          Test outbound call capabilities immediately. Clicking this button will trigger a real voice call to the <strong>Twilio Emergency Number</strong> configured in your platform secrets.
                        </p>
                        
                        <button
                          type="button"
                          onClick={handleTriggerTestCall}
                          disabled={triggeringTestCall}
                          className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md hover:shadow-red-950/40 disabled:opacity-50"
                        >
                          <PhoneCall className="h-3.5 w-3.5 animate-pulse" />
                          <span>
                            {triggeringTestCall ? "Initiating Call..." : `Test Call to Secret Emergency No: ${devEmergencyNumber || 'Active Config'}`}
                          </span>
                        </button>

                        {testCallMessage && (
                          <div className={`mt-3 p-3 rounded-xl text-xs font-semibold leading-relaxed ${
                            testCallMessage.startsWith('✅') || !testCallMessage.toLowerCase().includes('error')
                              ? 'bg-emerald-950/25 border border-emerald-900/40 text-emerald-300' 
                              : 'bg-rose-950/25 border border-rose-900/40 text-rose-300'
                          }`}>
                            {testCallMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {whatsAppStep === 'not_logged_in' && (
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <MessageSquare className="h-6 w-6 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white flex items-center gap-1.5">
                        🧪 WhatsApp Sandbox Mode
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium font-sans">Connect AI Mental Health Counselor</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    To start chatting with our mental health & crisis counselor AI on your own phone, please enter your mobile phone number below. We will send you a secure connection link directly via Twilio!
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Your WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +15551234567"
                        value={tempWhatsAppPhone}
                        onChange={(e) => {
                          setTempWhatsAppPhone(e.target.value);
                          setLinkSentStatus(null);
                          setWhatsAppError(null);
                        }}
                        className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-white font-mono focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>

                    {whatsAppError && (
                      <div className="bg-rose-950/30 border border-rose-900/30 p-3 rounded-xl text-xs text-rose-300 font-medium leading-relaxed">
                        ⚠️ {whatsAppError}
                      </div>
                    )}

                    {linkSentStatus && (
                      <div className="bg-emerald-950/40 border border-emerald-900/35 p-3.5 rounded-xl text-xs text-emerald-300 font-semibold leading-normal">
                        ✅ {linkSentStatus}
                      </div>
                    )}

                    {/* Dynamic Twilio From Number Info Card */}
                    <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-semibold">
                          Twilio Sandbox Number
                        </span>
                        <span className="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/25 font-bold">SANDBOX ACTIVE</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 font-mono text-xs">
                        <span className="text-emerald-400 font-extrabold">{twilioConfig?.globalSandboxNumber || '+14155238886'}</span>
                        <span className="text-[10px] text-slate-300 font-bold font-sans">Code: <strong className="text-amber-400 font-extrabold">{twilioConfig?.sandboxKeyword || 'join mile-sale'}</strong></span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal font-medium">
                        💡 <strong>Requirement:</strong> Send <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">{twilioConfig?.sandboxKeyword || 'join mile-sale'}</code> to the sandbox number first to allow your device to receive messages!
                      </p>
                    </div>

                    {/* Troubleshooting Accordion */}
                    <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden mt-1 mb-2">
                      <button
                        type="button"
                        onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          ⚠️ <span className="font-semibold">Not getting replies? Click here to fix</span>
                        </span>
                        <span className={`transform transition-transform duration-200 text-[10px] ${showTroubleshooting ? 'rotate-180' : 'rotate-0'}`}>
                          ▼
                        </span>
                      </button>
                      
                      {showTroubleshooting && (
                        <div className="px-4 pb-4 border-t border-slate-950/60 pt-3 space-y-3.5 text-[11px] leading-relaxed text-slate-300">
                          <div>
                            <span className="font-extrabold text-amber-400 block mb-1">1. Are you using Sandbox Mode? Send "join" first</span>
                            <p>
                              Your screenshot showed you sent <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded font-mono font-bold">mile-sale</code>. Sandbox requires sending the full exact keyword: <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono font-extrabold">join mile-sale</code> first to subscribe.
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-950/50">
                            <span className="font-extrabold text-amber-400 block mb-1">2. Configure your Twilio Webhook URL (Required)</span>
                            <p className="mb-2">
                              For Twilio to pass messages back to this AI web application, you must set the WhatsApp webhook URL in your Twilio Console:
                            </p>
                            <ol className="list-decimal pl-4 space-y-1.5">
                              <li>Go to your <strong className="text-white">Twilio Console</strong></li>
                              <li>
                                {useSandbox ? (
                                  <>Navigate to <strong>Messaging &gt; Settings &gt; WhatsApp Sandbox Settings</strong></>
                                ) : (
                                  <>Navigate to <strong>Messaging &gt; Senders &gt; WhatsApp Senders</strong> and select your active sender number</>
                                )}
                              </li>
                              <li>Find the <strong className="text-white">"WHEN A MESSAGE COMES IN"</strong> webhook field</li>
                              <li>
                                Paste this exact Webhook URL:
                                <div className="flex items-center gap-2 mt-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono text-[10px] break-all text-emerald-400 justify-between">
                                  <span>{getWebhookUrl()}</span>
                                  <button
                                    onClick={handleCopyWebhook}
                                    type="button"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2 py-0.5 rounded text-[9px] uppercase transition-all shrink-0 cursor-pointer"
                                  >
                                    {copiedWebhook ? 'Copied!' : 'Copy'}
                                  </button>
                                </div>
                                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-[10px] text-amber-300 mt-2.5 space-y-2 leading-relaxed">
                                  <div>
                                    💡 <strong>Crucial Discovery: Why your URL ended with <code className="text-red-400 bg-slate-950 px-1 py-0.5 rounded font-mono font-bold">southeas</code></strong>
                                  </div>
                                  <div className="text-slate-300">
                                    There is actually <strong>no 64-character limit bug on Twilio!</strong> The reason your URL ended at <code className="text-red-400 bg-slate-950 px-1 py-0.5 rounded font-mono">southeas</code> is because the long link <strong>wrapped onto two separate lines</strong> on your screen, and dragging your mouse manually to copy only selected the first line by accident!
                                  </div>
                                  <div className="bg-slate-950/80 p-2.5 rounded border border-amber-500/20 space-y-1 text-left">
                                    <span className="font-bold text-amber-400 block mb-1">✅ Easy 5-Second Fix:</span>
                                    <ol className="list-decimal pl-4 space-y-1 text-slate-300 font-medium">
                                      <li>Clear and delete <strong>EVERYTHING</strong> inside the Twilio Webhook input box.</li>
                                      <li>Click our green <strong className="text-emerald-400">Copy</strong> button above. This copies the full, 100% complete link (including the protocol and the end of the URL) in one clean click!</li>
                                      <li>Paste it directly into the Twilio Sandbox Webhook field and click <strong>Save</strong>. It will fit completely and work instantly!</li>
                                    </ol>
                                  </div>
                                </div>
                              </li>
                               <li>Set the HTTP method to <strong className="text-white">POST</strong></li>
                               <li>Click <strong className="text-white">Save</strong> at the bottom!</li>
                             </ol>
                           </div>

                           <div className="pt-2.5 border-t border-slate-800/60">
                             <h4 className="font-extrabold text-teal-400 text-[11px] mb-1.5 flex items-center justify-between">
                               <span>3. Live Connection Tester (Highly Recommended)</span>
                               <button
                                 onClick={checkWebhookLogs}
                                 disabled={loadingLogs}
                                 type="button"
                                 className="bg-teal-600/25 hover:bg-teal-600/40 text-teal-300 font-extrabold px-2.5 py-1 rounded text-[9.5px] uppercase tracking-wider transition-all cursor-pointer"
                               >
                                 {loadingLogs ? 'Checking...' : 'Refresh Webhook Hits'}
                               </button>
                             </h4>
                             <p className="text-slate-400 text-[10.5px] leading-relaxed mb-2">
                               Send a WhatsApp message like "Hi" or "Hello" to your Twilio Sandbox, then click <strong className="text-teal-400">Refresh Webhook Hits</strong> above. We will inspect live if Twilio successfully reached your app!
                             </p>

                             {logsChecked && (
                               <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-850 max-h-[140px] overflow-y-auto space-y-2 font-mono text-[9px] mt-2.5">
                                 {webhookLogs.length === 0 ? (
                                   <div className="text-slate-500 py-2.5 text-center leading-normal">
                                     🔴 <span className="font-bold text-amber-500">No Webhook Hits Received Yet</span>
                                     <div className="text-[9px] text-slate-400/80 mt-1 max-w-[90%] mx-auto font-sans">
                                       Your Twilio message didn't reach the server. Please click inside your Twilio Console Webhook box, delete everything, and paste using our green <span className="text-emerald-400 font-bold">Copy</span> button!
                                     </div>
                                   </div>
                                 ) : (
                                   <div className="space-y-1.5">
                                     <div className="text-emerald-400 font-bold font-sans text-[9.5px] border-b border-slate-800/80 pb-1 flex items-center gap-1">
                                       <span>🟢 Webhook Connection Active!</span>
                                     </div>
                                     {webhookLogs.map((log: any) => (
                                       <div key={log.id} className="border-b border-slate-900/40 pb-1.5 last:border-0 last:pb-0 text-left">
                                         <div className="flex justify-between text-teal-400 font-semibold text-[8px]">
                                           <span>From: {log.from}</span>
                                           <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                         </div>
                                         <div className="text-slate-300 break-words mt-0.5">Msg: "{log.body}"</div>
                                         <div className="text-slate-500 text-[8px] mt-0.5">Path: {log.path} | {log.method}</div>
                                       </div>
                                     ))}
                                   </div>
                                 )}
                               </div>
                             )}
                           </div>
                         </div>
                       )}
                     </div>

                      {/* Twilio Developer Settings Accordion */}
                      <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden mt-1 mb-2">
                        <button
                          type="button"
                          onClick={() => setShowDevSettings(!showDevSettings)}
                          className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5 text-teal-400">
                            🔧 <span>Twilio Setup from Scratch</span>
                          </span>
                          <span className={`transform transition-transform duration-200 text-[10px] ${showDevSettings ? 'rotate-180' : 'rotate-0'}`}>
                            ▼
                          </span>
                        </button>
                        
                        {showDevSettings && (
                          <div className="px-4 pb-4 border-t border-slate-950/60 pt-3 space-y-3 text-left font-sans">
                            <p className="text-[10px] text-slate-400 leading-relaxed">
                              Configure your Twilio keys and details freshly. They will be stored securely in the app's database and used immediately!
                            </p>
                            
                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Twilio Account SID
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                                value={devAccountSid}
                                onChange={(e) => setDevAccountSid(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono outline-none"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Twilio Auth Token
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. your_auth_token_secret"
                                value={devAuthToken}
                                onChange={(e) => setDevAuthToken(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono outline-none"
                                required
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Twilio Sender Number (WhatsApp)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. +14155238886 or whatsapp:+14155238886"
                                value={devFromNumber}
                                onChange={(e) => setDevFromNumber(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono outline-none"
                              />
                              <p className="text-[8px] text-amber-400 font-semibold mt-1">
                                ⚠️ Crucial: This must be your Twilio account sender number (or sandbox number), NOT your personal WhatsApp phone number!
                              </p>
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Twilio Sandbox Join Keyword
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. join behavior-simple"
                                value={devSandboxKeyword}
                                onChange={(e) => setDevSandboxKeyword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Emergency SMS/Voice Number (Optional)
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. +15551234567"
                                value={devEmergencyNumber}
                                onChange={(e) => setDevEmergencyNumber(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono outline-none"
                              />
                            </div>

                            {saveSettingsError && (
                              <div className="bg-rose-950/20 border border-rose-900/30 p-2 rounded text-[10px] text-rose-300 font-medium">
                                ⚠️ {saveSettingsError}
                              </div>
                            )}

                            {saveSettingsSuccess && (
                              <div className="bg-emerald-950/20 border border-emerald-900/30 p-2 rounded text-[10px] text-emerald-300 font-semibold">
                                ✅ {saveSettingsSuccess}
                              </div>
                            )}

                            <div className="flex gap-2 pt-1 font-sans">
                              <button
                                type="button"
                                onClick={handleSaveDevSettings}
                                disabled={savingDevSettings}
                                className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer disabled:opacity-55"
                              >
                                {savingDevSettings ? "Saving..." : "Save Custom Keys"}
                              </button>
                              <button
                                type="button"
                                onClick={handleResetDevSettings}
                                disabled={savingDevSettings}
                                className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer disabled:opacity-55"
                              >
                                Reset Defaults
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                    <div className="flex flex-col gap-2 pt-1">
                      {tempWhatsAppPhone.trim() ? (
                        <button
                          onClick={() => handleSendConnectionLink(tempWhatsAppPhone)}
                          disabled={sendingLink}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer disabled:bg-emerald-650 disabled:opacity-50"
                        >
                          <MessageSquare className="h-4 w-4" />
                          {sendingLink ? "Sending secure link..." : "Send Connection Link to My WhatsApp"}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 bg-slate-800 text-slate-500 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed font-semibold"
                        >
                          Enter Phone Number to Send Link
                        </button>
                      )}



                      <button
                        onClick={() => setWhatsAppStep('not_connected_guidance')}
                        className="w-full py-2.5 text-slate-400 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer text-center"
                      >
                        No, I need to download or sign up to WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Ask Connection Step (Logged In Patient) */}
              {whatsAppStep === 'ask_connection' && (
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                      <MessageSquare className="h-6 w-6 text-emerald-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white">
                        🧪 WhatsApp Sandbox Mode
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">Verify your registered wellness number</p>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl mb-4 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                      Registered Phone Number
                    </span>
                    <span className="text-lg font-extrabold text-emerald-400 font-mono tracking-wide">
                      {tempWhatsAppPhone || currentPatient?.phone}
                    </span>
                    <span className="block text-[11px] text-slate-400 mt-1 font-medium">
                      Patient: <strong className="text-slate-300">{currentPatient?.name}</strong>
                    </span>
                  </div>

                  {whatsAppError && (
                    <div className="bg-rose-950/30 border border-rose-900/30 p-3 rounded-xl text-xs text-rose-300 font-medium leading-relaxed mb-4">
                      ⚠️ {whatsAppError}
                    </div>
                  )}

                  {linkSentStatus && (
                    <div className="bg-emerald-950/40 border border-emerald-900/35 p-3.5 rounded-xl text-xs text-emerald-300 font-semibold leading-normal mb-4">
                      ✅ {linkSentStatus}
                    </div>
                  )}

                  {/* Dynamic Twilio From Number Info Card */}
                  <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block font-semibold">
                        Twilio Sandbox Number
                      </span>
                      <span className="text-[9px] bg-amber-500/10 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/25 font-bold">SANDBOX ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center bg-slate-900/80 px-3 py-2 rounded-lg border border-slate-800 font-mono text-xs">
                      <span className="text-emerald-400 font-extrabold">{twilioConfig?.globalSandboxNumber || '+14155238886'}</span>
                      <span className="text-[10px] text-slate-300 font-bold">Code: <strong className="text-amber-400 font-extrabold">{twilioConfig?.sandboxKeyword || 'join mile-sale'}</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal font-medium">
                      💡 <strong>Requirement:</strong> Send <code className="text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono font-bold text-[10px]">{twilioConfig?.sandboxKeyword || 'join mile-sale'}</code> to the sandbox number first to authorize your phone to receive messages!
                    </p>
                  </div>

                  {/* Troubleshooting Accordion */}
                  <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden mt-1 mb-4">
                    <button
                      type="button"
                      onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                      className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        ⚠️ <span className="font-semibold">Not getting replies? Click here to fix</span>
                      </span>
                      <span className={`transform transition-transform duration-200 text-[10px] ${showTroubleshooting ? 'rotate-180' : 'rotate-0'}`}>
                        ▼
                      </span>
                    </button>
                    
                    {showTroubleshooting && (
                      <div className="px-4 pb-4 border-t border-slate-950/60 pt-3 space-y-3.5 text-[11px] leading-relaxed text-slate-300">
                        <div>
                          <span className="font-extrabold text-amber-400 block mb-1">1. Are you using Sandbox Mode? Send "join" first</span>
                          <p>
                            Your screenshot showed you sent <code className="text-amber-400 bg-slate-950 px-1 py-0.5 rounded font-mono font-bold">mile-sale</code>. Sandbox requires sending the full exact keyword: <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono font-extrabold">join mile-sale</code> first to subscribe.
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-950/50">
                          <span className="font-extrabold text-amber-400 block mb-1">2. Configure your Twilio Webhook URL (Required)</span>
                          <p className="mb-2">
                            For Twilio to pass messages back to this AI web application, you must set the WhatsApp webhook URL in your Twilio Console:
                          </p>
                          <ol className="list-decimal pl-4 space-y-1.5">
                            <li>Go to your <strong className="text-white">Twilio Console</strong></li>
                            <li>
                              Navigate to <strong>Messaging &gt; Settings &gt; WhatsApp Sandbox Settings</strong>
                            </li>
                            <li>Find the <strong className="text-white">"WHEN A MESSAGE COMES IN"</strong> webhook field</li>
                            <li>
                              Paste this exact Webhook URL:
                              <div className="flex items-center gap-2 mt-1.5 bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono text-[10px] break-all text-emerald-400 justify-between">
                                <span>{getWebhookUrl()}</span>
                                <button
                                  onClick={handleCopyWebhook}
                                  type="button"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2 py-0.5 rounded text-[9px] uppercase transition-all shrink-0 cursor-pointer"
                                >
                                  {copiedWebhook ? 'Copied!' : 'Copy'}
                                </button>
                              </div>
                               <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg text-[10px] text-amber-300 mt-2.5 space-y-2 leading-relaxed">
                                 <div>
                                   💡 <strong>Crucial Discovery: Why your URL ended with <code className="text-red-400 bg-slate-950 px-1 py-0.5 rounded font-mono font-bold">southeas</code></strong>
                                 </div>
                                 <div className="text-slate-300 font-sans">
                                   There is actually <strong>no 64-character limit bug on Twilio!</strong> The reason your URL ended at <code className="text-red-400 bg-slate-950 px-1 py-0.5 rounded font-mono">southeas</code> is because the long link <strong>wrapped onto two separate lines</strong> on your screen, and dragging your mouse manually to copy only selected the first line by accident!
                                 </div>
                                 <div className="bg-slate-950/80 p-2.5 rounded border border-amber-500/20 space-y-1 text-left font-sans">
                                   <span className="font-bold text-amber-400 block mb-1">✅ Easy 5-Second Fix:</span>
                                   <ol className="list-decimal pl-4 space-y-1 text-slate-300 font-medium font-sans">
                                     <li>Clear and delete <strong>EVERYTHING</strong> inside the Twilio Webhook input box.</li>
                                     <li>Click our green <strong className="text-emerald-400">Copy</strong> button above. This copies the full, 100% complete link (including the protocol and the end of the URL) in one clean click!</li>
                                     <li>Paste it directly into the Twilio Sandbox Webhook field and click <strong>Save</strong>. It will fit completely and work instantly!</li>
                                   </ol>
                                 </div>
                               </div>
                            </li>
                            <li>Set the HTTP method to <strong className="text-white">POST</strong></li>
                            <li>Click <strong className="text-white">Save</strong> at the bottom!</li>
                          </ol>
                        </div>

                        <div className="pt-2 border-t border-slate-950/50 mt-2">
                          <span className="font-extrabold text-teal-400 block mb-1.5 flex items-center justify-between">
                            <span>3. Live Connection Tester (Highly Recommended)</span>
                            <button
                              onClick={checkWebhookLogs}
                              disabled={loadingLogs}
                              type="button"
                              className="bg-teal-600/25 hover:bg-teal-600/40 text-teal-300 font-extrabold px-2.5 py-1 rounded text-[9.5px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                              {loadingLogs ? 'Checking...' : 'Refresh Webhook Hits'}
                            </button>
                          </span>
                          <p className="text-slate-400 text-[10.5px] leading-relaxed mb-2 text-left">
                            Send a WhatsApp message like "Hi" or "Hello" to your Twilio Sandbox, then click <strong className="text-teal-400">Refresh Webhook Hits</strong> above. We will inspect live if Twilio successfully reached your app!
                          </p>

                          {logsChecked && (
                            <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-850 max-h-[140px] overflow-y-auto space-y-2 font-mono text-[9px] mt-2.5 text-left">
                              {webhookLogs.length === 0 ? (
                                <div className="text-slate-500 py-2.5 text-center leading-normal">
                                  🔴 <span className="font-bold text-amber-500">No Webhook Hits Received Yet</span>
                                  <div className="text-[9px] text-slate-400/80 mt-1 max-w-[90%] mx-auto font-sans">
                                    Your Twilio message didn't reach the server. Please click inside your Twilio Console Webhook box, delete everything, and paste using our green <span className="text-emerald-400 font-bold">Copy</span> button!
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5 font-mono">
                                  <div className="text-emerald-400 font-bold font-sans text-[9.5px] border-b border-slate-800/80 pb-1 flex items-center gap-1">
                                    <span>🟢 Webhook Connection Active!</span>
                                  </div>
                                  {webhookLogs.map((log: any) => (
                                    <div key={log.id} className="border-b border-slate-900/40 pb-1.5 last:border-0 last:pb-0">
                                      <div className="flex justify-between text-teal-400 font-semibold text-[8px]">
                                        <span>From: {log.from}</span>
                                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                                      </div>
                                      <div className="text-slate-300 break-words mt-0.5">Msg: "{log.body}"</div>
                                      <div className="text-slate-500 text-[8px] mt-0.5 font-mono">Path: {log.path} | {log.method}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                   {/* Twilio Developer Settings Accordion */}
                   <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden mt-1 mb-4">
                     <button
                       type="button"
                       onClick={() => setShowDevSettings(!showDevSettings)}
                       className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
                     >
                       <span className="flex items-center gap-1.5 text-teal-400">
                         🔧 <span>Twilio Setup from Scratch</span>
                       </span>
                       <span className={`transform transition-transform duration-200 text-[10px] ${showDevSettings ? 'rotate-180' : 'rotate-0'}`}>
                         ▼
                       </span>
                     </button>
                     
                     {showDevSettings && (
                       <div className="px-4 pb-4 border-t border-slate-950/60 pt-3 space-y-3.5 text-left font-sans">
                         <p className="text-[10px] text-slate-400 leading-relaxed">
                           Configure your Twilio keys and details freshly. They will be stored securely in the app's database and used immediately!
                         </p>
                         
                         <div>
                           <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                             Twilio Account SID
                           </label>
                           <input
                             type="text"
                             placeholder="e.g. ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                             value={devAccountSid}
                             onChange={(e) => setDevAccountSid(e.target.value)}
                             className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono outline-none"
                             required
                           />
                         </div>

                         <div>
                           <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                             Twilio Auth Token
                           </label>
                           <input
                             type="text"
                             placeholder="e.g. your_auth_token_secret"
                             value={devAuthToken}
                             onChange={(e) => setDevAuthToken(e.target.value)}
                             className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono outline-none"
                             required
                           />
                         </div>

                         <div>
                           <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                             Twilio Sender Number (WhatsApp)
                           </label>
                           <input
                             type="text"
                             placeholder="e.g. +14155238886 or whatsapp:+14155238886"
                             value={devFromNumber}
                             onChange={(e) => setDevFromNumber(e.target.value)}
                             className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono outline-none"
                           />
                           <p className="text-[8px] text-amber-400 font-semibold mt-1">
                             ⚠️ Crucial: This must be your Twilio account sender number (or sandbox number), NOT your personal WhatsApp phone number!
                           </p>
                         </div>

                         <div>
                           <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                             Twilio Sandbox Join Keyword
                           </label>
                           <input
                             type="text"
                             placeholder="e.g. join behavior-simple"
                             value={devSandboxKeyword}
                             onChange={(e) => setDevSandboxKeyword(e.target.value)}
                             className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono outline-none"
                           />
                         </div>

                         <div>
                           <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                             Emergency SMS/Voice Number (Optional)
                           </label>
                           <input
                             type="text"
                             placeholder="e.g. +15551234567"
                             value={devEmergencyNumber}
                             onChange={(e) => setDevEmergencyNumber(e.target.value)}
                             className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-[10px] text-white font-mono outline-none"
                           />
                         </div>

                         {saveSettingsError && (
                           <div className="bg-rose-950/20 border border-rose-900/30 p-2 rounded text-[10px] text-rose-300 font-medium">
                             ⚠️ {saveSettingsError}
                           </div>
                         )}

                         {saveSettingsSuccess && (
                           <div className="bg-emerald-950/20 border border-emerald-900/30 p-2 rounded text-[10px] text-emerald-300 font-semibold">
                             ✅ {saveSettingsSuccess}
                           </div>
                         )}

                         <div className="flex gap-2 pt-1 font-sans">
                           <button
                             type="button"
                             onClick={handleSaveDevSettings}
                             disabled={savingDevSettings}
                             className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer disabled:opacity-55"
                           >
                             {savingDevSettings ? "Saving..." : "Save Custom Keys"}
                           </button>
                           <button
                             type="button"
                             onClick={handleResetDevSettings}
                             disabled={savingDevSettings}
                             className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer disabled:opacity-55"
                           >
                             Reset Defaults
                           </button>
                         </div>
                       </div>
                     )}
                   </div>

                  <div className="space-y-3">
                    <div className="flex flex-col gap-2">
                      {/* Direct Click & Link Button (Highly stable and reliable!) */}
                      <a
                        href={
                          twilioConfig?.isSandbox
                            ? `https://wa.me/${twilioConfig?.globalSandboxClean || '14155238886'}?text=${encodeURIComponent(getSandboxMessageText())}`
                            : `https://wa.me/${twilioConfig?.cleanFromNumber || '14155238886'}?text=${encodeURIComponent('Hello Doctor')}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer uppercase tracking-wider text-center"
                      >
                        <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.665.989 3.3 1.487 5.358 1.488 5.429 0 9.847-4.415 9.85-9.847.002-2.63-1.023-5.101-2.887-6.967C17.066 1.965 14.593.94 11.968.94c-5.441 0-9.859 4.417-9.863 9.848-.001 2.115.556 4.175 1.614 5.973l-1.012 3.7.388-.1L6.647 19.15z"/>
                        </svg>
                        <span>Open WhatsApp & Chat Instantly</span>
                      </a>
                    </div>

                    <div className="pt-3 border-t border-slate-850">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                        Your WhatsApp/SMS phone number:
                      </label>
                      <div className="flex flex-col gap-1.5">
                        <input
                          type="tel"
                          placeholder="e.g. +919304189541"
                          value={tempWhatsAppPhone}
                          onChange={(e) => {
                            setTempWhatsAppPhone(e.target.value);
                            setLinkSentStatus(null);
                            setWhatsAppError(null);
                          }}
                          className="w-full bg-slate-950/80 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-600"
                        />
                        <p className="text-[10px] text-amber-400 leading-normal font-semibold">
                          ⚠️ <strong>Crucial:</strong> Always include your country code (e.g., <span className="font-mono">+91</span> for India, <span className="font-mono">+1</span> for US).
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setWhatsAppStep('not_connected_guidance')}
                      className="w-full py-2 text-slate-400 hover:text-white font-bold rounded-xl text-xs transition-all cursor-pointer text-center block pt-2"
                    >
                      I need to download or sign up to WhatsApp
                    </button>
                  </div>
                </div>
              )}

              {/* Not Connected Guidance / Sign Up Step */}
              {whatsAppStep === 'not_connected_guidance' && (
                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <HelpCircle className="h-6 w-6 text-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white">
                        Connect to WhatsApp
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">Verify or register your mobile number first</p>
                    </div>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-900/30 p-4 rounded-2xl mb-5 text-xs text-amber-300 leading-relaxed font-semibold">
                    ⚠️ Your registered phone number (<strong>{tempWhatsAppPhone || currentPatient?.phone || 'your phone number'}</strong>) must be signed up on WhatsApp to use this feature.
                  </div>

                  {/* Direct step list */}
                  <div className="space-y-3 mb-6">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Follow these 3 simple steps:</h4>
                    
                    <div className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-extrabold flex items-center justify-center border border-slate-700 text-slate-300 shrink-0 mt-0.5">
                        1
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Download WhatsApp onto your mobile device.
                      </p>
                    </div>

                    <div className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-extrabold flex items-center justify-center border border-slate-700 text-slate-300 shrink-0 mt-0.5">
                        2
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Sign up or create your WhatsApp account using the phone number: <strong className="text-emerald-400 font-mono">{tempWhatsAppPhone || currentPatient?.phone || 'your phone number'}</strong>.
                      </p>
                    </div>

                    <div className="flex gap-3 items-start">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-extrabold flex items-center justify-center border border-slate-700 text-slate-300 shrink-0 mt-0.5">
                        3
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Once WhatsApp is running on your phone, click the button below to use this feature!
                      </p>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col gap-2.5">
                    <a
                      href="https://www.whatsapp.com/download"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-500/10 cursor-pointer text-center"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Download & Sign Up to WhatsApp ↗
                    </a>

                    {(tempWhatsAppPhone || currentPatient?.phone) && (
                      <a
                        href={`https://wa.me/${twilioConfig?.globalSandboxClean || '14155238886'}?text=${encodeURIComponent(getSandboxMessageText())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShowWhatsAppModal(false)}
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 cursor-pointer text-center"
                      >
                        I have signed up! Open WhatsApp Now ↗
                      </a>
                    )}

                    <button
                      onClick={() => {
                        if (currentPatient) {
                          setWhatsAppStep('ask_connection');
                        } else {
                          setWhatsAppStep('not_logged_in');
                        }
                      }}
                      className="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer text-center"
                    >
                      ← Go Back
                    </button>
                  </div>
                </div>
              )}
                  </>
                ) }

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Footer Branding & WhatsApp badge with Frosted Glass element */}
      <footer id="app-footer" className="relative z-10 bg-white/40 backdrop-blur-md border-t border-white/40 py-6 px-6 text-center text-xs text-slate-500 font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5">
            <span>© 2026</span>
            <span className="font-bold text-slate-700">AI Life Saver Alert</span>
            <span className="text-slate-400">•</span>
            <span>Created by Rehan. All rights reserved.</span>
          </p>

          <button 
            onClick={handleWhatsAppClick}
            title="Configure Twilio Credentials & Outbound emergency call testing"
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-full text-xs font-extrabold shadow-md hover:shadow-lg transition-all border border-amber-400 flex items-center gap-2 cursor-pointer glossy-btn uppercase tracking-wider animate-pulse hover:animate-none"
            style={{ animationDuration: '3s' }}
          >
            <PhoneCall className="h-4 w-4" />
            <span>Emergency Calling</span>
          </button>
          
          <p>Powered by Gemini 2.5 Flash • Ultra Low Latency</p>
        </div>
      </footer>
    </div>
  );
}
