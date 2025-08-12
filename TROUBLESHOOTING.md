# Hướng Dẫn Khắc Phục Lỗi

## Lỗi URIError: URI malformed

### Nguyên nhân
Lỗi này xảy ra khi có ký tự đặc biệt hoặc URL không hợp lệ trong dữ liệu, đặc biệt là:
- URL ảnh có ký tự đặc biệt
- Nội dung tin tức có ký tự không được encode đúng cách
- Tham số URL có ký tự đặc biệt

### Cách khắc phục đã thực hiện

#### 1. Sửa lỗi decodeURIComponent trong News.tsx
- Thêm try-catch cho `decodeURIComponent`
- Xử lý HTML entities trước khi decode
- Có fallback khi decode fail

#### 2. Cải thiện getNewsImageUrl
- Validate URL format
- Sanitize tên file có ký tự đặc biệt
- Có fallback image khi lỗi

#### 3. Cải thiện OptimizedImage component
- Validate và sanitize src URL
- Xử lý lỗi khi load ảnh
- Có fallback image

#### 4. Sửa lỗi trong shop page
- Thêm try-catch cho decodeURIComponent trong URL params

### Cách phòng tránh

#### 1. Khi upload ảnh
- Đảm bảo tên file không có ký tự đặc biệt
- Sử dụng Cloudinary để upload ảnh
- Validate file trước khi upload

#### 2. Khi nhập nội dung tin tức
- Sử dụng TinyMCE editor để tránh ký tự đặc biệt
- Validate nội dung trước khi lưu
- Encode đúng cách các ký tự đặc biệt

#### 3. Khi tạo URL
- Sử dụng slugify để tạo URL an toàn
- Validate URL params
- Encode URL params đúng cách

### Kiểm tra lỗi
1. Mở Developer Tools (F12)
2. Vào tab Console
3. Tìm lỗi URIError
4. Kiểm tra dữ liệu gây lỗi

### Test sau khi sửa
1. Thêm tin tức mới với ảnh
2. Kiểm tra hiển thị trên trang chủ
3. Kiểm tra trang chi tiết tin tức
4. Kiểm tra admin panel
