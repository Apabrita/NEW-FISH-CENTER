const fs = require('fs');
let content = fs.readFileSync('src/components/SettingsPanel.tsx', 'utf8');

content = content.replace(
  '} from "../db";',
  '  factoryResetData,\n  wipeAllData,\n} from "../db";'
);

content = content.replace(
  'const { factoryResetData } = await import("../db");',
  ''
);

content = content.replace(
  'const { wipeAllData } = await import("../db");',
  ''
);

fs.writeFileSync('src/components/SettingsPanel.tsx', content);
