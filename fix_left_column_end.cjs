const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');

content = content.replace(
  `            </div>
          </section>`,
  `            </div>
            )}
          </section>`
);

fs.writeFileSync('src/components/Classroom.tsx', content);
