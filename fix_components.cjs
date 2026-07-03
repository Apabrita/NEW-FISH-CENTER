const fs = require('fs');
const { execSync } = require('child_process');

const files = execSync('find src -name "*.tsx"').toString().split('\n').filter(Boolean);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace bg-black/X with glass-panel EXCEPT bg-black/60 and bg-black/80 (modals)
  content = content.replace(/bg-black\/(40\/[0-9]{1,2}|40|50|20|10|30|70|90|100)/g, "glass-panel");
  content = content.replace(/bg-\[#[0-9a-fA-F]{6}\]\/[0-9]{1,2}/g, "glass-panel");
  
  // Replace solid dark backgrounds
  content = content.replace(/bg-\[#051b30\]/gi, "bg-app-bg");
  content = content.replace(/bg-\[#010b14\]/gi, "bg-app-bg");
  content = content.replace(/bg-\[#02101e\]/gi, "bg-panel");
  content = content.replace(/bg-\[#082f49\]/gi, "bg-panel");
  content = content.replace(/bg-\[#0c4a6e\]/gi, "bg-panel-hover");
  content = content.replace(/bg-\[#16223f\]/gi, "bg-panel-dark");
  content = content.replace(/bg-\[#180a0f\]/gi, "bg-rose-500/10");
  
  // Replace borders
  content = content.replace(/border-\[#0f355c\](?:\/[0-9]{1,2})?/gi, "border-divider");
  content = content.replace(/border-\[#0c4a6e\](?:\/[0-9]{1,2})?/gi, "border-divider");
  content = content.replace(/border-\[#075985\](?:\/[0-9]{1,2})?/gi, "border-divider");
  content = content.replace(/border-\[#5e192a\](?:\/[0-9]{1,2})?/gi, "border-rose-500/20");
  
  // Text replacements
  content = content.replace(/Supabase/gi, "Local Data");

  // Replace text-zinc-950/text-zinc-50 etc with appropriate variables
  content = content.replace(/text-zinc-50/g, "text-main");
  content = content.replace(/text-zinc-950/g, "text-main");

  fs.writeFileSync(file, content);
});
console.log("Done");
