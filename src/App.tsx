import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Logo from './components/Logo';
import CourseCatalog from './components/CourseCatalog';
import CourseCard from './components/CourseCard';
import StudentDashboard from './components/StudentDashboard';
import Classroom from './components/Classroom';
import ReviewSection from './components/ReviewSection';
import ImageWithSkeleton from './components/ImageWithSkeleton';
import { COURSES, REVIEWS } from './data/courses';
import { normalizeCourse, getEnrolledCourses } from './utils/courseHelper';
import { UserProgress, Enrollment, Course, Review } from './types';
import { formatBDTPrice } from './utils/currency';
import { 
  ArrowLeft, Clock, BookOpen, Star, Sparkles, ShieldCheck, 
  User, Compass, Award, ExternalLink, Calendar, AlertTriangle, Copy, Check 
} from 'lucide-react';
import { 
  auth, 
  signInWithGoogle, 
  logoutUser, 
  saveUserProgress, 
  getUserProgress,
  getCoursesFromDB,
  saveCoursesToDB,
  getImageConfigs,
  saveImageConfigs
} from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import AuthModal from './components/AuthModal';
import Footer, { footerContent } from './components/Footer';
import AdminPanel from './components/AdminPanel';
import Certificates from './components/Certificates';

const mecaLearningLogo = '/logo_web.png';

const LOCAL_STORAGE_KEY = 'meca_learning_progress_v1';
const REVIEWS_STORAGE_KEY = 'meca_learning_reviews_v1';

const DEFAULT_PROGRESS: UserProgress = {
  streak: 0,
  totalHours: 0,
  enrolledCourses: {},
  certificates: [],
  activityLog: [],
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(() => {
    try {
      const cached = localStorage.getItem('meca_cached_user');
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const ADMIN_EMAILS = ['jahid1882008@gmail.com', 'mecalearning@gmail.com'];
  const isAdmin = user !== null && ADMIN_EMAILS.includes(user.email || '');

  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  // Dynamic courses and branding configurations loaded from Firebase Realtime Database
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [logoUrl, setLogoUrl] = useState<string>(mecaLearningLogo);
  const [coursesLoading, setCoursesLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [pendingEnrollCourseId, setPendingEnrollCourseId] = useState<string | null>(null);

  // Navigation: 'explore' | 'my-learning' | 'dashboard' | 'classroom' | 'admin'
  const [currentView, setCurrentView] = useState<string>('explore');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [selectedCertCourseId, setSelectedCertCourseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Course detailed section state - expanded syllabus indices
  const [expandedSection, setExpandedSection] = useState<string | null>('sec-1');

  // Load / Save student progress
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing user progress, loading default', e);
      }
    }
    return DEFAULT_PROGRESS;
  });

  // Load / Save custom reviews list
  const [reviewsMap, setReviewsMap] = useState<{ [courseId: string]: Review[] }>(() => {
    const saved = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing reviews, loading default', e);
      }
    }
    // Set initial default reviews
    const initial: { [courseId: string]: Review[] } = {};
    COURSES.forEach((c) => {
      // Seed with some of the default reviews
      initial[c.id] = [...REVIEWS];
    });
    return initial;
  });

  // Listen to Auth changes and load progress from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        try {
          const simpleUser = {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          };
          localStorage.setItem('meca_cached_user', JSON.stringify(simpleUser));
        } catch (e) {}

        try {
          const cloudProgress = await getUserProgress(currentUser.uid);
          if (cloudProgress) {
            setProgress(cloudProgress);
          } else {
            // First time logging in, backup local progress to Firebase
            await saveUserProgress(currentUser.uid, progress);
          }
        } catch (error: any) {
          if (error && error.message && error.message.includes("offline")) {
            console.warn("Firebase client is offline. Unable to fetch online progress.");
          } else {
            console.warn("Error fetching user progress from Firebase:", error?.message || error);
          }
        }
      } else {
        try {
          localStorage.removeItem('meca_cached_user');
          localStorage.removeItem('current_user_pwd');
        } catch (e) {}
        setProgress(DEFAULT_PROGRESS);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch dynamic courses and logos/image configurations from Realtime Database on component mount
  useEffect(() => {
    async function fetchFirebaseConfigurations() {
      try {
        // 1. Get branding configurations
        const configs = await getImageConfigs();
        setLogoUrl(mecaLearningLogo);
        if (configs && configs.logoUrl) {
          // Keep other configs if needed, but not logoUrl
        }

        // 2. Get and clean AI courses
        const dbCourses = await getCoursesFromDB();

        if (!dbCourses || dbCourses.length === 0) {
          // If RTDB is empty, seed it with the default AI courses
          await saveCoursesToDB(COURSES);
          setCourses(COURSES);
        } else {
          // Normalize every course fetched from Realtime Database to ensure all arrays/properties are safe and correct.
          // This prevents courses from being filtered out due to Firebase array-to-object key/value serialization.
          const normalizedDBCourses = dbCourses
            .filter((c: any) => c && (c.id || c.title))
            .map((c: any) => {
              try {
                return normalizeCourse(c);
              } catch (e) {
                console.error("Error normalizing course from Realtime Database:", e);
                return null;
              }
            })
            .filter(Boolean) as Course[];

          let hasNewCourses = false;
          const updatedCourses = [...normalizedDBCourses];

          for (const defaultCourse of COURSES) {
            const exists = updatedCourses.some(c => c.id === defaultCourse.id);
            if (!exists) {
              updatedCourses.push(defaultCourse);
              hasNewCourses = true;
            }
          }

          // Detect if any normalized course had its thumbnail corrected/updated relative to the DB course
          let hasThumbnailCorrection = false;
          normalizedDBCourses.forEach((normalized) => {
            const original = dbCourses.find((dbC: any) => dbC && dbC.id === normalized.id);
            if (original && original.thumbnail !== normalized.thumbnail) {
              hasThumbnailCorrection = true;
            }
          });

          if (hasThumbnailCorrection) {
            hasNewCourses = true;
          }

          // If we found missing courses or there were format issues resolved, write back to DB
          if (hasNewCourses || normalizedDBCourses.length !== dbCourses.length) {
            await saveCoursesToDB(updatedCourses);
            setCourses(updatedCourses);
          } else {
            setCourses(normalizedDBCourses);
          }
        }
      } catch (err: any) {
        if (err && err.message && err.message.includes("offline")) {
          console.warn("Firebase is offline. Loading offline configurations and defaults.");
        } else {
          console.warn("Error loading courses/configs from Firebase Realtime Database:", err?.message || err);
        }
        // Fallback to static courses array if Firestore or RTDB is blocked
        setCourses(COURSES);
      } finally {
        setCoursesLoading(false);
      }
    }
    fetchFirebaseConfigurations();
  }, []);

  // Save progress locally and to Firebase on changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
    if (user) {
      saveUserProgress(user.uid, progress);
    }
  }, [progress, user]);

  useEffect(() => {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviewsMap));
  }, [reviewsMap]);

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
  const handleEnroll = (courseId: string, currentUser = user) => {
    if (!currentUser) {
      setPendingEnrollCourseId(courseId);
      setShowAuthModal(true);
      return;
    }
    if (progress.enrolledCourses[courseId]) return;

    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    // First lesson of syllabus
    const firstLessonId = course.syllabus[0]?.lessons[0]?.id || '';

    const newEnrollment: Enrollment = {
      courseId,
      progress: 0,
      completedLessons: [],
      currentLessonId: firstLessonId,
    };

    setProgress((prev) => ({
      ...prev,
      enrolledCourses: {
        ...prev.enrolledCourses,
        [courseId]: newEnrollment,
      },
    }));
  };

  const handleEnrollAndStart = (courseId: string) => {
    if (!user) {
      setPendingEnrollCourseId(courseId);
      setShowAuthModal(true);
      return;
    }
    handleEnroll(courseId, user);
    setSelectedCourseId(courseId);
    setCurrentView('classroom');
  };

  const handleUpdateEnrollment = (
    courseId: string,
    completedLessonIds: string[],
    currentLessonId: string
  ) => {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    const totalLessons = course.syllabus.flatMap((s) => s.lessons).length;
    const progressPercent = Math.min(100, (completedLessonIds.length / totalLessons) * 100);

    setProgress((prev) => {
      const updatedEnrolled = { ...prev.enrolledCourses };
      const currentEnrollment = updatedEnrolled[courseId] || {
        courseId,
        completedLessons: [],
      };

      updatedEnrolled[courseId] = {
        ...currentEnrollment,
        completedLessons: completedLessonIds,
        progress: progressPercent,
        currentLessonId,
        completedAt: progressPercent >= 100 ? new Date().toISOString() : undefined,
      };

      // Handle certificates earning automatically
      const updatedCerts = [...prev.certificates];
      if (progressPercent >= 100 && !updatedCerts.includes(courseId)) {
        updatedCerts.push(courseId);
      }

      return {
        ...prev,
        enrolledCourses: updatedEnrolled,
        certificates: updatedCerts,
      };
    });
  };

  const handleAddHours = (minutes: number) => {
    setProgress((prev) => {
      const hoursAdd = minutes / 60;
      // Increment total study hours
      const nextHours = prev.totalHours + hoursAdd;
      
      // Update activity log for today
      const today = new Date().toISOString().split('T')[0];
      const logCopy = [...prev.activityLog];
      const todayIndex = logCopy.findIndex((l) => l.date === today);

      if (todayIndex >= 0) {
        logCopy[todayIndex].minutes += minutes;
      } else {
        logCopy.push({ date: today, minutes });
      }

      // Automatically bump streak if last study date is different
      const lastStudy = prev.lastStudyDate;
      let nextStreak = prev.streak;
      if (lastStudy !== today) {
        nextStreak = prev.streak + 1;
      }

      return {
        ...prev,
        totalHours: nextHours,
        activityLog: logCopy,
        streak: nextStreak,
        lastStudyDate: today,
      };
    });
  };

  const handleUnlockCertificate = (courseId: string) => {
    setProgress((prev) => {
      if (prev.certificates.includes(courseId)) return prev;
      return {
        ...prev,
        certificates: [...prev.certificates, courseId],
      };
    });
  };

  const handleAddReview = (courseId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    };

    setReviewsMap((prev) => {
      const current = prev[courseId] || [];
      return {
        ...prev,
        [courseId]: [newReview, ...current],
      };
    });
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);
  const activeEnrollment = selectedCourseId ? progress.enrolledCourses[selectedCourseId] : undefined;

  // Filter lists for "My Learning" tab
  const enrolledCoursesList = getEnrolledCourses(progress, courses);

  return (
    <div className="min-h-screen bg-white text-neutral-800 font-sans flex flex-col">
      
      {/* 1. BRAND NAVIGATION HEADER */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setCurrentView(view);
          setSelectedCourseId(null); // Reset detail subviews on nav shift
        }}
        streak={progress.streak}
        totalHours={progress.totalHours}
        user={user}
        onSignIn={() => setShowAuthModal(true)}
        onSignOut={logoutUser}
        logoUrl={logoUrl}
        isAdmin={isAdmin}
      />

      {/* 2. DYNAMIC CONTENT MAIN ROUTING */}
      <main className="flex-grow">
        
        {/* ACTIVE CLASSROOM MODE */}
        {currentView === 'classroom' && selectedCourse && activeEnrollment ? (
          <Classroom
            course={selectedCourse}
            enrollment={activeEnrollment}
            onUpdateEnrollment={handleUpdateEnrollment}
            onAddHours={handleAddHours}
            onBack={() => {
              setCurrentView('my-learning');
              setSelectedCourseId(selectedCourse.id); // Go back to course detail subview
            }}
            onUnlockCertificate={handleUnlockCertificate}
          />
        ) : (
          /* STANDARD DIRECTORIES */
          <>
            {/* VIEW F: POLICY PAGES */}
            {['about', 'privacy', 'terms', 'refund'].includes(currentView) && (
              <div className="mx-auto max-w-3xl px-4 py-20 animate-fadeIn">
                <h1 className="text-3xl font-bold mb-6">{footerContent[currentView as keyof typeof footerContent].title}</h1>
                <p className="text-neutral-700 leading-relaxed whitespace-pre-line">{footerContent[currentView as keyof typeof footerContent].content}</p>
              </div>
            )}

            {/* VIEW A: EXPLORE HOME & CATALOG */}
            {currentView === 'explore' && !selectedCourseId && (
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
                    onSelectCourse={(courseId) => setSelectedCourseId(courseId)}
                    onEnroll={handleEnrollAndStart}
                    enrolledCourses={progress.enrolledCourses}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                  />
                </section>
              </div>
            )}

            {/* VIEW B: MY LEARNING DIRECTORY */}
            {currentView === 'my-learning' && !selectedCourseId && (
              <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fadeIn">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-neutral-900 tracking-tight">My Active Courses</h2>
                </div>

                {enrolledCoursesList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {enrolledCoursesList.map(({ course, enrollment }) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        enrollment={enrollment}
                        onSelect={(courseId) => {
                          setSelectedCourseId(courseId);
                          setCurrentView('classroom');
                        }}
                        onEnroll={handleEnrollAndStart}
                        onShowCertificate={(courseId) => setSelectedCertCourseId(courseId)}
                      />
                    ))}
                  </div>
                ) : (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center text-center p-12 bg-neutral-50/50 rounded-3xl border border-neutral-100 max-w-lg mx-auto">
                    <Compass className="w-12 h-12 text-neutral-300 mb-4" />
                    <h3 className="text-lg font-bold text-neutral-800">No Enrolled Courses</h3>
                    <p className="text-xs text-neutral-500 font-medium max-w-sm mt-1 mb-5">
                      You are not enrolled in any technical programs yet. Begin your learning journey by exploring our programs catalog.
                    </p>
                    <button
                      onClick={() => setCurrentView('explore')}
                      className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm"
                    >
                      Browse Syllabus Catalog
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* VIEW C: STUDENT ANALYTICS DASHBOARD */}
            {currentView === 'dashboard' && !selectedCourseId && (
              <div className="animate-fadeIn">
                <StudentDashboard
                  progress={progress}
                  courses={courses}
                  user={user}
                  onSignOut={logoutUser}
                  isAdmin={isAdmin}
                  onNavigate={(view) => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setCurrentView(view);
                  }}
                  onNavigateToCourse={(courseId) => {
                    setSelectedCourseId(courseId);
                    setCurrentView('my-learning');
                  }}
                  onNavigateToExplore={() => setCurrentView('explore')}
                />
              </div>
            )}

            {/* VIEW E: ADMIN CONSOLE */}
            {currentView === 'admin' && isAdmin && (
              <div className="animate-fadeIn">
                <AdminPanel
                  courses={courses}
                  logoUrl={logoUrl}
                  onUpdateCourses={async (newCourses) => {
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
                      // Save default COURSES to DB
                      await saveCoursesToDB(COURSES);
                      setCourses(COURSES);
                      // Reset logo config
                      await saveImageConfigs({ logoUrl: "" });
                      setLogoUrl("");
                    } catch (e) {
                      console.error("Error resetting Realtime Database:", e);
                      throw e;
                    }
                  }}
                  userEmail={user?.email || 'Demo Mode / Guest User'}
                />
              </div>
            )}

            {/* VIEW D: COURSE DETAILED SPECIFICATION PAGE (Active when selectedCourseId is set) */}
            {selectedCourseId && selectedCourse && (
              <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fadeIn">
                {/* Back Link */}
                <button
                  onClick={() => setSelectedCourseId(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-neutral-500 hover:text-orange-600 mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Syllabus Catalog
                </button>

                {/* Split detail grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* LEFT DETAILS COLUMN (Syllabus, Overview, Reviews) (Col 8) */}
                  <div className="lg:col-span-8 space-y-8">
                    
                    {/* Header Spec Banner */}
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-orange-50 text-orange-600 text-[10px] font-extrabold uppercase border border-orange-100">
                          {selectedCourse.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-extrabold uppercase">
                          {selectedCourse.level}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-neutral-500 font-semibold pl-2">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-neutral-950 font-bold">{selectedCourse.rating}</span>
                          <span>({selectedCourse.reviewCount} students reviews)</span>
                        </div>
                      </div>

                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 tracking-tight leading-none">
                        {selectedCourse.title}
                      </h1>

                      <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
                        {selectedCourse.description}
                      </p>
                    </div>

                    {/* Core syllabus breakdown directory */}
                    <div className="space-y-4">
                      <div className="border-b border-neutral-100 pb-3">
                        <h3 className="text-base font-extrabold text-neutral-900 uppercase tracking-wider">
                          Curriculum Syllabus
                        </h3>
                        <p className="text-xs text-neutral-500 font-medium">
                          Expand program sections to browse through integrated projects, quizzes, and modules.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {selectedCourse.syllabus.map((sec) => {
                          const isSectionExpanded = expandedSection === sec.id;
                          return (
                            <div 
                              key={sec.id}
                              className="bg-white rounded-2xl border border-neutral-100 shadow-2xs overflow-hidden"
                            >
                              {/* Section Accordion Trigger */}
                              <button
                                onClick={() => setExpandedSection(isSectionExpanded ? null : sec.id)}
                                className="w-full text-left px-5 py-4 flex items-center justify-between bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
                              >
                                <span className="text-xs font-extrabold text-neutral-800 uppercase tracking-wider">
                                  {sec.title}
                                </span>
                                <span className="text-[10px] font-bold text-orange-600 uppercase">
                                  {isSectionExpanded ? 'Collapse' : 'Expand'}
                                </span>
                              </button>

                              {/* Section lesson rows */}
                              {isSectionExpanded && (
                                <div className="divide-y divide-neutral-50 px-5 bg-white">
                                  {sec.lessons.map((les) => (
                                    <div 
                                      key={les.id} 
                                      className="py-3.5 flex items-center justify-between text-xs font-semibold text-neutral-700"
                                    >
                                      <div className="flex items-center gap-2.5 overflow-hidden pr-4">
                                        <div className="w-5 h-5 rounded-md bg-neutral-100 flex items-center justify-center shrink-0">
                                          {les.type === 'video' && <Clock className="w-3.5 h-3.5 text-neutral-400" />}
                                          {les.type === 'reading' && <BookOpen className="w-3.5 h-3.5 text-neutral-400" />}
                                          {les.type === 'quiz' && <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />}
                                        </div>
                                        <span className="truncate">{les.title}</span>
                                      </div>

                                      <span className="text-neutral-400 text-[10px] font-bold uppercase shrink-0">
                                        {les.duration}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dedicated reviews board */}
                    <div className="space-y-4">
                      <div className="border-b border-neutral-100 pb-3">
                        <h3 className="text-base font-extrabold text-neutral-900 uppercase tracking-wider">
                          Student Peer Reviews
                        </h3>
                        <p className="text-xs text-neutral-500 font-medium">
                          Read genuine feedback and thoughts submitted by verified course graduates.
                        </p>
                      </div>

                      <ReviewSection
                        reviews={reviewsMap[selectedCourse.id] || REVIEWS}
                        onAddReview={(reviewData) => handleAddReview(selectedCourse.id, reviewData)}
                      />
                    </div>

                  </div>

                  {/* RIGHT ACTION CARD (Tuition, Buy, Instructor profile) (Col 4) */}
                  <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                    
                    {/* TUITION PURCHASE / LAUNCH MODULE */}
                    <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-5">
                      <div className="space-y-1">
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">
                          Full Certification Tuition
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-neutral-900">{formatBDTPrice(selectedCourse.price)}</span>
                          <span className="text-xs font-semibold text-neutral-400 line-through">{formatBDTPrice(149.99)}</span>
                        </div>
                      </div>

                      {/* Course Core details checklist */}
                      <div className="space-y-3 text-xs font-semibold text-neutral-600 border-t border-b border-neutral-50 py-4">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4.5 h-4.5 text-neutral-400" />
                            <span>Total Duration</span>
                          </span>
                          <span className="text-neutral-900 font-bold">{selectedCourse.duration}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <BookOpen className="w-4.5 h-4.5 text-neutral-400" />
                            <span>Modules & Lessons</span>
                          </span>
                          <span className="text-neutral-900 font-bold">{selectedCourse.lessonsCount} syllabus units</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Award className="w-4.5 h-4.5 text-amber-500" />
                            <span>Certification status</span>
                          </span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 fill-emerald-100" /> Verified
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Primary Enrollment Button */}
                      {activeEnrollment ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-extrabold text-neutral-700">
                            <span>Syllabus Progress</span>
                            <span className="text-orange-600">{activeEnrollment.progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500" 
                              style={{ width: `${activeEnrollment.progress}%` }}
                            />
                          </div>

                          <button
                            onClick={() => {
                              setCurrentView('classroom');
                            }}
                            className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs"
                          >
                            Resume Classroom Studies
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEnrollAndStart(selectedCourse.id)}
                          className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-xs hover:shadow-md uppercase tracking-wider"
                        >
                          Enroll in Curriculum program
                        </button>
                      )}

                      <p className="text-[10px] text-neutral-400 text-center font-bold uppercase tracking-wider">
                        🔒 Secure Checkout • 14-Day Money-back promise
                      </p>
                    </div>

                    {/* INSTRUCTOR CARD */}
                    <div className="bg-neutral-50/50 p-6 rounded-3xl border border-neutral-100 space-y-4">
                      <h4 className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider">
                        Program Director
                      </h4>

                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-neutral-200 bg-neutral-100">
                          <ImageWithSkeleton 
                            src={selectedCourse.instructor.avatar} 
                            alt={selectedCourse.instructor.name}
                            className="w-full h-full object-cover"
                            containerClassName="w-full h-full"
                          />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-neutral-900 leading-none">
                            {selectedCourse.instructor.name}
                          </h5>
                          <span className="text-[10px] text-neutral-400 font-bold mt-1 block leading-none">
                            {selectedCourse.instructor.role}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-neutral-500 font-medium leading-relaxed italic">
                        "{selectedCourse.instructor.bio}"
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            )}
          </>
        )}

      </main>

      {/* 3. PROFESSIONAL SUB-FOOTER */}
      <Footer onNavigate={(view) => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentView(view);
      }} />

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
                  <li>আপনার <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline text-orange-600 hover:text-orange-700 font-bold inline-flex items-center gap-0.5">Firebase Console <ExternalLink className="w-3 h-3 inline" /></a> এ যান।</li>
                  <li>আপনার প্রোজেক্ট নির্বাচন করুন এবং বাম মেনু থেকে <strong className="font-bold">Authentication</strong> এ ক্লিক করুন।</li>
                  <li>উপরে থাকা <strong className="font-bold">Settings</strong> ট্যাবে যান।</li>
                  <li>বাম পাশের সাব-মেনু থেকে <strong className="font-bold">Authorized domains</strong> নির্বাচন করুন।</li>
                  <li><strong className="font-bold">Add domain</strong> বাটনে ক্লিক করে উপরের ডোমেন দুটি একটি একটি করে যোগ করুন।</li>
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
            setPendingEnrollCourseId(null);
          }}
          onSuccess={(loggedUser) => {
            setUser(loggedUser);
            if (pendingEnrollCourseId) {
              handleEnroll(pendingEnrollCourseId, loggedUser);
              setSelectedCourseId(pendingEnrollCourseId);
              setCurrentView('classroom');
              setPendingEnrollCourseId(null);
            }
          }}
        />
      )}

      {/* Certificate modal popup */}
      {selectedCertCourseId && (
        <Certificates 
          courseId={selectedCertCourseId} 
          courses={courses}
          onClose={() => setSelectedCertCourseId(null)} 
        />
      )}
    </div>
  );
}
