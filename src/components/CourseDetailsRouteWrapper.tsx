import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import CourseDetailsView from './CourseDetailsView';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { normalizeCourse } from '../utils/courseHelper';

interface CourseDetailsRouteWrapperProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
}

export default function CourseDetailsRouteWrapper({ courses, onEnroll, isEnrolled }: CourseDetailsRouteWrapperProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [directCourse, setDirectCourse] = useState<Course | null>(null);

  const courseFromProps = courses.find((c) => c.id === courseId);
  const course = courseFromProps || directCourse;

  useEffect(() => {
    let isMounted = true;
    async function fetchCourse() {
      if (courseFromProps) {
        setLoading(false);
        return;
      }
      if (!courseId) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, "courses", courseId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && isMounted) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setDirectCourse(normalizeCourse(data));
        }
      } catch (err) {
        console.error("Failed to fetch course directly:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchCourse();
    return () => { isMounted = false; };
  }, [courseId, courseFromProps]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-4 border-neutral-900 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-neutral-600 font-medium">কোর্স লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">কোর্সটি পাওয়া যায়নি</h2>
        <p className="text-neutral-600 mb-6">দুঃখিত, এই কোর্সটি ডিলিট হয়ে গেছে অথবা লিংকটি সঠিক নয়।</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-neutral-900 text-white font-medium rounded-xl hover:bg-neutral-800 transition-all"
        >
          হোম পেজে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <CourseDetailsView
      course={course}
      onBack={() => navigate('/')}
      onEnroll={onEnroll}
      isEnrolled={isEnrolled(course.id)}
    />
  );
}

