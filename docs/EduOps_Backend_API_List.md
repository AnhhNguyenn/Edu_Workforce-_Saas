# DANH SÁCH TOÀN BỘ 60 API ENDPOINTS (BACKEND EDUOPS SAAS)

Dưới đây là danh sách tổng hợp toàn bộ **60 chức năng (API Endpoints)** chia theo 14 Controller hiện có trong Backend:

### 1. Auth (Đăng nhập & Xác thực)
*(Tất cả người dùng)*
1. `POST /api/auth/login` - Đăng nhập
2. `POST /api/auth/refresh` - Xin cấp lại Token mới
3. `POST /api/auth/logout` - Đăng xuất [Yêu cầu Token]
4. `POST /api/auth/forgot-password` - Gửi mã OTP khôi phục mật khẩu vào Email
5. `POST /api/auth/reset-password-via-token` - Đặt lại mật khẩu mới bằng Token

### 2. Users (Quản lý Nhân sự / Tài khoản)
*(Quyền: SUPER_ADMIN, CENTER_ADMIN)*
6. `GET /api/users` - Lấy danh sách nhân sự
7. `GET /api/users/{id}` - Xem chi tiết 1 nhân sự
8. `POST /api/users` - Tạo tài khoản mới
9. `PUT /api/users/{id}` - Cập nhật thông tin
10. `POST /api/users/{id}/deactivate` - Hủy kích hoạt tài khoản
11. `DELETE /api/users/{id}` - Xóa tài khoản
12. `POST /api/users/{id}/lock` - Khóa tài khoản
13. `POST /api/users/{id}/unlock` - Mở khóa tài khoản
14. `POST /api/users/{id}/reset-password` - Admin chủ động đặt lại mật khẩu cho nhân viên

### 3. Organizations (Quản lý Trung tâm / Super Admin)
*(Quyền: SUPER_ADMIN)*

15. `GET /api/organizations` - Lấy danh sách các trung tâm
16. `GET /api/organizations/{id}` - Xem chi tiết 1 trung tâm
17. `POST /api/organizations` - Tạo trung tâm mới
18. `PUT /api/organizations/{id}` - Cập nhật thông tin trung tâm
19. `POST /api/organizations/{id}/suspend` - Đình chỉ trung tâm
20. `POST /api/organizations/{id}/activate` - Kích hoạt lại trung tâm

### 4. Subscriptions (Gói cước & Đăng ký dịch vụ)
*(Quyền: SUPER_ADMIN cho tạo mới, CENTER_ADMIN cho mua gói)*

21. `GET /api/subscriptions/plans` - Lấy danh sách các gói cước (Basic/Pro/...)
22. `POST /api/subscriptions/plans` - Tạo gói cước mới
23. `POST /api/subscriptions/subscribe` - Đăng ký mua/gia hạn gói cước
24. `GET /api/subscriptions/promotions` - Lấy danh sách mã khuyến mãi
25. `POST /api/subscriptions/promotions` - Tạo mã khuyến mãi mới

### 5. SePayWebhook (Thanh toán tự động)

26. `POST /api/sepay/ipn` - Hứng dữ liệu chuyển khoản tự động từ SePay

### 6. Schools (Cơ sở / Trường học & Tọa độ GPS)
*(Quyền: CENTER_ADMIN)*
27. `GET /api/schools` - Lấy danh sách cơ sở
28. `GET /api/schools/{id}` - Xem chi tiết 1 cơ sở
29. `POST /api/schools` - Thêm cơ sở mới (kèm tọa độ)
30. `PUT /api/schools/{id}` - Sửa cơ sở
31. `DELETE /api/schools/{id}` - Xóa cơ sở

### 7. Students (Học viên)
*(Quyền: CENTER_ADMIN, TEACHER chỉ được xem)*

32. `GET /api/students` - Lấy danh sách học viên
33. `GET /api/students/{id}` - Xem chi tiết học viên
34. `POST /api/students` - Thêm học viên mới
35. `PUT /api/students/{id}` - Cập nhật học viên
36. `DELETE /api/students/{id}` - Xóa học viên

### 8. Classes (Lớp học)
*(Quyền: CENTER_ADMIN, TEACHER chỉ được xem)*
37. `GET /api/classes` - Danh sách lớp học
38. `GET /api/classes/{id}` - Chi tiết lớp
39. `POST /api/classes` - Tạo lớp mới
40. `PUT /api/classes/{id}` - Sửa thông tin lớp
41. `DELETE /api/classes/{id}` - Xóa lớp

### 9. ClassSchedules (Lịch học định kỳ & Xếp lớp)
*(Quyền: CENTER_ADMIN)*
42. `POST /api/classes/{classId}/schedules` - Tạo lịch học định kỳ trong tuần
43. `POST /api/classes/{classId}/enrollments` - Xếp học viên vào lớp
44. `POST /api/classes/{classId}/generate-sessions` - Hệ thống tự động sinh ra các buổi học cụ thể từ lịch định kỳ

### 10. Sessions (Buổi học thực tế)

45. `GET /api/sessions` - Lấy danh sách các buổi học
46. `POST /api/sessions` - Tạo một buổi học thủ công (ngoại lệ)

### 11. Attendances (Điểm danh & Chấm công)

47. `POST /api/attendances/check-in` - Giáo viên Check-in (Xác thực GPS)
48. `POST /api/attendances/check-out` - Giáo viên Check-out
49. `GET /api/attendances/me` - Xem lịch sử điểm danh của bản thân
50. `POST /api/attendances/sessions/{sessionId}/students` - Giáo viên điểm danh vắng/có mặt cho học viên

### 12. Reports (Báo cáo & Upload file)

51. `GET /api/reports/session/{sessionId}` - Lấy báo cáo chi tiết của 1 buổi học
52. `POST /api/reports/session/{sessionId}/teacher` - Báo cáo chấm công cho giáo viên
53. `POST /api/reports/session/{sessionId}/assistant` - Báo cáo chấm công cho trợ giảng
54. `POST /api/reports/{reportId}/media` - Upload ảnh minh chứng (lên Cloudflare R2)

### 13. Notifications (Thông báo thời gian thực)

55. `GET /api/notifications` - Lấy danh sách thông báo
56. `POST /api/notifications/{id}/read` - Đánh dấu thông báo đã đọc

### 14. Profile (Hồ sơ cá nhân)
57. `GET /api/profile` - Lấy thông tin cá nhân của người dùng hiện tại
58. `PUT /api/profile` - Cập nhật thông tin cá nhân (SĐT, Địa chỉ)
59. `POST /api/profile/avatar` - Upload/Cập nhật ảnh đại diện cá nhân
60. `POST /api/profile/password` - Đổi mật khẩu cá nhân

---

## 🛡️ NHẬT KÝ KIỂM TOÁN BẢO MẬT & NÂNG CẤP LÕI (SECURITY & HARDENING AUDIT)

Dưới đây là danh sách các tính năng cốt lõi đã được **Bọc Thép chuẩn Enterprise** để đảm bảo 100% không xảy ra lỗi sập Server (500), thất thoát dữ liệu, hoặc ô nhiễm dữ liệu chéo (Cross-data pollution):

### 1. Global Infrastructure (Hạ tầng dùng chung)
- **Global Pagination Sort:** Tích hợp tự động `OrderByDescending(CreatedAt)` vào `Repository.cs`. Mọi API danh sách (`GET`) mặc định trả về dữ liệu mới nhất lên đầu, chống nháy giật UI.
- **Cascade Stability (`ignoreQueryFilters`):** Bật cờ xuyên thấu dữ liệu đã Xóa mềm (Soft Delete) ở các hàm nhạy cảm, đảm bảo tính toàn vẹn của Lịch sử Điểm danh & Tài chính dù Học viên/Giáo viên/Ca học đã bị xóa.

### 2. Academic Core - Học viên (Phần 7)
- **StudentCode Lock:** Chặn tái sử dụng Mã học viên cũ, tích hợp Regex bắt buộc chỉ chứa chữ, số, gạch ngang (Bảo vệ 100% tính năng in Barcode/QR Code).
- **Status Freeze:** Mở khóa tính năng đổi `Status` (Bảo lưu, Nghỉ học) để quản lý luân chuyển mà không cần Xóa mềm. Kèm Validation chặn ngày sinh rơi vào tương lai.

### 3. Academic Core - Lớp học (Phần 8)
- **Relational Desync Protection:** Khóa cứng thao tác đổi `SchoolId` sau khi tạo Lớp. Đảm bảo toàn bộ Buổi học (`Session`) thuộc lớp đó vĩnh viễn được neo vào đúng Tọa độ GPS của 1 Cơ sở.
- **Duplicate & Trim Guard:** Tự động cắt khoảng trắng đầu/cuối của dữ liệu. Bẫy lỗi chặn 2 Lớp học có cùng tên hoạt động trong cùng 1 Cơ sở.

### 4. Academic Core - Xếp lịch & Sinh ca học (Phần 9 & 10)
- **Cross-Role Radar:** Thuật toán bắt trùng lịch quét chéo toàn bộ Role (Giáo viên / Trợ giảng). Nếu 1 người đang có lịch dạy, vĩnh viễn không thể xếp người đó vào 1 ca học/lớp học khác cùng khung giờ.
- **Zombie Enrollment Guard:** Ném lỗi 400 nếu Admin cố tình xếp 1 Học viên Đã Nghỉ Học (`DROPPED_OUT`) vào lớp mới.
- **Bulk Generator Shield:** Thuật toán bắt trùng lịch được đưa vào bộ máy "Tự động sinh lịch tháng". Quét chặn ngay lập tức nếu lịch sinh ra đè lên lịch bù/lịch nghỉ lễ đã thiết lập trước. Kèm khiên Validator ép `StartTime < EndTime`.

### 5. Academic Core - Điểm danh (Phần 11)
- **Bypass GPS Check-out Lock:** Bắt buộc áp dụng thuật toán tọa độ `GeoCalculator` cho cả Check-out. Chặn đứng kẽ hở "Check-in ở trường rồi về nhà Check-out".
- **Check-out 500 Crash Fix:** Bọc `ignoreQueryFilters` cho Session lúc Check-out, cứu Giáo viên khỏi lỗi kẹt hệ thống khi Admin lỡ tay xóa Ca học trong lúc đang dạy.
- **Data Pollution Shield (Điểm danh ảo):** Khi Gửi danh sách điểm danh, hệ thống tự động lọc các Học sinh bị gửi trùng (chống lỗi 500 Constraint). Đồng thời đối chiếu với danh sách Lớp học chính thức, tát ngược lỗi 400 nếu nhét "Học sinh lạ" vào danh sách.
