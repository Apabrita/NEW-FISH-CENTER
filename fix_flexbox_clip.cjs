const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// Remove items-center
content = content.replace(
  'className="flex-grow overflow-auto bg-panel-dark/80 p-4 md:p-8 print:bg-transparent print:p-0 print:overflow-visible flex flex-col items-center"',
  'className="flex-grow overflow-auto bg-panel-dark/80 p-4 md:p-8 print:bg-transparent print:p-0 print:overflow-visible flex flex-col"'
);

// Remove mx-auto from child
content = content.replace(
  'className="shrink-0 transition-transform duration-100 print-scale-wrapper text-left relative mx-auto overflow-visible"',
  'className="shrink-0 transition-transform duration-100 print-scale-wrapper text-left relative overflow-visible"'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
