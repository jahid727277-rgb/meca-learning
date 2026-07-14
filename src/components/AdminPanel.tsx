import React, { useState } from 'react';
import { Course, Lesson, SyllabusSection, Level } from '../types';
import PlyrPlayer from './PlyrPlayer';
import { formatBDTPrice } from '../utils/currency';
import { 
  Plus, Edit3, Trash2, Image, Link, Play, FileText, HelpCircle, 
  Save, RotateCcw, ShieldAlert, Check, CheckCircle, ArrowRight, Eye
} from 'lucide-react';

interface AdminPanelProps {
  courses: Course[];
  logoUrl: string;
  onUpdateCourses: (newCourses: Course[]) => void;
  onUpdateLogo: (newLogoUrl: string) => void;
  onResetDatabase: () => Promise<void>;
  userEmail?: string;
}

export default function AdminPanel({
  courses,
  logoUrl,
  onUpdateCourses,
  onUpdateLogo,
  onResetDatabase,
  userEmail
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'branding'>('courses');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [previewingLessonId, setPreviewingLessonId] = useState<string | null>(null);

  // New course / edit form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Mechatronics');
  const [formLevel, setFormLevel] = useState<Level>('Beginner');
  const [formPrice, setFormPrice] = useState(49.99);
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formInstructorName, setFormInstructorName] = useState('Dr. Sarah Jenkins');
  const [formInstructorRole, setFormInstructorRole] = useState('Associate Professor');
  const [formInstructorAvatar, setFormInstructorAvatar] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200');
  const [formInstructorBio, setFormInstructorBio] = useState('Experienced robotics instructor.');
  const [formTags, setFormTags] = useState('Robotics, Hardware');
  
  // Custom Syllabus builder inside the course editor
  const [formSyllabus, setFormSyllabus] = useState<SyllabusSection[]>([
    {
      id: 'sec-1',
      title: 'Section 1: Core Fundamentals',
      lessons: [
        {
          id: 'les-1',
          title: 'Welcome & Introduction',
          duration: '10:00',
          type: 'video',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          content: 'This is the welcome video lesson content.'
        }
      ]
    }
  ]);

  // Branding states
  const [brandingLogo, setBrandingLogo] = useState(logoUrl);

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleResetDB = async () => {
    if (!window.confirm("আপনি কি নিশ্চিত যে ফায়ারবেসের বর্তমান সব ডেটা মুছে ডিফল্ট ডেটা দিয়ে ডেটাবেস রিসেট করতে চান?")) return;
    setIsResetting(true);
    try {
      await onResetDatabase();
      showStatus("ডেটাবেস সফলভাবে মুছে রিসেট করা হয়েছে!");
    } catch (e) {
      showStatus("রিসেট করতে ত্রুটি হয়েছে।", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsAddingNew(false);
    setFormTitle(course.title);
    setFormDescription(course.description);
    setFormCategory(course.category);
    setFormLevel(course.level);
    setFormPrice(course.price);
    setFormThumbnail(course.thumbnail);
    setFormInstructorName(course.instructor?.name || '');
    setFormInstructorRole(course.instructor?.role || '');
    setFormInstructorAvatar(course.instructor?.avatar || '');
    setFormInstructorBio(course.instructor?.bio || '');
    setFormTags(course.tags.join(', '));
    setFormSyllabus(course.syllabus || []);
  };

  const handleAddNewCourseClick = () => {
    setEditingCourse(null);
    setIsAddingNew(true);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Mechatronics');
    setFormLevel('Beginner');
    setFormPrice(49.99);
    setFormThumbnail('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800');
    setFormInstructorName('Dr. Sarah Jenkins');
    setFormInstructorRole('Associate Professor');
    setFormInstructorAvatar('https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200');
    setFormInstructorBio('Expert in this field with multiple research articles.');
    setFormTags('Arduino, Electronics, Robotics');
    setFormSyllabus([
      {
        id: 'sec-1',
        title: 'Section 1: Foundations',
        lessons: [
          {
            id: 'les-1',
            title: 'Welcome & System Overview',
            duration: '08:30',
            type: 'video',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            content: 'Welcome to this brand new course! Check out the syllabus guidelines.'
          }
        ]
      }
    ]);
  };

  const handleSaveCourse = () => {
    if (!formTitle.trim()) {
      showStatus("কোর্সের টাইটেল দেওয়া আবশ্যক!", "error");
      return;
    }

    const processedTags = formTags.split(',').map(t => t.trim()).filter(Boolean);
    const totalLessons = formSyllabus.reduce((acc, sec) => acc + sec.lessons.length, 0);

    const updatedOrNewCourse: Course = {
      id: editingCourse ? editingCourse.id : `course-${Date.now()}`,
      title: formTitle,
      description: formDescription,
      category: formCategory,
      level: formLevel,
      price: Number(formPrice) || 0,
      thumbnail: formThumbnail,
      rating: editingCourse ? editingCourse.rating : 5.0,
      reviewCount: editingCourse ? editingCourse.reviewCount : 1,
      duration: '10h 30m',
      lessonsCount: totalLessons,
      tags: processedTags,
      instructor: {
        name: formInstructorName,
        role: formInstructorRole,
        avatar: formInstructorAvatar,
        bio: formInstructorBio
      },
      syllabus: formSyllabus
    };

    let updatedCoursesListList: Course[] = [];
    if (editingCourse) {
      updatedCoursesListList = courses.map(c => c.id === editingCourse.id ? updatedOrNewCourse : c);
      showStatus("কোর্সটি সফলভাবে আপডেট করা হয়েছে!");
    } else {
      updatedCoursesListList = [...courses, updatedOrNewCourse];
      showStatus("নতুন কোর্সটি সফলভাবে তৈরি করা হয়েছে!");
    }

    onUpdateCourses(updatedCoursesListList);
    setEditingCourse(null);
    setIsAddingNew(false);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই কোর্সটি মুছে ফেলতে চান?")) return;
    const filtered = courses.filter(c => c.id !== courseId);
    onUpdateCourses(filtered);
    showStatus("কোর্সটি মুছে ফেলা হয়েছে!");
  };

  // Syllabus modifiers helpers
  const handleAddSyllabusSection = () => {
    const newSection: SyllabusSection = {
      id: `sec-${Date.now()}`,
      title: `Section ${formSyllabus.length + 1}: New Section`,
      lessons: []
    };
    setFormSyllabus([...formSyllabus, newSection]);
  };

  const handleUpdateSectionTitle = (secIndex: number, newTitle: string) => {
    const copy = [...formSyllabus];
    copy[secIndex].title = newTitle;
    setFormSyllabus(copy);
  };

  const handleDeleteSection = (secIndex: number) => {
    const copy = [...formSyllabus];
    copy.splice(secIndex, 1);
    setFormSyllabus(copy);
  };

  const handleAddLessonToSection = (secIndex: number) => {
    const copy = [...formSyllabus];
    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      title: 'New Lesson Video/Quiz',
      duration: '10:00',
      type: 'video',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      content: 'New content text.'
    };
    copy[secIndex].lessons.push(newLesson);
    setFormSyllabus(copy);
  };

  const handleUpdateLesson = (secIndex: number, lesIndex: number, key: keyof Lesson, value: any) => {
    const copy = [...formSyllabus];
    copy[secIndex].lessons[lesIndex] = {
      ...copy[secIndex].lessons[lesIndex],
      [key]: value
    };
    setFormSyllabus(copy);
  };

  const handleDeleteLesson = (secIndex: number, lesIndex: number) => {
    const copy = [...formSyllabus];
    copy[secIndex].lessons.splice(lesIndex, 1);
    setFormSyllabus(copy);
  };

  const handleSaveBranding = () => {
    onUpdateLogo(brandingLogo);
    showStatus("লোগো পরিবর্তন সংরক্ষণ করা হয়েছে!");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 text-neutral-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-neutral-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-wider">
              Admin Console
            </span>
            {userEmail && (
              <span className="text-[11px] text-neutral-400 font-bold">
                Logged in as: {userEmail}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-black text-neutral-900 tracking-tight mt-1">
            ম্যাকা লার্নিং এডমিন প্যানেল
          </h2>
          <p className="text-xs text-neutral-500 font-semibold mt-0.5">
            এখান থেকে আপনি লোগো পরিবর্তন, কোর্স এডিট, নতুন ভিডিও কোর্স ইউটিউব লিংকসহ যুক্ত ও ম্যানেজ করতে পারবেন।
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDB}
            disabled={isResetting}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100/80 border border-red-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            রিসেট ডেটাবেস
          </button>
          
          {!editingCourse && !isAddingNew && (
            <button
              onClick={handleAddNewCourseClick}
              className="flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              নতুন কোর্স যোগ করুন
            </button>
          )}
        </div>
      </div>

      {/* STATUS NOTIFICATION TOAST */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl mb-6 flex items-center gap-3 animate-slideIn border ${
          statusMessage.type === 'success' 
            ? 'bg-green-50 text-green-800 border-green-100' 
            : 'bg-red-50 text-red-800 border-red-100'
        }`}>
          <CheckCircle className={`w-5 h-5 ${statusMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
          <span className="text-xs font-bold">{statusMessage.text}</span>
        </div>
      )}

      {/* TAB NAVIGATION */}
      {!editingCourse && !isAddingNew && (
        <div className="flex gap-2 border-b border-neutral-100 mb-8 pb-px overflow-x-auto whitespace-nowrap scrollbar-none">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 pb-3.5 text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === 'courses'
                ? 'border-orange-500 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            কোর্স সমূহ ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 pb-3.5 text-xs font-extrabold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === 'branding'
                ? 'border-orange-500 text-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-neutral-600'
            }`}
          >
            লোগো ও ছবি ব্র্যান্ডিং
          </button>
        </div>
      )}

      {/* BRANDING TAB CONTENT */}
      {activeTab === 'branding' && !editingCourse && !isAddingNew && (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs p-6 md:p-8 max-w-2xl">
          <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Image className="w-4.5 h-4.5 text-orange-500" />
            লোগো লিংক কনফিগারেশন
          </h3>
          <p className="text-xs text-neutral-500 font-semibold mb-6">
            আপনার ম্যাকা লার্নিং ওয়েবসাইটের প্রধান লোগোটি পরিবর্তন করতে নিচে একটি নতুন ইমেজ লিংক বসিয়ে সেভ করুন।
          </p>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1.5">লোগো ছবি লিংক (Logo URL):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={brandingLogo}
                  onChange={(e) => setBrandingLogo(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
                <button
                  onClick={handleSaveBranding}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  সেভ করুন
                </button>
              </div>
            </div>

            {/* Preview Card */}
            <div className="p-5 rounded-2xl bg-neutral-50/50 border border-neutral-100 space-y-3">
              <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400 block">বর্তমান লোগো প্রিভিউ:</span>
              <div className="p-4 rounded-xl bg-neutral-900 inline-flex items-center justify-center">
                <img 
                  src={brandingLogo && !brandingLogo.includes('cloudinary.com') && brandingLogo !== 'https://res.cloudinary.com/djjhol6dg/image/upload/v1783518180/20260708_194111_pcs7uw.png' ? brandingLogo : 'meca_learning_logo.png'} 
                  alt="Logo Preview" 
                  className="h-10 w-auto object-contain max-w-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target.src !== 'meca_learning_logo.png') {
                      target.src = 'meca_learning_logo.png';
                    }
                  }}
                />
              </div>
              <p className="text-[10px] text-neutral-400 font-semibold leading-relaxed">
                * যদি ইমেজটি ইনভ্যালিড হয়, তবে সিস্টেম ডিফল্ট লোগোটি প্রদর্শন করবে।
              </p>
            </div>
          </div>
        </div>
      )}

      {/* COURSES MANAGER TAB CONTENT */}
      {activeTab === 'courses' && !editingCourse && !isAddingNew && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="bg-white rounded-3xl border border-neutral-100 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Course Thumbnail */}
                  <div className="relative aspect-video w-full bg-neutral-100 overflow-hidden">
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-neutral-900/90 backdrop-blur-xs text-white text-[10px] font-black tracking-wider uppercase">
                      {formatBDTPrice(course.price)}
                    </span>
                  </div>

                  {/* Course Info */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-600 text-[10px] font-bold uppercase tracking-wider">
                        {course.category}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-bold">
                        • {course.level}
                      </span>
                    </div>

                    <h3 className="text-xs font-black text-neutral-900 leading-snug line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-[11px] text-neutral-500 font-semibold leading-normal line-clamp-2">
                      {course.description}
                    </p>

                    <div className="pt-2.5 flex items-center justify-between border-t border-neutral-50 text-[11px] font-bold text-neutral-400">
                      <span>{course.lessonsCount} lessons</span>
                      <span>Instructor: {course.instructor?.name || 'Meca Team'}</span>
                    </div>
                  </div>
                </div>

                {/* Edit Actions Footer */}
                <div className="bg-neutral-50/60 border-t border-neutral-50 p-4 flex gap-2">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100/50 rounded-xl border border-orange-100/40 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    এডিট কোর্স
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all cursor-pointer"
                    title="মুছে ফেলুন"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COURSE EDITOR / NEW COURSE CREATOR SECTION */}
      {(editingCourse || isAddingNew) && (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-md p-6 md:p-8 space-y-8 max-w-4xl">
          
          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-wider text-orange-500">
                {editingCourse ? "কোর্স মডিফায়ার" : "নতুন কোর্স ক্রিয়েটর"}
              </span>
              <h3 className="text-lg font-black text-neutral-900 leading-tight">
                {editingCourse ? "কোর্সের তথ্য এবং সিলেবাস এডিট করুন" : "ইউটিউব সিলেবাসসহ নতুন কোর্স যোগ করুন"}
              </h3>
            </div>
            
            <button
              onClick={() => {
                setEditingCourse(null);
                setIsAddingNew(false);
              }}
              className="text-xs font-extrabold text-neutral-400 hover:text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-xl cursor-pointer"
            >
              বাতিল
            </button>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left side inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">কোর্স টাইটেল (Course Title):</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  placeholder="যেমন: PLC Programming & Industrial Automation"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">বর্ণনা (Description):</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  placeholder="কোর্সটির বিস্তারিত সংক্ষিপ্ত আকারে লিখুন..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">ক্যাটাগরি:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                  >
                    <option value="Mechatronics">Mechatronics</option>
                    <option value="Software Development">Software Development</option>
                    <option value="Design & UI/UX">Design & UI/UX</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">লেভেল:</label>
                  <select
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value as Level)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 text-neutral-800 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">
                    কোর্স ফি ($ USD) • বাংলা টাকায়: <span className="text-orange-600 font-bold">{formatBDTPrice(formPrice)}</span>
                  </label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">ট্যাগ সমূহ (Tags, কমা দিয়ে):</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-4 py-2 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    placeholder="Arduino, Hardware, Electronics"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">থাম্বনেইল ইমেজ লিংক (Thumbnail Image URL):</label>
                <input
                  type="text"
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                  className="w-full px-4 py-2 bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
            </div>

            {/* Right side inputs (Instructor Info) */}
            <div className="space-y-4 bg-neutral-50/50 border border-neutral-100 rounded-3xl p-5">
              <span className="text-[9px] uppercase font-black tracking-wider text-neutral-400 block">ইনস্ট্রাক্টর পরিচিতি:</span>
              
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">ইনস্ট্রাক্টরের নাম (Instructor Name):</label>
                <input
                  type="text"
                  value={formInstructorName}
                  onChange={(e) => setFormInstructorName(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">রোল / পদবী (Role):</label>
                <input
                  type="text"
                  value={formInstructorRole}
                  onChange={(e) => setFormInstructorRole(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">ইনস্ট্রাক্টর ছবি লিংক (Avatar Link):</label>
                <input
                  type="text"
                  value={formInstructorAvatar}
                  onChange={(e) => setFormInstructorAvatar(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-neutral-400 block mb-1">সংক্ষিপ্ত বায়ো (Bio):</label>
                <textarea
                  value={formInstructorBio}
                  onChange={(e) => setFormInstructorBio(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-white border border-neutral-200 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* SYLLABUS BUILDER (DYNAMIC SECTIONS AND LESSONS) */}
          <div className="space-y-4 border-t border-neutral-100 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-neutral-900 uppercase tracking-wider">সিলেবাস ও লেসন ডিরেক্টরি</h4>
                <p className="text-[10px] text-neutral-500 font-semibold">কোর্সের জন্য নতুন সেকশন ও ভিডিও লেসন ইউটিউব লিংক দিয়ে তৈরি করুন।</p>
              </div>
              <button
                type="button"
                onClick={handleAddSyllabusSection}
                className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-extrabold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-lg cursor-pointer transition-colors"
              >
                <Plus className="w-3 h-3" />
                সেকশন যোগ করুন
              </button>
            </div>

            {/* Dynamic Sections List */}
            <div className="space-y-5">
              {formSyllabus.map((section, secIndex) => (
                <div key={section.id} className="p-4 rounded-3xl bg-neutral-50 border border-neutral-100 space-y-4">
                  
                  {/* Section header input */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 flex items-center gap-2">
                      <span className="text-[10px] font-black text-neutral-400 uppercase shrink-0">সেকশন {secIndex + 1}:</span>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSectionTitle(secIndex, e.target.value)}
                        className="flex-1 bg-white border border-neutral-200 px-3 py-1 rounded-lg text-xs font-bold focus:outline-none focus:border-orange-500"
                        placeholder="সেকশনের নাম লিখুন"
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddLessonToSection(secIndex)}
                        className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold text-neutral-600 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-lg cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        লেসন যোগ করুন
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(secIndex)}
                        className="p-1 text-red-500 hover:text-red-700 bg-white hover:bg-red-50 border border-neutral-200 rounded-lg cursor-pointer"
                        title="সেকশন মুছুন"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons list inside section */}
                  {section.lessons.length > 0 ? (
                    <div className="space-y-3 pl-4 border-l-2 border-neutral-200/60">
                      {section.lessons.map((lesson, lesIndex) => (
                        <div key={lesson.id} className="bg-white p-4.5 rounded-2xl border border-neutral-100/80 space-y-3">
                          
                          {/* Lesson title & type row */}
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-8">
                              <label className="text-[9px] font-black uppercase text-neutral-400 block mb-0.5">লেসন নাম:</label>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => handleUpdateLesson(secIndex, lesIndex, 'title', e.target.value)}
                                className="w-full bg-neutral-50/50 border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500"
                                placeholder="লেসন টাইটেল লিখুন"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-[9px] font-black uppercase text-neutral-400 block mb-0.5">প্রকার:</label>
                              <select
                                value={lesson.type}
                                onChange={(e) => handleUpdateLesson(secIndex, lesIndex, 'type', e.target.value)}
                                className="w-full bg-neutral-50/50 border border-neutral-200 px-2 py-1.5 rounded-xl text-xs font-bold cursor-pointer focus:outline-none"
                              >
                                <option value="video">🎥 Video</option>
                                <option value="reading">📄 Reading</option>
                                <option value="quiz">❓ Quiz</option>
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-[9px] font-black uppercase text-neutral-400 block mb-0.5">ডিউরেশন (Duration):</label>
                              <input
                                type="text"
                                value={lesson.duration}
                                onChange={(e) => handleUpdateLesson(secIndex, lesIndex, 'duration', e.target.value)}
                                className="w-full bg-neutral-50/50 border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none"
                                placeholder="08:45"
                              />
                            </div>
                          </div>

                          {/* Video url if video type */}
                          {lesson.type === 'video' && (
                            <div className="space-y-2">
                              <label className="text-[9px] font-black uppercase text-neutral-400 block mb-0.5">ইউটিউব ভিডিও লিংক (YouTube / MP4 URL):</label>
                              <div className="flex gap-2">
                                <span className="p-2.5 rounded-xl bg-orange-50 text-orange-600 shrink-0 border border-orange-100/40">
                                  <Play className="w-4.5 h-4.5" />
                                </span>
                                <input
                                  type="text"
                                  value={lesson.videoUrl || ''}
                                  onChange={(e) => handleUpdateLesson(secIndex, lesIndex, 'videoUrl', e.target.value)}
                                  className="flex-1 bg-neutral-50/50 border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-orange-500 font-mono"
                                  placeholder="যেমন: https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                                />
                                {lesson.videoUrl && (
                                  <button
                                    type="button"
                                    onClick={() => setPreviewingLessonId(previewingLessonId === lesson.id ? null : lesson.id)}
                                    className="px-3.5 py-1.5 text-[10px] font-extrabold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100/50 rounded-xl border border-orange-100/30 transition-all flex items-center gap-1 shrink-0"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    {previewingLessonId === lesson.id ? 'বন্ধ করুন' : 'Plyr.js প্লেয়ার প্রিভিউ'}
                                  </button>
                                )}
                              </div>
                              
                              {previewingLessonId === lesson.id && lesson.videoUrl && (
                                <div className="mt-2.5 max-w-xl rounded-2xl overflow-hidden border border-neutral-100 shadow-sm bg-neutral-950">
                                  <div className="bg-neutral-900 px-3 py-1.5 border-b border-neutral-800 flex justify-between items-center">
                                    <span className="text-[9px] font-extrabold tracking-wider text-orange-500 uppercase">Plyr.js Live Preview</span>
                                    <span className="text-[8px] font-bold text-neutral-400 font-mono">{lesson.duration}</span>
                                  </div>
                                  <PlyrPlayer videoUrl={lesson.videoUrl} />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Content if reading/video content */}
                          {lesson.type !== 'quiz' && (
                            <div>
                              <label className="text-[9px] font-black uppercase text-neutral-400 block mb-0.5">লেসন কন্টেন্ট (Text Content):</label>
                              <textarea
                                value={lesson.content || ''}
                                onChange={(e) => handleUpdateLesson(secIndex, lesIndex, 'content', e.target.value)}
                                rows={2}
                                className="w-full bg-neutral-50/50 border border-neutral-200 px-3 py-1.5 rounded-xl text-xs font-medium focus:outline-none"
                                placeholder="এই লেসনের বিস্তারিত তথ্য এখানে লিখুন..."
                              />
                            </div>
                          )}

                          {/* Delete Lesson Button */}
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(secIndex, lesIndex)}
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-100 transition-all cursor-pointer"
                            >
                              লেসন মুছুন
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-neutral-200">
                      <p className="text-[10px] text-neutral-400 font-bold">এই সেকশনে কোন লেসন নেই। ডানের "লেসন যোগ করুন" বাটনে ক্লিক করুন।</p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="bg-neutral-50 rounded-3xl p-5 flex items-center justify-between border border-neutral-100">
            <span className="text-[11px] font-semibold text-neutral-500 leading-normal">
              * কোর্সটি সেভ করার সাথে সাথে এটি ফায়ারবেস ডেটাবেসে সিঙ্ক হয়ে আপডেট হয়ে যাবে।
            </span>
            
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setEditingCourse(null);
                  setIsAddingNew(false);
                }}
                className="px-5 py-2.5 text-xs font-bold text-neutral-500 hover:text-neutral-700 bg-neutral-100 hover:bg-neutral-200/70 rounded-xl transition-all cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleSaveCourse}
                className="px-6 py-2.5 text-xs font-black text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                পরিবর্তন সেভ করুন
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
