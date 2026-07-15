import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { getDatabase, ref, set as rtdbSet, get as rtdbGet } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCw12hW5NlxuMt2av2i5C23Ky-YWg2_mis",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "my-smart-controll-system.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://my-smart-controll-system-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "my-smart-controll-system",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "my-smart-controll-system.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "386170436080",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:386170436080:web:3dca02bb3b6e74ac140535",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-51RV7LB6ZX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

// Authentication Helpers
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase sign-in error:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase logout error:", error);
    throw error;
  }
}

// Data Synchronization Helpers
export async function saveUserProgress(userId: string, progressData: any) {
  // First save locally to localStorage so progress is never lost even if client is offline
  try {
    localStorage.setItem(`meca_progress_${userId}`, JSON.stringify(progressData));
  } catch (e) {}

  try {
    // Save to Firestore for structured records
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, {
      progress: progressData,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Also sync to Realtime Database since the user provided a databaseURL (could be used for IoT/smart control systems, etc.)
    const rtdbRef = ref(rtdb, `users/${userId}/progress`);
    await rtdbSet(rtdbRef, {
      ...progressData,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    if (error && error.message && error.message.includes("offline")) {
      console.warn("Firebase client is offline. Progress saved to local cache and will be synced later.");
    } else {
      console.warn("Error saving user progress to Firebase (saved to cache):", error?.message || error);
    }
  }
}

export async function getUserProgress(userId: string) {
  try {
    // Try reading from Firestore first
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists() && docSnap.data().progress) {
      try {
        localStorage.setItem(`meca_progress_${userId}`, JSON.stringify(docSnap.data().progress));
      } catch (e) {}
      return docSnap.data().progress;
    }

    // Try reading from Realtime Database as fallback
    const rtdbRef = ref(rtdb, `users/${userId}/progress`);
    const rtdbSnap = await rtdbGet(rtdbRef);
    if (rtdbSnap.exists()) {
      try {
        localStorage.setItem(`meca_progress_${userId}`, JSON.stringify(rtdbSnap.val()));
      } catch (e) {}
      return rtdbSnap.val();
    }
  } catch (error: any) {
    if (error && error.message && error.message.includes("offline")) {
      console.warn("Firebase client is offline. Using local cache fallback.");
    } else {
      console.warn("Error getting user progress from Firebase (using local fallback):", error?.message || error);
    }
  }

  // Fallback to local cache
  try {
    const cached = localStorage.getItem(`meca_progress_${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {}

  return null;
}

// Email & Password Auth Helpers
export async function registerWithEmail(email: string, password: string, name: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential.user;
  } catch (error: any) {
    console.error("Error registering with email:", error);
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error logging in with email:", error);
    throw error;
  }
}

// Courses Management Helpers in Realtime Database
export async function getCoursesFromDB() {
  try {
    const coursesRef = ref(rtdb, "courses");
    const snapshot = await rtdbGet(coursesRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      // If saved as object, convert to array
      if (data && typeof data === 'object') {
        if (Array.isArray(data)) {
          return data.filter(Boolean);
        }
        return Object.keys(data).map(key => ({
          ...data[key],
          id: data[key].id || key
        }));
      }
    }
  } catch (error: any) {
    if (error && error.message && error.message.includes("offline")) {
      console.warn("Firebase client is offline. Unable to get courses from DB.");
    } else {
      console.warn("Error getting courses from Firebase:", error?.message || error);
    }
  }
  return null;
}

export async function saveCoursesToDB(courses: any[]) {
  try {
    const coursesRef = ref(rtdb, "courses");
    await rtdbSet(coursesRef, courses);
  } catch (error: any) {
    if (error && error.message && error.message.includes("offline")) {
      console.warn("Firebase client is offline. Unable to save courses.");
    } else {
      console.warn("Error saving courses to Firebase:", error?.message || error);
    }
    throw error;
  }
}

// System image configurations stored in Realtime Database (logo, custom backgrounds, etc.)
export async function getImageConfigs() {
  try {
    const imagesRef = ref(rtdb, "configs/images");
    const snapshot = await rtdbGet(imagesRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
  } catch (error: any) {
    if (error && error.message && error.message.includes("offline")) {
      console.warn("Firebase client is offline. Unable to get image configs.");
    } else {
      console.warn("Error reading image configs:", error?.message || error);
    }
  }
  return null;
}

export async function saveImageConfigs(configs: any) {
  try {
    const imagesRef = ref(rtdb, "configs/images");
    await rtdbSet(imagesRef, configs);
  } catch (error: any) {
    if (error && error.message && error.message.includes("offline")) {
      console.warn("Firebase client is offline. Unable to save image configs.");
    } else {
      console.warn("Error saving image configs:", error?.message || error);
    }
    throw error;
  }
}


