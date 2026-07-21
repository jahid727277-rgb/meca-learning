import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course, UserProgress } from '../types';
import Classroom from './Classroom';

interface ClassroomRouteWrapperProps {
  courses: Course[];
  progress: UserProgress;
}

export default function ClassroomRouteWrapper({ 
    courses, 
    progress
}: ClassroomRouteWrapperProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId);
  const enrollment = courseId ? progress.enrolledCourses?.[courseId] : undefined;

  if (!course || !enrollment) {
    return <div className="p-10 text-center">Course not found or not enrolled.</div>;
  }

  return (
    <Classroom
      course={course}
      enrollment={enrollment}
      onBack={() => navigate('/my-learning')}
    />
  );
}
