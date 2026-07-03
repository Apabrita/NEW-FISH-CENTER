const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

// Strip all absolute/transform properties from the clone to make it a standard block element
// Also set explicit width in toJpeg options
content = content.replace(
  'clone.style.setProperty("transform", "none", "important");',
  `clone.style.setProperty("transform", "none", "important");
  clone.style.setProperty("left", "0", "important");
  clone.style.setProperty("top", "0", "important");
  clone.style.setProperty("position", "relative", "important");
  clone.classList.remove("absolute");
  clone.classList.remove("top-0");
  clone.classList.remove("left-0");
  clone.classList.remove("shadow-2xl");`
);

// We need to pass the explicit width/height to toJpeg so it doesn't try to guess from the viewport
// for the legacy fallback.
const oldLegacy = `      const imgDataUrl = await toJpeg(clone, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        pixelRatio: canvasScale,
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          width: "794px",
        },
      });`;

const newLegacy = `      const imgDataUrl = await toJpeg(clone, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        pixelRatio: canvasScale,
        width: 794, // FORCE width
        height: clone.scrollHeight || clone.offsetHeight, // FORCE height
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
          width: "794px",
          position: "relative",
          left: "0",
          top: "0",
          margin: "0",
        },
      });`;

content = content.replace(oldLegacy, newLegacy);

// Also apply the width/height to the chunked logic just in case
const oldChunk = `        const pageImgData = await toJpeg(pageNode, {
          quality: 1.0,
          backgroundColor: "#ffffff",
          pixelRatio: canvasScale,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
            margin: "0",
          },
        });`;

const newChunk = `        const pageImgData = await toJpeg(pageNode, {
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

content = content.replace(oldChunk, newChunk);

fs.writeFileSync('src/utils/pdf.ts', content);
