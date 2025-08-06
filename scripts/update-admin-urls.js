const fs = require('fs');
const path = require('path');

// URL cũ và mới
const OLD_URL = 'http://localhost:3000';
const NEW_URL = 'http://localhost:3000';

// Thư mục admin
const ADMIN_DIR = path.join(__dirname, '../app/admin');

// Hàm đệ quy để tìm tất cả file .tsx trong thư mục admin
function findTsxFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...findTsxFiles(fullPath));
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Hàm thay thế URL trong file
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Thay thế URL
    content = content.replace(new RegExp(OLD_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_URL);
    
    // Chỉ ghi file nếu có thay đổi
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Đã cập nhật: ${path.relative(process.cwd(), filePath)}`);
      return true;
    } else {
      console.log(`⏭️  Không có thay đổi: ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Lỗi khi xử lý file ${filePath}:`, error.message);
    return false;
  }
}

// Hàm chính
function main() {
  console.log('🔄 Bắt đầu cập nhật URL backend trong admin...\n');
  
  try {
    const tsxFiles = findTsxFiles(ADMIN_DIR);
    console.log(`📁 Tìm thấy ${tsxFiles.length} file .tsx trong thư mục admin\n`);
    
    let updatedCount = 0;
    
    for (const file of tsxFiles) {
      if (updateFile(file)) {
        updatedCount++;
      }
    }
    
    console.log(`\n🎉 Hoàn thành! Đã cập nhật ${updatedCount}/${tsxFiles.length} file.`);
    console.log(`📝 URL đã được thay đổi từ "${OLD_URL}" thành "${NEW_URL}"`);
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

// Chạy script
if (require.main === module) {
  main();
}

module.exports = { updateFile, findTsxFiles }; 