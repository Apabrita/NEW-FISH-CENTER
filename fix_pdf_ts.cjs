const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

// 1. Give isolateWrapper padding
content = content.replace(
  'isolateWrapper.style.backgroundColor = "#ffffff";\n        isolateWrapper.appendChild(pageNode);',
  'isolateWrapper.style.backgroundColor = "#ffffff";\n        isolateWrapper.style.padding = "48px";\n        isolateWrapper.style.boxSizing = "border-box";\n        isolateWrapper.appendChild(pageNode);'
);

// 2. Take screenshot of isolateWrapper instead of pageNode
const oldToJpeg = `        const pageImgData = await toJpeg(pageNode, {
          quality: 1.0,
          backgroundColor: "#ffffff",
          pixelRatio: canvasScale,
          width: 794,
          height: pageNode.scrollHeight || pageNode.offsetHeight,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
            width: "794px",
            margin: "0",
          },
        });`;

const newToJpeg = `        const pageImgData = await toJpeg(isolateWrapper, {
          quality: 1.0,
          backgroundColor: "#ffffff",
          pixelRatio: canvasScale,
          width: 794,
          height: isolateWrapper.scrollHeight || isolateWrapper.offsetHeight,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
            width: "794px",
            margin: "0",
          },
        });`;

content = content.replace(oldToJpeg, newToJpeg);

fs.writeFileSync('src/utils/pdf.ts', content);
