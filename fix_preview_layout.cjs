const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// Replace the parent wrapper
content = content.replace(
  /width: `\$\{794 \* scaleFactor\}px`,([\s\S]*?)minHeight: `\$\{1123 \* scaleFactor\}px`,/m,
  'width: `${794 * scaleFactor}px`,\n              height: `${(document.getElementById("print-sheet-canvas")?.offsetHeight || 1123) * scaleFactor}px`,'
);

// We need the height to be dynamic based on the actual height of the canvas, not hardcoded to 1123, 
// because if the content is longer, it will get cut off!
// Wait, `boxHeights` or similar could be used.
// Or we just calculate it.

// Let's replace the whole scrollable area:
const oldDiv = `<div
            className="shrink-0 transition-transform duration-100 print-scale-wrapper block mx-auto text-left"
            style={{
              width: \`\$\{794 * scaleFactor\}px\`,
              minHeight: \`\$\{1123 * scaleFactor\}px\`,
              overflow: "visible",
            }}
          >
            <div
              id="print-sheet-canvas"
              className="theme-light text-black bg-white font-sans select-text shrink-0 print:p-0 print:max-w-none print:w-full print:min-h-0 print:h-auto shadow-2xl rounded"
              style={{
                width: "794px",
                transform: \`scale(\$\{scaleFactor\})\`,
                transformOrigin: "top left",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >`;

const newDiv = `<div
            className="shrink-0 transition-transform duration-100 print-scale-wrapper block mx-auto text-left relative"
            style={{
              width: \`\$\{794 * scaleFactor\}px\`,
              height: \`\$\{ (document.getElementById("print-sheet-canvas")?.offsetHeight || 1123) * scaleFactor\}px\`,
              overflow: "visible",
            }}
          >
            <div
              id="print-sheet-canvas"
              className="theme-light text-black bg-white font-sans select-text print:p-0 print:max-w-none print:w-full print:min-h-0 print:h-auto shadow-2xl rounded absolute top-0 left-0"
              style={{
                width: "794px",
                transform: \`scale(\$\{scaleFactor\})\`,
                transformOrigin: "top left",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >`;

content = content.replace(oldDiv, newDiv);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
