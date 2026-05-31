import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyASHFY7d7Pk28CuEOcfHwft1o5PUdZXjH4",
  authDomain: "campusride-ac8c2.firebaseapp.com",
  projectId: "campusride-ac8c2",
  storageBucket: "campusride-ac8c2.firebasestorage.app",
  messagingSenderId: "64533894922",
  appId: "1:64533894922:web:40417a0df507be45cc4cf3",
  measurementId: "G-4TDVWZJRDD"
};

const app = initializeApp(firebaseConfig);

// Keep the user logged in across refreshes / app restarts.
// Persistence is platform-specific: the Firebase web SDK uses IndexedDB in the
// browser, but on native (Expo Go / device) it defaults to IN-MEMORY storage,
// which loses the session on every restart. We must wire AsyncStorage there.
let auth: Auth;
try {
  if (Platform.OS === 'web') {
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    });
  } else {
    // require() (not import) so the web bundle never pulls RN-only modules.
    // getReactNativePersistence only exists in firebase/auth's React Native build.
    const { getReactNativePersistence } = require('firebase/auth');
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch {
  // initializeAuth throws "already-initialized" on hot-reload — reuse the instance.
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);
export default app;