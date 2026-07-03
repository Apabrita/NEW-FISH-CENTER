const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

content = content.replace(
  'clone.style.margin = "0 auto"; // Centered for the visual flash',
  'clone.style.margin = "0";\n  clone.style.transform = "none";\n  clone.style.setProperty("transform", "none", "important");'
);

fs.writeFileSync('src/utils/pdf.ts', content);
