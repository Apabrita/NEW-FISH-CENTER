const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

content = content.replace(
  'className="grid grid-cols-2 lg:grid-cols-4 gap-4"',
  'className="grid grid-cols-4 gap-4"'
);

content = content.replace(
  'className="grid grid-cols-1 md:grid-cols-2 gap-6"',
  'className="grid grid-cols-2 gap-6"'
);

content = content.replace(
  'className="w-full text-left text-[10.5px] sm:text-[11px] whitespace-nowrap font-mono"',
  'className="w-full text-left text-[11px] whitespace-nowrap font-mono"'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
