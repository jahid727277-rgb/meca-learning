import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Logo from './components/Logo';
import CourseCatalog from './components/CourseCatalog';
import CourseCard from './components/CourseCard';
import StudentDashboard from './components/StudentDashboard';
import Classroom from './components/Classroom';
import CourseDetailsView from './components/CourseDetailsView';
import CourseDetailsRouteWrapper from './components/CourseDetailsRouteWrapper';
import ClassroomRouteWrapper from './components/ClassroomRouteWrapper';
import ImageWithSkeleton from './components/ImageWithSkeleton';
import { COURSES } from './data/courses';
import { normalizeCourse, getEnrolledCourses } from './utils/courseHelper';
import { UserProgress, Enrollment, Course } from './types';
import { 
  ArrowLeft, Clock, BookOpen, Star, Sparkles, ShieldCheck, 
  User, Compass, Award, ExternalLink, Calendar, AlertTriangle, Copy, Check 
} from 'lucide-react';
import { 
  supabase, 
  signInWithGoogle, 
  logoutUser, 
  saveUserProgress, 
  getUserProgress,
  getCoursesFromDB,
  saveCoursesToDB,
  getImageConfigs,
  saveImageConfigs,
  clearAllUserEnrollments,
  cleanupUIDUsers,
  subscribeCourses
} from './lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import AuthModal from './components/AuthModal';
import Footer, { footerContent } from './components/Footer';
import AdminPanel from './components/AdminPanel';

const mecaLearningLogo = '/logo_web.png';

const LOCAL_STORAGE_KEY = 'meca_learning_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
  enrolledCourses: {},
};

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.15, ease: 'easeOut' }}
  >
    {children}
  </motion.div>
);

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState<any | null>(() => {
    try {
      const cached = localStorage.getItem('meca_cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const ADMIN_EMAILS = ['jahid1882008@gmail.com'];
  const isAdmin = user !== null && ADMIN_EMAILS.includes(user.email || '');

  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);
  const [isCloudProgressLoaded, setIsCloudProgressLoaded] = useState<boolean>(false);

  // Dynamic courses and branding configurations loaded from Firebase
  const [courses, setCourses] = useState<Course[]>([]);
  const [logoUrl, setLogoUrl] = useState<string>(mecaLearningLogo);
  const [coursesLoading, setCoursesLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [pendingEnrollCourseId, setPendingEnrollCourseId] = useState<string | null>(null);
  const [enrollPopupMessage, setEnrollPopupMessage] = useState<string | null>(null);

  // Navigation: 'explore' | 'my-learning' | 'dashboard' | 'classroom' | 'admin'
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Course detailed section state - expanded syllabus indices
  const [expandedSection, setExpandedSection] = useState<string | null>('sec-1');

  // Load student progress from localStorage if available
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_PROGRESS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Error parsing user progress, loading default', e);
      }
    }
    return DEFAULT_PROGRESS;
  });

  // Scroll to top on route change with smooth behavior
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  // Listen to Auth changes and load progress from Supabase
  useEffect(() => {
    // Initial check for cached user
    const cachedUserStr = localStorage.getItem('meca_cached_user');
    if (cachedUserStr) {
      try {
        const cached = JSON.parse(cachedUserStr);
        setUser(cached);
      } catch (e) {}
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthLoading(false);
      const currentUser = session?.user;

      if (currentUser) {
        const wasAlreadyLoggedIn = !!localStorage.getItem('meca_cached_user');

        const simpleUser = {
          uid: currentUser.id,
          displayName: currentUser.user_metadata?.display_name || currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0],
          email: currentUser.email || '',
          photoURL: currentUser.user_metadata?.avatar_url || null,
        };
        setUser(simpleUser);
        localStorage.setItem('meca_cached_user', JSON.stringify(simpleUser));

        try {
          setIsCloudProgressLoaded(false);
          const cloudProgress = await getUserProgress(currentUser.id);

          if (cloudProgress) {
            setProgress(cloudProgress);
          } else {
            if (!wasAlreadyLoggedIn && Object.keys(progress.enrolledCourses).length > 0) {
              await saveUserProgress(currentUser.id, progress);
            } else {
              setProgress(DEFAULT_PROGRESS);
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_PROGRESS));
            }
          }
          setIsCloudProgressLoaded(true);
        } catch (error: any) {
          console.warn("Error syncing user progress:", error?.message || error);
          setIsCloudProgressLoaded(true);
        }
      } else {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProgress(DEFAULT_PROGRESS);
          setIsCloudProgressLoaded(false);
          try {
            localStorage.clear();
            sessionStorage.clear();
          } catch (e) {}
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch dynamic courses in real-time from Supabase
  useEffect(() => {
    getImageConfigs().then((configs) => {
      setLogoUrl(mecaLearningLogo);
    }).catch(err => console.warn("Branding configs load error:", err));

    const unsubscribe = subscribeCourses((updatedCourses) => {
      setCourses(updatedCourses);
      setCoursesLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Process pending enrollments after login
  useEffect(() => {
    if (user && isCloudProgressLoaded && pendingEnrollCourseId) {
      // Small timeout to ensure state settles before enrolling
      setTimeout(() => {
        handleEnroll(pendingEnrollCourseId, user);
        setPendingEnrollCourseId(null);
        setShowAuthModal(false);
        navigate('/my-learning');
      }, 100);
    }
  }, [user, isCloudProgressLoaded, pendingEnrollCourseId]);

  // Save progress locally and to Firebase on changes
  useEffect(() => {
    // Only save to local storage if user is logged in
    // This satisfies the requirement that data is tied to the logged-in session
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
    }
    
    // Only save to Firebase if the user is authenticated and we've successfully loaded/merged their cloud progress.
    // This prevents empty local progress from overwriting saved cloud progress during initial page loads.
    if (user && isCloudProgressLoaded) {
      saveUserProgress(user.uid, progress);
    }
  }, [progress, user, isCloudProgressLoaded]);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Auth error details:", err);
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.includes('unauthorized-domain'))) {
        setAuthError('unauthorized-domain');
      } else {
        setAuthError(err.message || 'An unexpected error occurred during authentication.');
      }
    }
  };

  // Actions
  // Actions
  const handleEnroll = (courseId: string, currentUser = user) => {
    console.log("DEBUG: handleEnroll called for:", courseId);
    const course = courses.find((c) => c.id === courseId);
    if (!course) {
        console.log("DEBUG: Course not found:", courseId);
        return;
    }

    // Intercept Date or UPcoming courses (where price is non-numeric and not free)
    const pStr = String(course.price).trim().toLowerCase();
    const isFree = pStr.includes('free') || pStr === '0' || course.price === 0;
    const isNum = !isNaN(Number(pStr)) && pStr !== '';
    const isComingSoon = !isFree && !isNum;
    if (isComingSoon) {
      const msg = course.comingSoonMessage || "এই কোর্সটি খুব শীঘ্রই শুরু হবে!";
      setEnrollPopupMessage(msg);
      return;
    }

    if (!currentUser) {
      setPendingEnrollCourseId(courseId);
      setShowAuthModal(true);
      return;
    }
    
    console.log("DEBUG: Current enrolledCourses:", progress.enrolledCourses);
    if (progress.enrolledCourses[courseId]) {
        console.log("DEBUG: Already enrolled, returning.");
        return;
    }

    // First lesson of syllabus
    const firstLessonId = course.syllabus[0]?.lessons[0]?.id || '';

    const newEnrollment: Enrollment = {
      courseId,
      courseTitle: course.title,
      enrolledAt: new Date().toISOString(),
    };

    console.log("DEBUG: Setting progress, new enrollment:", newEnrollment);

    setProgress((prev) => {
      const updated = {
        ...prev,
        enrolledCourses: {
          ...(prev.enrolledCourses || {}),
          [courseId]: newEnrollment,
        },
      };
      return updated;
    });
  };

  const handleUnenroll = (courseId: string) => {
    setProgress((prev) => {
      const updatedEnrolledCourses = { ...(prev.enrolledCourses || {}) };
      delete updatedEnrolledCourses[courseId];
      return {
        ...prev,
        enrolledCourses: updatedEnrolledCourses,
      };
    });
  };

  const handleEnrollAndStart = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      const pStr = String(course.price).trim().toLowerCase();
      const isFree = pStr.includes('free') || pStr === '0' || course.price === 0;
      const isNum = !isNaN(Number(pStr)) && pStr !== '';
      const isComingSoon = !isFree && !isNum;
      if (isComingSoon) {
        const msg = course.comingSoonMessage || "এই কোর্সটি খুব শীঘ্রই শুরু হবে!";
        setEnrollPopupMessage(msg);
        return;
      }
    }

    if (!user) {
      setPendingEnrollCourseId(courseId);
      setShowAuthModal(true);
      return;
    }

    if (progress.enrolledCourses?.[courseId]) {
      navigate(`/classroom/${courseId}`);
    } else {
      handleEnroll(courseId, user);
      navigate('/my-learning');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetails = (courseId: string) => {
    navigate(`/course/${courseId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    try {
      // Reset flags to prevent the reset progress from saving back to cloud before logout completes
      setIsCloudProgressLoaded(false);
      setProgress(DEFAULT_PROGRESS);
      
      // Clear ALL browser storage
      localStorage.clear();
      sessionStorage.clear();
      
      await logoutUser();
    } catch (e) {
      console.error("Sign out error:", e);
    }
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filter lists for "My Learning" tab
  const enrolledCoursesList = getEnrolledCourses(progress, courses);

  return (
    <div className="min-h-screen bg-white text-neutral-800 font-sans flex flex-col">
      
      {/* 1. BRAND NAVIGATION HEADER */}
      <Navbar
        user={user}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
        logoUrl={logoUrl}
        isAdmin={isAdmin}
      />

      {/* 2. DYNAMIC CONTENT MAIN ROUTING */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <div key={location.pathname}>
            <Routes location={location}>
            <Route path="/course/:courseId" element={
              <PageTransition>
                <CourseDetailsRouteWrapper
                  courses={courses}
                  isLoading={coursesLoading}
                  onEnroll={handleEnrollAndStart}
                  isEnrolled={(id) => !!progress.enrolledCourses?.[id]}
                />
              </PageTransition>
            } />
            <Route path="/classroom/:courseId" element={
              <PageTransition>
                <ClassroomRouteWrapper
                  courses={courses}
                  isLoading={coursesLoading}
                  progress={progress}
                />
              </PageTransition>
            } />
          <Route path="/" element={
            <PageTransition>
              <div className="animate-fadeIn">
                <Hero
                  courses={courses}
                  onSearch={(q) => setSearchQuery(q)}
                  onExploreClick={() => {
                    const catalogEl = document.getElementById('catalog-section');
                    if (catalogEl) {
                      catalogEl.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                />
                
                <section id="catalog-section" className="bg-white pb-24 sm:pb-32 md:pb-40">
                  <CourseCatalog
                    courses={courses}
                    isLoading={coursesLoading}
                    onSelectCourse={(courseId) => {
                      if (progress.enrolledCourses?.[courseId]) {
                        navigate(`/classroom/${courseId}`);
                      } else {
                        handleViewDetails(courseId);
                      }
                    }}
                    onEnroll={handleViewDetails}
                    onUnenroll={handleUnenroll}
                    enrolledCourses={progress.enrolledCourses || {}}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                </section>
              </div>
            </PageTransition>
          } />

          <Route path="/my-learning" element={
            <PageTransition>
              <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fadeIn">
              <div className="mb-8">
                <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                  {enrolledCoursesList.length > 0 ? "My Active Courses" : "No Enrolled Courses"}
                </h2>
              </div>

              {enrolledCoursesList.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {enrolledCoursesList.map(({ course, enrollment }) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrollment={enrollment}
                      onSelect={(courseId) => {
                        navigate(`/classroom/${courseId}`);
                      }}
                      onEnroll={handleEnrollAndStart}
                      onUnenroll={handleUnenroll}
                    />
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="space-y-6">
                  <div>
                    <div className="mb-6">
                      <h3 className="text-xl font-extrabold text-neutral-950 tracking-tight">Popular Courses</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {courses.slice(0, 4).map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          onSelect={(courseId) => {
                            if (progress.enrolledCourses?.[courseId]) {
                              navigate(`/classroom/${courseId}`);
                            } else {
                              handleViewDetails(courseId);
                            }
                          }}
                          onEnroll={handleViewDetails}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            </PageTransition>
          } />

          <Route path="/dashboard" element={
            <PageTransition>
              <div className="animate-fadeIn">
              <StudentDashboard
                progress={progress}
                courses={courses}
                user={user}
                onSignOut={handleSignOut}
                isAdmin={isAdmin}
                onEnroll={handleViewDetails}
                onUnenroll={handleUnenroll}
              />
            </div>
            </PageTransition>
          } />

          <Route path="/admin" element={
            <PageTransition>
              <div className="animate-fadeIn">
              <AdminPanel
                courses={courses}
                logoUrl={logoUrl}
                onUpdateCourses={async (newCourses) => {
                  console.log("App.tsx onUpdateCourses called with:", newCourses.length, "courses");
                  
                  // Clean up deleted courses from local progress state if the user was enrolled in any of them
                  const deletedIds = courses
                    .filter(oldC => oldC && !newCourses.some(newC => newC && newC.id === oldC.id))
                    .map(oldC => oldC.id);

                  if (deletedIds.length > 0) {
                    setProgress(prev => {
                      const updatedEnrolled = { ...prev.enrolledCourses };
                      let changed = false;
                      for (const id of deletedIds) {
                        if (updatedEnrolled[id]) {
                          delete updatedEnrolled[id];
                          changed = true;
                        }
                      }
                      if (changed) {
                        return { ...prev, enrolledCourses: updatedEnrolled };
                      }
                      return prev;
                    });
                  }

                  setCourses(newCourses);
                  try {
                    await saveCoursesToDB(newCourses);
                  } catch (e) {
                    console.error("Error saving updated courses list to Realtime Database:", e);
                  }
                }}
                onUpdateLogo={async (newLogoUrl) => {
                  setLogoUrl(newLogoUrl);
                  try {
                    await saveImageConfigs({ logoUrl: newLogoUrl });
                  } catch (e) {
                    console.error("Error saving updated logo configurations to Realtime Database:", e);
                  }
                }}
                onResetDatabase={async () => {
                  try {
                    // 1. Wipe all user progress from Firestore and Realtime Database
                    await clearAllUserEnrollments();

                    // 2. Clear current user's local state and localStorage
                    localStorage.removeItem(LOCAL_STORAGE_KEY);
                    setProgress(DEFAULT_PROGRESS);

                    // 3. Reset courses
                    await saveCoursesToDB([]);
                    setCourses([]);

                    // 4. Reset logo
                    await saveImageConfigs({ logoUrl: "" });
                    setLogoUrl(mecaLearningLogo);
                  } catch (e) {
                    console.error("Error resetting database:", e);
                    throw e;
                  }
                }}
                userEmail={user?.email || 'Demo Mode / Guest User'}
              />
            </div>
            </PageTransition>
          } />

          <Route path="/:page" element={
            <PageTransition>
              <div className="mx-auto max-w-3xl px-4 py-20 animate-fadeIn">
              <h1 className="text-3xl font-bold mb-6">{footerContent[location.pathname.substring(1) as keyof typeof footerContent]?.title || "Page Not Found"}</h1>
              <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{footerContent[location.pathname.substring(1) as keyof typeof footerContent]?.content || "The page you are looking for does not exist."}</p>
            </div>
            </PageTransition>
          } />
        </Routes>
          </div>
        </AnimatePresence>
    </main>

      {/* 3. PROFESSIONAL SUB-FOOTER */}
      <Footer />

      {/* AUTHENTICATION ERROR MODAL */}
      {authError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn text-neutral-800">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-2xl max-w-lg w-full overflow-hidden text-left">
            {/* Header */}
            <div className="bg-red-50 border-b border-red-100 p-6 flex items-start gap-4">
              <div className="p-2 bg-red-100 text-red-600 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-neutral-900 leading-tight">ফায়ারবেস অথেনটিকেশন ত্রুটি</h3>
                <p className="text-xs text-red-700 font-semibold mt-1">Firebase: auth/unauthorized-domain</p>
              </div>
              <button 
                onClick={() => setAuthError(null)}
                className="text-neutral-400 hover:text-neutral-600 font-black text-lg p-1"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-neutral-600 leading-relaxed font-semibold">
                গুগল সাইন-ইন সম্পন্ন করতে আপনার Firebase প্রজেক্টে এই ডোমেনটি অনুমোদিত তালিকায় (Authorized Domains) যুক্ত করতে হবে। এটি না করা পর্যন্ত সাইন-ইন কাজ করবে না।
              </p>

              {/* Domains to Copy */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block">অনুমোদন করতে হবে এমন ডোমেন সমূহ:</label>
                
                <div className="space-y-1.5">
                  {[
                    'ais-dev-sop3egaahjwt2tlilj4a6d-592927853819.asia-southeast1.run.app',
                    'ais-pre-sop3egaahjwt2tlilj4a6d-592927853819.asia-southeast1.run.app'
                  ].map((dom) => (
                    <div key={dom} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-100 font-mono text-[11px] text-neutral-700">
                      <span className="truncate select-all">{dom}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(dom);
                          setCopiedDomain(dom);
                          setTimeout(() => setCopiedDomain(null), 2000);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-bold border border-neutral-200 hover:bg-neutral-100 transition-all text-neutral-600 shrink-0 cursor-pointer"
                      >
                        {copiedDomain === dom ? (
                          <>
                            <Check className="w-3 h-3 text-green-600" />
                            <span className="text-green-600">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions steps */}
              <div className="rounded-2xl bg-amber-50/50 border border-amber-100/60 p-4.5 space-y-2.5 text-xs text-amber-900 font-semibold leading-relaxed">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-800 block">কীভাবে ডোমেনগুলো যোগ করবেন:</span>
                <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-amber-800">
                  <li>আপনার <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline text-emerald-600 hover:text-emerald-700 font-bold inline-flex items-center gap-0.5">Supabase Dashboard <ExternalLink className="w-3 h-3 inline" /></a> এ যান।</li>
                  <li>আপনার প্রোজেক্ট নির্বাচন করুন এবং বাম মেনু থেকে <strong className="font-bold">Authentication &gt; URL Configuration</strong> এ ক্লিক করুন।</li>
                  <li><strong className="font-bold">Site URL</strong> এবং <strong className="font-bold">Redirect URLs</strong> সেকশনে আপনার অ্যাপের URL যোগ করুন।</li>
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-neutral-50 border-t border-neutral-100 p-4 flex justify-end">
              <button
                onClick={() => setAuthError(null)}
                className="px-5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                ঠিক আছে, বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ON-SITE AUTHENTICATION DIALOG (Direct Login & Register in-app) */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => {
            setShowAuthModal(false);
          }}
          onSuccess={(loggedUser) => {
            setUser(loggedUser);
          }}
        />
      )}

      {/* UPCOMING COURSE CUSTOM POPUP MESSAGE MODAL */}
      {enrollPopupMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn text-neutral-800">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-2xl max-w-md w-full overflow-hidden text-center p-6 space-y-5">
            <div className="mx-auto w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-black text-neutral-900">কোর্সের তথ্য</h3>
              <p className="text-sm text-neutral-600 font-medium leading-relaxed whitespace-pre-wrap">
                {enrollPopupMessage}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setEnrollPopupMessage(null)}
                className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black rounded-xl transition-all shadow-md cursor-pointer uppercase tracking-wider"
              >
                ঠিক আছে, বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
