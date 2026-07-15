import React, { useState } from 'react';
import { Course } from '../types';
import { X, Award, Printer, Download, Check, Sparkles, Share2 } from 'lucide-react';

interface CertificatesProps {
  courseId: string;
  courses: Course[];
  onClose: () => void;
}

export default function Certificates({ courseId, courses, onClose }: CertificatesProps) {
  const [studentName, setStudentName] = useState('Jane Doe');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const course = courses.find((c) => c.id === courseId);
  if (!course) return null;

  // Generate mock certification hash
  const certHash = `ML-CERT-${courseId.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleShare = () => {
    navigator.clipboard.writeText(`Check out my certified credential for ${course.title} on Meca Learning! Verification Hash: ${certHash}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert('Certificate downloaded successfully as PDF (Simulated)!');
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-neutral-100 overflow-hidden my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-neutral-100 text-neutral-500 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Outer Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT SIDE - Certificate Design Canvas (Col 8) */}
          <div className="lg:col-span-8 p-6 sm:p-8 bg-neutral-50 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-neutral-100">
            {/* The Certificate Paper Wrapper */}
            <div 
              id="certificate-print"
              className="relative w-full aspect-[1.414/1] bg-white border-8 border-double border-orange-200/80 p-6 sm:p-8 text-center flex flex-col justify-between shadow-lg select-none rounded-sm"
              style={{ fontFamily: '"Inter", sans-serif' }}
            >
              {/* Ornate corner accents */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-orange-500" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-orange-500" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-orange-500" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-orange-500" />

              {/* Certificate Header */}
              <div className="space-y-1.5">
                <div className="flex justify-center mb-1">
                  <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 border border-orange-100">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-[10px] font-black tracking-widest text-orange-600 uppercase">
                  Meca Learning Credentials
                </h4>
                <p className="text-[7px] text-neutral-400 font-bold uppercase tracking-widest">
                  Verified Technical Certification Program
                </p>
              </div>

              {/* Body Text */}
              <div className="my-2 space-y-1 sm:space-y-2">
                <p className="text-[8px] sm:text-[10px] font-medium text-neutral-500 italic">
                  This international credential is honorably awarded to
                </p>
                <h2 
                  className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight select-all px-4 py-1"
                  style={{ fontFamily: '"Space Grotesk", sans-serif' }}
                >
                  {studentName || 'Jane Doe'}
                </h2>
                <div className="w-20 h-[1px] bg-orange-200 mx-auto" />
                <p className="text-[8px] sm:text-[10px] text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  for successfully finishing all practical labs, theoretical lessons, and examinations required to fully graduate from the curriculum program of
                </p>
                <h3 className="text-xs sm:text-sm font-extrabold text-orange-600 tracking-tight leading-snug">
                  {course.title}
                </h3>
              </div>

              {/* Certificate Footer */}
              <div className="flex items-end justify-between pt-4 mt-2 border-t border-neutral-100">
                {/* Hash / ID */}
                <div className="text-left space-y-0.5">
                  <span className="text-[6px] text-neutral-400 font-bold uppercase block">Credential Identifier</span>
                  <span className="font-mono text-[7px] text-neutral-600 font-semibold">{certHash}</span>
                </div>

                {/* Seal */}
                <div className="relative flex justify-center items-center">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-orange-300 flex items-center justify-center bg-orange-50/20">
                    <Award className="w-6 h-6 text-orange-600/70" />
                  </div>
                  {/* Ribbon */}
                  <div className="absolute -bottom-2 -right-1 w-2.5 h-6 bg-orange-600/80 rotate-12 transform origin-top" />
                  <div className="absolute -bottom-2 -left-1 w-2.5 h-6 bg-orange-600/80 -rotate-12 transform origin-top" />
                </div>

                {/* Signature Block */}
                <div className="text-right space-y-0.5">
                  <span className="font-serif text-[9px] text-neutral-800 italic block leading-none">
                    {course.instructor.name}
                  </span>
                  <div className="w-16 h-[1px] bg-neutral-200 ml-auto my-0.5" />
                  <span className="text-[6px] text-neutral-400 font-bold uppercase block">Syllabus Director</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Actions & Inputs (Col 4) */}
          <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-neutral-900 tracking-tight">Customize Credential</h3>
                <p className="text-xs text-neutral-500 font-medium mt-1">
                  Type your official full name below to instantly update the certificate before exporting.
                </p>
              </div>

              {/* Name input */}
              <div className="space-y-2">
                <label htmlFor="student-name" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                  Graduate Full Name
                </label>
                <input
                  id="student-name"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Enter name (e.g. Jane Doe)"
                  className="w-full px-4 py-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Info card */}
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-xs text-orange-800 leading-relaxed space-y-1">
                <div className="flex items-center gap-1 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Secure Cryptographic Hash</span>
                </div>
                <p className="text-[11px] font-medium text-orange-700/90">
                  This certificate carries a unique identifier linked to your Meca Learning profile. Anyone can verify this ID to confirm your achievement.
                </p>
              </div>
            </div>

            {/* Print and Export Buttons */}
            <div className="space-y-3 pt-6 border-t border-neutral-100">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-xs"
              >
                {isDownloading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Compiling PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF Certificate</span>
                  </>
                )}
              </button>

              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-neutral-200 hover:border-orange-200 text-neutral-700 hover:text-orange-600 text-xs font-bold transition-colors shadow-xs"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span className="text-emerald-600">Copied Link!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copy Verification Share Link</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-600 text-xs font-bold transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Document</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
