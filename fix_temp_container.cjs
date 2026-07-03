const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

content = content.replace(
  'tempContainer.style.left = "-9999px";',
  'tempContainer.style.left = "0";'
);
content = content.replace(
  'tempContainer.style.zIndex = "999999";',
  'tempContainer.style.zIndex = "-9999"; // Push behind to prevent flash, but keep in viewport to prevent Safari culling'
);

fs.writeFileSync('src/utils/pdf.ts', content);
