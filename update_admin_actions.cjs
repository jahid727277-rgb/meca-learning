const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf-8');

const target = `          {/* Save & Cancel Actions */}
          <div className="flex items-center justify-between border-t border-neutral-100 pt-6 mt-4 gap-4">
            <button
              onClick={handleAddSyllabusSection}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-neutral-300 text-black hover:bg-neutral-50 rounded-xl transition-all font-semibold cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" />
              নতুন সেকশন যোগ করুন
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingSyllabusCourse(null);
                  setEditingSectionId(null);
                  setEditingLessonId(null);
                }}
                className="px-5 py-3 text-xs font-semibold text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-all cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleSaveSyllabus}
                className="px-6 py-3 text-xs font-black text-white bg-neutral-800 hover:bg-black rounded-xl transition-all shadow-sm cursor-pointer"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>`;

const replacement = `          {/* Actions */}
          <div className="flex flex-col border-t border-neutral-100 pt-6 mt-4 gap-4">
            <button
              onClick={handleAddSyllabusSection}
              className="flex items-center justify-center gap-2 px-5 py-3 border border-neutral-300 text-black hover:bg-neutral-50 rounded-xl transition-all font-semibold cursor-pointer text-sm w-full"
            >
              <Plus className="w-4 h-4" />
              Add new section
            </button>

            <button
              onClick={handleSaveSyllabus}
              className="w-full px-6 py-3 text-sm font-black text-white bg-neutral-800 hover:bg-black rounded-xl transition-all shadow-sm cursor-pointer text-center"
            >
              Save
            </button>
          </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/AdminPanel.tsx', content);
