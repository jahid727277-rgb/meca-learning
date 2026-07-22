import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course, UserProgress } from '../types';
import Classroom from './Classroom';
import { getSingleCourseFromDB } from '../lib/firebase';
import { normalizeCourse } from '../utils/courseHelper';

interface ClassroomRouteWrapperProps {
  courses: Course[];
  isLoading?: boolean;
  progress: UserProgress;
}

export default function ClassroomRouteWrapper({ 
    courses, 
    isLoading = false,
    progress
}: ClassroomRouteWrapperProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const existingCourse = courses.find((c) => c.id === courseId);
  const [directCourse, setDirectCourse] = useState<Course | null>(null);
  const [isDirectLoading, setIsDirectLoading] = useState<boolean>(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState<boolean>(false);

  useEffect(() => {
    if (courseId && !existingCourse && !hasAttemptedFetch) {
      setIsDirectLoading(true);
      getSingleCourseFromDB(courseId).then((data) => {
        if (data) {
          try {
            const normalized = normalizeCourse(data);
            setDirectCourse(normalized);
          } catch (e) {
            console.error("Error normalizing direct classroom course:", e);
          }
        }
      }).finally(() => {
        setIsDirectLoading(false);
        setHasAttemptedFetch(true);
      });
    }
  }, [courseId, existingCourse, hasAttemptedFetch]);

  const activeCourse = existingCourse || directCourse;
  const enrollment = courseId ? progress.enrolledCourses?.[courseId] : undefined;
  const showSkeleton = (isLoading || isDirectLoading) && !activeCourse;

  if (showSkeleton) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 bg-neutral-800 rounded w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="w-full h-80 sm:h-[450px] bg-neutral-800 rounded-2xl animate-pulse border border-neutral-700"></div>
              <div className="h-6 bg-neutral-800 rounded w-2/3 animate-pulse"></div>
            </div>
            <div className="bg-neutral-800 rounded-2xl p-4 border border-neutral-700 space-y-4 animate-pulse h-[450px]">
              <div className="h-5 bg-neutral-700 rounded w-1/2"></div>
              <div className="space-y-3 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-neutral-700/60 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeCourse || !enrollment) {
    return (
      <div className="p-16 text-center text-neutral-600 font-semibold text-lg">
        Course not found or you are not enrolled in this course.
      </div>
    );
  }

  return (
    <Classroom
      course={activeCourse}
      enrollment={enrollment}
      onBack={() => navigate('/my-learning')}
    />
  );
}
