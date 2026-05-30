# EDUOPS SAAS - CODING RULES & GUIDELINES

Tài liệu này định nghĩa các nguyên tắc lập trình bắt buộc khi phát triển hệ thống EduOps SaaS.

## 1. Bảo mật & Xử lý Ngoại lệ (Exception Handling)
- **Thông báo lỗi chung chung (Generic Error Messages):** Tuyệt đối không trả về các thông báo lỗi quá chi tiết liên quan đến Phân quyền (Authorization), Cấu trúc Database, hoặc Logic hệ thống nội bộ cho Client.
- **Quy tắc ném lỗi Quyền hạn:** Khi người dùng vi phạm quyền, chỉ sử dụng format chung:
  `throw new UnauthorizedAccessException("Bạn không có quyền thực hiện thao tác này.");`
- **Che giấu sự tồn tại của dữ liệu:** Ở các luồng nhạy cảm như Quên mật khẩu (Forgot Password), không được trả về lỗi "Email không tồn tại" vì sẽ giúp hacker dò quét (User Enumeration). Hãy luôn trả về thông báo thành công "Nếu email hợp lệ, mã OTP sẽ được gửi".

## 2. Multi-tenancy (Cách ly dữ liệu Trung tâm)
- **Luôn dựa vào Token:** Tuyệt đối không tin tưởng `OrganizationId` do Client gửi lên trong request body khi thực hiện các thao tác POST/PUT. Phải luôn trích xuất `OrganizationId` từ JWT Token của phiên đăng nhập để ép kiểu (override).
- **Global Query Filter:** Mọi truy vấn lấy dữ liệu (GET, List) đều đã được EF Core tự động bọc bộ lọc `OrganizationId`. Không cần tự viết lại điều kiện `where x.OrganizationId == ...` ở tầng Service trừ khi có logic đặc thù.
- **Cross-tenant Updates:** Khi sửa hoặc xóa (PUT/DELETE), luôn gọi `GetByIdAsync`. Nếu Global Query Filter trả về `null`, điều đó có nghĩa là User đang cố thao tác trên dữ liệu của trung tâm khác. Hãy ném lỗi `NotFoundException`.

## 3. Kiến trúc hệ thống
- Mọi logic nghiệp vụ (Business Logic) phải đặt trong tầng `Application/Services`. Controllers chỉ làm nhiệm vụ điều phối và Validate DTO.
- Không lưu URL cứng của ảnh trong DB. Chỉ lưu đường dẫn tương đối (Path) của Cloudflare R2 để linh hoạt.

## 4. Tối ưu hóa Hiệu năng & Bộ nhớ (Performance & Memory)
- **Luôn dùng AsNoTracking cho các truy vấn Đọc (GET):** Đối với các API lấy danh sách, lấy chi tiết trả về JSON (không thay đổi dữ liệu), bắt buộc phải truyền cờ `asNoTracking: true` vào các hàm của `IRepository`. Điều này giúp tiết kiệm >50% RAM và CPU vì Entity Framework không phải theo dõi trạng thái các Object.
- **Không phá vỡ Unique Index bằng ToLower():** Tuyệt đối KHÔNG viết `u.Email.ToLower() == request.Email.ToLower()` trong biểu thức LINQ. SQL Server mặc định không phân biệt hoa thường. Việc ép kiểu trong Query sẽ vô hiệu hóa Index và biến truy vấn thành O(N) (Full Table Scan).
- **Hạn chế fetch thừa dữ liệu:** 
  - Nếu chỉ cần kiểm tra tồn tại (ví dụ: kiểm tra trùng Email), hãy dùng `repo.AnyAsync(...)` thay vì tải cả Object về bằng `FindAsync().Any()`.
  - Nếu chỉ cần lấy 1 Object, hãy dùng `repo.FirstOrDefaultAsync(...)` thay vì tải cả một List bằng `FindAsync().FirstOrDefault()`.
