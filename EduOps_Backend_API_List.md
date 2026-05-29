# DANH SÁCH TOÀN BỘ 53 API ENDPOINTS (BACKEND EDUOPS SAAS)

Dưới đây là danh sách tổng hợp toàn bộ **53 chức năng (API Endpoints)** chia theo 14 Controller hiện có trong Backend:

### 1. Auth (Đăng nhập & Xác thực)
1. `POST /api/auth/login` - Đăng nhập
2. `POST /api/auth/refresh` - Xin cấp lại Token mới

### 2. Users (Quản lý Nhân sự / Tài khoản)
3. `GET /api/users` - Lấy danh sách nhân sự
4. `GET /api/users/{id}` - Xem chi tiết 1 nhân sự
5. `POST /api/users` - Tạo tài khoản mới
6. `PUT /api/users/{id}` - Cập nhật thông tin
7. `POST /api/users/{id}/deactivate` - Hủy kích hoạt tài khoản
8. `DELETE /api/users/{id}` - Xóa tài khoản
9. `POST /api/users/{id}/lock` - Khóa tài khoản
10. `POST /api/users/{id}/unlock` - Mở khóa tài khoản

### 3. Organizations (Quản lý Trung tâm / Super Admin)
11. `GET /api/organizations` - Lấy danh sách các trung tâm
12. `GET /api/organizations/{id}` - Xem chi tiết 1 trung tâm
13. `POST /api/organizations` - Tạo trung tâm mới
14. `PUT /api/organizations/{id}` - Cập nhật thông tin trung tâm
15. `POST /api/organizations/{id}/suspend` - Đình chỉ trung tâm
16. `POST /api/organizations/{id}/activate` - Kích hoạt lại trung tâm

### 4. Subscriptions (Gói cước & Đăng ký dịch vụ)
17. `GET /api/subscriptions/plans` - Lấy danh sách các gói cước (Basic/Pro/...)
18. `POST /api/subscriptions/plans` - Tạo gói cước mới
19. `POST /api/subscriptions/subscribe` - Đăng ký mua/gia hạn gói cước
20. `GET /api/subscriptions/promotions` - Lấy danh sách mã khuyến mãi
21. `POST /api/subscriptions/promotions` - Tạo mã khuyến mãi mới

### 5. SePayWebhook (Thanh toán tự động)
22. `POST /api/sepay/ipn` - Hứng dữ liệu chuyển khoản tự động từ SePay

### 6. Schools (Cơ sở / Trường học & Tọa độ GPS)
23. `GET /api/schools` - Lấy danh sách cơ sở
24. `GET /api/schools/{id}` - Xem chi tiết 1 cơ sở
25. `POST /api/schools` - Thêm cơ sở mới (kèm tọa độ)
26. `PUT /api/schools/{id}` - Sửa cơ sở
27. `DELETE /api/schools/{id}` - Xóa cơ sở

### 7. Students (Học viên)
28. `GET /api/students` - Lấy danh sách học viên
29. `GET /api/students/{id}` - Xem chi tiết học viên
30. `POST /api/students` - Thêm học viên mới
31. `PUT /api/students/{id}` - Cập nhật học viên
32. `DELETE /api/students/{id}` - Xóa học viên

### 8. Classes (Lớp học)
33. `GET /api/classes` - Danh sách lớp học
34. `GET /api/classes/{id}` - Chi tiết lớp
35. `POST /api/classes` - Tạo lớp mới
36. `PUT /api/classes/{id}` - Sửa thông tin lớp
37. `DELETE /api/classes/{id}` - Xóa lớp

### 9. ClassSchedules (Lịch học định kỳ)
38. `POST /api/classes/schedules` - Tạo lịch học định kỳ trong tuần
39. `POST /api/classes/enrollments` - Xếp học viên vào lớp
40. `POST /api/classes/generate-sessions` - Hệ thống tự động sinh ra các buổi học cụ thể từ lịch định kỳ

### 10. Sessions (Buổi học thực tế)
41. `GET /api/sessions` - Lấy danh sách các buổi học
42. `POST /api/sessions` - Tạo một buổi học thủ công (ngoại lệ)

### 11. Attendances (Điểm danh & Chấm công)
43. `POST /api/attendances/check-in` - Giáo viên Check-in (Xác thực GPS)
44. `POST /api/attendances/check-out` - Giáo viên Check-out
45. `GET /api/attendances/me` - Xem lịch sử điểm danh của bản thân
46. `POST /api/attendances/sessions/{sessionId}/students` - Giáo viên điểm danh vắng/có mặt cho học viên

### 12. Reports (Báo cáo & Upload file)
47. `GET /api/reports/session/{sessionId}` - Lấy báo cáo chi tiết của 1 buổi học
48. `POST /api/reports/session/{sessionId}/teacher` - Báo cáo chấm công cho giáo viên
49. `POST /api/reports/session/{sessionId}/assistant` - Báo cáo chấm công cho trợ giảng
50. `POST /api/reports/{reportId}/media` - Upload ảnh minh chứng (lên Cloudflare R2)

### 13. Notifications (Thông báo thời gian thực)
51. `GET /api/notifications` - Lấy danh sách thông báo
52. `POST /api/notifications/{id}/read` - Đánh dấu thông báo đã đọc

### 14. Profile (Hồ sơ cá nhân)
53. `POST /api/profile/avatar` - Upload/Cập nhật ảnh đại diện cá nhân
