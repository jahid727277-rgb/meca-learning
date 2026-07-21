const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

const targetStr = `<div className="bg-white rounded-3xl border border-neutral-100 shadow-xs overflow-hidden">
              {/* VIDEO TYPE LESSON (TEXT CONTENT DESCRIPTION - REMOVED AS REQUESTED) */}`;

const replacementStr = `{(currentLesson?.type === 'reading' || currentLesson?.type === 'quiz') && (
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-xs overflow-hidden">
              {/* VIDEO TYPE LESSON (TEXT CONTENT DESCRIPTION - REMOVED AS REQUESTED) */}`;

content = content.replace(targetStr, replacementStr);

const endTarget = `                  </div>
                </div>
              )}
            </div>
          </section>`;

const endReplacement = `                  </div>
                </div>
              )}
            </div>
            )}
          </section>`;

content = content.replace(endTarget, endReplacement);

fs.writeFileSync('src/components/Classroom.tsx', content);
