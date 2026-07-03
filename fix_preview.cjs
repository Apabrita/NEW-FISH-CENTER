const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

content = content.replace(/transformOrigin: "top center",/, 'transformOrigin: "top left",');
content = content.replace(/transformOrigin: "top left",/g, 'transformOrigin: "top left",'); // Ensure it's there
content = content.replace(/width: scaleFactor < 1 \? `\$\{794 \* scaleFactor\}px` : "794px",/, 'width: `${794 * scaleFactor}px`,');
content = content.replace(/minHeight: scaleFactor < 1 \? `\$\{1123 \* scaleFactor\}px` : "1123px",/, 'minHeight: `${1123 * scaleFactor}px`,');
content = content.replace(/id="print-sheet-canvas"\s*className="text-main font-sans select-text shrink-0 print:p-0 print:max-w-none print:w-full print:min-h-0 print:h-auto"\s*style=\{\{/,
`id="print-sheet-canvas"
              className="text-black bg-white font-sans select-text shrink-0 print:p-0 print:max-w-none print:w-full print:min-h-0 print:h-auto shadow-2xl rounded"
              style={{`);

// Ensure text-black bg-white is used for PDF preview so it looks like paper.
// We should check if we already had a white background.

fs.writeFileSync('src/components/PdfExportView.tsx', content);
