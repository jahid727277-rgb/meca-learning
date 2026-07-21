const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">',
  '<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">'
);

content = content.replace(
  '<aside className="lg:col-span-4 bg-white p-5 rounded-3xl border border-neutral-100 shadow-xs space-y-5 h-fit lg:sticky lg:top-24">',
  '<aside className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-3xl border border-neutral-100 shadow-xs space-y-4 sm:space-y-5 h-fit lg:sticky lg:top-24">'
);

fs.writeFileSync('src/components/Classroom.tsx', content);
