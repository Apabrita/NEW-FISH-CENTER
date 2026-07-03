const fs = require('fs');

function addHaptics(file) {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('triggerHaptic')) {
    content = 'import { triggerHaptic } from "../utils/haptics";\n' + content;
  }
  
  // Find onClick handlers in buttons
  // Note: since the file may have many, we can just replace the specific onClick implementations for numpad.
  // Actually, we can replace onClick={() => onChange( or onClick={() => onConfirm(
  content = content.replace(/onClick=\{\(\) => onChange\((.*?)\)\}/g, "onClick={() => { triggerHaptic('light'); onChange($1); }}");
  content = content.replace(/onClick=\{\(\) => onConfirm\((.*?)\)\}/g, "onClick={() => { triggerHaptic('success'); onConfirm($1); }}");
  content = content.replace(/onClick=\{\(\) => onClear\((.*?)\)\}/g, "onClick={() => { triggerHaptic('light'); onClear($1); }}");
  
  // TransactionNumpad has onKeyPress
  content = content.replace(/onClick=\{\(\) => onKeyPress\((.*?)\)\}/g, "onClick={() => { triggerHaptic('light'); onKeyPress($1); }}");
  content = content.replace(/onClick=\{onBackspace\}/g, "onClick={() => { triggerHaptic('light'); onBackspace(); }}");
  content = content.replace(/onClick=\{onConfirm\}/g, "onClick={() => { triggerHaptic('success'); onConfirm(); }}");
  
  fs.writeFileSync(file, content);
}

addHaptics('src/components/TransactionNumpad.tsx');
addHaptics('src/components/VirtualNumpad.tsx');
