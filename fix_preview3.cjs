const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// The safest way to allow scrolling in both directions for a centered oversized element is:
// Parent: display: flex; justify-content: center; overflow: auto;
// Child: margin: auto;
content = content.replace(
  'className="flex-grow overflow-auto bg-panel-dark/80 p-4 md:p-8 print:bg-transparent print:p-0 print:overflow-visible text-center"',
  'className="flex-grow overflow-auto bg-panel-dark/80 p-4 md:p-8 flex justify-center items-start print:bg-transparent print:p-0 print:overflow-visible"'
);

// We need to make sure the child does not get clipped on the left if it grows too large.
// If we use justify-center, it clips left.
// If we don't use justify center, we can use margin-left: auto, margin-right: auto on child if it's smaller, but what if it's bigger?
// The trick is: flex, NO justify center. Child has margin: auto.
content = content.replace(
  'className="flex-grow overflow-auto bg-panel-dark/80 p-4 md:p-8 flex justify-center items-start print:bg-transparent print:p-0 print:overflow-visible"',
  'className="flex-grow overflow-auto bg-panel-dark/80 p-4 md:p-8 print:bg-transparent print:p-0 print:overflow-visible"'
);

content = content.replace(
  'className="shrink-0 transition-transform duration-100 print-scale-wrapper inline-block text-left"',
  'className="shrink-0 transition-transform duration-100 print-scale-wrapper block mx-auto text-left"'
);

// Wait, block mx-auto doesn't clip left! It pushes content down and left but LTR respects left bounds and it's scrollable.
fs.writeFileSync('src/components/PdfExportView.tsx', content);
