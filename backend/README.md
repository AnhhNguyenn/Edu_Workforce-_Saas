# EduOps SaaS Backend - Developer Guide

Đây là tài liệu kỹ thuật chuyên sâu dành cho đội ngũ Backend Developer & DevOps. Tài liệu giải phẫu chi tiết kiến trúc hệ thống, các module cốt lõi và hướng dẫn cài đặt/vận hành môi trường Local.

---

## 🏗 1. Kiến Trúc Hệ Thống (Architecture)
Dự án được xây dựng theo kiến trúc **Clean Architecture** kết hợp **Domain-Driven Design (DDD)**.
- **`EduOps.Domain`**: Chứa toàn bộ Entities (Bảng CSDL), Enums (Trạng thái chuẩn) và Interfaces. Không phụ thuộc vào bất kỳ thư viện ngoài nào.
- **`EduOps.Application`**: Chứa Business Logic (Services), DTOs (Data Transfer Objects), Exceptions và Validations.
- **`EduOps.Infrastructure`**: Thao tác trực tiếp với Database (Entity Framework Core), Unit of Work, và các API bên ngoài (Cloudflare R2, SePay).
- **`EduOps.Api`**: Lớp ngoài cùng (Controllers, Middleware, Action Filters). Chịu trách nhiệm cấu hình API, DI (Dependency Injection) và Swagger.

---

## ⚙️ 2. Phân Tích Kỹ Thuật Chuyên Sâu (Core Modules)

### 2.1. Multi-Tenancy & Data Isolation (Cách ly dữ liệu)
- **Vấn đề**: Là một hệ thống SaaS, hàng trăm Trung tâm (Organization) dùng chung 1 Database. Phải tuyệt đối ngăn chặn việc Trung tâm A nhìn thấy học sinh của Trung tâm B.
- **Giải pháp**: Áp dụng **Global Query Filter** ở tầng DbContext (`EduOpsDbContext.cs`).
  - Tất cả Entity nhạy cảm đều kế thừa `TenantEntity`.
  - Mỗi khi có câu query SQL bắn xuống DB, EF Core tự động chèn thêm điều kiện `WHERE OrganizationId = {Current_Org_Id}` ngầm ở dưới.
  - **Super Admin** được thiết kế để bypass (bỏ qua) filter này, cho phép nhìn toàn cảnh hệ thống.

### 2.2. Paywall & SePay Payment (Thanh toán & Khóa tài khoản)
- **Logic Paywall**: 
  - Sử dụng Custom Attribute `[RequirePaidSubscription]` bọc ngoài các API quan trọng.
  - Middleware sẽ soi thời hạn `SubscriptionEnd`. Nếu gói cước hết hạn hoặc trạng thái là `LOCKED`, nó sẽ tự động update DB thành `EXPIRED` và chặn luồng bằng mã lỗi `403_SUBSCRIPTION_REQUIRED`.
- **Tích hợp SePay**:
  - KHÔNG dùng SDK. Giao tiếp trực tiếp qua REST API bằng `HttpClient`.
  - **Webhook (IPN)**: Xây dựng Endpoint `POST /api/sepay/ipn` hứng dữ liệu từ SePay khi có biến động số dư.
  - **Bảo mật Webhook**: Chống Hacker giả mạo bằng cách yêu cầu Query Param `?token=YOUR_SECRET_TOKEN` khớp với `appsettings.json`.

### 2.3. GPS Check-in (Điểm danh bằng Tọa độ)
- **Công thức Haversine**: Tính toán khoảng cách đường chim bay giữa Tọa độ của Học sinh/Giáo viên so với Tọa độ Trường học.
- **Cấu hình**: Bán kính điểm danh hợp lệ được lấy linh động từ `Organization.AllowedRadiusMeters` (Mặc định: 100 mét). Sai số cho phép ở mức lý tưởng.

### 2.4. Cloudflare R2 (Lưu trữ ảnh & Media)
- Sử dụng Amazon S3 API (AWSSDK.S3) tương thích 100% với Cloudflare R2 để tối ưu chi phí.
- Upload theo luồng: `Client -> Backend -> R2 -> Trả về Public URL`. Hỗ trợ lưu trữ minh chứng chấm công và file Báo cáo (Report).

---

## 🚀 3. Hướng Dẫn Cài Đặt (Setup & Run)

### 3.1. Yêu cầu hệ thống
- .NET 8.0 SDK
- PostgreSQL (Cài local hoặc dùng Cloud như NeonDB/Supabase)
- Postman / Swagger để test API.

### 3.2. Cấu hình `appsettings.Development.json`
Đảm bảo bạn đã điền đầy đủ các thông số quan trọng sau:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=EduOpsDb;Username=postgres;Password=..."
  },
  "JwtSettings": {
    "Key": "Chuỗi_Bảo_Mật_Đủ_Dài_Của_Bạn",
    "Issuer": "EduOpsAPI",
    "Audience": "EduOpsClient"
  },
  "CloudflareR2": {
    "AccessKey": "...",
    "SecretKey": "...",
    "AccountId": "...",
    "BucketName": "...",
    "PublicDomain": "https://pub-..."
  },
  "SePay": {
    "MerchantId": "SP-...",
    "SecretKey": "...",
    "WebhookToken": "eduops_sepay_secret_9999" // Token bắt buộc khi test Webhook
  }
}
```

### 3.3. Build và Chạy dự án
1. Mở Terminal tại thư mục `backend`.
2. Gõ lệnh Cập nhật Database:
   ```bash
   dotnet ef database update --project EduOps.Infrastructure --startup-project EduOps.Api
   ```
3. Chạy Server:
   ```bash
   dotnet run --project EduOps.Api
   ```
4. **Data Seeder tự động**: Ngay khi chạy lệnh `dotnet run` lần đầu tiên, hệ thống sẽ tự động cấy (seed) sẵn vào Database:
   - 1 Gói cước mẫu (Gói Pro)
   - 4 Tài khoản Test (`superadmin@test.com`, `centeradmin@test.com`, `teacher@test.com`, `assistant@test.com`). Mật khẩu chung: `Admin@123`.
5. Truy cập Swagger UI để test: `http://localhost:5000/swagger`

---

## 🧪 4. Hướng Dẫn Test & Giả Lập

### 4.1. Test Webhook SePay ở Local
Vì SePay không thể gửi IPN (Webhook) vào `localhost`, hãy sử dụng **Ngrok**:
1. Cài đặt Ngrok.
2. Chạy lệnh: `ngrok http 5000` (Nếu Backend chạy ở port 5000).
3. Lấy URL Public Ngrok cung cấp, ví dụ: `https://abcd.ngrok.app`.
4. Cấu hình vào Dashboard SePay: `https://abcd.ngrok.app/api/sepay/ipn?token=eduops_sepay_secret_9999`.
5. Bấm "Gửi Test" trên SePay để theo dõi Log đổ về Backend.

### 4.2. Test Logic Paywall
1. Dùng tài khoản Super Admin, tạo 1 Organization với `SubscriptionStatus` là `LOCKED`.
2. Đăng nhập bằng tài khoản Center Admin của Organization đó.
3. Gọi thử API Tạo Giáo viên. Chắc chắn bạn sẽ nhận được mã lỗi `403`.
4. Đóng vai SePay, gọi POST vào `/api/sepay/ipn` để truyền Data Thanh toán giả lập (Nhớ truyền đúng `Invoice ID`).
5. Gọi lại API Tạo Giáo viên. Lúc này Account đã `ACTIVE` và API hoạt động bình thường!
