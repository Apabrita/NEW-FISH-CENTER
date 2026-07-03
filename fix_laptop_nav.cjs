const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// We have another nav that has:
// className="bg-panel-hover border-b border-divider flex overflow-x-auto whitespace-nowrap custom-scrollbar py-2 px-3.5 z-40 shrink-0 select-none gap-4"
// Let's replace it with a cleaner one:
content = content.replace(
  'className="flex border-b border-none custom-scrollbar overflow-x-auto gap-1"',
  'className="flex custom-scrollbar overflow-x-auto gap-1 bg-panel-dark p-1 rounded-xl shadow-inner"'
);

// Laptop nav item class
// `isSelected ? "bg-white text-zinc-900 shadow-sm font-bold scale-[1.02]" : "text-muted hover:bg-zinc-100 hover:text-main"`
// Or something like that.
content = content.replace(
  /\? "bg-white text-zinc-900 shadow-sm font-bold scale-\[1\.02\]"\s*:\s*"text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"/g,
  '? "bg-panel text-main shadow-sm font-bold rounded-lg scale-[1.02]" : "text-muted hover:bg-panel-hover hover:text-main rounded-lg"'
);
content = content.replace(
  /\? "bg-panel-hover text-main shadow-sm font-bold scale-\[1\.02\]"\s*:\s*"text-faint hover:bg-panel-hover hover:text-main"/g,
  '? "bg-panel text-main shadow-sm font-bold rounded-lg scale-[1.02]" : "text-muted hover:bg-panel-hover hover:text-main rounded-lg"'
);

fs.writeFileSync('src/App.tsx', content);
