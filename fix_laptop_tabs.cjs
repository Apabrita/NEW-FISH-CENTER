const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Replace laptop tab buttons
content = content.replace(
  /className=\{`pb-3 px-3 text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 select-none \$\{([^}]+)\}`\}/,
  'className={`py-1.5 px-3 text-xs font-bold tracking-wider uppercase transition-all duration-150 cursor-pointer flex items-center gap-1.5 shrink-0 select-none rounded-lg ${activeTab === tab.id ? "bg-main text-app-bg shadow-sm scale-[1.02]" : "text-muted hover:text-main hover:bg-panel-hover"}`}'
);

fs.writeFileSync('src/App.tsx', content);
