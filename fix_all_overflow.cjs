const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// For line 614: Source Box
content = content.replace(
  /className="border border-divider rounded-\[16px\] overflow-hidden bg-white p-4"/g,
  'className="border border-divider rounded-[16px] bg-white p-4"'
);

// For line 2150: Source Ledger Debits
content = content.replace(
  /<div className="border border-divider rounded-\[16px\] overflow-hidden shadow-sm">/g,
  '<div className="border border-divider rounded-[16px] shadow-sm">'
);

// For line 2215: Detailed Trade Ledger empty
content = content.replace(
  /<div className="border border-divider rounded-\[16px\] overflow-hidden shadow-sm mt-6">/g,
  '<div className="border border-divider rounded-[16px] shadow-sm mt-6">'
);

// For line 2238: Detailed Trade Ledger chunks
content = content.replace(
  /className=\{`border border-divider rounded-\[16px\] overflow-hidden shadow-sm mt-6 print-page-wrapper`\}/g,
  'className={`border border-divider rounded-[16px] shadow-sm mt-6 print-page-wrapper`}'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
