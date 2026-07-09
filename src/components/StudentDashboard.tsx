import React, { useState } from 'react';
import { UserProgress, Course } from '../types';
import { Flame, Trophy, Award, Calendar, BookOpen, Clock, ChevronRight, Share2, Printer, CheckCircle } from 'lucide-react';
import Certificates from './Certificates';

interface StudentDashboardProps {
  progress: UserProgress;
  courses: Course[];
  onNavigateToCourse: (courseId: string) => void;
  onNavigateToExplore: () => void;
}

export default function StudentDashboard({
  progress,
  courses,
  onNavigateToCourse,
  onNavigateToExplore,
}: StudentDashboardProps) {
  const [selectedCertCourseId, setSelectedCertCourseId] = useState<string | null>(null);

  // Derive courses enrolled
  const enrolledList = Object.values(progress.enrolledCourses).map((enrollment) => {
    const course = courses.find((c) => c.id === enrollment.courseId);
    return {
      enrollment,
      course,
    };
  }).filter((item) => item.course !== undefined) as { enrollment: any; course: Course }[];

  const completedCount = enrolledList.filter((item) => item.enrollment.progress >= 100).length;

  // Active recommendations (courses not enrolled yet)
  const recommendations = courses.filter(
    (c) => !progress.enrolledCourses[c.id]
  ).slice(0, 2);

  // Daily labels for weekly study tracker
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Weekly static study hours logs (simulated based on activityLog)
  const weeklyTarget = 10; // 10 hours target
  const weeklyLogged = progress.totalHours;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Title greeting */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Student Dashboard</h2>
        <p className="text-sm text-neutral-500 font-medium mt-1">
          Monitor your study times, manage enrolled syllabi, and export verified digital credentials.
        </p>
      </div>

      {/* Grid of Stats Cards & Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* STATS BENTO COLUMN */}
        <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
          {/* Syllabi Enrolled */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-2xl border border-indigo-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider">Syllabi Enrolled</span>
              <BookOpen className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-indigo-950">{enrolledList.length} Syllabi</span>
              <p className="text-[10px] text-indigo-700 font-medium mt-1">
                {completedCount} completed, {enrolledList.length - completedCount} in progress
              </p>
            </div>
          </div>

          {/* Active Hours */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-5 rounded-2xl border border-orange-100 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-800 uppercase tracking-wider">Active Hours</span>
              <Trophy className="w-5 h-5 text-orange-600" />
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-orange-950">{progress.totalHours.toFixed(1)} hrs</span>
              <p className="text-[10px] text-orange-700 font-medium mt-1">
                {weeklyLogged >= weeklyTarget ? '🏆 Weekly target met!' : `Only ${(weeklyTarget - weeklyLogged).toFixed(1)} hrs to target`}
              </p>
            </div>
          </div>
        </div>

        {/* STUDY ACTIVITY BAR CHART */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
                Weekly Study Commitment
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <span className="w-2.5 h-2.5 bg-neutral-100 border border-neutral-200 rounded-xs" />
                  <span>Avg</span>
                </div>
                <div className="flex items-center gap-1.5 text-orange-600">
                  <span className="w-2.5 h-2.5 bg-orange-500 rounded-xs" />
                  <span>You</span>
                </div>
              </div>
            </div>
            {/* The Bar graph */}
            <div className="h-28 grid grid-cols-7 gap-3 items-end border-b border-neutral-100 pb-2">
              {[120, 45, 90, 180, 60, 240, 15].map((mins, idx) => {
                const heightPercent = Math.min(100, (mins / 240) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center group relative h-full justify-end">
                    {/* Hover Tooltip */}
                    <div className="absolute bottom-full mb-1 bg-neutral-900 text-white text-[9px] px-2 py-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-bold">
                      {mins >= 60 ? `${(mins / 60).toFixed(1)}h` : `${mins}m`}
                    </div>
                    {/* The Fill Bar */}
                    <div 
                      className="w-full bg-orange-500/90 rounded-t-md hover:bg-orange-600 transition-colors"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-7 gap-3 text-center text-[10px] text-neutral-400 font-bold pt-2">
              {days.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Courses & Recommendations panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MY ENROLLED COURSES PANEL */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-600" />
            Enrolled Syllabus ({enrolledList.length})
          </h3>

          {enrolledList.length > 0 ? (
            <div className="space-y-4">
              {enrolledList.map(({ enrollment, course }) => {
                const isFinished = enrollment.progress >= 100;
                return (
                  <div 
                    key={course.id}
                    className="bg-white rounded-2xl border border-neutral-100 hover:border-orange-200/60 p-5 shadow-xs transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md tracking-wider ${
                          isFinished ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'
                        }`}>
                          {isFinished ? 'Finished' : 'In Progress'}
                        </span>
                        <span className="text-neutral-400 text-[10px] font-semibold">{course.category}</span>
                      </div>
                      <h4 className="text-sm font-bold text-neutral-900">{course.title}</h4>
                      
                      {/* Compact Progress Bar */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <div className="w-24 bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isFinished ? 'bg-emerald-500' : 'bg-orange-500'}`}
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-neutral-600">{enrollment.progress.toFixed(0)}% Complete</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                      {isFinished && (
                        <button
                          onClick={() => setSelectedCertCourseId(course.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 hover:text-orange-600 hover:border-orange-200 text-xs font-bold transition-colors bg-white shadow-xs"
                        >
                          <Award className="w-4 h-4 text-amber-500" />
                          Certificate
                        </button>
                      )}
                      <button
                        onClick={() => onNavigateToCourse(course.id)}
                        className="flex items-center gap-1.5 px-4.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 hover:shadow-xs text-white text-xs font-bold transition-all w-full sm:w-auto justify-center"
                      >
                        {isFinished ? 'Review' : 'Resume'}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* No Enrollment state */
            <div className="flex flex-col items-center justify-center text-center py-10 bg-white rounded-2xl border border-dashed border-orange-200 p-6">
              <BookOpen className="w-8 h-8 text-neutral-300 mb-2.5" />
              <h4 className="text-sm font-bold text-neutral-700">Not Enrolled Yet</h4>
              <p className="text-xs text-neutral-400 font-medium max-w-xs mt-1 mb-4">
                You haven't registered for any curriculum programs yet. Start learning today!
              </p>
              <button
                onClick={onNavigateToExplore}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Browse Syllabus Catalog
              </button>
            </div>
          )}
        </div>

        {/* SIDE RECOMMENDATIONS & CERTIFICATES SUMMARY */}
        <div className="lg:col-span-1 space-y-6">
          {/* CERTIFICATES MODULE */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4.5 h-4.5 text-amber-500" />
              Your Certificates
            </h3>
            
            {progress.certificates.length > 0 ? (
              <div className="space-y-2.5">
                {progress.certificates.map((cid) => {
                  const course = courses.find((c) => c.id === cid);
                  if (!course) return null;
                  return (
                    <div 
                      key={cid}
                      onClick={() => setSelectedCertCourseId(cid)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-50 hover:border-amber-200 bg-neutral-50/20 hover:bg-amber-50/10 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                          <Award className="w-4.5 h-4.5" />
                        </div>
                        <div className="truncate max-w-[150px]">
                          <h4 className="text-xs font-bold text-neutral-900 truncate">{course.title}</h4>
                          <span className="text-[9px] text-neutral-400 font-semibold uppercase">Verified</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 bg-neutral-50/50 rounded-xl border border-dashed border-neutral-100">
                <Award className="w-6 h-6 text-neutral-300 mx-auto mb-1.5" />
                <p className="text-[10px] text-neutral-400 font-semibold uppercase">No Certificates Earned</p>
                <p className="text-[9px] text-neutral-400 font-medium px-4 mt-0.5">
                  Complete 100% of any course curriculum to automatically unlock digital credentials.
                </p>
              </div>
            )}
          </div>

          {/* RECOMMENDED COURSES LIST */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-100/80 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
              Recommended For You
            </h3>
            <div className="space-y-4">
              {recommendations.map((course) => (
                <div 
                  key={course.id}
                  onClick={() => onNavigateToCourse(course.id)}
                  className="flex gap-3 group cursor-pointer"
                >
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-16 h-12 object-cover rounded-lg bg-neutral-100"
                  />
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="text-xs font-bold text-neutral-800 truncate group-hover:text-orange-600 transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-[10px] text-neutral-500 font-semibold">{course.category}</p>
                    <span className="text-xs font-black text-neutral-900">${course.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* POPUP FOR THE DIGITAL CERTIFICATE RENDERER */}
      {selectedCertCourseId && (
        <Certificates 
          courseId={selectedCertCourseId} 
          courses={courses}
          onClose={() => setSelectedCertCourseId(null)} 
        />
      )}
    </div>
  );
}
