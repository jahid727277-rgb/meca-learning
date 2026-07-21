const fs = require('fs');
let content = fs.readFileSync('src/components/Classroom.tsx', 'utf-8');
content = content.replace(
`                          </div>
                        </div>
                      );
                    })}
                  </div>`,
`                          </div>
                        </div>
                      );
                    })}
                  </div>`
);
// let's do this safely with an exact target and exact replacement
