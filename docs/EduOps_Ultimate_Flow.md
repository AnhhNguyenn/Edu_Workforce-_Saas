# 👑 TÀI LIỆU LUỒNG HỆ THỐNG TOÀN DIỆN (TEXT-BASED ULTIMATE FLOW)

Để tiện cho việc đọc trực tiếp trên VS Code mà không cần cài thêm Plugin hỗ trợ vẽ hình, toàn bộ 59 APIs của hệ thống EduOps đã được chuyển đổi thành **7 Luồng Chạy Bằng Lời Văn** (Text-based). 

Tài liệu này mô tả chi tiết từng bước click chuột, API được gọi và cách hệ thống xử lý bên dưới.

---

## LUỒNG 1: XÁC THỰC & BẢO MẬT (AUTH & SECURITY FLOW)
*Quy trình đăng nhập, làm mới token và khôi phục mật khẩu.*

**A. Đăng nhập & Giữ phiên (Session)**
1. **Người dùng đăng nhập:** Trình duyệt gọi `POST /api/auth/login`. Hệ thống trả về `AccessToken` (có hiệu lực 15 phút) và `RefreshToken` (có hiệu lực 7 ngày).
2. **Hết hạn Token:** Khi AccessToken hết 15 phút, mọi lệnh gọi API tiếp theo sẽ bị từ chối với lỗi 401 Unauthorized.
3. **Làm mới Token:** App/Frontend lập tức gọi ngầm API `POST /api/auth/refresh` gửi kèm RefreshToken để xin cấp Token mới. Người dùng tiếp tục dùng app mà không bị văng ra bắt đăng nhập lại.
4. **Đăng xuất:** Người dùng gọi `POST /api/auth/logout`. Hệ thống xóa RefreshToken khỏi Database.

**B. Quên mật khẩu**
1. **Yêu cầu khôi phục:** Người dùng gọi `POST /api/auth/forgot-password`. Hệ thống tạo mã OTP 6 số và gửi qua Email (SMTP).
2. **Xác nhận đổi MK:** Người dùng nhập mã OTP lấy từ Email và mật khẩu mới vào API `POST /api/auth/reset-password-via-token` để đổi thành công.

---

## LUỒNG 2: GIA NHẬP NỀN TẢNG & THANH TOÁN (SAAS ONBOARDING FLOW)
*Quy trình để Center Admin bắt đầu sử dụng phần mềm.*

1. **Super Admin Setup:** Hệ thống được cấu hình sẵn các gói cước (`POST /api/subscriptions/plans`) và mã giảm giá (`POST /api/subscriptions/promotions`).
2. **Khởi tạo Tổ chức:** Khách hàng (Center Admin) đăng ký bằng cách gọi `POST /api/organizations`. Hệ thống cấp cho họ 1 mã Trung tâm với trạng thái `TRIAL` (Dùng thử) hoặc `LOCKED`.
3. **Tạo tài khoản Admin:** Center Admin tạo tài khoản quản trị đầu tiên cho họ qua `POST /api/users` và đăng nhập.
4. **Mua Gói cước:** Center Admin chọn mua 1 gói cước qua `POST /api/subscriptions/subscribe`. Hệ thống trả về mã QR Code Ngân hàng.
5. **Thanh toán tự động:** Center Admin cầm app ngân hàng quét mã QR. Sau khi tiền vào tài khoản công ty, cổng thanh toán SePay tự động bắn Webhook về API `POST /api/sepay/ipn`.
6. **Mở khóa Hệ thống:** Hệ thống nhận Webhook, xác thực dòng tiền và cập nhật trạng thái Tổ chức thành `ACTIVE`. Từ lúc này hệ thống mới cho phép Center Admin làm bước tiếp theo.

---

## LUỒNG 3: XÂY DỰNG KHUNG HỌC THUẬT (ACADEMIC SETUP FLOW)
*Quy trình Giám đốc setup hệ thống nhân sự, cơ sở và lớp học.*

1. **Tạo Cơ sở (School):** Center Admin gọi `POST /api/schools`. **Lưu ý:** Bắt buộc phải đính kèm Tọa độ (Vĩ độ / Kinh độ) lấy từ Google Maps để sau này làm mốc cho Giáo viên chấm công.
2. **Mời Nhân sự:** Gọi `POST /api/users` để tạo tài khoản cho Giáo viên (`TEACHER`) và Trợ giảng (`ASSISTANT`).
3. **Mở Lớp Học:** Gọi `POST /api/classes` để tạo lớp và gán lớp đó thuộc về 1 Cơ sở nhất định.
4. **Tạo Hồ sơ Học sinh:** Gọi `POST /api/students` để nhập danh sách học sinh vào hệ thống.
5. **Xếp Lớp:** Gọi `POST /api/classes/enrollments` để nhét các Học sinh ở bước 4 vào Lớp học ở bước 3.
*(Center Admin dùng các lệnh GET, PUT, DELETE tương ứng để sửa/xóa các đối tượng trên)*.

---

## LUỒNG 4: ĐỘNG CƠ SINH LỊCH HỌC (THE SCHEDULING ENGINE)
*Luồng thông minh nhất hệ thống, biến Lịch tuần thành hàng chục Buổi học thực tế.*

1. **Thiết lập Lịch tuần:** Center Admin gọi `POST /api/classes/schedules`. Truyền vào thông tin như: "Học Thứ 2, Thứ 4, Thứ 6, từ 18:00 đến 20:00".
2. **Kích hoạt Thuật toán:** Gọi `POST /api/classes/generate-sessions`. 
   - Hệ thống (Database) sẽ tự động tính toán thời gian từ ngày hôm nay đến X tháng sau.
   - Bỏ qua các ngày nghỉ Chủ Nhật hoặc Lễ, Tết.
   - Trực tiếp `Bulk Insert` (tạo hàng loạt) hàng chục bản ghi **Buổi học (Sessions)** vào Database.
3. **Ngoại lệ (Học bù):** Nếu cần tạo 1 buổi học phụ đạo lệch giờ, Center Admin gọi `POST /api/sessions` để tự tạo 1 buổi học thủ công (Manual Session).

---

## LUỒNG 5: VẬN HÀNH HÀNG NGÀY (DAILY OPERATIONS FLOW)
*Hành trình của Giáo viên trong 1 ngày làm việc.*

1. **Check-in cổng trường:** Giáo viên đến trường, bật App gọi `POST /api/attendances/check-in`. App sẽ bắt buộc lấy GPS của điện thoại truyền lên. API tính khoảng cách với GPS của School, nếu <= 50 mét mới cho phép Check-in thành công.
2. **Nhận việc:** Giáo viên gọi `GET /api/sessions` để lấy danh sách các Lớp mình phải dạy trong hôm nay.
3. **Điểm danh:** Đang dạy trong lớp, Giáo viên gọi `POST /api/attendances/sessions/{id}/students` để đánh dấu học sinh nào Có mặt/Vắng/Đi trễ.
4. **Viết Báo cáo & Nhận xét:** Cuối giờ học, Giáo viên gọi `POST /api/reports/session/{id}/teacher` để gửi nhận xét về buổi học.
5. **Gửi Ảnh phụ huynh:** Giáo viên chụp ảnh lớp, gọi `POST /api/reports/{id}/media`. Ảnh được đẩy lên Cloudflare R2, lưu đường dẫn vào Database để giảm tải cho Server.
6. **Check-out ra về:** Ra khỏi trường, Giáo viên gọi `POST /api/attendances/check-out` để chốt công ngày hôm đó.

---

## LUỒNG 6: QUẢN LÝ THÔNG BÁO & HỒ SƠ CÁ NHÂN (NOTIFICATIONS)
*Luồng tương tác của từng cá nhân.*

1. **Quản lý Hồ sơ:** Bất kỳ ai cũng có thể xem hồ sơ (`GET /api/profile`), tự đổi mật khẩu (`POST /api/profile/password`) hoặc đổi ảnh đại diện (`POST /api/profile/avatar`).
2. **Nhận Thông báo:** Khi có sự kiện xảy ra (Trung tâm gia hạn thành công, Giáo viên nộp báo cáo...), hệ thống ngầm gọi API tạo Thông báo. Người dùng gọi `GET /api/notifications` để xem và `POST /api/notifications/{id}/read` để đánh dấu đã đọc.

---

## LUỒNG 7: KỶ LUẬT & XỬ LÝ SỰ CỐ (MAINTENANCE FLOW)
*Luồng quyền lực cao nhất để dọn dẹp hệ thống.*

**A. Kỷ luật Nhân viên (Dành cho Center Admin):**
1. **Nghỉ việc:** Gọi `POST /api/users/{id}/deactivate` để ẩn tài khoản (Nhân viên không thể login, nhưng lịch sử giảng dạy vẫn còn giữ lại để đối soát lương).
2. **Phá hoại:** Nếu phát hiện gian lận, gọi `POST /api/users/{id}/lock` để khóa đứng tài khoản ngay lập tức.
3. **Cấp cứu:** Nếu nhân viên quên sạch mật khẩu mà không vào được email, Giám đốc gọi `POST /api/users/{id}/reset-password` để đặt lại mật khẩu thủ công cho họ.

**B. Kỷ luật Trung tâm (Dành cho Super Admin):**
1. **Quỵt tiền/Cấm sóng:** Gọi `POST /api/organizations/{id}/suspend`. Lập tức 100% nhân viên và Giám đốc của trung tâm đó không thể làm bất cứ thao tác nào trên hệ thống (do bị chặn bởi Middleware).
2. **Mở lại:** Khi đã nộp đủ tiền phạt, gọi `POST /api/organizations/{id}/activate` để hệ thống hoạt động bình thường trở lại.
