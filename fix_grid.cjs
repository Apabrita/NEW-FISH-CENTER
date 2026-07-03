const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// For Buyer slip grid items:
content = content.replace(
  /className="border-2 border-dashed border-divider p-4 rounded-\[24px\] bg-zinc-50\/45 flex flex-col gap-2 relative overflow-hidden"/g,
  'className="border-2 border-dashed border-divider p-4 rounded-[24px] bg-zinc-50/45 flex flex-col gap-2 relative overflow-hidden min-w-0"'
);

// For Source slip grid items:
content = content.replace(
  /className="border-2 border-dashed border-indigo-300 p-4 rounded-\[24px\] bg-indigo-50\/20 flex flex-col gap-2 relative overflow-hidden"/g,
  'className="border-2 border-dashed border-indigo-300 p-4 rounded-[24px] bg-indigo-50/20 flex flex-col gap-2 relative overflow-hidden min-w-0"'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
