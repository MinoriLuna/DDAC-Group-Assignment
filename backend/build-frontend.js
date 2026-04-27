const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const envLocal = path.join(root, '.env.local');
const envLocalBak = path.join(root, '.env.local.bak');

// Temporarily hide .env.local so Next.js uses .env.production (NEXT_PUBLIC_API_URL=)
if (fs.existsSync(envLocal)) fs.renameSync(envLocal, envLocalBak);
try {
  execSync('npm run build', { cwd: root, stdio: 'inherit' });
} finally {
  if (fs.existsSync(envLocalBak)) fs.renameSync(envLocalBak, envLocal);
}

// Copy out/ → wwwroot/
const wwwroot = path.join(__dirname, 'wwwroot');
if (fs.existsSync(wwwroot)) fs.rmSync(wwwroot, { recursive: true });
fs.cpSync(path.join(root, 'out'), wwwroot, { recursive: true });
console.log('Frontend built and copied to wwwroot/');
