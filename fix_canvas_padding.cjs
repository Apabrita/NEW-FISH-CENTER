const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

content = content.replace(
  'id="print-sheet-canvas"\n              className="theme-light text-black bg-white font-sans select-text print:p-0 print:max-w-none print:w-full print:min-h-0 print:h-auto shadow-2xl rounded absolute top-0 left-0"',
  'id="print-sheet-canvas"\n              className="theme-light text-black bg-white font-sans select-text print:p-0 print:max-w-none print:w-full print:min-h-0 print:h-auto shadow-2xl rounded absolute top-0 left-0 pb-12"'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
