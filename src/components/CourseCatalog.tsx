import React, { useMemo } from 'react';
import { Course, Enrollment } from '../types';
import CourseCard from './CourseCard';
import { Search, RotateCcw } from 'lucide-react';

interface CourseCatalogProps {
  courses: Course[];
  onSelectCourse: (courseId: string) => void;
  onEnroll: (courseId: string) => void;
  enrolledCourses: { [courseId: string]: Enrollment };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function CourseCatalog({
  courses,
  onSelectCourse,
  onEnroll,
  enrolledCourses,
  searchQuery,
  setSearchQuery,
}: CourseCatalogProps) {
  // Filter logic based on search
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return result;
  }, [searchQuery, courses]);

  const handleReset = () => {
    setSearchQuery('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header section with catalog description - Simplified as requested */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Popular courses
          </h2>
        </div>
      </div>

      {/* Catalog Grid Layout (Courses Main panel) */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* COURSES MAIN PANEL */}
        <div className="space-y-6">

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={enrolledCourses[course.id]}
                  onSelect={onSelectCourse}
                  onEnroll={onEnroll}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-3xl border border-dashed border-orange-200">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-orange-50 text-orange-600 mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900">No Courses Found</h3>
              <p className="text-xs text-neutral-500 font-medium max-w-sm mt-1 mb-5">
                We couldn't find any courses matching your search criteria. Try modifying your keywords or resetting filters.
              </p>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Course Catalog
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
