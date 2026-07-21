const fs = require('fs');

const motionProps = `initial={{ x: '100%', opacity: 0.9 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-20%', opacity: 0 }} transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}`;

let content = fs.readFileSync('src/views/MonthlyFileDetails.tsx', 'utf8');

// Replace createPortal motion tags
content = content.replace(/createPortal\(\s*<motion\.div\s+className=\{\`fixed inset-0 z-\[100\]/g, 
  `createPortal(\n    <motion.div ${motionProps}\n      className={\`fixed inset-0 z-[100]`);

// Replace AnimatePresence selectedCategory motion tags
content = content.replace(/\{selectedCategory && \(\s*<motion\.div\s+className=\{\`fixed inset-0 z-\[100\]/g,
  `{selectedCategory && (\n          <motion.div\n            ${motionProps}\n            className={\`fixed inset-0 z-[100]`);

fs.writeFileSync('src/views/MonthlyFileDetails.tsx', content);
