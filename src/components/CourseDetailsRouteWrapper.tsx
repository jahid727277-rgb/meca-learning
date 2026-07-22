import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import CourseDetailsView from './CourseDetailsView';

interface CourseDetailsRouteWrapperProps {
  courses: Course[];
  isLoading?: boolean;
  onEnroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
}

export default function CourseDetailsRouteWrapper({ courses, isLoading = false, onEnroll, isEnrolled }: CourseDetailsRouteWrapperProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId);

  if (isLoading && !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 animate-pulse space-y-8">
        <div className="h-8 bg-neutral-200 rounded-lg w-1/3"></div>
        <div className="h-64 bg-neutral-100 rounded-2xl"></div>
        <div className="space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
          <div className="h-4 bg-neutral-100 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-16 text-center text-neutral-600 font-semibold text-lg">
        কোর্সটি পাওয়া যায়নি।
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
