export interface Patient {
  name: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  passcode: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  imageSrc?: string;
  timestamp: string;
  escalationTriggered?: boolean;
  toolUsed?: string;
}

export interface MoodEntry {
  id: string;
  timestamp: string;
  mood: string;
  note: string;
}

export interface Therapist {
  name: string;
  address: string;
  phone?: string;
}

export interface CopingExercise {
  type: 'breathing' | 'grounding' | 'journaling';
  title: string;
  steps: string[];
}
