import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

let firebaseConfig: any = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  }
} catch (error) {
  console.error('Failed to load firebase-applet-config.json:', error);
}

// Fallback configuration if firebase-applet-config.json is not present or partial
const config = {
  apiKey: firebaseConfig?.apiKey || process.env.FIREBASE_API_KEY,
  authDomain: firebaseConfig?.authDomain || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: firebaseConfig?.projectId || process.env.FIREBASE_PROJECT_ID || 'my-project-rehan',
  storageBucket: firebaseConfig?.storageBucket || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: firebaseConfig?.messagingSenderId || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: firebaseConfig?.appId || process.env.FIREBASE_APP_ID,
};

const app = initializeApp(config);
const firestoreInstance = getFirestore(app, firebaseConfig?.firestoreDatabaseId || '(default)');

function cleanUndefined(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }
  if (typeof obj === 'object') {
    // If it is a native Date or other object, return as is
    if (obj instanceof Date) {
      return obj;
    }
    const res: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          res[key] = cleanUndefined(val);
        }
      }
    }
    return res;
  }
  return obj;
}

// Wrap Web JS SDK to be backward-compatible with Admin SDK doc/collection API used in server.ts
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
              data() {
                return snap.data();
              }
            };
          },
          async set(data: any, options?: { merge?: boolean }) {
            const cleanData = cleanUndefined(data);
            await setDoc(docRef, cleanData, options || {});
          }
        };
      },
      async add(data: any) {
        const cleanData = cleanUndefined(data);
        const colRef = collection(firestoreInstance, collectionName);
        const docRef = await addDoc(colRef, cleanData);
        return {
          id: docRef.id,
          get() {
            return getDoc(docRef);
          }
        };
      },
      async get() {
        const colRef = collection(firestoreInstance, collectionName);
        const snap = await getDocs(colRef);
        return {
          docs: snap.docs.map(docSnap => ({
            id: docSnap.id,
            data() {
              return docSnap.data();
            }
          }))
        };
      }
    };
  }
};

