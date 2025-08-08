// const fs = require('fs');
// const path = require('path');

// // Đường dẫn đến thư mục app
// const appDir = path.join(__dirname, '../app');

// // Danh sách các file cần thêm "use client"
// const filesToFix = [
//   'app/(site)/about/page.tsx',
//   'app/(site)/account/page.tsx',
//   'app/(site)/auth/facebook/success/page.tsx',
//   'app/(site)/auth/google/success/page.tsx',
//   'app/(site)/cart/page.tsx',
//   'app/(site)/checkout/page.tsx',
//   'app/(site)/checkout-cancel/page.tsx',
//   'app/(site)/checkout-success/page.tsx',
//   'app/(site)/search/page.tsx',
//   'app/(site)/shop/page.tsx',
//   'app/(site)/components/CartContext.tsx',
//   'app/(site)/components/chatbox.tsx',
//   'app/(site)/components/Footer.tsx',
//   'app/(site)/components/Header.tsx',
//   'app/(site)/components/Preloader.tsx',
//   'app/(site)/components/WishlistContext.tsx',
//   'app/(site)/contact/page.tsx',
//   'app/(site)/context/AuthContext.tsx',
//   'app/(site)/news/page.tsx',
//   'app/(site)/news/[id]/page.tsx',
//   'app/(site)/page.tsx',
//   'app/(site)/product/[id]/page.tsx',
//   'app/admin/categories-product-list/editCatePro/page.tsx',
//   'app/admin/account/page.tsx',
//   'app/admin/brands/addBrand/page.tsx',
//   'app/admin/brands/editBrand/[id]/page.tsx',
//   'app/admin/brands/page.tsx',
//   'app/admin/brands/[id]/page.tsx',
//   'app/admin/categories-news-list/addCateNew/page.tsx',
//   'app/admin/categories-news-list/editCateNew/page.tsx',
//   'app/admin/categories-news-list/page.tsx',
//   'app/admin/categories-product-list/addCatePro/page.tsx',
//   'app/admin/categories-product-list/page.tsx',
//   'app/admin/chatbox/page.tsx',
//   'app/admin/layout.tsx',
//   'app/admin/news/addNew/page.tsx',
//   'app/admin/news/editNew/page.tsx',
//   'app/admin/news/page.tsx',
//   'app/admin/news/[id]/page.tsx',
//   'app/admin/orders/page.tsx',
//   'app/admin/orders/[id]/page.tsx',
//   'app/admin/page.tsx',
//   'app/admin/payment-methods/addPM/page.tsx',
//   'app/admin/payment-methods/editPM/page.tsx',
//   'app/admin/payment-methods/page.tsx',
//   'app/admin/products/addProduct/page.tsx',
//   'app/admin/products/edit/page.tsx',
//   'app/admin/products/page.tsx',
//   'app/admin/products/[id]/page.tsx',
//   'app/admin/reviews/page.tsx',
//   'app/admin/users/addUser/page.tsx',
//   'app/admin/users/editUser/[id]/page.tsx',
//   'app/admin/users/page.tsx',
//   'app/admin/users/[id]/page.tsx',
//   'app/admin/vouchers/addVoucher/page.tsx',
//   'app/admin/vouchers/editVoucher/page.tsx',
//   'app/admin/vouchers/page.tsx',
//   'app/admin/vouchers/[id]/page.tsx',
//   'app/config/api.ts',
//   'app/context/AdminAuthContext.tsx',
//   'app/context/AppContext.tsx',
//   'app/utils/authUtils.ts',
//   'app/utils/avatarUtils.ts'
// ];

// // Hàm thêm "use client" vào file
// function addUseClient(filePath) {
//   try {
//     const fullPath = path.join(__dirname, '..', filePath);
//     if (!fs.existsSync(fullPath)) {
//       console.log(`⚠️ File not found: ${filePath}`);
//       return;
//     }

//     let content = fs.readFileSync(fullPath, 'utf8');
    
//     // Kiểm tra xem đã có "use client" chưa
//     if (content.includes('"use client"') || content.includes("'use client'")) {
//       console.log(`✅ Already has use client: ${filePath}`);
//       return;
//     }

//     // Thêm "use client" vào đầu file
//     const newContent = '"use client";\n\n' + content;
//     fs.writeFileSync(fullPath, newContent);
//     console.log(`✅ Added use client: ${filePath}`);
//   } catch (error) {
//     console.error(`❌ Error processing ${filePath}:`, error.message);
//   }
// }

// console.log('🔄 Starting to add "use client" directives...');
// filesToFix.forEach(addUseClient);
// console.log('✅ Finished adding "use client" directives!');
