const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

content = content.replace(
  /className="grid grid-cols-2 gap-3 divide-x divide-zinc-200 shrink-0"/g,
  'className="grid grid-cols-2 gap-3 shrink-0"'
);

// We can add border-r to the first child manually.
content = content.replace(
  /<div className="space-y-1 pr-1\.5">/g,
  '<div className="space-y-1 pr-1.5 border-r border-zinc-200">'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
