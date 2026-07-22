import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course, UserProgress } from '../types';
import Classroom from './Classroom';

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
  const course = courses.find((c) => c.id === courseId);
  const enrollment = courseId ? progress.enrolledCourses?.[courseId] : undefined;

  if (isLoading && !course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
        <div className="h-96 bg-neutral-100 rounded-3xl"></div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="p-16 text-center text-neutral-600 font-semibold text-lg">
        কোর্সটি পাওয়া যায়নি অথবা আপনি এই কোর্সে এনরোলড নন।
      </div>
    );
  }

  return (
    <Classroom
      course={course}
      enrollment={enrollment}
      onBack={() => navigate('/my-learning')}
    />
  );
}
