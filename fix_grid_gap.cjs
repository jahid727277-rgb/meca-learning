const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

content = content.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">',
  '<div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">'
);

fs.writeFileSync('src/components/Classroom.tsx', content);
