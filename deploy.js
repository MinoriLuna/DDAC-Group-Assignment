const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, opts = {}) {
  console.log('\n> ' + cmd);
  execSync(cmd, { stdio: 'inherit', ...opts });
}

// Step 1: Build Next.js without .env.local overriding NEXT_PUBLIC_API_URL
console.log('\n=== Step 1: Building Next.js (production) ===');
if (fs.existsSync('.env.local')) {
  fs.renameSync('.env.local', '.env.local.bak');
}
try {
  run('npm run build');
} finally {
  if (fs.existsSync('.env.local.bak')) {
    fs.renameSync('.env.local.bak', '.env.local');
  }
}

// Step 2: Copy out/ → backend/wwwroot/
console.log('\n=== Step 2: Copying build output to backend/wwwroot ===');
if (fs.existsSync('backend/wwwroot')) {
  run('rm -rf backend/wwwroot');
}
run('cp -r out backend/wwwroot');

// Step 3: dotnet publish
console.log('\n=== Step 3: Publishing .NET backend ===');
run('dotnet publish -c Release -o ./publish', { cwd: path.join(__dirname, 'backend') });

// Step 4: Create deploy.zip with forward-slash entry names (required for Linux unzip)
console.log('\n=== Step 4: Creating deploy.zip with forward slashes ===');
if (fs.existsSync('deploy.zip')) {
  fs.unlinkSync('deploy.zip');
}

// Use [char]92 = backslash, [char]47 = forward-slash to avoid all JS/PS escaping bugs
const publishDir = path.resolve('backend/publish');
const zipOut = path.resolve('deploy.zip');

const ps1Lines = [
  "Add-Type -Assembly 'System.IO.Compression'",
  "Add-Type -Assembly 'System.IO.Compression.FileSystem'",
  "$publishPath = '" + publishDir + "'",
  "$zipPath = '" + zipOut + "'",
  "$stream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)",
  "$archive = New-Object System.IO.Compression.ZipArchive($stream, [System.IO.Compression.ZipArchiveMode]::Create)",
  "Get-ChildItem -Recurse -File -Path $publishPath | ForEach-Object {",
  "    $entryName = $_.FullName.Substring($publishPath.Length + 1).Replace([char]92, [char]47)",
  "    $entry = $archive.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)",
  "    $entryStream = $entry.Open()",
  "    $fileStream = [System.IO.File]::OpenRead($_.FullName)",
  "    $fileStream.CopyTo($entryStream)",
  "    $fileStream.Close()",
  "    $entryStream.Close()",
  "}",
  "$archive.Dispose()",
  "$stream.Close()",
  "Write-Host 'Created deploy.zip'"
];
fs.writeFileSync('_make_zip.ps1', ps1Lines.join('\n'), 'utf8');
try {
  run('powershell -NoProfile -ExecutionPolicy Bypass -File _make_zip.ps1');
} finally {
  if (fs.existsSync('_make_zip.ps1')) fs.unlinkSync('_make_zip.ps1');
}

// Step 5: Deploy to Elastic Beanstalk via AWS CLI
console.log('\n=== Step 5: Deploying to Elastic Beanstalk ===');

const appName = 'MediCareDDAC';
const envName = 'MediCareDDAC-test';
const region  = 'us-east-1';
const label   = 'v' + Date.now();

// Get the Beanstalk-managed S3 bucket for this region
const bucketRaw = execSync(
  'aws elasticbeanstalk create-storage-location --region ' + region + ' --query S3Bucket --output text',
  { encoding: 'utf8' }
).trim();
console.log('S3 bucket: ' + bucketRaw);

const s3Key = appName + '/' + label + '.zip';
run('aws s3 cp deploy.zip s3://' + bucketRaw + '/' + s3Key + ' --region ' + region);

run(
  'aws elasticbeanstalk create-application-version' +
  ' --application-name ' + appName +
  ' --version-label ' + label +
  ' --source-bundle S3Bucket=' + bucketRaw + ',S3Key=' + s3Key +
  ' --region ' + region
);

run(
  'aws elasticbeanstalk update-environment' +
  ' --environment-name ' + envName +
  ' --version-label ' + label +
  ' --region ' + region
);

console.log('\n=== Deployment triggered! Monitor progress at the Elastic Beanstalk console ===');
console.log('Version label: ' + label);
