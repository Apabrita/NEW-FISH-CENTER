const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// Add hasManuallyZoomed state
content = content.replace(
  'const [scaleFactor, setScaleFactor] = React.useState(1);',
  'const [scaleFactor, setScaleFactor] = React.useState(1);\n  const [hasManuallyZoomed, setHasManuallyZoomed] = React.useState(false);'
);

// updateScale logic
const oldUpdateScale = `    const updateScale = () => {
      const parent = document.getElementById("dashboard-preview-parent");
      if (!parent) {
        timer = setTimeout(updateScale, 50);
        return;
      }
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const isMobile = window.innerWidth < 768;

      const scaleX = (width - 32) / 794;
      const scaleY = (height - 32) / 1123;

      // On mobile, allow the user to pan around the PDF rather than shrinking it too small.
      if (isMobile) {
        setScaleFactor(Math.max(0.45, Math.min(1, scaleX)));
      } else {
        const newScale = Math.min(scaleX, scaleY);
        setScaleFactor(Math.max(0.15, Math.min(1, newScale)));
      }
    };`;

const newUpdateScale = `    const updateScale = () => {
      if (hasManuallyZoomed) return; // DON'T override user's fixed zoom preference
      const parent = document.getElementById("dashboard-preview-parent");
      if (!parent) {
        timer = setTimeout(updateScale, 50);
        return;
      }
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      const isMobile = window.innerWidth < 768;

      const scaleX = (width - 32) / 794;
      const scaleY = (height - 32) / 1123;

      if (isMobile) {
        setScaleFactor(Math.max(0.45, Math.min(1, scaleX)));
      } else {
        const newScale = Math.min(scaleX, scaleY);
        setScaleFactor(Math.max(0.15, Math.min(1, newScale)));
      }
    };`;

content = content.replace(oldUpdateScale, newUpdateScale);

// add to dependency array so it can see it
content = content.replace(
  '  }, [activePdfTab]);',
  '  }, [activePdfTab, hasManuallyZoomed]);'
);

// Zoom out button
content = content.replace(
  'onClick={() => setScaleFactor((prev) => Math.max(0.2, prev - 0.1))}',
  'onClick={() => { setScaleFactor((prev) => Math.max(0.2, prev - 0.1)); setHasManuallyZoomed(true); }}'
);

// Zoom in button
content = content.replace(
  'onClick={() => setScaleFactor((prev) => Math.min(2.0, prev + 0.1))}',
  'onClick={() => { setScaleFactor((prev) => Math.min(2.0, prev + 0.1)); setHasManuallyZoomed(true); }}'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
