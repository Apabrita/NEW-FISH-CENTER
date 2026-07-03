const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

content = content.replace(
  'const [scaleFactor, setScaleFactor] = React.useState(1);',
  `const [scaleFactor, setScaleFactor] = React.useState(1);
  
  React.useEffect(() => {
    // Auto scale to fit height if screen is small
    const vh = window.innerHeight;
    if (vh < 1200) {
      // 1123 is standard A4 height in pixels at 96 DPI
      setScaleFactor(Math.max(0.4, (vh - 200) / 1123));
    }
  }, []);`
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
