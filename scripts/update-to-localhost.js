const fs = require('fs');
const path = require('path');

// Các URL cần thay thế
const URL_REPLACEMENTS = [
  {
    from: 'https://bevclock-production.up.railway.app',
    to: 'http://localhost:3000'
  },
  {
    from: 'https://fe-vclock.vercel.app',
    to: 'http://localhost:3005'
  },
  {
    from: 'https://www.fe-vclock.vercel.app',
    to: 'http://localhost:3005'
  }
];

// Thư mục cần quét
const SCAN_DIRECTORIES = [
  'app',
  'components',
  'context',
  'utils'
];

// Các file cần bỏ qua
const IGNORE_FILES = [
  'node_modules',
  '.git',
  '.next',
  'scripts',
  'public'
];

// Các extension cần quét
const SCAN_EXTENSIONS = ['.tsx', '.ts', '.js', '.jsx'];

function shouldIgnoreFile(filePath) {
  return IGNORE_FILES.some(ignore => filePath.includes(ignore));
}

function shouldScanFile(filePath) {
  return SCAN_EXTENSIONS.some(ext => filePath.endsWith(ext));
}

function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    URL_REPLACEMENTS.forEach(replacement => {
      if (content.includes(replacement.from)) {
        content = content.replace(new RegExp(replacement.from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement.to);
        hasChanges = true;
        console.log(`✅ Updated ${replacement.from} -> ${replacement.to} in ${filePath}`);
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
  return false;
}

function scanDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let updatedFiles = 0;
  
  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (shouldIgnoreFile(fullPath)) {
      return;
    }
    
    if (stat.isDirectory()) {
      updatedFiles += scanDirectory(fullPath);
    } else if (shouldScanFile(fullPath)) {
      if (updateFile(fullPath)) {
        updatedFiles++;
      }
    }
  });
  
  return updatedFiles;
}

// Bắt đầu quét
console.log('🔄 Starting URL replacement...');
console.log('📁 Scanning directories:', SCAN_DIRECTORIES.join(', '));

let totalUpdated = 0;
SCAN_DIRECTORIES.forEach(dir => {
  if (fs.existsSync(dir)) {
    const updated = scanDirectory(dir);
    totalUpdated += updated;
    console.log(`📂 ${dir}: ${updated} files updated`);
  } else {
    console.log(`⚠️  Directory not found: ${dir}`);
  }
});

// Quét thêm các file trong thư mục gốc
console.log('📁 Scanning root directory files...');
const rootFiles = fs.readdirSync('.');
let rootUpdated = 0;

rootFiles.forEach(file => {
  if (shouldScanFile(file) && !shouldIgnoreFile(file)) {
    if (updateFile(file)) {
      rootUpdated++;
    }
  }
});

if (rootUpdated > 0) {
  console.log(`📂 Root directory: ${rootUpdated} files updated`);
  totalUpdated += rootUpdated;
}

console.log(`\n✅ Total files updated: ${totalUpdated}`);
console.log('🎉 URL replacement completed!'); 