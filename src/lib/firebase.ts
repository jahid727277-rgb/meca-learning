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
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getDoc } from "firebase/firestore";
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

// Initialize Firestore with robust persistent local cache to handle connection/offline errors gracefully
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  console.warn("Could not initialize persistent local cache for Firestore. Falling back to default Firestore initialization.");
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

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
  try {
    if (!userId) return;

    // Deep clean data for Firestore (remove undefined values which cause setDoc to fail)
    const cleanData = JSON.parse(JSON.stringify(progressData));

    // Save to Firestore for structured records
    const userDocRef = doc(db, "users", userId);
    
    // Save a clean array of enrolled courses with ID and Title for easy querying in console
    const enrolledCourseDetails = cleanData.enrolledCourses 
      ? Object.values(cleanData.enrolledCourses).map((enrollment: any) => ({
          id: enrollment.courseId,
          title: enrollment.courseTitle || enrollment.courseId
        }))
      : [];
    
    await setDoc(userDocRef, {
      progress: cleanData,
      enrolledCoursesList: enrolledCourseDetails,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Also sync to Realtime Database
    const rtdbRef = ref(rtdb, `users/${userId}/progress`);
    await rtdbSet(rtdbRef, {
      ...cleanData,
      updatedAt: new Date().toISOString()
    });

    if (cleanData.enrolledCourses) {
      const cleanCoursesRef = ref(rtdb, `users/${userId}/enrolled_courses`);
      await rtdbSet(cleanCoursesRef, cleanData.enrolledCourses);
    }
    
    console.log(`Successfully synced progress to Firebase for user: ${userId}`, {
      enrolledCount: Object.keys(cleanData.enrolledCourses || {}).length
    });
  } catch (error: any) {
    if (error && error.message && error.message.includes("offline")) {
      console.warn("Firebase client is offline. Progress will sync when online.");
    } else {
      console.error("Error saving user progress to Firebase:", error?.message || error);
    }
  }
}

export async function getUserProgress(userId: string) {
  try {
    // Try reading from Firestore first
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists() && docSnap.data().progress) {
      return docSnap.data().progress;
    }

    // Try reading from Realtime Database as fallback
    const rtdbRef = ref(rtdb, `users/${userId}/progress`);
    const rtdbSnap = await rtdbGet(rtdbRef);
    if (rtdbSnap.exists()) {
      return rtdbSnap.val();
    }
  } catch (error: any) {
    if (error && error.message && error.message.includes("offline")) {
      console.warn("Firebase client is offline.");
    } else {
      console.warn("Error getting user progress from Firebase:", error?.message || error);
    }
  }

  return null;
}

// Email & Password Auth Helpers
export async function registerWithEmail(email: string, password: string, name: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return userCredential.user;
  } catch (error: any) {
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
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


