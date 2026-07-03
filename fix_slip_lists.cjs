const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// For buyer slips
content = content.replace(
  /className="pl-2 pr-1 py-1 my-1 border-l-2 border-amber-200 flex-1 overflow-hidden flex flex-col"/g,
  'className="pl-2 pr-1 py-1 my-1 border-l-2 border-amber-200 flex-1 flex flex-col"'
);
content = content.replace(
  /className="flex-1 overflow-hidden min-h-0"/g,
  'className="flex-1"'
);

// For source slips
content = content.replace(
  /className="pl-2 pr-1 py-1 my-1 border-l-2 border-indigo-200 flex flex-col flex-1 overflow-hidden"/g,
  'className="pl-2 pr-1 py-1 my-1 border-l-2 border-indigo-200 flex flex-col flex-1"'
);

// Any other overflow-hidden that restricts height
// Let's replace flex-1 overflow-hidden min-h-0 globally just in case.

fs.writeFileSync('src/components/PdfExportView.tsx', content);
