const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

// Replace canvasScale
content = content.replace(
  'const canvasScale = isMobile ? 1.0 : 1.25;',
  'const canvasScale = isMobile ? 1.5 : 2; // Increased for top-notch quality'
);

// Replace the explicitly chunked pages loop
const oldLoopStart = `      // Logic for explicitly chunked pages
      // PREPARE ALL WRAPPERS AT ONCE
      const wrappers = pageNodes.map((pageNode) => {`;

const oldLoopEnd = `        globalPageNum++;
      }
      }`;

const newLoop = `      // Logic for explicitly chunked pages
      // Process in small batches (virtualized chunking) to improve performance and prevent memory limits on large reports
      const batchSize = 2;
      for (let i = 0; i < pageNodes.length; i += batchSize) {
        const batchNodes = pageNodes.slice(i, i + batchSize);
        
        // Prepare batch DOM
        const batchWrappers = batchNodes.map((pageNode) => {
          const isolateWrapper = document.createElement("div");
          isolateWrapper.style.position = "absolute";
          isolateWrapper.style.top = "0";
          isolateWrapper.style.left = "0";
          isolateWrapper.style.width = "794px";
          isolateWrapper.style.backgroundColor = "#ffffff";
          isolateWrapper.style.padding = "48px";
          isolateWrapper.style.boxSizing = "border-box";
          isolateWrapper.appendChild(pageNode);
          tempContainer.appendChild(isolateWrapper);
          
          pageNode.style.height = "auto";
          pageNode.style.position = "relative";
          pageNode.style.backgroundColor = "#ffffff";
          pageNode.style.margin = "0";
          
          return { pageNode, isolateWrapper };
        });

        // Wait for layout
        await new Promise((r) => setTimeout(r, 60));

        const results = await Promise.all(
          batchWrappers.map(w => 
            toJpeg(w.isolateWrapper, {
              quality: 1.0,
              backgroundColor: "#ffffff",
              pixelRatio: canvasScale,
              width: 794,
              height: w.isolateWrapper.scrollHeight || w.isolateWrapper.offsetHeight,
              style: {
                transform: "scale(1)",
                transformOrigin: "top left",
                width: "794px",
                margin: "0",
              },
            })
          )
        );

        for (let j = 0; j < batchWrappers.length; j++) {
          const { pageNode, isolateWrapper } = batchWrappers[j];
          const pageImgData = results[j];
          
          // Cleanup
          isolateWrapper.removeChild(pageNode);
          tempContainer.removeChild(isolateWrapper);
          // We do not need to restore to original parent because tempContainer is discarded anyway.

          // Add a new page if it's not the very first page of the document
          if ((i + j) > 0 || globalPageNum > 1) {
            if ((i + j) > 0) pdf.addPage();
          }

          const imgProps = pdf.getImageProperties(pageImgData);
          let fitHeight = (imgProps.height * pdfWidth) / imgProps.width;
          let fitWidth = pdfWidth;

          // Smart fit
          if (fitHeight > usableHeight) {
            const ratio = usableHeight / fitHeight;
            fitHeight = usableHeight;
            fitWidth = pdfWidth * ratio;
          }

          const xOffset = (pdfWidth - fitWidth) / 2;
          pdf.addImage(
            pageImgData,
            "JPEG",
            xOffset,
            topMargin,
            fitWidth,
            fitHeight,
          );
          
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(\`Page \${globalPageNum}\`, pdfWidth / 2, pdfPageHeight - 5, {
            align: "center",
          });
          globalPageNum++;
        }
      }`;

content = content.replace(
  content.substring(content.indexOf(oldLoopStart), content.indexOf(oldLoopEnd) + oldLoopEnd.length),
  newLoop
);

// Update legacy fallback quality
content = content.replace(
  'quality: 0.95,',
  'quality: 1.0,'
);

fs.writeFileSync('src/utils/pdf.ts', content);
