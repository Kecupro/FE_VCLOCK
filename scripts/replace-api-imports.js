const fs = require('fs');
const path = require('path');

// Đường dẫn đến thư mục app
const appDir = path.join(__dirname, '../app');

// Hàm thay thế import API_BASE_URL trong file
function replaceApiImportsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Xóa import API_BASE_URL
    const importRegex = /import\s*\{\s*API_BASE_URL\s*\}\s*from\s*['"][^'"]*config\/api['"];?\s*\n?/g;
    if (importRegex.test(content)) {
      content = content.replace(importRegex, '');
      modified = true;
    }

    // Thay thế API_BASE_URL bằng process.env.NEXT_PUBLIC_API_URL
    const apiBaseUrlRegex = /API_BASE_URL/g;
    if (apiBaseUrlRegex.test(content)) {
      content = content.replace(apiBaseUrlRegex, 'process.env.NEXT_PUBLIC_API_URL');
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
      replaceApiImportsInFile(fullPath);
    }
  }
}

console.log('🔄 Starting to replace API_BASE_URL imports...');
processDirectory(appDir);
console.log('✅ Finished replacing API_BASE_URL imports!');
