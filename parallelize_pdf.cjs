const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

const oldLoop = `      for (let i = 0; i < wrappers.length; i++) {
        const { pageNode, isolateWrapper, parent, nextSibling } = wrappers[i];

        const pageImgData = await toJpeg(isolateWrapper, {
          quality: 0.95,
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
        });
        
        // Restore
        isolateWrapper.removeChild(pageNode);
        tempContainer.removeChild(isolateWrapper);
        if (parent) {
          parent.insertBefore(pageNode, nextSibling);
        }

        // Add a new page if it's not the very first page of the document
        if (i > 0 || globalPageNum > 1) {
          if (i > 0) pdf.addPage();
        }

        const imgProps = pdf.getImageProperties(pageImgData);`;

const newLoop = `      const batchSize = 3;
      for (let i = 0; i < wrappers.length; i += batchSize) {
        const batch = wrappers.slice(i, i + batchSize);
        
        const results = await Promise.all(
          batch.map(w => 
            toJpeg(w.isolateWrapper, {
              quality: 0.95,
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
        
        for (let j = 0; j < batch.length; j++) {
          const { pageNode, isolateWrapper, parent, nextSibling } = batch[j];
          const pageImgData = results[j];
          
          // Restore
          isolateWrapper.removeChild(pageNode);
          tempContainer.removeChild(isolateWrapper);
          if (parent) {
            parent.insertBefore(pageNode, nextSibling);
          }

          // Add a new page if it's not the very first page of the document
          if ((i + j) > 0 || globalPageNum > 1) {
            if ((i + j) > 0) pdf.addPage();
          }

          const imgProps = pdf.getImageProperties(pageImgData);`;

content = content.replace(oldLoop, newLoop);
fs.writeFileSync('src/utils/pdf.ts', content);
