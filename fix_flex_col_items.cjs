const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// The parent
content = content.replace(
  'className="flex-grow overflow-auto bg-panel-dark/80 p-4 md:p-8 print:bg-transparent print:p-0 print:overflow-visible text-center whitespace-nowrap"',
  'className="flex-grow overflow-auto bg-panel-dark/80 p-4 md:p-8 print:bg-transparent print:p-0 print:overflow-visible flex flex-col items-center"'
);

// The child
content = content.replace(
  'className="shrink-0 transition-transform duration-100 print-scale-wrapper text-left relative inline-block whitespace-normal align-top"',
  'className="shrink-0 transition-transform duration-100 print-scale-wrapper text-left relative mx-auto overflow-visible"'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
