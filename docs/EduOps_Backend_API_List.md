# DANH SÁCH TOÀN BỘ 59 API ENDPOINTS (BACKEND EDUOPS SAAS)

Dưới đây là danh sách tổng hợp toàn bộ **59 chức năng (API Endpoints)** chia theo 14 Controller hiện có trong Backend:

### 1. Auth (Đăng nhập & Xác thực)
1. `POST /api/auth/login` - Đăng nhập
2. `POST /api/auth/refresh` - Xin cấp lại Token mới
3. `POST /api/auth/logout` - Đăng xuất
4. `POST /api/auth/forgot-password` - Gửi mã OTP khôi phục mật khẩu vào Email
5. `POST /api/auth/reset-password-via-token` - Đặt lại mật khẩu mới bằng Token

### 2. Users (Quản lý Nhân sự / Tài khoản)
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
15. `GET /api/organizations` - Lấy danh sách các trung tâm
16. `GET /api/organizations/{id}` - Xem chi tiết 1 trung tâm
17. `POST /api/organizations` - Tạo trung tâm mới
18. `PUT /api/organizations/{id}` - Cập nhật thông tin trung tâm
19. `POST /api/organizations/{id}/suspend` - Đình chỉ trung tâm
20. `POST /api/organizations/{id}/activate` - Kích hoạt lại trung tâm

### 4. Subscriptions (Gói cước & Đăng ký dịch vụ)
21. `GET /api/subscriptions/plans` - Lấy danh sách các gói cước (Basic/Pro/...)
22. `POST /api/subscriptions/plans` - Tạo gói cước mới
23. `POST /api/subscriptions/subscribe` - Đăng ký mua/gia hạn gói cước
24. `GET /api/subscriptions/promotions` - Lấy danh sách mã khuyến mãi
25. `POST /api/subscriptions/promotions` - Tạo mã khuyến mãi mới

### 5. SePayWebhook (Thanh toán tự động)
26. `POST /api/sepay/ipn` - Hứng dữ liệu chuyển khoản tự động từ SePay

### 6. Schools (Cơ sở / Trường học & Tọa độ GPS)
27. `GET /api/schools` - Lấy danh sách cơ sở
28. `GET /api/schools/{id}` - Xem chi tiết 1 cơ sở
29. `POST /api/schools` - Thêm cơ sở mới (kèm tọa độ)
30. `PUT /api/schools/{id}` - Sửa cơ sở
31. `DELETE /api/schools/{id}` - Xóa cơ sở

### 7. Students (Học viên)
32. `GET /api/students` - Lấy danh sách học viên
33. `GET /api/students/{id}` - Xem chi tiết học viên
34. `POST /api/students` - Thêm học viên mới
35. `PUT /api/students/{id}` - Cập nhật học viên
36. `DELETE /api/students/{id}` - Xóa học viên

### 8. Classes (Lớp học)
37. `GET /api/classes` - Danh sách lớp học
38. `GET /api/classes/{id}` - Chi tiết lớp
39. `POST /api/classes` - Tạo lớp mới
40. `PUT /api/classes/{id}` - Sửa thông tin lớp
41. `DELETE /api/classes/{id}` - Xóa lớp

### 9. ClassSchedules (Lịch học định kỳ)
42. `POST /api/classes/schedules` - Tạo lịch học định kỳ trong tuần
43. `POST /api/classes/enrollments` - Xếp học viên vào lớp
44. `POST /api/classes/generate-sessions` - Hệ thống tự động sinh ra các buổi học cụ thể từ lịch định kỳ

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
58. `POST /api/profile/avatar` - Upload/Cập nhật ảnh đại diện cá nhân
59. `POST /api/profile/password` - Đổi mật khẩu cá nhân
