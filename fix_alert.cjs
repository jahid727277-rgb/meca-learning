const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

// Add state
content = content.replace(
  '  const [quizScore, setQuizScore] = useState<number | null>(null);',
  '  const [quizScore, setQuizScore] = useState<number | null>(null);\n  const [showPdfAlert, setShowPdfAlert] = useState(false);'
);

// Replace alert
content = content.replace(
  /onClick=\{\(\) => alert\("There is no PDF available for this class\."\)\}/g,
  'onClick={() => setShowPdfAlert(true)}'
);

// Add the modal at the end before closing div
const modalStr = `
      {/* PDF Alert Modal */}
      <AnimatePresence>
        {showPdfAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowPdfAlert(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl border border-neutral-100 max-w-sm w-full p-6 relative z-10"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-neutral-900">PDF Not Available</h3>
                <p className="text-sm text-neutral-500 font-medium">
                  There is no PDF available for this class.
                </p>
                <button
                  onClick={() => setShowPdfAlert(false)}
                  className="mt-4 w-full px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}`;

content = content.replace(
  /    <\/div>\s*  \);\s*\}/,
  modalStr
);

fs.writeFileSync('src/components/Classroom.tsx', content);
