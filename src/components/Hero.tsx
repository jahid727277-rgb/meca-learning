import React, { useState } from 'react';
import { Search, GraduationCap, Cpu, Award, Zap } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string) => void;
  onExploreClick: () => void;
}

export default function Hero({ onSearch, onExploreClick }: HeroProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
    onExploreClick();
  };

  const stats = [
    { value: '15,000+', label: 'Active Students', icon: GraduationCap },
    { value: '42+', label: 'Technical Labs', icon: Cpu },
    { value: '98%', label: 'Completion Rate', icon: Zap },
    { value: '12,500+', label: 'Certificates Earned', icon: Award },
  ];

  return (
    <section id="hero-section" className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#FFFDFB] to-white pt-10 pb-12 lg:pt-14 lg:pb-16 border-b border-orange-100/40">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-orange-100/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-orange-50/30 rounded-full blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50/60 border border-orange-100/60 text-orange-700 text-xs font-semibold tracking-wide mb-5">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            Empowering Next-Gen Engineering & Tech Leaders
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-extrabold text-neutral-950 tracking-tight leading-[1.05] mb-5 font-sans">
            Learn skills <br />
            that{' '}
            <span className="relative inline-block text-neutral-950 pb-1 sm:pb-2">
              actually
              <svg 
                className="absolute -bottom-1 left-0 w-full h-2.5 sm:h-3 text-[#ff5330]" 
                viewBox="0 0 100 10" 
                preserveAspectRatio="none"
              >
                <path 
                  d="M3,6 C35,7.5 65,7.5 97,3 C70,5 35,5.5 3,6" 
                  stroke="currentColor" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none" 
                />
              </svg>
            </span> <br />
            move you <br />
            forward.
          </h1>

          {/* Subheading */}
          <p className="text-lg text-neutral-600 font-medium leading-relaxed mb-5 max-w-2xl mx-auto">
            Meca Learning aims to make the knowledge of AI, AI agents, and AI automation programming accessible to everyone and build a skilled future
          </p>

          {/* Course Search Box */}
          <form onSubmit={handleSubmit} className="relative max-w-md mx-auto mb-4">
            <input
              type="text"
              placeholder="Search courses (e.g. Arduino, React, Kinematics)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-28 py-3.5 bg-white rounded-full border border-orange-200/80 shadow-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
            />
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bottom-1.5 bg-neutral-950 hover:bg-neutral-800 text-white px-5 rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              Find Courses
            </button>
          </form>
        </div>

      </div>
    </section>
  );
}
