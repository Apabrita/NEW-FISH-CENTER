const fs = require('fs');
let file = 'src/contexts/DataContext.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/let metaTheme = document.querySelector/g, "let metaTheme = document.querySelector<HTMLMetaElement>");
fs.writeFileSync(file, content);

file = 'src/components/CollectPanel.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/transition={{[^}]*}}\s*transition={{/g, "transition={{");
content = content.replace(/initial={{[^}]*}}\s*initial={{/g, "initial={{");
fs.writeFileSync(file, content);

file = 'src/components/DashboardPanel.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/transition={{[^}]*}}\s*transition={{/g, "transition={{");
content = content.replace(/initial={{[^}]*}}\s*initial={{/g, "initial={{");
fs.writeFileSync(file, content);

file = 'src/components/TransactionNumpad.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/transition={{[^}]*}}\s*transition={{/g, "transition={{");
content = content.replace(/initial={{[^}]*}}\s*initial={{/g, "initial={{");
fs.writeFileSync(file, content);

