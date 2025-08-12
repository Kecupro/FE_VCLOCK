# Hướng dẫn thay đổi API Key TinyMCE

## 🔍 Tình trạng hiện tại
Dự án đang sử dụng API key TinyMCE: `6fo0luz3qumzjivmx7fqqwnkpf7hrg0e8san58tjg18xa5n7`

## 📋 Các bước thực hiện

### 1. Đăng ký tài khoản TinyMCE mới
1. Truy cập https://www.tiny.cloud/
2. Đăng ký tài khoản mới
3. Xác thực email

### 2. Lấy API Key mới
1. Đăng nhập vào TinyMCE Cloud
2. Vào Dashboard
3. Copy API key mới

### 3. Cấu hình Domain
1. Trong Dashboard, vào phần "Domains"
2. Thêm domain của bạn (ví dụ: `localhost:3000`, `yourdomain.com`)
3. Lưu cài đặt

### 4. Cập nhật API Key trong code

#### Cách 1: Sử dụng script tự động (Khuyến nghị)
```bash
# 1. Mở file scripts/update-tinymce-api.js
# 2. Thay thế YOUR_NEW_API_KEY_HERE bằng API key mới
# 3. Chạy script
cd duantn
node scripts/update-tinymce-api.js
```

#### Cách 2: Thay thế thủ công
Cần cập nhật API key trong các file sau:

**File chính:**
- `app/admin/layout.tsx` (4 dòng CSS)

**File sử dụng TinyMCE Editor:**
- `app/admin/news/addNew/page.tsx`
- `app/admin/news/editNew/page.tsx`
- `app/admin/products/addProduct/page.tsx`
- `app/admin/products/edit/page.tsx`
- `app/admin/payment-methods/addPM/page.tsx`
- `app/admin/payment-methods/editPM/page.tsx`
- `app/admin/brands/addBrand/page.tsx`
- `app/admin/brands/editBrand/[id]/page.tsx`

### 5. Kiểm tra
1. Khởi động lại server
2. Vào trang admin
3. Thử tạo/sửa tin tức, sản phẩm
4. Kiểm tra TinyMCE editor hoạt động bình thường

## 📸 Về Uploadcare (Tùy chọn)

### **Tình trạng hiện tại:**
- Dự án **KHÔNG** sử dụng Uploadcare
- TinyMCE chỉ có plugin `image` cơ bản (chèn ảnh bằng URL)
- Ảnh được upload riêng biệt qua form

### **Nếu muốn thêm Uploadcare:**
1. Đăng ký tài khoản tại https://uploadcare.com/
2. Lấy public key
3. Cập nhật `UPLOADCARE_PUBLIC_KEY` trong script
4. Script sẽ tự động thêm cấu hình upload ảnh vào TinyMCE

### **Khuyến nghị:**
- **Giữ nguyên như hiện tại**: Đơn giản, ổn định
- **Chỉ thêm Uploadcare** nếu thực sự cần chức năng upload ảnh trực tiếp trong TinyMCE

## ⚠️ Lưu ý quan trọng

### Về Domain Configuration
- **Development**: Thêm `localhost:3000`, `127.0.0.1:3000`
- **Production**: Thêm domain thực tế của website
- **Subdomain**: Nếu có subdomain, thêm cả subdomain

### Về API Key
- API key cũ sẽ không hoạt động nếu tài khoản bị mất
- API key mới cần được cấu hình domain trước khi sử dụng
- Mỗi API key có giới hạn sử dụng theo gói

### Về Uploadcare
- Uploadcare là dịch vụ trả phí theo lưu lượng sử dụng
- Cần đăng ký tài khoản riêng
- Có thể thay thế bằng các dịch vụ khác như Cloudinary, AWS S3

### Về Backup
- Backup toàn bộ code trước khi thay đổi
- Test kỹ trước khi deploy lên production

## 🔧 Troubleshooting

### Lỗi "API key not valid"
- Kiểm tra API key đã được copy đúng chưa
- Kiểm tra domain đã được thêm vào TinyMCE chưa
- Kiểm tra tài khoản TinyMCE còn hoạt động không

### TinyMCE không load
- Kiểm tra console browser có lỗi gì không
- Kiểm tra network tab xem có request nào bị fail không
- Kiểm tra API key trong tất cả các file đã được cập nhật chưa

### Editor hiển thị nhưng không hoạt động
- Kiểm tra domain configuration
- Kiểm tra browser console
- Thử refresh page và clear cache

### Uploadcare không hoạt động
- Kiểm tra public key đã đúng chưa
- Kiểm tra script Uploadcare đã được load chưa
- Kiểm tra console browser có lỗi gì không

## 📞 Hỗ trợ
Nếu gặp vấn đề, có thể:
1. Kiểm tra documentation TinyMCE
2. Liên hệ support TinyMCE
3. Kiểm tra logs server và browser console
