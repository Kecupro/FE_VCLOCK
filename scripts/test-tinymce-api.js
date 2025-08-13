const https = require('https');

const API_KEY = 'Y3n407w2hrdm50486yfaarb459wuuvhbzuzs8d2grfyt4bouf';

function testTinyMCEAPI() {
  console.log('🔍 Đang test API key TinyMCE...\n');
  
  const testUrl = `https://cdn.tiny.cloud/1/${API_KEY}/tinymce/6/tinymce.min.js`;
  
  console.log(`📡 Testing URL: ${testUrl}\n`);
  
  https.get(testUrl, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, res.headers);
    
    if (res.statusCode === 200) {
      console.log('\n✅ API key hoạt động bình thường!');
      console.log('💡 Nếu vẫn lỗi, có thể do:');
      console.log('   - Domain chưa được cấu hình trong TinyMCE Dashboard');
      console.log('   - Cần thêm domain: localhost:3000, 127.0.0.1:3000');
    } else if (res.statusCode === 403) {
      console.log('\n❌ API key không hợp lệ hoặc domain chưa được cấu hình!');
      console.log('🔧 Cần kiểm tra:');
      console.log('   1. API key có đúng không');
      console.log('   2. Domain đã được thêm vào TinyMCE Dashboard chưa');
      console.log('   3. Tài khoản TinyMCE còn hoạt động không');
    } else {
      console.log(`\n⚠️  Lỗi không xác định: ${res.statusCode}`);
    }
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      if (data.length > 100) {
        console.log('\n📄 Response preview:', data.substring(0, 100) + '...');
      } else {
        console.log('\n📄 Response:', data);
      }
    });
  }).on('error', (err) => {
    console.log('\n❌ Lỗi kết nối:', err.message);
    console.log('💡 Có thể do:');
    console.log('   - Không có internet');
    console.log('   - Firewall chặn kết nối');
    console.log('   - DNS không phân giải được');
  });
}

// Test thêm một số domain phổ biến
function testDomains() {
  console.log('\n🌐 Testing các domain phổ biến...\n');
  
  const domains = [
    'localhost:3000',
    '127.0.0.1:3000',
    'localhost',
    '127.0.0.1'
  ];
  
  domains.forEach(domain => {
    console.log(`📍 Domain: ${domain}`);
  });
  
  console.log('\n📝 Hướng dẫn cấu hình domain:');
  console.log('1. Đăng nhập vào https://www.tiny.cloud/');
  console.log('2. Vào Dashboard');
  console.log('3. Chọn "Domains"');
  console.log('4. Thêm các domain trên');
  console.log('5. Lưu cài đặt');
}

testTinyMCEAPI();
testDomains();
