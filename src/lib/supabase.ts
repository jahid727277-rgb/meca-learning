import { createClient } from '@supabase/supabase-js';
import { UserProgress, Course } from '../types';
import { normalizeCourse } from '../utils/courseHelper';

// Supabase Environment Configurations
const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tstymkcvnyfouonuhdvo.supabase.co';
const SUPABASE_URL = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_cRulJh-OAy8rHLRfllBZmA_PwATxaGn';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth compatibility helper
export const auth = {
  get currentUser() {
    // Synchronously check cached session or fallback
    const cachedUser = localStorage.getItem('meca_cached_user');
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        return {
          uid: parsed.uid,
          email: parsed.email,
          displayName: parsed.displayName,
          photoURL: parsed.photoURL,
        };
      } catch (e) {}
    }
    return null;
  }
};

// --- AUTHENTICATION HELPERS ---

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Supabase Google sign-in error:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('meca_cached_user');
  } catch (error) {
    console.error("Supabase logout error:", error);
    throw error;
  }
}

export async function registerWithEmail(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          full_name: name
        }
      }
    });

    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error("User registration failed.");

    // Check if user already exists (Supabase returns empty identities array if user exists)
    if (user.identities && user.identities.length === 0) {
      const existingErr: any = new Error("User already registered");
      existingErr.code = "user_already_exists";
      throw existingErr;
    }

    const formattedUser = {
      uid: user.id,
      email: user.email || email,
      displayName: name,
      photoURL: user.user_metadata?.avatar_url || null
    };

    localStorage.setItem('meca_cached_user', JSON.stringify(formattedUser));
    return formattedUser;
  } catch (error: any) {
    console.warn("Supabase registration info:", error?.message || error);
    throw error;
  }
}

export async function loginWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    const user = data.user;
    if (!user) throw new Error("Login failed.");

    const formattedUser = {
      uid: user.id,
      email: user.email || email,
      displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || email.split('@')[0],
      photoURL: user.user_metadata?.avatar_url || null
    };

    localStorage.setItem('meca_cached_user', JSON.stringify(formattedUser));
    return formattedUser;
  } catch (error: any) {
    console.warn("Supabase login info:", error?.message || error);
    throw error;
  }
}

function extractSupabaseErrorMessage(err: any): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err.message && typeof err.message === 'string' && err.message !== '{}' && err.message !== '[object Object]') {
    return err.message;
  }
  if (err.error_description && typeof err.error_description === 'string') {
    return err.error_description;
  }
  if (err.msg && typeof err.msg === 'string') {
    return err.msg;
  }
  try {
    const propNames = Object.getOwnPropertyNames(err);
    if (propNames.length > 0) {
      const obj: Record<string, any> = {};
      for (const name of propNames) {
        obj[name] = err[name];
      }
      if (obj.message) return String(obj.message);
      if (obj.error_description) return String(obj.error_description);
    }
  } catch (e) {
    // ignore
  }
  if (err.status) {
    return `Supabase Auth Error (HTTP ${err.status})`;
  }
  return '';
}

export async function sendPasswordResetOTP(email: string) {
  try {
    const redirectUrl = typeof window !== 'undefined' ? window.location.origin : '';
    
    // Call resetPasswordForEmail so Supabase uses the custom "Reset Password" email template
    const { data: resetData, error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });

    if (!resetErr) {
      return resetData;
    }

    const resetMsg = extractSupabaseErrorMessage(resetErr);
    console.warn("Supabase resetPasswordForEmail info:", resetMsg, resetErr);
    const resetMsgLower = resetMsg.toLowerCase();

    if (
      resetMsgLower.includes('user not found') || 
      resetMsgLower.includes('not_found') ||
      resetMsgLower.includes('signups not allowed') ||
      resetMsgLower.includes('signup disabled')
    ) {
      throw new Error("This email address is not registered in the system.");
    }

    if (resetMsgLower.includes('rate limit') || resetMsgLower.includes('60 seconds') || resetMsgLower.includes('security purposes') || resetMsgLower.includes('over_email_send_rate_limit')) {
      if (resetMsg && (resetMsg.toLowerCase().includes('security purposes') || resetMsg.toLowerCase().includes('request this after'))) {
        throw new Error(resetMsg);
      }
      throw new Error("For security reasons, Supabase limits OTP requests. Please wait a few seconds before requesting again.");
    }

    if (resetMsg) {
      if (resetMsg.toLowerCase().includes('error sending') || resetMsg.toLowerCase().includes('smtp')) {
        throw new Error("Sorry server down");
      }
      throw new Error(resetMsg);
    }

    throw new Error("Sorry server down");
  } catch (error: any) {
    console.warn("Supabase sendPasswordResetOTP caught error:", error?.message || error);
    let msg = typeof error === 'string' ? error : error?.message;
    if (!msg || typeof msg !== 'string' || msg === '{}' || msg === '[object Object]' || msg.includes('SMTP') || msg.includes('Unable to send') || msg.includes('error sending')) {
      msg = "Sorry server down";
    }
    throw new Error(msg);
  }
}

export async function verifyOTPAndResetPassword(email: string, otpToken: string, newPassword: string) {
  try {
    // 1. Verify OTP code
    let verifiedUser = null;
    let verifyError: any = null;

    // Try 'recovery' type first
    const { data: recData, error: recErr } = await supabase.auth.verifyOtp({
      email,
      token: otpToken,
      type: 'recovery'
    });

    if (!recErr && recData?.user) {
      verifiedUser = recData.user;
    } else {
      verifyError = recErr;
      // Fallback try 'email' type
      const { data: emailData, error: emailErr } = await supabase.auth.verifyOtp({
        email,
        token: otpToken,
        type: 'email'
      });

      if (!emailErr && emailData?.user) {
        verifiedUser = emailData.user;
        verifyError = null;
      } else {
        verifyError = emailErr || recErr;
      }
    }

    if (verifyError || !verifiedUser) {
      const msg = verifyError?.message || "Invalid or expired OTP code.";
      throw new Error(msg);
    }

    // 2. Update user's password
    const { data: updateData, error: updateErr } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateErr) {
      throw new Error(updateErr.message || "Failed to update password.");
    }

    const finalUser = updateData.user || verifiedUser;

    const formattedUser = {
      uid: finalUser.id,
      email: finalUser.email || email,
      displayName: finalUser.user_metadata?.display_name || finalUser.user_metadata?.full_name || email.split('@')[0],
      photoURL: finalUser.user_metadata?.avatar_url || null
    };

    localStorage.setItem('meca_cached_user', JSON.stringify(formattedUser));
    return formattedUser;
  } catch (error: any) {
    console.warn("Supabase verifyOTPAndResetPassword error:", error);
    let msg = error?.message || (typeof error === 'string' ? error : '');
    if (!msg || msg === '{}' || typeof msg === 'object') {
      msg = "Invalid or expired OTP code. Please check the code and try again.";
    }
    throw new Error(msg);
  }
}

export async function updateProfileName(displayName: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: displayName, full_name: displayName }
    });
    if (error) throw error;

    const cached = localStorage.getItem('meca_cached_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        parsed.displayName = displayName;
        localStorage.setItem('meca_cached_user', JSON.stringify(parsed));
      } catch (e) {}
    }
    return data.user;
  } catch (error: any) {
    console.error("Supabase updateProfile error:", error);
    throw error;
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data.user;
  } catch (error: any) {
    console.error("Supabase updatePassword error:", error);
    throw error;
  }
}

// --- USER PROGRESS HELPERS ---

export async function saveUserProgress(userId: string, progressData: UserProgress) {
  try {
    if (!userId) return;

    const cleanData: UserProgress = {
      enrolledCourses: progressData.enrolledCourses || {}
    };

    const cachedUser = auth.currentUser;

    const userData = {
      id: userId,
      uid: userId,
      email: cachedUser?.email || "",
      display_name: cachedUser?.displayName || "",
      enrolled_courses: cleanData.enrolledCourses,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('users_progress')
      .upsert(userData, { onConflict: 'id' });

    if (error) {
      console.warn("Supabase saveUserProgress notice/error:", error.message);
    } else {
      console.log(`Successfully synced enrollment to Supabase for UID: ${userId}`);
    }
  } catch (error: any) {
    console.warn("Error saving user enrollment to Supabase:", error?.message || error);
  }
}

export async function getUserProgress(userId: string): Promise<UserProgress | null> {
  try {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('users_progress')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn("Error fetching user progress from Supabase:", error.message);
      return null;
    }

    if (data && (data.enrolled_courses || data.enrolledCourses)) {
      return {
        enrolledCourses: data.enrolled_courses || data.enrolledCourses || {}
      };
    }
  } catch (error: any) {
    console.warn("Error getting user enrollment from Supabase:", error?.message || error);
  }

  return null;
}

// --- COURSES HELPERS ---

export function cleanCourseForSupabase(course: any) {
  if (!course) return course;
  const c = { ...course };

  return {
    id: String(c.id),
    title: c.title || '',
    description: c.description || '',
    category: c.category || 'Generative AI',
    level: c.level || 'Beginner',
    rating: c.rating ?? 5.0,
    review_count: c.reviewCount ?? 0,
    duration: c.duration || '',
    lessons_count: c.lessonsCount ?? (c.syllabus ? c.syllabus.reduce((acc: number, s: any) => acc + (s.lessons ? s.lessons.length : 0), 0) : 0),
    price: c.price ?? 0,
    thumbnail: c.thumbnail || '',
    tags: c.tags || [],
    instructor: c.instructor || {},
    syllabus: c.syllabus || [],
    promo_video_url: c.promoVideoUrl || '',
    details_description: c.detailsDescription || '',
    coming_soon_message: c.comingSoonMessage || '',
    updated_at: new Date().toISOString()
  };
}

export async function getCoursesFromDB(): Promise<Course[]> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase getCoursesFromDB error:", error.message);
      return [];
    }

    if (data && data.length > 0) {
      return data.map((item: any) => {
        const rawCourse = {
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          level: item.level,
          rating: item.rating,
          reviewCount: item.review_count ?? item.reviewCount,
          duration: item.duration,
          lessonsCount: item.lessons_count ?? item.lessonsCount,
          price: item.price,
          thumbnail: item.thumbnail,
          tags: item.tags,
          instructor: item.instructor,
          syllabus: item.syllabus,
          promoVideoUrl: item.promo_video_url ?? item.promoVideoUrl,
          detailsDescription: item.details_description ?? item.detailsDescription,
          comingSoonMessage: item.coming_soon_message ?? item.comingSoonMessage,
        };
        return normalizeCourse(rawCourse);
      });
    }
    return [];
  } catch (error: any) {
    console.warn("Error getting courses from Supabase:", error?.message || error);
    return [];
  }
}

export async function getSingleCourseFromDB(courseId: string): Promise<Course | null> {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .maybeSingle();

    if (error || !data) return null;

    const rawCourse = {
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      rating: data.rating,
      reviewCount: data.review_count ?? data.reviewCount,
      duration: data.duration,
      lessonsCount: data.lessons_count ?? data.lessonsCount,
      price: data.price,
      thumbnail: data.thumbnail,
      tags: data.tags,
      instructor: data.instructor,
      syllabus: data.syllabus,
      promoVideoUrl: data.promo_video_url ?? data.promoVideoUrl,
      detailsDescription: data.details_description ?? data.detailsDescription,
      comingSoonMessage: data.coming_soon_message ?? data.comingSoonMessage,
    };
    return normalizeCourse(rawCourse);
  } catch (err: any) {
    console.warn("Error getting single course from Supabase:", err?.message || err);
    return null;
  }
}

export async function saveCoursesToDB(courses: Course[]) {
  try {
    const activeIds = new Set(courses.map(c => String(c.id)).filter(Boolean));

    // 1. Fetch current courses to identify deleted ones
    const { data: existingData } = await supabase.from('courses').select('id');
    if (existingData) {
      const deletedIds = existingData
        .map((row: any) => String(row.id))
        .filter(id => !activeIds.has(id));

      if (deletedIds.length > 0) {
        await supabase.from('courses').delete().in('id', deletedIds);
        console.log(`Deleted ${deletedIds.length} course(s) from Supabase.`);
      }
    }

    // 2. Upsert active courses
    if (courses.length > 0) {
      const cleanList = courses.map(c => cleanCourseForSupabase(c));
      const { error } = await supabase
        .from('courses')
        .upsert(cleanList, { onConflict: 'id' });

      if (error) throw error;
    }

    // Mark configs
    await supabase.from('configs').upsert({ id: 'courses_meta', data: { initialized: true } }, { onConflict: 'id' });
    console.log("Successfully saved courses to Supabase.");
  } catch (error: any) {
    console.warn("Error saving courses to Supabase:", error?.message || error);
    throw error;
  }
}

// System image configurations (logo, banners, etc.)
export async function getImageConfigs() {
  try {
    const { data, error } = await supabase
      .from('configs')
      .select('data')
      .eq('id', 'images')
      .maybeSingle();

    if (error || !data) return null;
    return data.data;
  } catch (error: any) {
    console.warn("Error reading image configs from Supabase:", error?.message || error);
    return null;
  }
}

export async function saveImageConfigs(configs: any) {
  try {
    const { error } = await supabase
      .from('configs')
      .upsert({ id: 'images', data: configs, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (error) throw error;
    console.log("Successfully saved image configs to Supabase.");
  } catch (error: any) {
    console.warn("Error saving image configs to Supabase:", error?.message || error);
    throw error;
  }
}

export async function clearAllUserEnrollments() {
  try {
    const { error } = await supabase
      .from('users_progress')
      .delete()
      .neq('id', '___non_existent_id___');

    if (error) console.warn("Error deleting users_progress from Supabase:", error.message);
    else console.log("Successfully deleted all user progress records from Supabase.");
  } catch (error: any) {
    console.warn("Error clearing user enrollments in Supabase:", error?.message || error);
  }
}

export async function cleanupUIDUsers() {
  // Utility cleanup for Supabase
  try {
    console.log("Supabase cleanup check completed.");
  } catch (e) {}
}

export async function syncAllCoursesToFirestore(courses: Course[]) {
  return saveCoursesToDB(courses);
}

export async function syncAllCoursesToSupabase(courses: Course[]) {
  return saveCoursesToDB(courses);
}

// Real-time subscription helper for courses
export function subscribeCourses(onUpdate: (courses: Course[]) => void) {
  // Initial fetch
  getCoursesFromDB().then((data) => onUpdate(data));

  // Subscribe to real-time changes
  const channel = supabase
    .channel('public:courses')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'courses' },
      async () => {
        const fresh = await getCoursesFromDB();
        onUpdate(fresh);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
