import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course, Enrollment } from '../types';
import Classroom from './Classroom';

interface ClassroomRouteWrapperProps {
  courses: Course[];
  progress: any; // Assuming 'any' for now, should match App.tsx's state type
  onUpdateEnrollment: (courseId: string, completedLessonIds: string[], currentLessonId: string) => void;
  onAddHours: (minutes: number) => void;
  onUnlockCertificate: (courseId: string) => void;
}

export default function ClassroomRouteWrapper({ 
    courses, 
    progress, 
    onUpdateEnrollment, 
    onAddHours, 
    onUnlockCertificate 
}: ClassroomRouteWrapperProps) {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId);
  const enrollment = courseId ? progress.enrolledCourses?.[courseId] : undefined;

  useEffect(() => {
    // Top scroll handled by App.tsx
  }, [courseId]);

  if (!course || !enrollment) {
    return <div className="p-10 text-center">Course not found or not enrolled.</div>;
  }

  return (
    <Classroom
      course={course}
      enrollment={enrollment}
      onUpdateEnrollment={onUpdateEnrollment}
      onAddHours={onAddHours}
      onBack={() => navigate('/my-learning')}
      onUnlockCertificate={onUnlockCertificate}
    />
  );
}
