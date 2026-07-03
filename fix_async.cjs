const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

content = content.replace(
  'onClick={() => {\n                const filename = `NFC_${activePdfTab.toUpperCase()}_${appDate}.pdf`;',
  'onClick={async () => {\n                const filename = `NFC_${activePdfTab.toUpperCase()}_${appDate}.pdf`;'
);

content = content.replace(
  'onClick={() => {\n                const title = `New Fish Center - ${activePdfTab.toUpperCase()} - ${appDate}`;',
  'onClick={async () => {\n                const title = `New Fish Center - ${activePdfTab.toUpperCase()} - ${appDate}`;'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
