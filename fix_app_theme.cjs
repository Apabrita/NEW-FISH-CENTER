const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Header
content = content.replace(/className=\{`border-b.*?\{[\s\S]*?\}`\}/, 'className="border-b border-divider flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-6 md:px-12 sticky top-0 z-50 shadow-sm glass-panel text-main transition-all duration-200"');
content = content.replace(/className=\{`rounded-xl px-3 py-1 border font-sans select-none \$\{[\s\S]*?\}`\}/, 'className="rounded-xl px-3 py-1 border border-divider font-sans select-none glass-panel text-main shadow-sm"');
content = content.replace(/className=\{`text-\[8px\] tracking-widest uppercase px-1\.5 py-0\.5 rounded-full font-mono font-bold \$\{[\s\S]*?\}`\}/, 'className="text-[8px] tracking-widest uppercase px-1.5 py-0.5 rounded-full font-mono font-bold bg-panel-hover text-muted"');

// Navigation
content = content.replace(/className=\{`px-2 py-1\.5 flex items-center gap-2 overflow-x-auto custom-scrollbar shadow-inner z-\[100\] print:hidden shrink-0 transition-colors \$\{[\s\S]*?\}`\}/, 'className="px-2 py-1.5 flex items-center gap-2 overflow-x-auto custom-scrollbar shadow-inner z-[100] print:hidden shrink-0 transition-colors glass-panel text-main"');

// Auth Modal
content = content.replace(/className=\{`w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl shadow-black\/50 \$\{[\s\S]*?\}`\}/, 'className="w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl shadow-black/50 glass-panel border border-divider text-main"');
content = content.replace(/className=\{`w-full max-w-md overflow-hidden rounded-3xl shadow-2xl shadow-black\/50 \$\{[\s\S]*?\}`\}/, 'className="w-full max-w-md overflow-hidden rounded-3xl shadow-2xl shadow-black/50 glass-panel border border-divider text-main"');

fs.writeFileSync('src/App.tsx', content);
