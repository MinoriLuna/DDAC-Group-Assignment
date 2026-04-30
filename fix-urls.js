const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !['node_modules', '.next', 'out', 'publish'].includes(item)) {
      processDir(fullPath);
    } else if (item.endsWith('.js') || item.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://localhost:5230')) {
        // Replace single-quoted strings: 'http://localhost:5230/...'
        content = content.replace(
          /'http:\/\/localhost:5230(\/[^']*)'/g,
          (_, p) => '`${process.env.NEXT_PUBLIC_API_URL ?? \'\'}' + p + '`'
        );
        // Replace template literals: `http://localhost:5230/...`
        content = content.replace(
          /`http:\/\/localhost:5230(\/[^`]*)`/g,
          (_, p) => '`${process.env.NEXT_PUBLIC_API_URL ?? \'\'}' + p + '`'
        );
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDir('app');
console.log('Done.');
