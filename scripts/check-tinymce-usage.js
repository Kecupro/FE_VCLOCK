const fs = require('fs');
const path = require('path');

const OLD_API_KEY = '6fo0luz3qumzjivmx7fqqwnkpf7hrg0e8san58tjg18xa5n7';

function searchInFile(filePath, searchTerm) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const matches = [];
    
    lines.forEach((line, index) => {
      if (line.includes(searchTerm)) {
        matches.push({
          line: index + 1,
          content: line.trim()
        });
      }
    });
    
    return matches;
  } catch (error) {
    return [];
  }
}

function scanDirectory(dir, extensions = ['.tsx', '.ts', '.js', '.jsx']) {
  const results = [];
  
  function scan(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Bỏ qua node_modules và .git
        if (item !== 'node_modules' && item !== '.git' && !item.startsWith('.')) {
          scan(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          const relativePath = path.relative(dir, fullPath);
          results.push(relativePath);
        }
      }
    }
  }
  
  scan(dir);
  return results;
}

function main() {
  console.log('🔍 Đang quét tìm API key TinyMCE cũ...\n');
  
  const projectRoot = path.join(__dirname, '..');
  const files = scanDirectory(projectRoot);
  
  let totalMatches = 0;
  const filesWithMatches = [];
  
  files.forEach(filePath => {
    const fullPath = path.join(projectRoot, filePath);
    const matches = searchInFile(fullPath, OLD_API_KEY);
    
    if (matches.length > 0) {
      filesWithMatches.push({
        file: filePath,
        matches: matches
      });
      totalMatches += matches.length;
    }
  });
  
  console.log(`📊 Kết quả quét: Tìm thấy ${totalMatches} lần xuất hiện trong ${filesWithMatches.length} file\n`);
  
  if (filesWithMatches.length > 0) {
    console.log('📁 Các file cần cập nhật:');
    filesWithMatches.forEach(({ file, matches }) => {
      console.log(`\n📄 ${file} (${matches.length} lần xuất hiện):`);
      matches.forEach(match => {
        console.log(`   Dòng ${match.line}: ${match.content}`);
      });
    });
    
    console.log('\n⚠️  Các file này cần được cập nhật API key mới!');
    console.log('💡 Sử dụng script update-tinymce-api.js để tự động cập nhật.');
  } else {
    console.log('✅ Không tìm thấy API key cũ trong code!');
  }
  
  // Kiểm tra các pattern khác có thể chứa API key
  console.log('\n🔍 Kiểm tra các pattern khác...');
  
  const patterns = [
    'tinymceScriptSrc',
    'cdn.tiny.cloud',
    'tinymce/6/',
    'tinymce.min.js'
  ];
  
  patterns.forEach(pattern => {
    const filesWithPattern = [];
    
    files.forEach(filePath => {
      const fullPath = path.join(projectRoot, filePath);
      const matches = searchInFile(fullPath, pattern);
      
      if (matches.length > 0) {
        filesWithPattern.push({
          file: filePath,
          matches: matches
        });
      }
    });
    
    if (filesWithPattern.length > 0) {
      console.log(`\n📋 Files có chứa "${pattern}":`);
      filesWithPattern.forEach(({ file, matches }) => {
        console.log(`   - ${file} (${matches.length} lần)`);
      });
    }
  });
}

main();
