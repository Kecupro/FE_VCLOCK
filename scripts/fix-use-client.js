// const fs = require('fs');
// const path = require('path');

// // Đường dẫn đến thư mục app
// const appDir = path.join(__dirname, '../app');

// // Hàm sửa "use client" directive trong file
// function fixUseClientInFile(filePath) {
//   try {
//     let content = fs.readFileSync(filePath, 'utf8');

//     // Tìm và sửa pattern: import trước "use client"
//     const lines = content.split('\n');
//     const newLines = [];
//     let useClientFound = false;
//     let useClientLine = '';

//     for (let i = 0; i < lines.length; i++) {
//       const line = lines[i];
      
//       // Tìm "use client" directive
//       if (line.trim() === '"use client";' || line.trim() === "'use client';") {
//         useClientFound = true;
//         useClientLine = line;
//         continue; // Bỏ qua dòng này, sẽ thêm lại ở đầu
//       }
      
//       // Nếu chưa tìm thấy "use client" và dòng này là import
//       if (!useClientFound && (line.trim().startsWith('import ') || line.trim().startsWith('const ') || line.trim().startsWith('let ') || line.trim().startsWith('var '))) {
//         // Thêm "use client" trước import đầu tiên
//         newLines.push(useClientLine);
//         newLines.push(''); // Dòng trống
//         useClientFound = true;
//       }
      
//       newLines.push(line);
//     }

//     // Nếu có thay đổi
//     if (useClientFound) {
//       const newContent = newLines.join('\n');
//       if (newContent !== content) {
//         fs.writeFileSync(filePath, newContent);
//         console.log(`✅ Fixed use client: ${filePath}`);
//       }
//     }
//   } catch (error) {
//     console.error(`❌ Error processing ${filePath}:`, error.message);
//   }
// }

// // Hàm duyệt thư mục
// function processDirectory(dir) {
//   const items = fs.readdirSync(dir);
  
//   for (const item of items) {
//     const fullPath = path.join(dir, item);
//     const stat = fs.statSync(fullPath);
    
//     if (stat.isDirectory()) {
//       processDirectory(fullPath);
//     } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
//       fixUseClientInFile(fullPath);
//     }
//   }
// }

// console.log('🔄 Starting to fix "use client" directives...');
// processDirectory(appDir);
// console.log('✅ Finished fixing "use client" directives!');
