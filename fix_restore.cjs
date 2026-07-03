const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

const target = `          // Restore
          isolateWrapper.removeChild(pageNode);
          tempContainer.removeChild(isolateWrapper);
          if (parent) {
            parent.insertBefore(pageNode, nextSibling);
          }`;

const replacement = `          // Restore
          isolateWrapper.removeChild(pageNode);
          tempContainer.removeChild(isolateWrapper);`;

content = content.replace(target, replacement);

fs.writeFileSync('src/utils/pdf.ts', content);
