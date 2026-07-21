const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

content = content.replace(
  'className="flex items-center justify-center gap-2 px-5 py-3 border border-neutral-300 text-black hover:bg-neutral-50 rounded-xl transition-all font-semibold cursor-pointer text-sm w-full"',
  'className="flex items-center justify-center gap-2 px-5 py-3 border-2 border-dashed border-neutral-300 text-black hover:bg-neutral-50 rounded-xl transition-all font-semibold cursor-pointer text-sm w-full"'
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
