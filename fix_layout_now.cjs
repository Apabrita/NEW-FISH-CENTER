const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// Replace the preview parent
content = content.replace(
  /id="dashboard-preview-parent"\s+className="flex-grow overflow-auto bg-panel-dark\/80 p-4 md:p-8 print:bg-transparent print:p-0 print:overflow-visible"/m,
  'id="dashboard-preview-parent"\n          className="flex-grow overflow-auto bg-panel-dark/80 p-4 md:p-8 print:bg-transparent print:p-0 print:overflow-visible flex flex-col items-center"'
);

// Replace the inner wrapper and canvasHeight reference
const regex = /<div\s+className="shrink-0 transition-transform duration-100 print-scale-wrapper block mx-auto text-left"\s+style=\{\{\s+width: `\$\{794 \* scaleFactor\}px`,\s+height: `\$\{\(document\.getElementById\("print-sheet-canvas"\)\?\.offsetHeight \|\| 1123\) \* scaleFactor\}px`,\s+overflow: "visible",\s+\}\}\s+>\s+<div\s+id="print-sheet-canvas"\s+className="theme-light text-black bg-white font-sans select-text shrink-0 print:p-0 print:max-w-none print:w-full print:min-h-0 print:h-auto shadow-2xl rounded"\s+style=\{\{\s+width: "794px",\s+transform: `scale\(\$\{scaleFactor\}\)`,\s+transformOrigin: "top left",/gm;

const replaceWith = `<div
            className="shrink-0 transition-transform duration-100 print-scale-wrapper text-left relative"
            style={{
              width: \`\$\{794 * scaleFactor\}px\`,
              height: \`\$\{canvasHeight * scaleFactor\}px\`,
              overflow: "visible",
            }}
          >
            <div
              id="print-sheet-canvas"
              className="theme-light text-black bg-white font-sans select-text print:p-0 print:max-w-none print:w-full print:min-h-0 print:h-auto shadow-2xl rounded absolute top-0 left-0"
              style={{
                width: "794px",
                transform: \`scale(\$\{scaleFactor\})\`,
                transformOrigin: "top left",`;

content = content.replace(regex, replaceWith);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
