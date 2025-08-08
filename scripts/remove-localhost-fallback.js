const fs = require('fs');
const path = require('path');

// Đường dẫn đến thư mục app
const appDir = path.join(__dirname, '../app');

// Hàm thay thế fallback localhost trong file
function removeLocalhostFallbackInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Thay thế process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000' bằng process.env.NEXT_PUBLIC_API_URL
    const fallbackRegex = /process\.env\.NEXT_PUBLIC_API_URL\s*\|\|\s*['"]http:\/\/localhost:3000['"]/g;
    if (fallbackRegex.test(content)) {
      content = content.replace(fallbackRegex, 'process.env.NEXT_PUBLIC_API_URL');
      modified = true;
    }

    // Nếu có thay đổi, ghi file
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Updated: ${filePath}`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Hàm duyệt qua tất cả file .tsx và .ts
function processDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      removeLocalhostFallbackInFile(fullPath);
    }
  }
}

console.log('🔄 Starting to remove localhost fallback...');
processDirectory(appDir);
console.log('✅ Finished removing localhost fallback!');
