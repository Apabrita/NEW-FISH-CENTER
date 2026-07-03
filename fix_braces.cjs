const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

content = content.replace(
  '        globalPageNum++;\n      }\n    } else {\n      // Legacy',
  '        globalPageNum++;\n      }\n      }\n    } else {\n      // Legacy'
);

fs.writeFileSync('src/utils/pdf.ts', content);
