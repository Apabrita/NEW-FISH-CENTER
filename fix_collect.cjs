const fs = require('fs');
let content = fs.readFileSync('src/components/CollectPanel.tsx', 'utf8');

content = content.replace(/bg-sky-950\/30 border border-sky-900\/50 text-sky-400 hover:bg-sky-950\/60/g, 'bg-sky-500/10 border border-sky-500/20 text-sky-500 hover:bg-sky-500/20');
content = content.replace(/text-rose-400/g, 'text-rose-500');
content = content.replace(/text-amber-500/g, 'text-amber-500');
content = content.replace(/text-teal-400/g, 'text-teal-500');

fs.writeFileSync('src/components/CollectPanel.tsx', content);
