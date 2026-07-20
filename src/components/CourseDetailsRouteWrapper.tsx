import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course } from '../types';
import CourseDetailsView from './CourseDetailsView';

interface CourseDetailsRouteWrapperProps {
  courses: Course[];
  onEnroll: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
}

export default function CourseDetailsRouteWrapper({ courses, onEnroll, isEnrolled }: CourseDetailsRouteWrapperProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId);

  useEffect(() => {
    // Top scroll handled by App.tsx
  }, []);

  if (!course) {
    return <div className="p-10 text-center">Course not found.</div>;
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
