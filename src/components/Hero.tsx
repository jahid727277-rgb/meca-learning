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
    <section id="hero-section" className="relative overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-white py-16 lg:py-24 border-b border-orange-100/60">
      {/* Visual background accents */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-orange-100/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-orange-50/50 rounded-full blur-3xl -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-semibold tracking-wide mb-6">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            Empowering Next-Gen Engineering & Tech Leaders
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-none mb-6">
            Master Technical Skills. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-500">
              Build the Future.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg text-neutral-600 font-medium leading-relaxed mb-8 max-w-2xl mx-auto">
            Meca Learning bridges the gap between hardware engineering and software development. 
            Access premium interactive courses in Mechatronics, AI, Design Systems, and Fullstack systems.
          </p>

          {/* Course Search Box */}
          <form onSubmit={handleSubmit} className="relative max-w-md mx-auto mb-12">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mt-4 bg-white/60 backdrop-blur-sm p-6 sm:p-8 rounded-3xl border border-orange-100/50 shadow-xs">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-2xl hover:bg-orange-50/20 transition-colors">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-50 text-orange-600 mb-2.5">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs text-neutral-500 font-medium mt-0.5">
                  {stat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
