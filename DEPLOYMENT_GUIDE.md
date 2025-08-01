# Hướng Dẫn Cấu Hình Deployment

## 🚀 Triển Khai Frontend (Vercel)

### 1. Cấu hình Environment Variables trên Vercel

Sau khi deploy lên Vercel, vào **Settings > Environment Variables** và thêm:

```
NEXT_PUBLIC_API_URL=https://your-railway-app-name.railway.app
```

### 2. Thay đổi URL Railway

Thay thế `your-railway-app-name` bằng tên thực tế của ứng dụng Railway của bạn.

## 🚂 Triển Khai Backend (Railway)

### 1. Cấu hình Environment Variables trên Railway

Vào **Variables** tab và thêm các biến môi trường cần thiết:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
```

### 2. Cập nhật Callback URLs

Trong Google OAuth và Facebook OAuth, cập nhật callback URLs:

**Google OAuth:**
- Thêm: `https://your-railway-app-name.railway.app/auth/google/callback`

**Facebook OAuth:**
- Thêm: `https://your-railway-app-name.railway.app/auth/facebook/callback`

## 🔧 Cấu Hình Local Development

### 1. Tạo file .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Chạy script cập nhật URLs (nếu cần)

```bash
cd duantn
node scripts/update-api-urls.js
```

## 📝 Kiểm Tra Sau Deployment

### 1. Kiểm tra API endpoints
- Đảm bảo tất cả API calls đều sử dụng URL Railway
- Test các chức năng chính: đăng nhập, đăng ký, xem sản phẩm

### 2. Kiểm tra OAuth
- Test đăng nhập Google
- Test đăng nhập Facebook

### 3. Kiểm tra file uploads
- Đảm bảo avatar uploads hoạt động đúng
- Kiểm tra product images

## 🐛 Troubleshooting

### Lỗi CORS
Nếu gặp lỗi CORS, thêm vào backend:

```javascript
app.use(cors({
  origin: ['https://your-vercel-app.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
```

### Lỗi Environment Variables
- Kiểm tra tên biến môi trường có đúng không
- Đảm bảo restart ứng dụng sau khi thêm biến môi trường

### Lỗi Database Connection
- Kiểm tra MongoDB URI
- Đảm bảo IP whitelist cho MongoDB Atlas

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Console logs của browser
2. Railway logs
3. Vercel deployment logs 