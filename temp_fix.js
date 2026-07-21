import fs from 'fs';
const content = fs.readFileSync('src/views/Chat.tsx', 'utf8');
const lines = content.split('\n');
lines.splice(174, 46); // removes lines 175-220 inclusive (indices 174 to 219)
fs.writeFileSync('src/views/Chat.tsx', lines.join('\n'));
