import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import CourseDetailsView from './CourseDetailsView';
import { getSingleCourseFromDB } from '../lib/supabase';
import { normalizeCourse } from '../utils/courseHelper';

interface CourseDetailsRouteWrapperProps {
  courses: Course[];
  isLoading?: boolean;
  onEnroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
}

export default function CourseDetailsRouteWrapper({ courses, isLoading = false, onEnroll, isEnrolled }: CourseDetailsRouteWrapperProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  
  const existingCourse = courses.find((c) => c.id === courseId);
  const [directCourse, setDirectCourse] = useState<Course | null>(null);
  const [isDirectLoading, setIsDirectLoading] = useState<boolean>(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState<boolean>(false);

  useEffect(() => {
    // If not found in memory courses list, fetch directly from DB for fast loading
    if (courseId && !existingCourse && !hasAttemptedFetch) {
      setIsDirectLoading(true);
      getSingleCourseFromDB(courseId).then((data) => {
        if (data) {
          try {
            const normalized = normalizeCourse(data);
            setDirectCourse(normalized);
          } catch (e) {
            console.error("Error normalizing direct course:", e);
          }
        }
      }).finally(() => {
        setIsDirectLoading(false);
        setHasAttemptedFetch(true);
      });
    }
  }, [courseId, existingCourse, hasAttemptedFetch]);

  const activeCourse = existingCourse || directCourse;
  const isFetching = isLoading || isDirectLoading || (!activeCourse && !hasAttemptedFetch);
  const showSkeleton = isFetching && !activeCourse;

  if (showSkeleton) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-32">
        {/* Skeleton Top Bar & Back Button */}
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="w-10 h-10 bg-neutral-200 rounded-full animate-pulse border border-neutral-300"></div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-3 space-y-5">
          {/* Skeleton Promo Video */}
          <div className="w-full h-52 sm:h-64 bg-neutral-300 rounded-2xl animate-pulse border border-neutral-200 shadow-xs"></div>

          {/* Skeleton Course Card */}
          <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm space-y-4 animate-pulse">
            <div className="w-full h-48 bg-neutral-200 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-6 bg-neutral-200 rounded-md w-3/4"></div>
              <div className="h-4 bg-neutral-100 rounded-md w-full"></div>
              <div className="h-4 bg-neutral-100 rounded-md w-2/3"></div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 bg-neutral-200 rounded-full"></div>
              <div className="space-y-1.5 flex-1">
                <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                <div className="h-3 bg-neutral-100 rounded w-1/4"></div>
              </div>
            </div>
            <div className="pt-3 flex items-center justify-between border-t border-neutral-100">
              <div className="h-7 bg-neutral-200 rounded w-28"></div>
              <div className="h-10 bg-neutral-300 rounded-xl w-32"></div>
            </div>
          </div>

          {/* Skeleton Description */}
          <div className="space-y-3 pt-3">
            <div className="h-6 bg-neutral-200 rounded-md w-40 animate-pulse"></div>
            <div className="h-4 bg-neutral-100 rounded-md w-full animate-pulse"></div>
            <div className="h-4 bg-neutral-100 rounded-md w-5/6 animate-pulse"></div>
            <div className="h-4 bg-neutral-100 rounded-md w-4/6 animate-pulse"></div>
          </div>
        </div>

        {/* Skeleton Fixed Bottom Enrollment Dock */}
        <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-neutral-800/95 backdrop-blur-md text-white border-t border-neutral-700 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-t-[32px] sm:rounded-t-[40px] px-6 py-5 sm:py-6">
          <div className="max-w-2xl mx-auto flex flex-row items-center justify-between gap-4 sm:gap-6 flex-nowrap w-full overflow-hidden">
            <div className="h-7 bg-neutral-700 rounded-lg w-28 animate-pulse"></div>
            <div className="h-11 bg-neutral-600 rounded-xl w-32 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeCourse) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="text-xl font-black text-neutral-800">কোর্সটি পাওয়া যায়নি</h2>
        <p className="text-sm text-neutral-500 font-medium">সম্ভবত এটি মুছে ফেলা হয়েছে অথবা ভুল ইউআরএল ব্যবহার করা হয়েছে।</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all cursor-pointer"
        >
          হোম পেজে ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <CourseDetailsView
      course={activeCourse}
      onBack={() => navigate('/')}
      onEnroll={onEnroll}
      isEnrolled={isEnrolled(activeCourse.id)}
    />
  );
}
