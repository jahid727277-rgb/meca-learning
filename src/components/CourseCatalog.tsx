import React, { useState, useMemo } from 'react';
import { Course, Enrollment, Level } from '../types';
import CourseCard from './CourseCard';
import { SlidersHorizontal, Search, RotateCcw } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('popular');

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  // Compute unique categories dynamically from the actual courses list
  const categoriesList = useMemo(() => {
    const cats = new Set(courses.map((c) => c.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [courses]);

  // Filter & Sort logic
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

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter((c) => c.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== 'All') {
      result = result.filter((c) => c.level === selectedLevel);
    }

    // Sorting
    if (sortBy === 'popular') {
      result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLevel('All');
    setSortBy('popular');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header section with catalog description */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
            Explore Course Curriculum
          </h2>
          <p className="text-sm text-neutral-500 font-medium mt-1">
            Browse through professional certification programs curated by leading academic and industry specialists.
          </p>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            Sort:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3.5 py-1.5 bg-white border border-neutral-200 text-neutral-800 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid Layout (Filters Side panel + Courses Main panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS PANEL */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories Filter list */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2 uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-orange-500" />
              Categories
            </h3>
            <div className="flex flex-row lg:flex-col flex-wrap gap-1">
              {courses.length > 0 && categoriesList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-auto lg:w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-orange-50 text-orange-600 font-bold'
                      : 'text-neutral-600 hover:text-orange-500 hover:bg-neutral-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level Filter list */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
              Difficulty Level
            </h3>
            <div className="flex flex-row lg:flex-col flex-wrap gap-1">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    selectedLevel === lvl
                      ? 'bg-orange-50 text-orange-600 font-bold'
                      : 'text-neutral-600 hover:text-orange-500 hover:bg-neutral-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COURSES MAIN PANEL */}
        <div className="lg:col-span-3 space-y-6">
          {/* Inline search status bar */}
          {(searchQuery || selectedCategory !== 'All' || selectedLevel !== 'All') && (
            <div className="flex items-center justify-between bg-orange-50/30 border border-orange-100/50 p-3 rounded-2xl">
              <span className="text-xs text-neutral-600 font-semibold">
                Showing <strong className="text-neutral-900">{filteredCourses.length}</strong> matches 
                {searchQuery && ` for "${searchQuery}"`}
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                {selectedLevel !== 'All' && ` [${selectedLevel}]`}
              </span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            </div>
          )}

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
