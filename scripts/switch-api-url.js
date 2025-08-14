#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function replaceInFile(filePath, mode) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    let patterns;
    
    if (mode === 'env') {
      patterns = [
        {
          from: /http:\/\/localhost:3000/g,
          to: '${process.env.NEXT_PUBLIC_API_URL}',
          description: 'http://localhost:3000'
        },
        {
          from: /https:\/\/localhost:3000/g,
          to: '${process.env.NEXT_PUBLIC_API_URL}',
          description: 'https://localhost:3000'
        },
        {
          from: /'http:\/\/localhost:3000'/g,
          to: "'${process.env.NEXT_PUBLIC_API_URL}'",
          description: "'http://localhost:3000'"
        },
        {
          from: /"http:\/\/localhost:3000"/g,
          to: '"${process.env.NEXT_PUBLIC_API_URL}"',
          description: '"http://localhost:3000"'
        }
      ];
    } else {
      patterns = [
        {
          from: /\$\{process\.env\.NEXT_PUBLIC_API_URL\}/g,
          to: 'http://localhost:3000',
          description: '${process.env.NEXT_PUBLIC_API_URL}'
        },
        {
          from: /'\\$\\{process\.env\.NEXT_PUBLIC_API_URL\\}'/g,
          to: "'http://localhost:3000'",
          description: "'${process.env.NEXT_PUBLIC_API_URL}'"
        },
        {
          from: /"\\$\\{process\.env\.NEXT_PUBLIC_API_URL\\}"/g,
          to: '"http://localhost:3000"',
          description: '"${process.env.NEXT_PUBLIC_API_URL}"'
        }
      ];
    }

    patterns.forEach(pattern => {
      if (pattern.from.test(content)) {
        content = content.replace(pattern.from, pattern.to);
        hasChanges = true;
        log(`  ✓ Thay thế: ${pattern.description}`, 'green');
      }
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    log(`  ✗ Lỗi xử lý file ${filePath}: ${error.message}`, 'red');
    return false;
  }
}

function findFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  let files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!['node_modules', '.next', 'dist', '.git'].includes(item)) {
          files = files.concat(findFiles(fullPath, extensions));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    
  }
  
  return files;
}

function main() {
  const args = process.argv.slice(2);
  const mode = args[0];

  if (!mode || (mode !== 'env' && mode !== 'localhost')) {
    log('❌ Lỗi: Vui lòng chỉ định mode!', 'red');
    log('');
    log('📖 Cách sử dụng:', 'cyan');
    log('  node scripts/switch-api-url.js env        # Chuyển sang environment variable');
    log('  node scripts/switch-api-url.js localhost  # Chuyển sang localhost');
    log('');
    log('💡 Ví dụ:', 'yellow');
    log('  node scripts/switch-api-url.js env');
    log('  node scripts/switch-api-url.js localhost');
    process.exit(1);
  }

  const modeText = mode === 'env' ? 'environment variable' : 'localhost';
  log(`🔄 Bắt đầu chuyển đổi sang ${modeText}...`, 'cyan');
  log('');

  const appDir = path.resolve(__dirname, '..', 'app');
  const files = findFiles(appDir);

  let totalFiles = 0;
  let changedFiles = 0;

  files.forEach(file => {
    const relativePath = path.relative(path.resolve(__dirname, '..'), file);
    log(`📁 Xử lý: ${relativePath}`, 'blue');
    
    if (replaceInFile(file, mode)) {
      changedFiles++;
    }
    totalFiles++;
  });

  log('');
  log('📊 Kết quả:', 'bright');
  log(`  • Tổng số file đã quét: ${totalFiles}`, 'yellow');
  log(`  • Số file đã thay đổi: ${changedFiles}`, 'green');
  
  if (changedFiles > 0) {
    log('');
    log(`✅ Hoàn thành! Các file đã được cập nhật để sử dụng ${modeText}.`, 'green');
    log('');
    
    if (mode === 'env') {
      log('💡 Lưu ý cho environment variable:', 'cyan');
      log('  • Đảm bảo đã cấu hình NEXT_PUBLIC_API_URL trong file .env.local');
      log('  • Kiểm tra lại các file đã thay đổi để đảm bảo không có lỗi');
      log('  • Chạy npm run dev để test ứng dụng');
    } else {
      log('💡 Lưu ý cho localhost:', 'cyan');
      log('  • Đảm bảo server đang chạy trên localhost:3000');
      log('  • Kiểm tra lại các file đã thay đổi để đảm bảo không có lỗi');
      log('  • Chạy npm run dev để test ứng dụng');
    }
  } else {
    log('');
    log(`ℹ️  Không tìm thấy URL nào cần thay thế sang ${modeText}.`, 'yellow');
  }
}

if (require.main === module) {
  main();
}

module.exports = { replaceInFile, findFiles };
