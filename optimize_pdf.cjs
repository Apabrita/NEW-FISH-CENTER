const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

// 1. Change scale and add batch processing logic
content = content.replace(
  'const canvasScale = isMobile ? 1.5 : 2;',
  'const canvasScale = isMobile ? 1.0 : 1.25;' // drastically improves generation speed
);

// We need to rewrite the explicitly chunked pages loop
const oldLoopStart = `      // Logic for explicitly chunked pages
      for (let i = 0; i < pageNodes.length; i++) {`;

const newLoopStart = `      // Logic for explicitly chunked pages
      // PREPARE ALL WRAPPERS AT ONCE
      const wrappers = pageNodes.map((pageNode) => {
        const parent = pageNode.parentNode;
        const nextSibling = pageNode.nextSibling;
        
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
        
        return { pageNode, isolateWrapper, parent, nextSibling };
      });
      
      // Wait a frame for layout ONCE for all pages
      await new Promise((r) => setTimeout(r, 100));

      for (let i = 0; i < wrappers.length; i++) {
        const { pageNode, isolateWrapper, parent, nextSibling } = wrappers[i];`;

content = content.replace(oldLoopStart, newLoopStart);

// Remove the wrapper creation inside the loop
const oldWrapperCreation = `        const pageNode = pageNodes[i];
        // Isolate the node at the top of the container to prevent html-to-image clipping bugs on scrolled/offset elements
        const parent = pageNode.parentNode;
        const nextSibling = pageNode.nextSibling;
        
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
        pageNode.style.margin = "0"; // reset margin

        // Wait a frame for layout
        await new Promise((r) => setTimeout(r, 50));`;

content = content.replace(oldWrapperCreation, ``);

// Update quality in toJpeg
content = content.replace(
  'quality: 1.0,',
  'quality: 0.95,'
);

// We need to replace the second `quality: 1.0,` which is inside the legacy fallback
content = content.replace(
  'quality: 1.0,',
  'quality: 0.95,'
);

fs.writeFileSync('src/utils/pdf.ts', content);
