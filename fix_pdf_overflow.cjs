const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

content = content.replace(
  /className="print-page-wrapper bg-white shadow-xl w-\[794px\] h-\[1123px\] max-h-\[1123px\] shrink-0 box-border p-\[48px\] rounded-\[12px\] flex flex-col mx-auto overflow-hidden"/g,
  'className="print-page-wrapper bg-white shadow-xl w-[794px] min-h-[1123px] shrink-0 box-border p-[48px] rounded-[12px] flex flex-col mx-auto relative"'
);

// Fix the typescript error
content = content.replace(
  'setCanvasHeight(entry.target.offsetHeight || 1123);',
  'setCanvasHeight((entry.target as HTMLElement).offsetHeight || 1123);'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
