# TÀI LIỆU MÔ TẢ TOÀN BỘ CHỨC NĂNG HỆ THỐNG EDUOPS SAAS

Hệ thống EduOps SaaS là một nền tảng phần mềm quản lý (Software as a Service) hỗ trợ các Trung tâm Giáo dục, Gia sư, và Trường học quản lý nhân sự, học viên, lịch giảng dạy và chấm công một cách toàn diện. 

Dưới đây là mô tả chi tiết các phân hệ (Module) và chức năng của hệ thống được phân chia theo từng vai trò (Role) tham gia:

---

## 1. Phân hệ Quản trị Hệ thống (Vai trò: SUPER ADMIN)
*Đây là tài khoản sở hữu nền tảng EduOps SaaS, có quyền lực cao nhất, quản lý toàn bộ các khách hàng (Trung tâm) đang sử dụng dịch vụ.*

*   **Quản lý Khách hàng (Organizations Management):** Thêm mới, chỉnh sửa thông tin, xem danh sách và khóa/mở khóa các Trung tâm giáo dục tham gia vào hệ thống.
*   **Quản lý Gói cước (Subscriptions & Pricing):** Khởi tạo và thiết lập các gói cước (ví dụ: Basic, Pro, Enterprise) với mức giá và giới hạn tài nguyên khác nhau (Giới hạn số học viên, giáo viên).
*   **Quản lý Tài khoản Center Admin:** Khởi tạo tài khoản quản trị viên cấp cao nhất cho từng Trung tâm khi họ mua/đăng ký dịch vụ.
*   **Thống kê Tổng quan (Super Admin Dashboard):** Xem báo cáo về số lượng Trung tâm đang hoạt động, doanh thu từ các gói cước và theo dõi dòng tiền thanh toán tự động qua SePay.

---

## 2. Phân hệ Quản trị Trung tâm (Vai trò: CENTER ADMIN & ASSISTANT)
*Center Admin là Giám đốc hoặc Quản lý của một Trung tâm cụ thể. Dữ liệu của họ được cách ly hoàn toàn, chỉ quản lý tài nguyên thuộc về Trung tâm của mình.*

*   **Quản lý Nhân sự (User Management):** 
    *   Tạo tài khoản, cấp quyền, và quản lý hồ sơ cho Giáo viên (Teacher) và Trợ giảng (Assistant).
    *   Khóa tài khoản hoặc reset mật khẩu cho nhân sự.
*   **Quản lý Cơ sở / Trường học (School/Location Management):** 
    *   Khai báo danh sách các trường học hoặc cơ sở giảng dạy.
    *   **Đặc biệt:** Cấu hình **Tọa độ GPS (Vĩ độ, Kinh độ)** và bán kính cho phép (Radius) của cơ sở để phục vụ tính năng điểm danh.
*   **Quản lý Học viên (Student Management):** 
    *   Thêm mới, nhập (import) danh sách học viên.
    *   Cập nhật thông tin cá nhân, liên hệ của phụ huynh và phân bổ học viên vào các lớp học.
*   **Quản lý Lớp & Lịch học (Class & Session Management):**
    *   Tạo lớp học, phân công Giáo viên/Trợ giảng phụ trách chính.
    *   Xếp lịch học định kỳ (Schedules) theo các thứ trong tuần (VD: T2-T4-T6, từ 18h-20h).
    *   Từ lịch định kỳ, hệ thống tự động sinh ra các **Buổi học cụ thể (Sessions)** cho từng ngày để phục vụ điểm danh.
*   **Quản lý Thanh toán & Tự động Gia hạn (Billing & SePay IPN):** 
    *   Xem trạng thái Gói cước hiện tại của Trung tâm (Sắp hết hạn, Đang nợ, Đang hoạt động).
    *   Mở Popup quét mã QR để đóng tiền gia hạn gói cước. Hệ thống tự động mở khóa tính năng ngay lập tức khi khách chuyển khoản xong nhờ Webhook SePay.
*   **Báo cáo & Thống kê (Reports):** 
    *   Xuất các báo cáo chuyên cần của học viên.
    *   Báo cáo số giờ dạy, ca dạy của giáo viên để tính lương.

---

## 3. Phân hệ Giáo viên & Trợ giảng (Vai trò: TEACHER)
*Dành cho người trực tiếp đứng lớp giảng dạy.*

*   **Lịch giảng dạy (My Schedule):** 
    *   Xem lịch trình các buổi học (Sessions) mà giáo viên được phân công trong ngày/tuần/tháng trên giao diện Calendar.
*   **Điểm danh bằng GPS (GPS Check-in / Attendance):** 
    *   Khi đến trường/cơ sở, giáo viên mở App/Web trên điện thoại để Check-in. 
    *   Hệ thống so khớp tọa độ thiết bị với tọa độ của Cơ sở (Tính bằng công thức Haversine). Nếu nằm trong phạm vi bán kính cho phép mới được điểm danh thành công.
    *   Hỗ trợ upload ảnh chụp minh chứng lớp học trực tiếp lên lưu trữ đám mây (Cloudflare R2).
*   **Chấm công Học viên trong lớp:** 
    *   Mở danh sách lớp và tick trạng thái cho từng học viên: Có mặt (Present), Vắng phép (Excused Absence), Vắng không phép (Unexcused Absence), Đi muộn (Late).
*   **Nhận Thông báo (Real-time Notifications):** 
    *   Nhận thông báo Pop-up (toast) tức thời khi có lịch dạy mới, lịch dạy bị thay đổi hoặc hủy bỏ.
    *   Nhận Email/Thông báo hệ thống tự động nhắc nhở lịch dạy vào lúc 21h00 tối hôm trước.

---

## 4. Các Tính năng Cốt lõi của Hệ thống (Core System Features)

*   **Cơ chế khóa Tường phí (Paywall Blocking):** Nếu gói cước của Trung tâm hết hạn (EXPIRED), hệ thống sẽ vô hiệu hóa tất cả các nút Thêm mới/Chỉnh sửa ở Frontend và chặn các API POST/PUT ở Backend (Báo lỗi 403_SUBSCRIPTION_REQUIRED). Chỉ cho phép người dùng xem dữ liệu cũ hoặc vào màn hình nạp tiền.
*   **Cách ly dữ liệu (Data Isolation / Multi-tenancy):** Cam kết dữ liệu học viên, doanh thu của Trung tâm A tuyệt đối không bị lộ sang Trung tâm B nhờ bộ lọc lõi (Global Query Filter) của DB.
*   **Hệ thống Tác vụ chạy ngầm (Hangfire Background Jobs):** Tự động hóa hoàn toàn các quy trình như: Quét các gói cước hết hạn mỗi buổi sáng (8:00 AM) và khóa tài khoản; Gửi nhắc nhở lịch dạy hằng ngày (9:00 PM).
*   **Tương tác Thời gian thực (SignalR WebSockets):** Trải nghiệm người dùng mượt mà, màn hình tự động cập nhật số liệu, thông báo mà không bao giờ cần phải bấm F5 (Tải lại trang).
