const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The main col-span-8 container
content = content.replace(/className=\{`lg:col-span-8 border rounded-3xl p-5 md:p-6 shadow-2xl shadow-black\/50 shadow-black\/10 space-y-6 min-h-\[600px\] flex flex-col justify-between transition-colors duration-200 \$\{[\s\S]*?\}`\}/, 'className="lg:col-span-8 rounded-3xl p-5 md:p-6 shadow-2xl shadow-black/50 shadow-black/10 space-y-6 min-h-[600px] flex flex-col justify-between transition-colors duration-200 glass-panel border border-divider text-main"');

// The viewport switch container
content = content.replace(/className=\{`flex p-1 rounded-3xl border \$\{[\s\S]*?\}`\}/, 'className="flex p-1 rounded-3xl border border-divider glass-panel text-main"');

// Viewport buttons
content = content.replace(/activeTheme === "light"\s*\?\s*"text-main hover:text-white"\s*:\s*"text-muted hover:text-main"/g, '"text-muted hover:text-main"');

// Android viewport wrapper
content = content.replace(/className=\{`w-full max-w-sm aspect-\[9\/19\.5\] rounded-\[44px\] overflow-hidden relative shadow-2xl flex flex-col transition-all duration-300 transform font-sans border-\[6px\] \$\{[\s\S]*?\}`\}/, 'className="w-full max-w-sm aspect-[9/19.5] rounded-[44px] overflow-hidden relative shadow-2xl flex flex-col transition-all duration-300 transform font-sans border-[6px] border-divider glass-panel text-main"');

fs.writeFileSync('src/App.tsx', content);
