const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

content = content.replace(
  'className={`border border-divider rounded-[16px] overflow-hidden shadow-sm mt-6 ${chunkIdx > 0 ? "print-page-wrapper" : ""}`}',
  'className={`border border-divider rounded-[16px] overflow-hidden shadow-sm mt-6 print-page-wrapper`}'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
