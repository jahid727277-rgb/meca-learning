import React, { useState } from 'react'; import { getEnrolledCourses } from '../utils/courseHelper';
import { UserProgress, Course } from '../types';
import { Award, BookOpen, ChevronRight, LogOut, Edit3, Check, KeyRound, User, Smartphone, Mail } from 'lucide-react';
import { updateProfile, updatePassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import Certificates from './Certificates';
import CourseCard from './CourseCard';
import ImageWithSkeleton from './ImageWithSkeleton';

interface StudentDashboardProps {
  progress: UserProgress;
  courses: Course[];
  user: any;
  onSignOut: () => void;
  isAdmin: boolean;
  onNavigate: (view: string) => void;
  onNavigateToCourse: (courseId: string) => void;
  onNavigateToExplore: () => void;
  onEnroll: (courseId: string) => void;
}

export default function StudentDashboard({
  progress,
  courses,
  user,
  onSignOut,
  isAdmin,
  onNavigate,
  onNavigateToCourse,
  onNavigateToExplore,
  onEnroll,
}: StudentDashboardProps) {
  const [selectedCertCourseId, setSelectedCertCourseId] = useState<string | null>(null);
  
  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  
  // Format displaying email or clean phone
  const rawEmail = user?.email || '';
  const isPhoneUser = rawEmail.endsWith('@phone.maca.com');
  const displayEmailOrPhone = isPhoneUser ? rawEmail.split('@')[0] : rawEmail;
  
  const [newPassword, setNewPassword] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Derive courses enrolled
  const enrolledList = Object.values(progress.enrolledCourses).map((enrollment) => {
    const course = courses.find((c) => c.id === enrollment.courseId);
    return {
      enrollment,
      course,
    };
  }).filter((item) => item.course !== undefined) as { enrollment: any; course: Course }[];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setUpdateLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("কোনো লগইনকৃত ইউজার পাওয়া যায়নি।");

      // Update Display Name
      if (editName.trim() && editName.trim() !== user?.displayName) {
        await updateProfile(currentUser, { displayName: editName.trim() });
      }

      // Update Password if entered and different from current stored password
      const currentPwd = localStorage.getItem('current_user_pwd') || '';
      if (newPassword.trim() && newPassword.trim() !== currentPwd) {
        if (newPassword.length < 6) {
          throw new Error("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
        }
        await updatePassword(currentUser, newPassword.trim());
        try {
          localStorage.setItem('current_user_pwd', newPassword.trim());
        } catch (e) {
          console.warn(e);
        }
      }

      setStatusMessage({ type: 'success', text: "প্রোফাইল সফলভাবে আপডেট করা হয়েছে!" });
      setIsEditing(false);
    } catch (err: any) {
      console.error("Profile update error:", err);
      setStatusMessage({ type: 'error', text: err.message || "প্রোফাইল আপডেট করতে সমস্যা হয়েছে।" });
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 text-neutral-900 font-sans">
      
      {/* 1. Header: Simple "Welcome to dashboard" as requested */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Welcome to dashboard
        </h2>
      </div>

      {/* 2. Compact User Profile Card with thin, even border on all sides */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm relative mb-8">
        
        {/* Controls inside profile card */}
        <div className="flex justify-between items-center mb-4">
          
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            {user && isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-bold rounded-lg border border-neutral-300 transition-colors cursor-pointer"
              >
                Admin
              </button>
            )}
            
            {user && (
              <button
                onClick={onSignOut}
                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-[10px] font-bold rounded-lg border border-red-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                log out
              </button>
            )}
          </div>

          {/* Right Control: Edit Button */}
          {user && (
            <div>
              <button
                onClick={() => {
                  const editingState = !isEditing;
                  setIsEditing(editingState);
                  setEditName(user?.displayName || '');
                  if (editingState) {
                    setNewPassword(localStorage.getItem('current_user_pwd') || '');
                  } else {
                    setNewPassword('');
                  }
                  setStatusMessage(null);
                }}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
                  isEditing 
                    ? 'bg-orange-50 text-orange-700 border-orange-200' 
                    : 'bg-neutral-50 text-neutral-700 border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                <Edit3 className="w-3 h-3" />
                edit
              </button>
            </div>
          )}

        </div>

        {/* Small Centered Profile Avatar */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-14 h-14 rounded-full border border-neutral-300 bg-neutral-50 overflow-hidden flex items-center justify-center shadow-xs">
            {user?.photoURL ? (
              <ImageWithSkeleton 
                src={user.photoURL} 
                alt={user.displayName || "User"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                containerClassName="w-full h-full"
              />
            ) : (
              <div className="text-neutral-700 font-extrabold text-lg">
                {(user?.displayName || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Status Indicators */}
        {statusMessage && (
          <div className={`p-2.5 mb-4 rounded-xl border font-bold text-xs ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {statusMessage.text}
          </div>
        )}

        {/* User profile fields (Name, Email/Phone, Password) - smaller/compact inputs */}
        <form onSubmit={handleSaveProfile} className="space-y-3">
          
          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-0.5">Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                <User className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                disabled={!isEditing}
                value={isEditing ? editName : (user?.displayName || 'Name..')}
                onChange={(e) => setEditName(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-xl transition-all focus:outline-none ${
                  isEditing ? 'bg-white focus:ring-2 focus:ring-orange-500/15 focus:border-neutral-400' : 'cursor-not-allowed select-none'
                }`}
                placeholder="Name.."
              />
            </div>
          </div>

          {/* Email/Phone Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-0.5">Email/Phone</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                {isPhoneUser ? <Smartphone className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
              </span>
              <input
                type="text"
                disabled={true}
                value={displayEmailOrPhone}
                className="w-full pl-9 pr-3 py-2 bg-neutral-50/50 border border-neutral-200 text-neutral-400 text-xs font-semibold rounded-xl cursor-not-allowed select-none"
                placeholder="Email or Phone Number"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-0.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                <KeyRound className="w-3.5 h-3.5" />
              </span>
              <input
                type={isEditing ? "text" : "password"}
                disabled={!isEditing}
                value={isEditing ? newPassword : "••••••••"}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isEditing ? "নতুন পাসওয়ার্ড লিখুন" : "••••••••"}
                className={`w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-semibold rounded-xl transition-all focus:outline-none ${
                  isEditing ? 'bg-white focus:ring-2 focus:ring-orange-500/15 focus:border-neutral-400' : 'cursor-not-allowed select-none'
                }`}
              />
            </div>
          </div>

          {/* Save changes button */}
          {isEditing && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={updateLoading}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                {updateLoading ? (
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                Save Changes
              </button>
            </div>
          )}

        </form>
      </div>

      {/* 3. Enroll Courses Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight">
            {enrolledList.length > 0 ? "Enroll courses" : "No Enrolled Courses"}
          </h3>
          <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
            {enrolledList.length} total
          </span>
        </div>

        {enrolledList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledList.map(({ enrollment, course }) => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollment}
                onSelect={(courseId) => onNavigateToCourse(courseId)}
                onEnroll={() => {}}
                onShowCertificate={(courseId) => setSelectedCertCourseId(courseId)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6 w-full">
            {/* Popular Courses section directly on empty dashboard */}
            <div>
              <div className="mb-4">
                <h4 className="text-lg font-extrabold text-neutral-900 tracking-tight">Popular Courses</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.slice(0, 3).map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onSelect={(courseId) => onNavigateToCourse(courseId)}
                    onEnroll={onEnroll}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Certificate modal popup */}
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
