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
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { UserProgress } from "../types";
import { COURSES } from "../data/courses";

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
export async function saveUserProgress(userId: string, progressData: UserProgress) {
  try {
    if (!userId) return;

    // Only save the necessary enrollment data
    const cleanData: UserProgress = {
      enrolledCourses: progressData.enrolledCourses || {}
    };

    const currentUser = auth.currentUser;
    // Determine the document ID in Firestore: Prefer Email, then Phone, then UID
    let docId = userId;
    if (currentUser && currentUser.uid === userId) {
      docId = currentUser.email || currentUser.phoneNumber || userId;
    }

    // Save to Firestore
    const userDocRef = doc(db, "users", docId);
    
    // Include user details (email, phone, etc.) directly in the Firestore document
    // This allows the admin to view each user's ID/email alongside their enrolled courses in Firestore console
    const userData = {
      uid: userId,
      email: currentUser?.email || "",
      displayName: currentUser?.displayName || "",
      phoneNumber: currentUser?.phoneNumber || "",
      enrolledCourses: cleanData.enrolledCourses,
      updatedAt: new Date().toISOString()
    };

    // Use setDoc WITHOUT merge: true to completely replace the document.
    // This guarantees that any deleted courses are permanently removed from the user document in Firestore.
    await setDoc(userDocRef, userData);
    
    console.log(`Successfully synced enrollment to Firestore for user: ${docId}`);
  } catch (error: any) {
    if (error && error.message && error.message.includes("offline")) {
      console.warn("Firebase client is offline.");
    } else {
      console.error("Error saving user enrollment to Firestore:", error?.message || error);
    }
  }
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    const currentUser = auth.currentUser;
    let docId = userId;
    if (currentUser && currentUser.uid === userId) {
      docId = currentUser.email || currentUser.phoneNumber || userId;
    }

    // Try reading from Firestore using the email/phone/UID as the document ID
    const userDocRef = doc(db, "users", docId);
    let docSnap = await getDoc(userDocRef);
    
    // Fallback: If not found under email/phone, try using the raw UID as document ID
    if (!docSnap.exists() && docId !== userId) {
      const fallbackRef = doc(db, "users", userId);
      const fallbackSnap = await getDoc(fallbackRef);
      if (fallbackSnap.exists()) {
        docSnap = fallbackSnap;
      }
    }

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.enrolledCourses) {
        return { enrolledCourses: data.enrolledCourses };
      }
    }
  } catch (error: any) {
    console.warn("Error getting user enrollment from Firestore:", error?.message || error);
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

// Courses Management Helpers in Firestore
export async function getCoursesFromDB() {
  try {
    // Try reading from Firestore 'courses' collection first
    const coursesCol = collection(db, "courses");
    const snapshot = await getDocs(coursesCol);
    if (!snapshot.empty) {
      const courses: any[] = [];
      snapshot.forEach((doc) => {
        courses.push({ id: doc.id, ...doc.data() });
      });
      console.log("Successfully fetched courses from Firestore:", courses.length);
      return courses;
    } else {
      // Seed with initial static courses
      console.log("Firestore 'courses' collection is empty. Seeding with default courses...");
      try {
        for (const course of COURSES) {
          if (!course.id) continue;
          const courseDocRef = doc(db, "courses", course.id);
          const cleanCourse = JSON.parse(JSON.stringify(course));
          await setDoc(courseDocRef, cleanCourse);
        }
        console.log("Seeded default courses to Firestore.");
        return COURSES;
      } catch (seedError: any) {
        console.error("Failed to seed default courses to Firestore:", seedError);
        return COURSES;
      }
    }
  } catch (error: any) {
    console.warn("Error getting courses from Firestore:", error?.message || error);
    // If we're offline or it fails, fall back to COURSES so the app still functions
    return COURSES;
  }
}

export async function saveCoursesToDB(courses: any[]) {
  // Save each course as a document in Firestore 'courses' collection
  try {
    for (const course of courses) {
      if (!course.id) continue;
      const courseDocRef = doc(db, "courses", course.id);
      
      // Deep clean data for Firestore (remove undefined values)
      const cleanCourse = JSON.parse(JSON.stringify(course));
      await setDoc(courseDocRef, cleanCourse, { merge: true });
    }
    console.log("Successfully saved courses to Firestore.");
  } catch (error: any) {
    console.warn("Error saving courses to Firestore:", error?.message || error);
    throw error;
  }
}

// System image configurations stored in Firestore (logo, custom backgrounds, etc.)
export async function getImageConfigs() {
  try {
    const configDocRef = doc(db, "configs", "images");
    const docSnap = await getDoc(configDocRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error: any) {
    console.warn("Error reading image configs from Firestore:", error?.message || error);
  }
  return null;
}

export async function saveImageConfigs(configs: any) {
  try {
    const configDocRef = doc(db, "configs", "images");
    const cleanConfigs = JSON.parse(JSON.stringify(configs));
    await setDoc(configDocRef, cleanConfigs);
    console.log("Successfully saved image configs to Firestore.");
  } catch (error: any) {
    console.warn("Error saving image configs to Firestore:", error?.message || error);
    throw error;
  }
}

export async function clearAllUserEnrollments() {
  // Delete all user records from Firestore 'users' collection
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, "users", docSnapshot.id));
    }
    console.log("Successfully deleted all user progress records from Firestore 'users' collection.");
  } catch (error: any) {
    console.warn("Error deleting users from Firestore:", error?.message || error);
  }
}

export async function cleanupUIDUsers() {
  try {
    const usersCol = collection(db, "users");
    const snapshot = await getDocs(usersCol);
    let count = 0;
    for (const docSnapshot of snapshot.docs) {
      const id = docSnapshot.id;
      // If the ID is a UID (does not contain '@' and is not a phone number)
      const isEmail = id.includes("@");
      const isPhone = /^\+?[0-9\s\-()]+$/.test(id) && id.replace(/[^0-9]/g, "").length >= 10;
      if (!isEmail && !isPhone) {
        await deleteDoc(doc(db, "users", id));
        count++;
      }
    }
    if (count > 0) {
      console.log(`Successfully deleted ${count} UID-style user records from Firestore.`);
    }
  } catch (error: any) {
    console.warn("Error cleaning up UID users from Firestore:", error?.message || error);
  }
}

export async function syncAllCoursesToFirestore(courses: any[]) {
  try {
    for (const course of courses) {
      if (!course.id) continue;
      const courseDocRef = doc(db, "courses", course.id);
      
      // Deep clean data for Firestore (remove undefined values)
      const cleanCourse = JSON.parse(JSON.stringify(course));
      await setDoc(courseDocRef, cleanCourse, { merge: true });
    }
    console.log("Successfully synced all courses to Firestore.");
    return true;
  } catch (error: any) {
    console.error("Error syncing courses to Firestore:", error);
    throw error;
  }
}


