import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cấu hình
const OLD_BASE_URL = 'http://localhost:3000';
const NEW_BASE_URL = 'http://localhost:3000'; // URL localhost

// Danh sách các file cần cập nhật (trừ những file đã cập nhật thủ công)
const filesToUpdate = [
  'app/(site)/news/page.tsx',
  'app/(site)/news/[id]/page.tsx',
  'app/(site)/search/page.tsx',
  'app/(site)/shop/page.tsx',
  'app/(site)/product/FormBinhLuan.tsx',
  'app/(site)/product/SPLienQuan.tsx',
  'app/(site)/product/HienBinhLuanSP.tsx',
  'app/(site)/context/AuthContext.tsx',
  'app/(site)/product/[id]/page.tsx',
  'app/(site)/checkout/page.tsx',
  'app/(site)/contact/page.tsx',
  'app/(site)/components/Categories.tsx',
  'app/(site)/components/ProductNew.tsx',
  'app/(site)/components/Show1SP.tsx',
  'app/(site)/components/VoucherBoxList.tsx',
  'app/(site)/components/VoucherCard.tsx',
  'app/(site)/components/WishlistButton.tsx',
  'app/(site)/components/ProductSale.tsx',
  'app/(site)/components/News.tsx',
  'app/(site)/components/AddressSelector.tsx',
  'app/(site)/components/Feedback.tsx',
  'app/(site)/account/FormBinhLuan.tsx',
  'app/(site)/account/page.tsx',
  'app/(site)/account/OrderCard .tsx',
  'app/admin/users/page.tsx',
  'app/admin/account/page.tsx',
];

function updateFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`File không tồn tại: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Thay thế tất cả các URL localhost
    content = content.replace(new RegExp(OLD_BASE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_BASE_URL);

    // Kiểm tra xem có thay đổi gì không
    if (content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ Đã cập nhật: ${filePath}`);
    } else {
      console.log(`⏭️  Không có thay đổi: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật ${filePath}:`, error.message);
  }
}

function main() {
  console.log('🚀 Bắt đầu cập nhật API URLs...');
  console.log(`Từ: ${OLD_BASE_URL}`);
  console.log(`Sang: ${NEW_BASE_URL}`);
  console.log('');

  filesToUpdate.forEach(file => {
    updateFile(file);
  });

  console.log('');
  console.log('✅ Hoàn thành cập nhật API URLs!');
  console.log('');
  console.log('📝 Lưu ý:');
  console.log('1. Hãy thay đổi URL Railway thực tế trong file config/api.ts');
  console.log('2. Tạo file .env.local với NEXT_PUBLIC_API_URL=your-railway-url');
  console.log('3. Kiểm tra lại tất cả các API calls để đảm bảo hoạt động đúng');
}

main(); 