import React, { useState } from 'react';
import { Course } from '../types';
import { 
  ArrowLeft, Clock, Award, ChevronDown, ChevronUp, Check, ShieldCheck, Play, HelpCircle, FileText 
} from 'lucide-react';
import { formatBDTPrice } from '../utils/currency';
import YouTubePlayer from './YouTubePlayer';
import CourseCard from './CourseCard';

interface CourseDetailsViewProps {
  course: Course;
  onBack: () => void;
  onEnroll: (courseId: string) => void;
  isEnrolled: boolean;
}

export default function CourseDetailsView({ course, onBack, onEnroll, isEnrolled }: CourseDetailsViewProps) {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    [course.syllabus[0]?.id || '']: true // expand the first section by default
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // The user requested to play this specific youtube link for the intro video: https://youtu.be/v1gT1hxdrWU
  const promoVideoUrl = 'https://youtu.be/v1gT1hxdrWU';

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 1. BACK BUTTON (ONLY ICON) */}
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center justify-center text-neutral-600 hover:text-neutral-900 font-extrabold transition-all group cursor-pointer bg-white p-2.5 rounded-full border border-neutral-200 shadow-xs hover:border-neutral-300"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-3 space-y-4 pb-32">
        {/* 2. COURSE PROMO VIDEO AT THE TOP (SPECIFIC LINK: https://youtu.be/v1gT1hxdrWU) */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-md bg-black">
          <YouTubePlayer videoUrl={promoVideoUrl} />
        </div>

        {/* 3. COURSE CARD EXACTLY AS IN "EXPLORE COURSES" */}
        <div className="w-full">
          <CourseCard
            course={course}
            enrollment={isEnrolled ? { courseId: course.id, progress: 0, completedLessons: [], currentLessonId: '' } : undefined}
            onSelect={() => onEnroll(course.id)}
            onEnroll={() => onEnroll(course.id)}
          />
        </div>

        {/* 4. COURSE DESCRIPTION */}
        <div className="space-y-4 pt-2">
          <h2 className="text-xl font-black text-neutral-950 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-orange-600 rounded-full"></span>
            কোর্স ডেসক্রিপশন
          </h2>
          
          <p className="text-base sm:text-lg text-neutral-800 font-extrabold leading-relaxed whitespace-pre-line">
            {course.description}
          </p>
        </div>
      </div>

      {/* 6. BOTTOM ENROLLMENT DOCK */}
      <div className="fixed bottom-0 left-0 right-0 z-40 w-full bg-neutral-800/95 backdrop-blur-md text-white border-t border-neutral-700 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] rounded-t-[32px] sm:rounded-t-[40px] px-6 py-5 sm:py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-6">
          {/* Price Container */}
          <div className="flex flex-col pl-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-300">কোর্সের মূল্য</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {formatBDTPrice(course.price)}
            </span>
          </div>

          {/* Enroll / Start Studying Button */}
          {isEnrolled ? (
            <button
              onClick={() => onEnroll(course.id)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-sm font-black rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>আমার কোর্সে যান</span>
            </button>
          ) : (
            <button
              onClick={() => onEnroll(course.id)}
              className="px-8 py-3 bg-[#dcdcdc] text-neutral-900 hover:bg-white active:scale-[0.98] text-sm font-black rounded-xl transition-all shadow-md cursor-pointer"
            >
              এনরোল করুন
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
