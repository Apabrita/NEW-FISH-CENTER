const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// 1. Give print-sheet-canvas the padding it deserves!
content = content.replace(
  'id="print-sheet-canvas"\n              className="theme-light text-black bg-white font-sans select-text print:p-0 print:max-w-none print:w-full print:min-h-0 print:h-auto shadow-2xl rounded absolute top-0 left-0 pb-12"',
  'id="print-sheet-canvas"\n              className="theme-light text-black bg-white font-sans select-text print:p-0 print:max-w-none print:w-full print:min-h-0 print:h-auto shadow-2xl rounded absolute top-0 left-0 p-[48px] box-border"'
);

// 2. Remove hardcoded width and padding from print-page-wrapper
const oldClasses = [
  'className="print-page-wrapper bg-white shadow-xl w-[794px] min-h-[1123px] box-border p-[48px] mx-auto rounded-[12px]"',
  'className="print-page-wrapper bg-white shadow-xl w-[794px] min-h-[1123px] box-border p-[48px] mx-auto rounded-[12px] mt-4"',
  'className="print-page-wrapper bg-white shadow-xl w-[794px] min-h-[1123px] shrink-0 box-border p-[48px] rounded-[12px] flex flex-col mx-auto relative"'
];
const newClasses = [
  'className="print-page-wrapper w-full min-h-[1027px] box-border"',
  'className="print-page-wrapper w-full min-h-[1027px] box-border mt-4"',
  'className="print-page-wrapper w-full min-h-[1027px] shrink-0 box-border flex flex-col relative"'
];

for (let i = 0; i < oldClasses.length; i++) {
  content = content.replaceAll(oldClasses[i], newClasses[i]);
}

fs.writeFileSync('src/components/PdfExportView.tsx', content);
