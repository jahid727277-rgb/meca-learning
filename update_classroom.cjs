const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

content = content.replace(
  'const [currentLesson, setCurrentLesson] = useState<Lesson>(initialLesson);',
  'const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);'
);

content = content.replace(
  'if (!currentLesson.quiz) return;',
  'if (!currentLesson?.quiz) return;'
);

content = content.replace(
  'currentLesson.quiz.forEach',
  'currentLesson?.quiz.forEach'
);

content = content.replace(
  'currentLesson.quiz.length',
  'currentLesson?.quiz.length'
);

// Replace the cinematic player area
const cinematicRegex = /\{\/\* Cinematic Global Video Player Area \(Full Width under Navbar\) \*\/\}\s*\{currentLesson\.type === 'video' && \([\s\S]*?\}\)\}\s*<\/div>\s*\}\)\}\s*<div className="mx-auto max-w-7xl/m;
content = content.replace(cinematicRegex, (match) => {
    // wait, that regex might not be right. Let's do it simply by reading the file and slicing.
    return match;
});

fs.writeFileSync('src/components/Classroom.tsx', content);
