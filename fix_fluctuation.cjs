const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// 1. Remove the first useEffect that unconditionally overrides scale
content = content.replace(
  `  React.useEffect(() => {\n    // Auto scale to fit height if screen is small\n    const vh = window.innerHeight;\n    if (vh < 1200) {\n      // 1123 is standard A4 height in pixels at 96 DPI\n      setScaleFactor(Math.max(0.4, (vh - 200) / 1123));\n    }\n  }, []);`,
  ``
);

// 2. Remove activePdfTab from updateScale dependency array so it doesn't trigger on tab change
content = content.replace(
  `  }, [activePdfTab, hasManuallyZoomed]);`,
  `  }, [hasManuallyZoomed]);`
);

// 3. Remove setScaleFactor(1) from Share PDF button
const shareBtnOld = `                // Temporarily reset scale to 1 for perfect high resolution capture
                const prevScale = scaleFactor;
                setScaleFactor(1);

                setTimeout(async () => {
                  try {
                    await shareAsPDF(
                      "print-sheet-canvas",
                      filename,
                      title,
                      text,
                      "share",
                    );
                  } finally {
                    setScaleFactor(prevScale);
                  }
                }, 250);`;

const shareBtnNew = `                await shareAsPDF(
                  "print-sheet-canvas",
                  filename,
                  title,
                  text,
                  "share",
                );`;

content = content.replace(shareBtnOld, shareBtnNew);

// 4. Remove setScaleFactor(1) from Download PDF button
const downloadBtnOld = `                const prevScale = scaleFactor;
                setScaleFactor(1.0); // force unscaled crisp font capturing
                const filename = \`NFC_\${activePdfTab.toUpperCase()}_\${appDate}.pdf\`;
                const title = \`New Fish Center - \${activePdfTab.toUpperCase()} - \${appDate}\`;
                const text = \`I am downloading the \${activePdfTab.toUpperCase()} ledger sheet from New Fish Center for \${appDate}.\`;

                setTimeout(async () => {
                  try {
                    await shareAsPDF(
                      "print-sheet-canvas",
                      filename,
                      title,
                      text,
                      "download",
                    );
                  } finally {
                    setScaleFactor(prevScale);
                  }
                }, 250);`;

const downloadBtnNew = `                const filename = \`NFC_\${activePdfTab.toUpperCase()}_\${appDate}.pdf\`;
                const title = \`New Fish Center - \${activePdfTab.toUpperCase()} - \${appDate}\`;
                const text = \`I am downloading the \${activePdfTab.toUpperCase()} ledger sheet from New Fish Center for \${appDate}.\`;

                await shareAsPDF(
                  "print-sheet-canvas",
                  filename,
                  title,
                  text,
                  "download",
                );`;

content = content.replace(downloadBtnOld, downloadBtnNew);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
