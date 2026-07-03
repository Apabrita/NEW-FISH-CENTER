const fs = require('fs');
let content = fs.readFileSync('src/components/PdfExportView.tsx', 'utf8');

// Remove grid-rows-3 and flex-1 min-h-0
content = content.replace(
  /className="grid grid-cols-2 grid-rows-3 gap-6 flex-1 min-h-0"/g,
  'className="grid grid-cols-2 gap-6"'
);

// Remove overflow-hidden and min-w-0 from slip boxes
content = content.replace(
  /className="border-2 border-dashed border-divider p-4 rounded-\[24px\] bg-zinc-50\/45 flex flex-col gap-2 relative overflow-hidden min-w-0"/g,
  'className="border-2 border-dashed border-divider p-4 rounded-[24px] bg-zinc-50/45 flex flex-col gap-2 relative"'
);

content = content.replace(
  /className="border-2 border-dashed border-indigo-300 p-4 rounded-\[24px\] bg-indigo-50\/20 flex flex-col gap-2 relative overflow-hidden min-w-0"/g,
  'className="border-2 border-dashed border-indigo-300 p-4 rounded-[24px] bg-indigo-50/20 flex flex-col gap-2 relative"'
);

// Note: I also need to make sure the overflow-hidden on other slip elements are removed if they limit height.
// There is an overflow-hidden on the "Mathematical representation and purchases" box
// className="bg-zinc-50 p-2 rounded-[16px] text-[9.5px] text-main font-mono flex flex-col gap-1 flex-1 overflow-hidden"
content = content.replace(
  /className="bg-zinc-50 p-2 rounded-\[16px\] text-\[9\.5px\] text-main font-mono flex flex-col gap-1 flex-1 overflow-hidden"/g,
  'className="bg-zinc-50 p-2 rounded-[16px] text-[9.5px] text-main font-mono flex flex-col gap-1 flex-1"'
);
content = content.replace(
  /className="bg-indigo-100\/30 p-2 rounded-\[16px\] text-\[9\.5px\] text-indigo-900 font-mono flex flex-col gap-1 flex-1 overflow-hidden"/g,
  'className="bg-indigo-100/30 p-2 rounded-[16px] text-[9.5px] text-indigo-900 font-mono flex flex-col gap-1 flex-1"'
);

fs.writeFileSync('src/components/PdfExportView.tsx', content);
