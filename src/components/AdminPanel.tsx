import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, Lesson, SyllabusSection, Level } from '../types';
import ImageWithSkeleton from './ImageWithSkeleton';
import YouTubePlayer from './YouTubePlayer';
import CourseCard from './CourseCard';
import { formatBDTPrice } from '../utils/currency';
import { 
  Plus, Edit3, Trash2, Image, Link, Play, FileText, HelpCircle, 
  Save, RotateCcw, Check, CheckCircle, ArrowRight, Eye, EyeOff,
  Github, CloudLightning, RefreshCw, AlertCircle, Copy, Download,
  ChevronDown, Video, Circle, ArrowLeft, PlusCircle, Sparkles
} from 'lucide-react';

const mecaLearningLogo = 'https://res.cloudinary.com/djjhol6dg/image/upload/v1784080493/meca_learning_logo_a3yqec.png';

import { syncAllCoursesToFirestore } from '../lib/firebase';

interface AdminPanelProps {
  courses: Course[];
  logoUrl: string;
  onUpdateCourses: (newCourses: Course[]) => void;
  onUpdateLogo: (newLogoUrl: string) => void;
  onResetDatabase: () => Promise<void>;
  userEmail?: string;
}

// Serial Input Component for stable reordering
const SerialInput = ({ value, onChange, max, className, onSave }: { value: string, onChange: (val: string) => void, max: number, className?: string, onSave?: () => void }) => {
  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={value}
      onChange={(e) => {
        const val = e.target.value.replace(/\D/g, '');
        onChange(val);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && onSave) {
          onSave();
        }
      }}
      className={className}
      title="Serial Number"
    />
  );
};

export default function AdminPanel({
  courses,
  logoUrl,
  onUpdateCourses,
  onUpdateLogo,
  onResetDatabase,
  userEmail
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'branding' | 'github'>('courses');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingSyllabusCourse, setEditingSyllabusCourse] = useState<Course | null>(null);
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionTempTitle, setSectionTempTitle] = useState('');
  const [sectionTempSerial, setSectionTempSerial] = useState('');
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTempSerial, setLessonTempSerial] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [previewingLessonId, setPreviewingLessonId] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [sectionToDelete, setSectionToDelete] = useState<{ index: number, title: string } | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<{ secIndex: number, lesIndex: number, title: string } | null>(null);
  const [viewingCourseInfo, setViewingCourseInfo] = useState<Course | null>(null);
  const [detailsPromoVideoUrl, setDetailsPromoVideoUrl] = useState('');
  const [detailsDescription, setDetailsDescription] = useState('');
  const [isEditingPromoVideoUrl, setIsEditingPromoVideoUrl] = useState(false);

  // Prevent body scroll when modals are open
  React.useEffect(() => {
    if (courseToDelete || sectionToDelete || lessonToDelete) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [courseToDelete, sectionToDelete, lessonToDelete]);

  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('Prompt Engineering');
  const [formLevel, setFormLevel] = useState<Level>('Beginner');
  const [formPrice, setFormPrice] = useState<string | number>(49.99);
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formInstructorName, setFormInstructorName] = useState('Dr. Sarah Jenkins');
  const [formInstructorRole, setFormInstructorRole] = useState('Associate Professor');
  const [formInstructorAvatar, setFormInstructorAvatar] = useState('');
  const [formInstructorBio, setFormInstructorBio] = useState('');
  const [formTags, setFormTags] = useState('');
  
  const [formSyllabus, setFormSyllabus] = useState<SyllabusSection[]>([]);
  const [brandingLogo, setBrandingLogo] = useState(logoUrl);

  // GitHub States
  const [githubToken, setGithubToken] = useState('');
  const [githubRepo, setGithubRepo] = useState(() => localStorage.getItem('meca_github_repo') || '');
  const [githubBranch, setGithubBranch] = useState(() => localStorage.getItem('meca_github_branch') || 'main');
  const [githubFilePath, setGithubFilePath] = useState(() => localStorage.getItem('meca_github_filepath') || 'src/data/courses.ts');
  const [githubCommitMsg, setGithubCommitMsg] = useState('docs: update courses dataset from admin console');
  const [showToken, setShowToken] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [githubStatus, setGithubStatus] = useState<{ type: 'idle' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });

  const generateCoursesTS = () => {
    const formattedCourses = JSON.stringify(courses, null, 2);
    return `import { Course } from '../types';

export const CATEGORIES = [
  'All',
  'Prompt Engineering',
  'AI Agents',
  'AI Automation',
];

export const COURSES: Course[] = ${formattedCourses};
`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateCoursesTS());
    showStatus("কোর্স কোড ক্লিপবোর্ডে কপি করা হয়েছে!");
  };

  const handleDownloadFile = () => {
    const element = document.createElement("a");
    const file = new Blob([generateCoursesTS()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "courses.ts";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showStatus("courses.ts ফাইল ডাউনলোড করা হয়েছে!");
  };

  const handlePushToGithub = async () => {
    if (!githubToken.trim() || !githubRepo.trim() || !githubBranch.trim()) {
      setGithubStatus({ 
        type: 'error', 
        message: 'GitHub Token, Repository এবং Branch প্রদান করুন।' 
      });
      return;
    }

    localStorage.setItem('meca_github_repo', githubRepo);
    localStorage.setItem('meca_github_branch', githubBranch);
    localStorage.setItem('meca_github_filepath', githubFilePath);

    setIsPushing(true);
    setGithubStatus({ type: 'idle', message: 'GitHub সংযোগ স্থাপন করা হচ্ছে...' });

    try {
      const fileContent = generateCoursesTS();
      const encodedContent = btoa(unescape(encodeURIComponent(fileContent)));
      
      const getFileUrl = `https://api.github.com/repos/${githubRepo}/contents/${githubFilePath}?ref=${githubBranch}`;
      let existingFileSha = '';
      
      try {
        const response = await fetch(getFileUrl, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          existingFileSha = data.sha;
        }
      } catch (err) {
        console.log("File may not exist yet.");
      }

      const putFileUrl = `https://api.github.com/repos/${githubRepo}/contents/${githubFilePath}`;
      const body: any = {
        message: githubCommitMsg || 'docs: update courses dataset from admin console',
        content: encodedContent,
        branch: githubBranch
      };
      
      if (existingFileSha) {
        body.sha = existingFileSha;
      }

      const putResponse = await fetch(putFileUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(body)
      });

      if (putResponse.ok) {
        setGithubStatus({ 
          type: 'success', 
          message: `সফলভাবে GitHub এ পুশ করা হয়েছে!` 
        });
        showStatus("GitHub সিঙ্ক সফল হয়েছে!");
      } else {
        const errorData = await putResponse.json();
        setGithubStatus({ 
          type: 'error', 
          message: `ত্রুটি: ${errorData.message || putResponse.statusText}` 
        });
      }
    } catch (error: any) {
      setGithubStatus({ 
        type: 'error', 
        message: `API ত্রুটি: ${error?.message || error}` 
      });
    } finally {
      setIsPushing(false);
    }
  };

  const showStatus = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleResetDB = async () => {
    if (!window.confirm("আপনি কি ডেটাবেস রিসেট করতে চান?")) return;
    setIsResetting(true);
    try {
      await onResetDatabase();
      showStatus("ডেটাবেস রিসেট করা হয়েছে!");
    } catch (e) {
      showStatus("রিসেট করতে ত্রুটি হয়েছে।", "error");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSyncToFirestore = async () => {
    setIsSyncing(true);
    try {
      await syncAllCoursesToFirestore(courses);
      showStatus("কোর্সের সকল তথ্য সফলভাবে Firebase Firestore এ সেভ করা হয়েছে!");
    } catch (e: any) {
      console.error(e);
      showStatus("Firestore এ সেভ করতে সমস্যা হয়েছে। অনুগ্রহ করে আপনার Firestore Rules চেক করুন।", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditingSyllabusCourse(null);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSyllabus = (course: Course) => {
    setEditingSyllabusCourse(course);
    const syllabus = course.syllabus || [];
    setFormSyllabus(syllabus);
    // Initialize all sections as expanded
    const initialExpanded: {[key: string]: boolean} = {};
    syllabus.forEach(sec => {
      initialExpanded[sec.id] = true;
    });
    setExpandedSections(initialExpanded);
    setIsAddingNew(false);
    setEditingCourse(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSyllabus = async () => {
    if (!editingSyllabusCourse) return;
    const updatedCoursesList = courses.map(c => 
      c.id === editingSyllabusCourse.id ? { ...c, syllabus: formSyllabus } : c
    );
    onUpdateCourses(updatedCoursesList);
    setEditingSyllabusCourse(null);
    showStatus("টপিক সেকশন সফলভাবে সংরক্ষণ করা হয়েছে!");
  };

  const handleAddNewCourseClick = () => {
    if (isAddingNew) {
      setIsAddingNew(false);
      setEditingCourse(null);
      return;
    }
    setEditingCourse(null);
    setIsAddingNew(true);
    setFormTitle('');
    setFormDescription('');
    setFormCategory('Prompt Engineering');
    setFormLevel('Beginner');
    setFormPrice('');
    setFormThumbnail('');
    setFormInstructorName('Abrar Chowdhury');
    setFormInstructorRole('AI Research Architect');
    setFormInstructorAvatar('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200');
    setFormInstructorBio('Expert in artificial intelligence.');
    setFormTags('AI, LLMs');
    setFormSyllabus([
      {
        id: 'sec-1',
        title: '',
        lessons: [
          {
            id: 'les-1',
            title: 'Welcome & System Overview',
            type: 'video',
            videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            content: ''
          }
        ]
      }
    ]);
  };

  const handleSaveCourse = () => {
    if (!formTitle.trim()) {
      showStatus("কোর্সের টাইটেল আবশ্যক!", "error");
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
      price: formPrice,
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

    let updatedCoursesList: Course[] = [];
    if (editingCourse) {
      updatedCoursesList = courses.map(c => c.id === editingCourse.id ? updatedOrNewCourse : c);
      showStatus("কোর্স আপডেট করা হয়েছে!");
    } else {
      updatedCoursesList = [...courses, updatedOrNewCourse];
      showStatus("নতুন কোর্স তৈরি করা হয়েছে!");
    }

    onUpdateCourses(updatedCoursesList);
    setEditingCourse(null);
    setIsAddingNew(false);
  };

  const handleEditCourseDetails = (course: Course) => {
    setViewingCourseInfo(course);
    setDetailsPromoVideoUrl(course.promoVideoUrl || '');
    setDetailsDescription(course.detailsDescription || 'Master the core mechanics of Large Language Models and learn to write production-grade prompts. Deep-dive into zero-shot learning, few-shot conditioning, and reasoning chains.');
    setIsEditingPromoVideoUrl(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCourseDetails = () => {
    if (!viewingCourseInfo) return;
    const updated = courses.map(c => 
      c.id === viewingCourseInfo.id 
        ? { ...c, promoVideoUrl: detailsPromoVideoUrl, detailsDescription: detailsDescription } 
        : c
    );
    onUpdateCourses(updated);
    setViewingCourseInfo(null);
    showStatus("কোর্স পরিচিতি ও ডেসক্রিপশন সফলভাবে সংরক্ষণ করা হয়েছে!");
  };

  const handleDeleteCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setCourseToDelete(course);
      // Scroll to the top immediately to ensure user sees the modal at the top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const confirmDeleteCourse = () => {
    if (!courseToDelete) return;
    const filtered = courses.filter(c => c.id !== courseToDelete.id);
    onUpdateCourses(filtered);
    setCourseToDelete(null);
    showStatus("কোর্সটি মুছে ফেলা হয়েছে!");
  };

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddSyllabusSection = () => {
    const newSection: SyllabusSection = {
      id: `sec-${Date.now()}`,
      title: `Section ${formSyllabus.length + 1}: New Section`,
      lessons: []
    };
    setFormSyllabus([...formSyllabus, newSection]);
  };

  const handleUpdateSectionTitle = (secIndex: number, newTitle: string) => {
    setFormSyllabus(prev => {
      const copy = [...prev];
      copy[secIndex] = { ...copy[secIndex], title: newTitle };
      return copy;
    });
  };

  const handleDeleteSection = (secIndex: number) => {
    const section = formSyllabus[secIndex];
    if (section) {
      setSectionToDelete({ index: secIndex, title: section.title });
    }
  };

  const confirmDeleteSection = () => {
    if (sectionToDelete === null) return;
    setFormSyllabus(prev => {
      const copy = [...prev];
      copy.splice(sectionToDelete.index, 1);
      return copy;
    });
    setSectionToDelete(null);
  };

  const handleAddLessonToSection = (secIndex: number) => {
    setFormSyllabus(prev => {
      const copy = [...prev];
      const newLesson: Lesson = {
        id: `les-${Date.now()}`,
        title: 'New Lesson',
        type: 'video',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        content: ''
      };
      const section = { ...copy[secIndex] };
      section.lessons = [...section.lessons, newLesson];
      copy[secIndex] = section;
      return copy;
    });
  };

  const handleUpdateLesson = (secIndex: number, lesIndex: number, key: keyof Lesson, value: any) => {
    setFormSyllabus(prev => {
      const copy = [...prev];
      const lessons = [...copy[secIndex].lessons];
      lessons[lesIndex] = {
        ...lessons[lesIndex],
        [key]: value
      };
      copy[secIndex] = { ...copy[secIndex], lessons };
      return copy;
    });
  };

  const handleReorderSection = (oldIndex: number, newSerial: string) => {
    setSectionTempSerial(newSerial);
    const newIndex = parseInt(newSerial) - 1;
    if (isNaN(newIndex) || newIndex < 0 || newIndex >= formSyllabus.length || newIndex === oldIndex) {
      return;
    }

    const updatedSyllabus = [...formSyllabus];
    const [movedItem] = updatedSyllabus.splice(oldIndex, 1);
    updatedSyllabus.splice(newIndex, 0, movedItem);
    
    setFormSyllabus(updatedSyllabus);
    
    // Auto-save the new order if we have a course context
    if (editingSyllabusCourse) {
      const updatedCourse = { ...editingSyllabusCourse, syllabus: updatedSyllabus };
      setEditingSyllabusCourse(updatedCourse);
      const updatedCoursesList = courses.map(c => 
        c.id === updatedCourse.id ? updatedCourse : c
      );
      onUpdateCourses(updatedCoursesList);
    }
  };

  const handleReorderLesson = (secIndex: number, oldLesIndex: number, newSerial: string) => {
    setLessonTempSerial(newSerial);
    const newIndex = parseInt(newSerial) - 1;
    
    const lessons = formSyllabus[secIndex].lessons;
    if (isNaN(newIndex) || newIndex < 0 || newIndex >= lessons.length || newIndex === oldLesIndex) {
      return;
    }

    const updatedSyllabus = [...formSyllabus];
    const sectionCopy = { ...updatedSyllabus[secIndex] };
    const lessonsCopy = [...sectionCopy.lessons];
    
    const [movedItem] = lessonsCopy.splice(oldLesIndex, 1);
    lessonsCopy.splice(newIndex, 0, movedItem);
    
    sectionCopy.lessons = lessonsCopy;
    updatedSyllabus[secIndex] = sectionCopy;
    
    setFormSyllabus(updatedSyllabus);
    
    // Auto-save
    if (editingSyllabusCourse) {
      const updatedCourse = { ...editingSyllabusCourse, syllabus: updatedSyllabus };
      setEditingSyllabusCourse(updatedCourse);
      const updatedCoursesList = courses.map(c => 
        c.id === updatedCourse.id ? updatedCourse : c
      );
      onUpdateCourses(updatedCoursesList);
    }
  };

  const handleSaveSectionEdits = (secIndex: number, newTitle: string, newSerialStr: string) => {
    let newIndex = parseInt(newSerialStr) - 1;
    if (isNaN(newIndex)) newIndex = secIndex;

    const updatedSyllabus = [...formSyllabus];
    // Update title
    const updatedSection = { ...updatedSyllabus[secIndex], title: newTitle };
    updatedSyllabus[secIndex] = updatedSection;
    
    // Reorder one last time if needed (usually already handled by reorder func)
    if (newIndex >= 0 && newIndex < updatedSyllabus.length && newIndex !== secIndex) {
      const [movedItem] = updatedSyllabus.splice(secIndex, 1);
      updatedSyllabus.splice(newIndex, 0, movedItem);
    }

    setFormSyllabus(updatedSyllabus);
    setEditingSectionId(null);
    
    if (editingSyllabusCourse) {
      const updatedCourse = { ...editingSyllabusCourse, syllabus: updatedSyllabus };
      setEditingSyllabusCourse(updatedCourse);
      const updatedCoursesList = courses.map(c => 
        c.id === updatedCourse.id ? updatedCourse : c
      );
      onUpdateCourses(updatedCoursesList);
      showStatus("সেকশন সফলভাবে সংরক্ষণ করা হয়েছে!");
    }
  };

  const handleSaveLessonEdits = (secIndex: number, lesIndex: number, newSerialStr: string) => {
    let newIndex = parseInt(newSerialStr) - 1;
    if (isNaN(newIndex)) newIndex = lesIndex;

    const updatedSyllabus = [...formSyllabus];
    const sectionCopy = { ...updatedSyllabus[secIndex] };
    const lessons = [...sectionCopy.lessons];
    
    if (newIndex >= 0 && newIndex < lessons.length && newIndex !== lesIndex) {
      const [movedItem] = lessons.splice(lesIndex, 1);
      lessons.splice(newIndex, 0, movedItem);
      sectionCopy.lessons = lessons;
      updatedSyllabus[secIndex] = sectionCopy;
    }

    setFormSyllabus(updatedSyllabus);
    setEditingLessonId(null);

    if (editingSyllabusCourse) {
      const updatedCourse = { ...editingSyllabusCourse, syllabus: updatedSyllabus };
      setEditingSyllabusCourse(updatedCourse);
      const updatedCoursesList = courses.map(c => 
        c.id === updatedCourse.id ? updatedCourse : c
      );
      onUpdateCourses(updatedCoursesList);
      showStatus("টপিক সফলভাবে সংরক্ষণ করা হয়েছে!");
    }
  };

  const handleDeleteLesson = (secIndex: number, lesIndex: number) => {
    const lesson = formSyllabus[secIndex].lessons[lesIndex];
    if (lesson) {
      setLessonToDelete({ secIndex, lesIndex, title: lesson.title });
    }
  };

  const confirmDeleteLesson = () => {
    if (lessonToDelete === null) return;
    const copy = [...formSyllabus];
    copy[lessonToDelete.secIndex].lessons.splice(lessonToDelete.lesIndex, 1);
    setFormSyllabus(copy);
    setLessonToDelete(null);
  };

  const handleSaveBranding = () => {
    onUpdateLogo(brandingLogo);
    showStatus("লোগো পরিবর্তন সংরক্ষণ করা হয়েছে!");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 text-neutral-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col mb-4 pb-2">
        <h2 
          onClick={() => {
            setEditingCourse(null);
            setIsAddingNew(false);
            setActiveTab('courses');
          }}
          className="text-3xl font-black text-neutral-900 tracking-tight text-center mb-4 cursor-pointer hover:text-neutral-700 transition-colors"
        >
          Admin Panel
        </h2>
        
        {/* Big Plus Button */}
        {!editingCourse && !editingSyllabusCourse && !viewingCourseInfo && (
          <button
            onClick={handleAddNewCourseClick}
            className="w-full flex items-center justify-center gap-2 py-6 bg-white border border-neutral-300 text-black rounded-2xl transition-all shadow-md cursor-pointer hover:bg-neutral-50 font-bold"
          >
            <Plus className="w-6 h-6 shrink-0" />
            Add new course
          </button>
        )}
      </div>

      {/* COURSE MANAGER TAB CONTENT */}
      {activeTab === 'courses' && !editingCourse && !isAddingNew && !editingSyllabusCourse && !viewingCourseInfo && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {courses.map((course) => (
              <article 
                key={course.id}
                className="group flex flex-col bg-white rounded-2xl border border-neutral-200 hover:border-orange-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 h-full"
              >
                {/* Course Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                  <ImageWithSkeleton 
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'} 
                    alt={course.title || 'Course'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    containerClassName="w-full h-full"
                  />
                </div>

                {/* Course Details */}
                <div className="flex flex-col flex-1 p-5">
                  <div className="text-sm font-black text-orange-600 mb-1">
                    {formatBDTPrice(course.price)}
                  </div>
                  <h3 className="text-base font-bold text-neutral-900 leading-snug mb-2 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-neutral-500 line-clamp-2 mb-3 font-medium leading-relaxed">
                    {course.description}
                  </p>

                  {/* Actions Footer */}
                  <div className="pt-4 mt-auto border-t border-neutral-50 flex justify-between items-center">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="flex items-center justify-center p-2 rounded-xl text-neutral-900 hover:text-orange-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                      title="এডিট"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pen pointer-events-none" viewBox="0 0 16 16">
                        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditSyllabus(course)}
                      className="flex items-center justify-center p-2 rounded-xl text-neutral-900 hover:text-orange-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                      title="টপিক সেকশন"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-collection-play pointer-events-none" viewBox="0 0 16 16">
                        <path d="M2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3m2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1m2.765 5.576A.5.5 0 0 0 6 7v5a.5.5 0 0 0 .765.424l4-2.5a.5.5 0 0 0 0-.848z"/>
                        <path d="M1.5 14.5A1.5 1.5 0 0 1 0 13V6a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 16 6v7a1.5 1.5 0 0 1-1.5 1.5zm13-1a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5h-13A.5.5 0 0 0 1 6v7a.5.5 0 0 0 .5.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEditCourseDetails(course)}
                      className="flex items-center justify-center p-2 rounded-xl text-neutral-900 hover:text-orange-600 hover:bg-neutral-50 transition-colors cursor-pointer"
                      title="কোর্স পরিচিতি"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-card-text pointer-events-none" viewBox="0 0 16 16">
                        <path d="M14.5 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5zm-13-1A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2z"/>
                        <path d="M3 5.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5M3 8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9A.5.5 0 0 1 3 8m0 2.5a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        console.log("Delete button clicked!");
                        handleDeleteCourse(course.id);
                      }}
                      className="flex items-center justify-center p-2 rounded-xl text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash pointer-events-none" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* COURSE EDITOR / NEW COURSE CREATOR SECTION */}
      {(editingCourse || isAddingNew) && (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-md p-4 md:p-6 space-y-4 max-w-4xl">
          
          {/* Form Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-neutral-900 leading-tight">
                {editingCourse ? "Course edit section" : "Add new course"}
              </h3>
            </div>
            
            <button
              onClick={() => {
                setEditingCourse(null);
                setIsAddingNew(false);
              }}
              className="p-2 text-neutral-400 hover:text-neutral-600 bg-neutral-50 rounded-xl cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          {/* Form Fields - Updated to vertical design */}
          <div className="space-y-4">
            <input
              type="text"
              value={formThumbnail}
              onChange={(e) => setFormThumbnail(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="https://images.example.com/"
            />
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Name.."
            />
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Description..."
            />
            <input
              type="text"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              placeholder="Price box"
            />
            
            
            <button
              onClick={handleSaveCourse}
              className="w-full py-3 text-sm font-black text-white bg-neutral-800 hover:bg-black rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* TOPIC SECTION EDITOR */}
      {editingSyllabusCourse && (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-md p-4 md:p-6 space-y-6 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                Topic section
              </h3>
              <p className="text-xs text-neutral-500 mt-1 font-medium">
                Course: <span className="font-bold text-neutral-800">{editingSyllabusCourse.title}</span>
              </p>
            </div>
            
            <button
              onClick={() => {
                setEditingSyllabusCourse(null);
                setEditingSectionId(null);
                setEditingLessonId(null);
              }}
              className="p-2 text-neutral-400 hover:text-neutral-600 bg-neutral-50 rounded-xl cursor-pointer transition-colors"
              title="বন্ধ করুন"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          {/* Section List */}
          <div className="space-y-4">
            {formSyllabus.map((section, secIndex) => {
              const isExpanded = !!expandedSections[section.id];
              const displayTitle = section.title.replace(/^(Section|Lesson)\s+\d+:\s*/i, '');
              
              return (
                <div key={section.id} className="border border-neutral-200 rounded-[20px] overflow-hidden bg-white shadow-sm">
                  {/* Section Header */}
                  <div className="flex items-center justify-between p-4 md:p-5 bg-white border-b border-neutral-100">
                    {editingSectionId === section.id ? (
                      <div className="flex items-center gap-1.5 flex-1 max-w-xl">
                        <div className="w-8 sm:w-9 shrink-0">
                          <SerialInput 
                            value={sectionTempSerial}
                            onChange={(val) => handleReorderSection(secIndex, val)}
                            onSave={() => handleSaveSectionEdits(secIndex, sectionTempTitle, sectionTempSerial)}
                            max={formSyllabus.length}
                            className="w-full px-1 py-1.5 bg-white border border-orange-200 text-xs font-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-orange-700 text-center"
                          />
                        </div>
                        <input
                          type="text"
                          value={sectionTempTitle}
                          onChange={(e) => setSectionTempTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveSectionEdits(secIndex, sectionTempTitle, sectionTempSerial);
                            }
                          }}
                          className="flex-1 px-4 py-2 text-sm bg-white border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold text-neutral-800"
                          placeholder="Section Title"
                        />
                        <button
                          onClick={() => handleSaveSectionEdits(secIndex, sectionTempTitle, sectionTempSerial)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors cursor-pointer"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingSectionId(null)}
                          className="p-2 text-neutral-400 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
                          title="Cancel"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-800 flex-1 pr-4 truncate">
                        Section {secIndex + 1}: {displayTitle}
                      </h4>
                    )}

                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* Edit Section Button */}
                      <button
                        onClick={() => {
                          setEditingSectionId(section.id);
                          setSectionTempTitle(section.title);
                          setSectionTempSerial((secIndex + 1).toString());
                        }}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer"
                        title="Edit Section"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {/* Delete Section Button */}
                      <button
                        onClick={() => handleDeleteSection(secIndex)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                        title="Delete Section"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Collapse/Expand toggle Button */}
                      <button
                        onClick={() => toggleSection(section.id)}
                        className={`p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all ${isExpanded ? 'rotate-180' : ''} cursor-pointer`}
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        <ChevronDown className="w-5 h-5" />
                      </button>

                      {/* Add Lesson/Topic Button */}
                      <button
                        onClick={() => {
                          handleAddLessonToSection(secIndex);
                          setExpandedSections(prev => ({ ...prev, [section.id]: true }));
                        }}
                        className="p-1.5 rounded-lg text-neutral-700 hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer"
                        title="Add Topic"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons List inside Section */}
                  {isExpanded && (
                    <div className="bg-white divide-y divide-neutral-100">
                      {section.lessons.length === 0 ? (
                        <p className="text-xs text-neutral-400 text-center py-6">কোনো টপিক বা লেসন নেই। প্লাস বাটন চেপে তৈরি করুন।</p>
                      ) : (
                        section.lessons.map((lesson, lesIndex) => {
                          const isCurrentEditing = editingLessonId === lesson.id;
                          return (
                            <div 
                              key={lesson.id} 
                              className={`flex flex-col transition-all duration-300 relative border-b last:border-0 border-neutral-100 ${
                                isCurrentEditing 
                                  ? 'bg-amber-50/20 border-l-[3px] border-l-orange-500 pl-4 pr-4 py-3' 
                                  : 'bg-white hover:bg-neutral-50/40 pl-4 pr-4 py-3'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {/* Radio Circle Indicator */}
                                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    isCurrentEditing ? 'border-orange-500 bg-orange-500/10' : 'border-neutral-300 bg-white'
                                  }`} />
                                  
                                  {/* Media Type Icon */}
                                  {lesson.type === 'video' ? (
                                    <Video className="w-4 h-4 text-neutral-500 shrink-0" />
                                  ) : lesson.type === 'quiz' ? (
                                    <HelpCircle className="w-4 h-4 text-neutral-500 shrink-0" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-neutral-500 shrink-0" />
                                  )}

                                  {/* Lesson Title */}
                                  <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 min-w-0">
                                    <span className="text-xs sm:text-sm font-bold text-neutral-800 leading-tight truncate">
                                      {lesson.title}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                  {/* Edit Lesson Button */}
                                  <button
                                    onClick={() => {
                                      if (isCurrentEditing) {
                                        setEditingLessonId(null);
                                      } else {
                                        setEditingLessonId(lesson.id);
                                        setLessonTempSerial((lesIndex + 1).toString());
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-neutral-500 hover:text-orange-600 hover:bg-orange-50 transition-all cursor-pointer"
                                    title="Edit Topic"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>

                                  {/* Delete Lesson Button */}
                                  <button
                                    onClick={() => handleDeleteLesson(secIndex, lesIndex)}
                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                                    title="Delete Topic"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Collapsible edit form */}
                              {isCurrentEditing && (
                                <div className="mt-4 p-4 md:p-5 bg-white border border-neutral-200/70 rounded-2xl space-y-4 shadow-xs animate-fadeIn">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Topic Title</label>
                                      <div className="flex gap-1.5">
                                        <div className="w-7 sm:w-8 shrink-0">
                                          <SerialInput 
                                            value={lessonTempSerial}
                                            onChange={(val) => handleReorderLesson(secIndex, lesIndex, val)}
                                            onSave={() => handleSaveLessonEdits(secIndex, lesIndex, lessonTempSerial)}
                                            max={section.lessons.length}
                                            className="w-full px-1 py-1 bg-white border border-orange-200 text-[10px] font-black rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-orange-700 text-center"
                                          />
                                        </div>
                                        <input
                                          type="text"
                                          value={lesson.title}
                                          onChange={(e) => handleUpdateLesson(secIndex, lesIndex, 'title', e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleSaveLessonEdits(secIndex, lesIndex, lessonTempSerial);
                                            }
                                          }}
                                          className="flex-1 px-3 py-2 bg-white border border-neutral-300 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-neutral-800"
                                          placeholder="Topic Title"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Class Note (PDF URL)</label>
                                      <input
                                        type="text"
                                        value={lesson.classNotePdfUrl || ''}
                                        onChange={(e) => handleUpdateLesson(secIndex, lesIndex, 'classNotePdfUrl', e.target.value)}
                                        className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-neutral-800"
                                        placeholder="https://example.com/note.pdf"
                                      />
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Topic Type</label>
                                      <select
                                        value={lesson.type}
                                        onChange={(e) => handleUpdateLesson(secIndex, lesIndex, 'type', e.target.value as any)}
                                        className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-neutral-800"
                                      >
                                        <option value="video">Video</option>
                                        <option value="quiz">Quiz</option>
                                        <option value="reading">Reading</option>
                                      </select>
                                    </div>

                                    {lesson.type === 'video' && (
                                      <div>
                                        <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Video URL (YouTube)</label>
                                        <input
                                          type="text"
                                          value={lesson.videoUrl || ''}
                                          onChange={(e) => handleUpdateLesson(secIndex, lesIndex, 'videoUrl', e.target.value)}
                                          className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-neutral-800"
                                          placeholder="https://www.youtube.com/watch?v=..."
                                        />
                                      </div>
                                    )}
                                  </div>

                                  {lesson.type === 'reading' && (
                                    <div>
                                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Reading Content (Markdown/Text)</label>
                                      <textarea
                                        value={lesson.content || ''}
                                        onChange={(e) => handleUpdateLesson(secIndex, lesIndex, 'content', e.target.value)}
                                        rows={5}
                                        className="w-full px-3 py-2 bg-white border border-neutral-300 text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-neutral-800"
                                        placeholder="Write reading content here..."
                                      />
                                    </div>
                                  )}

                                  {lesson.type === 'quiz' && (
                                    <div className="space-y-4 pt-2 border-t border-neutral-200">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-neutral-700">Quiz Questions ({lesson.quiz?.length || 0})</span>
                                        <button
                                          onClick={() => {
                                            const quizCopy = [...(lesson.quiz || [])];
                                            quizCopy.push({
                                              id: `q-${Date.now()}`,
                                              question: 'New Question',
                                              options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
                                              correctAnswer: 0
                                            });
                                            handleUpdateLesson(secIndex, lesIndex, 'quiz', quizCopy);
                                          }}
                                          className="px-2.5 py-1 text-[10px] font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors cursor-pointer"
                                        >
                                          Add Question
                                        </button>
                                      </div>

                                      {(lesson.quiz || []).map((q, qIndex) => (
                                        <div key={q.id} className="p-3 bg-white border border-neutral-200 rounded-lg space-y-3">
                                          <div className="flex items-start gap-2 justify-between">
                                            <span className="text-[10px] font-bold text-neutral-500 uppercase">Question {qIndex + 1}</span>
                                            <button
                                              onClick={() => {
                                                const quizCopy = [...(lesson.quiz || [])];
                                                quizCopy.splice(qIndex, 1);
                                                handleUpdateLesson(secIndex, lesIndex, 'quiz', quizCopy);
                                              }}
                                              className="text-red-500 hover:text-red-700 text-xs cursor-pointer"
                                            >
                                              Remove
                                            </button>
                                          </div>

                                          <input
                                            type="text"
                                            value={q.question}
                                            onChange={(e) => {
                                              const quizCopy = [...(lesson.quiz || [])];
                                              quizCopy[qIndex].question = e.target.value;
                                              handleUpdateLesson(secIndex, lesIndex, 'quiz', quizCopy);
                                            }}
                                            className="w-full px-3 py-1.5 bg-neutral-50 border border-neutral-200 text-xs font-medium rounded-lg text-neutral-800"
                                            placeholder="Question text"
                                          />

                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {q.options.map((opt, optIndex) => (
                                              <div key={optIndex} className="flex items-center gap-2">
                                                <input
                                                  type="radio"
                                                  name={`correct-${q.id}`}
                                                  checked={q.correctAnswer === optIndex}
                                                  onChange={() => {
                                                    const quizCopy = [...(lesson.quiz || [])];
                                                    quizCopy[qIndex].correctAnswer = optIndex;
                                                    handleUpdateLesson(secIndex, lesIndex, 'quiz', quizCopy);
                                                  }}
                                                  className="text-orange-600 focus:ring-orange-500"
                                                />
                                                <input
                                                  type="text"
                                                  value={opt}
                                                  onChange={(e) => {
                                                    const quizCopy = [...(lesson.quiz || [])];
                                                    quizCopy[qIndex].options[optIndex] = e.target.value;
                                                    handleUpdateLesson(secIndex, lesIndex, 'quiz', quizCopy);
                                                  }}
                                                  className="flex-1 px-2.5 py-1 bg-neutral-50 border border-neutral-200 text-xs font-medium rounded-lg text-neutral-800"
                                                  placeholder={`Option ${optIndex + 1}`}
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <div className="flex justify-end pt-4 border-t border-neutral-100">
                                    <button
                                      onClick={() => handleSaveLessonEdits(secIndex, lesIndex, lessonTempSerial)}
                                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      Save Topic
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex flex-col border-t border-neutral-100 pt-6 mt-4 gap-4">
            <button
              onClick={handleAddSyllabusSection}
              className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-dashed border-neutral-300 text-black hover:bg-neutral-50 rounded-xl transition-all font-semibold cursor-pointer text-sm w-full"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Add new section
            </button>

            <button
              onClick={handleSaveSyllabus}
              className="w-full px-6 py-3 text-sm font-black text-white bg-neutral-800 hover:bg-black rounded-xl transition-all shadow-sm cursor-pointer text-center"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {courseToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCourseToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl border border-neutral-100 shadow-2xl p-6 max-w-sm w-full space-y-6 text-center relative z-10 mx-auto"
            >
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                  Delete Course
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Are you sure you want to delete this course?
                </p>
                {courseToDelete.title && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100 inline-block">
                      {courseToDelete.title}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCourseToDelete(null)}
                  className="flex-1 py-3 text-sm font-semibold text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={confirmDeleteCourse}
                  className="flex-1 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECTION DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {sectionToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSectionToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl border border-neutral-100 shadow-2xl p-6 max-w-sm w-full space-y-6 text-center relative z-10 mx-auto"
            >
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                  Delete Section
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Are you sure you want to delete this section?
                </p>
                <div className="mt-2">
                  <p className="text-xs font-semibold text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100 inline-block truncate max-w-full">
                    {sectionToDelete.title}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSectionToDelete(null)}
                  className="flex-1 py-3 text-sm font-semibold text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={confirmDeleteSection}
                  className="flex-1 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LESSON/TOPIC DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {lessonToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLessonToDelete(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-white rounded-3xl border border-neutral-100 shadow-2xl p-6 max-w-sm w-full space-y-6 text-center relative z-10 mx-auto"
            >
              <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                  Delete Topic
                </h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Are you sure you want to delete this topic?
                </p>
                <div className="mt-2">
                  <p className="text-xs font-semibold text-neutral-700 bg-neutral-50 px-3 py-2 rounded-lg border border-neutral-100 inline-block truncate max-w-full">
                    {lessonToDelete.title}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setLessonToDelete(null)}
                  className="flex-1 py-3 text-sm font-semibold text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer"
                >
                  No
                </button>
                <button
                  onClick={confirmDeleteLesson}
                  className="flex-1 py-3 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COURSE DETAILS SECTION / COURSE INFO EDITOR */}
      {viewingCourseInfo && (
        <div className="bg-white rounded-3xl border border-neutral-100 shadow-md p-4 md:p-6 space-y-6 max-w-4xl animate-fadeIn">
          {/* Header */}
          <div className="relative flex items-center justify-center py-4 border-b border-neutral-100">
            <button
              onClick={() => setViewingCourseInfo(null)}
              className="absolute left-0 p-2.5 text-neutral-600 hover:text-neutral-900 bg-white hover:bg-neutral-50 rounded-full border border-neutral-200 shadow-xs cursor-pointer transition-all"
              title="ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-neutral-900 tracking-tight">
              Details section
            </h3>
          </div>

          {/* 1. YouTube Video Link Input Box - Compact */}
          <div className="space-y-2 bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-orange-600" />
              <h4 className="text-xs font-black text-neutral-800 uppercase tracking-wide">YouTube Video Link</h4>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={detailsPromoVideoUrl}
                onChange={(e) => setDetailsPromoVideoUrl(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 transition-all font-bold text-neutral-800 text-sm placeholder:text-neutral-400"
                placeholder="https://youtu.be/example"
              />
            </div>
          </div>

          {/* 2. Course Card Preview Box */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider pl-1">Course Preview</h4>
            <div className="border border-neutral-100 rounded-[24px] overflow-hidden bg-neutral-50/30 p-1">
              <CourseCard
                course={viewingCourseInfo}
                onSelect={() => {}}
                onEnroll={() => {}}
                enrollButtonLabel="Preview Mode"
              />
            </div>
          </div>

          {/* 3. Course Description Section - Clean & Large */}
          <div className="space-y-3 bg-white border border-neutral-100 p-5 rounded-[24px] shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 bg-orange-600 rounded-full"></span>
              <h2 className="text-sm font-black text-neutral-900 uppercase tracking-wide">About the course</h2>
            </div>
            
            <div className="relative group">
              <textarea
                value={detailsDescription}
                onChange={(e) => setDetailsDescription(e.target.value)}
                rows={10}
                className="w-full bg-neutral-50/30 border border-neutral-200 text-neutral-800 text-sm font-medium rounded-xl p-4 focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 leading-relaxed transition-all placeholder:text-neutral-400"
                placeholder="কোর্সের বিস্তারিত আলোচনা এখানে লিখুন..."
              />
            </div>
          </div>

          {/* Action Footer Button - Only Save */}
          <div className="pt-2">
            <button
              onClick={handleSaveCourseDetails}
              className="w-full py-4 text-sm font-black text-white bg-black hover:bg-neutral-800 rounded-2xl transition-all shadow-lg shadow-neutral-900/10 cursor-pointer text-center"
            >
              Save
            </button>
          </div>
        </div>
      )}
      
    </div>
  );
}
