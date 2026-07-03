const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

// Replace the chunking logic to temporarily isolate the pageNode
const oldLogic = `      // Logic for explicitly chunked pages
      for (let i = 0; i < pageNodes.length; i++) {
        const pageNode = pageNodes[i];

        pageNode.style.height = "auto";
        pageNode.style.position = "relative";
        pageNode.style.backgroundColor = "#ffffff";

        const pageImgData = await toJpeg(pageNode, {
          quality: 1.0,
          backgroundColor: "#ffffff",
          pixelRatio: canvasScale,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
            margin: "0",
          },
        });`;

const newLogic = `      // Logic for explicitly chunked pages
      for (let i = 0; i < pageNodes.length; i++) {
        const pageNode = pageNodes[i];

        // Isolate the node at the top of the container to prevent html-to-image clipping bugs on scrolled/offset elements
        const parent = pageNode.parentNode;
        const nextSibling = pageNode.nextSibling;
        
        const isolateWrapper = document.createElement("div");
        isolateWrapper.style.position = "absolute";
        isolateWrapper.style.top = "0";
        isolateWrapper.style.left = "0";
        isolateWrapper.style.width = "794px";
        isolateWrapper.style.backgroundColor = "#ffffff";
        isolateWrapper.appendChild(pageNode);
        tempContainer.appendChild(isolateWrapper);

        pageNode.style.height = "auto";
        pageNode.style.position = "relative";
        pageNode.style.backgroundColor = "#ffffff";
        pageNode.style.margin = "0"; // reset margin

        // Wait a frame for layout
        await new Promise((r) => setTimeout(r, 50));

        const pageImgData = await toJpeg(pageNode, {
          quality: 1.0,
          backgroundColor: "#ffffff",
          pixelRatio: canvasScale,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
            margin: "0",
          },
        });
        
        // Restore
        isolateWrapper.removeChild(pageNode);
        tempContainer.removeChild(isolateWrapper);
        if (parent) {
          parent.insertBefore(pageNode, nextSibling);
        }`;

content = content.replace(oldLogic, newLogic);

fs.writeFileSync('src/utils/pdf.ts', content);
