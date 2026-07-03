const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Smartphone container
content = content.replace(/className=\{`w-full max-w-\[460px\] h-\[100dvh\] sm:h-\[820px\] sm:min-h-0 sm:max-h-\[860px\] sm:rounded-\[40px\] sm:ring-\[14px\] sm:ring-slate-950 sm:border-\[4px\] sm:border-none flex flex-col justify-between shadow-2xl shadow-black\/50 relative overflow-hidden print:max-w-none print:h-auto print:max-h-none print:min-h-0 print:ring-0 print:border-none print:rounded-none print:shadow-none print:overflow-visible transition-colors duration-200 \$\{[\s\S]*?\}`\}/, 'className="w-full max-w-[460px] h-[100dvh] sm:h-[820px] sm:min-h-0 sm:max-h-[860px] sm:rounded-[40px] sm:ring-[14px] sm:ring-slate-950 sm:border-[4px] sm:border-none flex flex-col justify-between shadow-2xl shadow-black/50 relative overflow-hidden print:max-w-none print:h-auto print:max-h-none print:min-h-0 print:ring-0 print:border-none print:rounded-none print:shadow-none print:overflow-visible transition-colors duration-200 glass-panel text-main"');

// Mobile App Header
content = content.replace(/className=\{`border-b px-3\.5 py-1\.5 flex justify-between items-center z-45 shrink-0 select-none transition-colors duration-150 \$\{[\s\S]*?\}`\}/, 'className="border-b px-3.5 py-1.5 flex justify-between items-center z-45 shrink-0 select-none transition-colors duration-150 glass-panel border-divider"');

// New Fish Center in mobile header
content = content.replace(/className=\{`rounded-xl px-2\.5 py-1 shadow-sm border font-sans select-none \$\{[\s\S]*?\}`\}/, 'className="rounded-xl px-2.5 py-1 shadow-sm border font-sans select-none glass-panel border-divider text-main"');

// System Gate text
content = content.replace(/activeTheme === "light" \? "text-faint" : "text-main"/g, '"text-main"');

// Date Picker border
content = content.replace(/className=\{`flex items-center pl-2\.5 border-l \$\{[\s\S]*?\}`\}/, 'className="flex items-center pl-2.5 border-l border-divider"');

// Date Picker input
content = content.replace(/className=\{`text-\[9\.5px\] font-bold font-mono bg-transparent outline-none cursor-pointer focus:ring-0 \$\{[\s\S]*?\}`\}/, 'className="text-[9.5px] font-bold font-mono bg-transparent outline-none cursor-pointer focus:ring-0 text-main hover:text-sky-500"');

// Active theme checks that we might have missed
content = content.replace(/activeTheme === "light"/g, "false /* removed activeTheme check */");

fs.writeFileSync('src/App.tsx', content);
