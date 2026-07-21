const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

const toolbarRegex = /\{\/\* INTEGRATED CONTROL TOOLBAR \*\/\}\s*<div className="flex items-center justify-between bg-white px-5 py-4 border-t border-neutral-100">\s*\{\/\* Left Side: Back Arrow Button \*\/\}\s*<button\s*onClick=\{onBack\}\s*className="p-2\.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-orange-600 transition-colors cursor-pointer border border-neutral-100"\s*title="Back"\s*>\s*<ArrowLeft className="w-5 h-5" \/>\s*<\/button>\s*\{\/\* Right Side: Class Notes Button Only \*\/\}\s*<div className="flex items-center gap-2">\s*\{currentLesson\.classNotePdfUrl \? \(\s*<a\s*href=\{currentLesson\.classNotePdfUrl\}\s*target="_blank"\s*rel="noopener noreferrer"\s*className="flex items-center gap-1\.5 px-4 py-2\.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"\s*>\s*<FileText className="w-4 h-4 text-orange-500" \/>\s*<span>Class PDF<\/span>\s*<\/a>\s*\) : \(\s*<button\s*onClick=\{([^}]*)\}\s*className="flex items-center gap-1\.5 px-4 py-2\.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"\s*>\s*<FileText className="w-4 h-4 text-neutral-400" \/>\s*<span>Class PDF<\/span>\s*<\/button>\s*\)\}\s*<\/div>\s*<\/div>/;

const match = content.match(toolbarRegex);
if(match) {
    // Remove it from Left Column
    content = content.replace(toolbarRegex, '');
    
    // Add it to Right Column, along with the Course Title
    const rightColRegex = /(<aside className="lg:col-span-4 bg-white p-5 rounded-3xl border border-neutral-100 shadow-xs space-y-5 h-fit lg:sticky lg:top-24">)/;
    
    const replacementRightCol = `$1\n            {/* Actions & Course Title */}\n            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">\n              <button\n                onClick={onBack}\n                className="p-2.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-orange-600 transition-colors cursor-pointer border border-neutral-200"\n                title="Back"\n              >\n                <ArrowLeft className="w-5 h-5" />\n              </button>\n              <div className="flex items-center gap-2">\n                {currentLesson?.classNotePdfUrl ? (\n                  <a\n                    href={currentLesson.classNotePdfUrl}\n                    target="_blank"\n                    rel="noopener noreferrer"\n                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"\n                  >\n                    <FileText className="w-4 h-4 text-orange-500" />\n                    <span>Class PDF</span>\n                  </a>\n                ) : (\n                  <button\n                    onClick={() => alert("There is no PDF available for this class.")}\n                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-bold transition-all cursor-pointer"\n                  >\n                    <FileText className="w-4 h-4 text-neutral-400" />\n                    <span>Class PDF</span>\n                  </button>\n                )}\n              </div>\n            </div>\n            <div>\n              <h2 className="text-xl font-bold text-neutral-800 leading-tight">{course.title}</h2>\n            </div>`;
    content = content.replace(rightColRegex, replacementRightCol);

    content = content.replace(
      "{currentLesson.type === 'quiz' && (",
      "{currentLesson?.type === 'quiz' && ("
    );
    
    // Also we need to fix the currentLesson.id === les.id
    content = content.replace(
      "const isSelected = currentLesson.id === les.id;",
      "const isSelected = currentLesson?.id === les.id;"
    );

    fs.writeFileSync('src/components/Classroom.tsx', content);
    console.log("Success");
} else {
    console.log("Toolbar not found");
}
