const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

const target = `            {!currentLesson && (
              <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs overflow-hidden">
                <div className="w-full aspect-[21/9] sm:aspect-video bg-neutral-900 relative">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover opacity-90" />
                </div>
                <div className="p-6 sm:p-8 space-y-4">
                  <h2 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">{course.title}</h2>
                  <p className="text-neutral-600 text-sm leading-relaxed">{course.description}</p>
                </div>
              </div>
            )}`;

const replacement = `            {!currentLesson && (
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-xs overflow-hidden">
                <div className="w-full aspect-video bg-neutral-100 relative">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>
              </div>
            )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/Classroom.tsx', content);
