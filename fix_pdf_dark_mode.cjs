const fs = require('fs');
let content = fs.readFileSync('src/utils/pdf.ts', 'utf8');

content = content.replace(
  'htmlElement.classList.remove("theme-dark", "dark");',
  'htmlElement.classList.remove("theme-dark", "dark");\n    htmlElement.classList.add("theme-light");'
);

content = content.replace(
  'htmlElement.classList.add("theme-dark", "dark");',
  'htmlElement.classList.remove("theme-light");\n      htmlElement.classList.add("theme-dark", "dark");'
);

fs.writeFileSync('src/utils/pdf.ts', content);
