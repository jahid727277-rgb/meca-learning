import React, { useMemo } from 'react';
import { Course, Enrollment } from '../types';
import CourseCard from './CourseCard';
import { Search, RotateCcw } from 'lucide-react';

interface CourseCatalogProps {
  courses: Course[];
  isLoading?: boolean;
  onSelectCourse: (courseId: string) => void;
  onEnroll: (courseId: string) => void;
  onUnenroll?: (courseId: string) => void;
  enrolledCourses: { [courseId: string]: Enrollment };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function CourseCatalog({
  courses,
  isLoading = false,
  onSelectCourse,
  onEnroll,
  onUnenroll,
  enrolledCourses,
  searchQuery,
  setSearchQuery,
}: CourseCatalogProps) {
  // Filter logic based on search
  const filteredCourses = useMemo(() => {
    let result = [...courses];

    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 animate-fadeIn">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Popular courses
          </h2>
          {searchQuery.trim() !== '' && (
            <p className="text-xs sm:text-sm font-bold text-orange-600 mt-1">
              Showing search results for: <span className="italic">"{searchQuery}"</span>
            </p>
          )}
        </div>
      </div>

      {/* Catalog Grid Layout (Courses Main panel) */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* COURSES MAIN PANEL */}
        <div className="space-y-6">

          {isLoading && courses.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-xs animate-pulse">
                  <div className="w-full h-44 bg-neutral-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-100 rounded w-full" />
                    <div className="h-3 bg-neutral-100 rounded w-2/3" />
                    <div className="pt-2 flex justify-between items-center">
                      <div className="h-6 bg-neutral-200 rounded w-20" />
                      <div className="h-8 bg-neutral-200 rounded-full w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={enrolledCourses[course.id]}
                  onSelect={onSelectCourse}
                  onEnroll={onEnroll}
                  onUnenroll={onUnenroll}
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
