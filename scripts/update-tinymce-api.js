const fs = require('fs');
const path = require('path');

// Cấu hình
const OLD_API_KEY = 'Y3n407w2hrdm50486yfaarb459wuuvhbzuzs8d2grfyt4bouf';
const NEW_API_KEY = '3n407w2hrdm50486yfaarb459wuuvhbzuzs8d2grfyt4bouf'; // Thay thế bằng API key mới của bạn

// Danh sách các file cần cập nhật
const filesToUpdate = [
  'app/admin/layout.tsx',
  'app/admin/news/addNew/page.tsx',
  'app/admin/news/editNew/page.tsx',
  'app/admin/products/addProduct/page.tsx',
  'app/admin/products/edit/page.tsx',
  'app/admin/payment-methods/addPM/page.tsx',
  'app/admin/payment-methods/editPM/page.tsx',
  'app/admin/brands/addBrand/page.tsx',
  'app/admin/brands/editBrand/[id]/page.tsx'
];

function updateFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File không tồn tại: ${filePath}`);
    return false;
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;
    
    // Thay thế API key trong tinymceScriptSrc
    content = content.replace(
      new RegExp(`tinymceScriptSrc="https://cdn\\.tiny\\.cloud/1/${OLD_API_KEY}/tinymce/6/tinymce\\.min\\.js"`, 'g'),
      `tinymceScriptSrc="https://cdn.tiny.cloud/1/${NEW_API_KEY}/tinymce/6/tinymce.min.js"`
    );
    
    // Thay thế API key trong các link CSS
    content = content.replace(
      new RegExp(`https://cdn\\.tiny\\.cloud/1/${OLD_API_KEY}/tinymce/6/skins/ui/oxide/skin\\.min\\.css`, 'g'),
      `https://cdn.tiny.cloud/1/${NEW_API_KEY}/tinymce/6/skins/ui/oxide/skin.min.css`
    );
    
    content = content.replace(
      new RegExp(`https://cdn\\.tiny\\.cloud/1/${OLD_API_KEY}/tinymce/6/skins/ui/oxide-dark/skin\\.min\\.css`, 'g'),
      `https://cdn.tiny.cloud/1/${NEW_API_KEY}/tinymce/6/skins/ui/oxide-dark/skin.min.css`
    );
    
    content = content.replace(
      new RegExp(`https://cdn\\.tiny\\.cloud/1/${OLD_API_KEY}/tinymce/6/skins/content/default/content\\.min\\.css`, 'g'),
      `https://cdn.tiny.cloud/1/${NEW_API_KEY}/tinymce/6/skins/content/default/content.min.css`
    );
    
    content = content.replace(
      new RegExp(`https://cdn\\.tiny\\.cloud/1/${OLD_API_KEY}/tinymce/6/skins/content/dark/content\\.min\\.css`, 'g'),
      `https://cdn.tiny.cloud/1/${NEW_API_KEY}/tinymce/6/skins/content/dark/content.min.css`
    );
    
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Đã cập nhật: ${filePath}`);
      return true;
    } else {
      console.log(`⚠️  Không có thay đổi: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Lỗi khi cập nhật ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔄 Bắt đầu cập nhật API key TinyMCE...\n');
  
  if (NEW_API_KEY === 'YOUR_NEW_API_KEY_HERE') {
    console.log('❌ Vui lòng cập nhật NEW_API_KEY trong script trước khi chạy!');
    console.log('📝 Hướng dẫn:');
    console.log('1. Đăng ký tài khoản tại https://www.tiny.cloud/');
    console.log('2. Lấy API key từ dashboard');
    console.log('3. Thay thế YOUR_NEW_API_KEY_HERE bằng API key mới');
    console.log('4. Chạy lại script này');
    return;
  }
  
  let updatedCount = 0;
  
  filesToUpdate.forEach(filePath => {
    if (updateFile(filePath)) {
      updatedCount++;
    }
  });
  
  console.log(`\n📊 Kết quả: Đã cập nhật ${updatedCount}/${filesToUpdate.length} file`);
  
  if (updatedCount > 0) {
    console.log('\n✅ Hoàn thành! Vui lòng:');
    console.log('1. Kiểm tra lại các file đã được cập nhật');
    console.log('2. Khởi động lại server để áp dụng thay đổi');
    console.log('3. Kiểm tra TinyMCE hoạt động bình thường');
  }
}

main();
