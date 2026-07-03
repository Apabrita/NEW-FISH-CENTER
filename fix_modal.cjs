const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl shadow-black\/50 glass-panel border border-divider text-main"\s*>\s*Midnight Rollover\s*<\/h3>/,
`className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl shadow-black/50 glass-panel border border-divider text-main"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-sky-500/20 p-2 rounded-full">
                    <Clock className="w-6 h-6 text-sky-400" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight font-sans">
                    Midnight Rollover
                  </h3>`
);

fs.writeFileSync('src/App.tsx', content);
