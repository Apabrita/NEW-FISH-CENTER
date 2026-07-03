const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

content = content.replace(
  'const [scaleFactor, setScaleFactor] = React.useState(1);',
  `const [scaleFactor, setScaleFactor] = React.useState(1);
  const [canvasHeight, setCanvasHeight] = React.useState(1123);
  
  React.useEffect(() => {
    const el = document.getElementById("print-sheet-canvas");
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasHeight(entry.target.offsetHeight || 1123);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [activePdfTab, slipCategory, selectedAuctioneerFilter, selectedBuyerSlipFilter, selectedSourceSlipFilter]);`
);

content = content.replace(
  'height: `${ (document.getElementById("print-sheet-canvas")?.offsetHeight || 1123) * scaleFactor}px`,',
  'height: `${canvasHeight * scaleFactor}px`,'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
