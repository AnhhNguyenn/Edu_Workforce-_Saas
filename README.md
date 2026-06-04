# EduOps — Comprehensive Workforce & Class Operations SaaS

EduOps là một hệ thống phần mềm dạng Dịch vụ (SaaS) quy mô lớn, được thiết kế chuyên biệt để giải quyết bài toán vận hành phức tạp của các chuỗi hệ thống giáo dục, trung tâm ngoại ngữ, và cơ sở đào tạo. 

Hệ thống cung cấp một giải pháp toàn diện bao phủ từ cấp độ quản trị lõi (Super Admin) đến cấp độ vận hành cơ sở (Center Admin), và vươn tới tận điểm chạm cuối cùng là thiết bị di động của từng cá nhân (Teacher / Assistant). Đặc biệt nổi bật với giải pháp **Chống gian lận điểm danh qua hệ thống Định vị GPS (Geolocation + Haversine)** và kiến trúc **Đa khách thuê (Multi-tenant)** khép kín.

---

## 🌟 TÀI LIỆU TÍNH NĂNG CHI TIẾT (FULL FEATURES)

Hệ thống được chia làm 4 Role phân quyền với các đặc quyền và cổng giao diện (Portal) hoàn toàn độc lập, đảm bảo bảo mật dữ liệu tuyệt đối.

### 1. Phân hệ Tổng Công Ty (Super Admin Portal)
*Giao diện quản trị cấp cao dành cho Chủ sở hữu phần mềm SaaS.*

- **Global Dashboard (Thống kê thời gian thực):** 
  - Biểu diễn sức khỏe hệ thống (System Overview) qua các chỉ số: Tổng số Tenants, Lượng Users Active, Tổng Doanh Thu.
  - Tích hợp biểu đồ chuẩn phân tích (`recharts`): Biểu đồ Miền (Area Chart) theo dõi luồng doanh thu 6 tháng, Biểu đồ Cột (Bar Chart) phân tích tốc độ tăng trưởng Tenant mới.
- **Organization Management (Quản lý Khách thuê/Tenants):**
  - Khởi tạo Trung tâm mới, tự động cấp phát không gian dữ liệu độc lập (Tenant Isolation).
  - Tạm ngưng (Suspend) / Kích hoạt lại (Activate) toàn bộ hoạt động của một Trung tâm chỉ bằng 1 click.
  - **Deep Stats Inspection**: Khi bấm vào một Trung tâm cụ thể, Super Admin có thể "nhìn xuyên thấu" hiệu suất vận hành của trung tâm đó (Tổng số giáo viên, Tần suất mở ca học (Sessions/tháng), Tỷ lệ đi học chuyên cần của học viên (Attendance Rate)).

### 2. Phân hệ Quản trị Trung tâm (Center Admin Portal)
*Trái tim của hệ thống vận hành. Dành cho Quản lý / Giám đốc chi nhánh.*

- **Quản lý Cơ sở vật chất (Schools Management):**
  - CRUD các điểm dạy vật lý trực thuộc trung tâm.
  - **Bản đồ Tương tác (Leaflet/OpenStreetMap):** Cung cấp công cụ chọn vị trí trực quan. Center Admin kéo thả ghim trực tiếp trên bản đồ để ấn định chính xác Vĩ độ (Latitude) và Kinh độ (Longitude) của trường.
  - Thiết lập bán kính GPS hợp lệ (vd: 200m) làm vòng kim cô điểm danh cho giáo viên.
- **Quản lý Nhân sự (Workforce Management):**
  - Cấp tài khoản và số hóa hồ sơ cho `TEACHER` và `ASSISTANT`.
- **Hệ thống Lớp & Ca học (Classes & Sessions):**
  - Lên lịch trình, tạo và phân bổ ca học.
  - Phân công tự động Giáo viên đứng chính và Trợ giảng đi kèm cho từng ca.
- **Kiểm soát Báo cáo & Điểm danh (Attendance Tracking):**
  - Nhận và xét duyệt Báo cáo điểm danh từ hiện trường (Giáo viên nộp lên).
  - Bộ lọc thông minh cho phép tìm kiếm nhanh các báo cáo Trễ, Chờ Duyệt, Đã Duyệt. Xuất file Excel (CSV) tự động.
- **Center Dashboard:** 
  - Thống kê chéo dữ liệu nội bộ: Số lớp đang Active, Giáo viên sẵn sàng, và theo dõi trực tiếp các Ca học Đang diễn ra trong ngày hôm nay (`statusCode = ONGOING`).

### 3. Phân hệ Hiện trường - Giáo viên (Teacher Mobile Portal)
*Được thiết kế tối ưu hóa hiển thị Mobile-first. Giáo viên dùng điện thoại quét ngay tại lớp.*

- **Định vị & Điểm danh Chống gian lận (GPS Check-in System):**
  - Thu thập vị trí (Geolocation API) trực tiếp từ phần cứng điện thoại.
  - Tự động chạy thuật toán `Haversine` ở tầng Backend để đối chiếu khoảng cách toán học giữa vị trí của Giáo viên và tọa độ `Lat/Lng` của Trường. 
  - Nếu khoảng cách > Bán kính cho phép (200m), hệ thống khóa quyền truy cập báo cáo và đánh dấu vi phạm.
- **Nhật ký Giảng dạy (Today's Schedule):**
  - Liệt kê toàn bộ các ca học cần đứng lớp trong ngày.
- **Quản lý Lớp học thực tế (Class Attendance):**
  - Thao tác quét điểm danh bằng hệ thống Nút gạt (Toggle) mượt mà cho toàn bộ sĩ số học viên trong lớp. Đánh giá nhanh tình hình học tập.
- **Submit Report (Nộp báo cáo chốt ca):**
  - Ký điện tử và gửi báo cáo điểm danh về cho Center Admin. Khi đã `SUBMITTED`, giáo viên không thể sửa đổi (nguyên tắc bất biến dữ liệu).

### 4. Phân hệ Hiện trường - Trợ giảng (Assistant Mobile Portal)
*Giới hạn đặc quyền so với Giáo viên.*

- **GPS Check-in độc lập**: Vẫn phải tuân thủ chuẩn Check-in chống gian lận như Giáo viên.
- **Quyền Giám sát (Read-Only)**: Trợ giảng có thể vào xem trạng thái điểm danh của lớp để hỗ trợ sắp xếp học viên, nhưng **hệ thống Backend sẽ chặn tuyệt đối** mọi nỗ lực sửa đổi, thêm bớt điểm danh hoặc Gửi Báo Cáo. Quyền Chốt Ca chỉ thuộc về Giáo viên chủ nhiệm.

---

## 💻 CÔNG NGHỆ BỀN VỮNG (ENTERPRISE TECH STACK)

### 🔹 Backend (Core Engine)
- **Framework**: C# .NET 8 Web API.
- **Architecture**: Mô hình Clean Architecture, chia tách rõ ràng các tầng (Domain, Application, Infrastructure, Api) kết hợp với Repository / Unit of Work Pattern.
- **Database Engine**: PostgreSQL + Entity Framework Core (Code-first Migrations).
- **Security & Identity**: 
  - JSON Web Tokens (JWT) kết hợp xác thực mã hóa Bcrypt.
  - Middleware kiểm soát Role khắt khe bằng Policy-based Authorization (`[Authorize(Roles="TEACHER")]`). Chống trục lợi leo thang đặc quyền (Privilege Escalation).
- **Data Isolation**: Cơ chế truy vấn Tự động lọc theo `OrganizationId` đối với các Center Admin/Teacher, đảm bảo dữ liệu giữa các Khách thuê (Tenant) không bao giờ bị lẫn lộn.

### 🔹 Frontend (User Interface)
- **Framework**: Next.js 14 (App Router) với Server-Side Rendering (SSR) & Static Site Generation (SSG).
- **Language**: TypeScript (Type-safe toàn bộ hệ thống).
- **State & Data Fetching**: 
  - `Zustand` cho Global UI State nhẹ nhàng.
  - `@tanstack/react-query` xử lý toàn bộ logic Cache, Auto-Refetch, và Mutations dữ liệu API mượt mà.
- **UI & Styling**: Tailwind CSS, Class-variance-authority (CVA).
- **Authentication**: `Next-Auth` (Auth.js) lo luồng đăng nhập, giữ session và bắt tuyến đường (Middleware Middleware) bảo vệ các Routes theo Roles.
- **Ecosystem Libraries**:
  - `Recharts`: Render biểu đồ SVG phân tích mượt mà.
  - `React-Leaflet`: Render bản đồ OpenStreetMap (Không tốn phí Google Maps API).

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT DỰ ÁN (QUICK START)

### 1. Chuẩn bị Môi trường
- **Node.js** >= 18.x
- **.NET SDK** 8.0
- Máy chủ cơ sở dữ liệu **PostgreSQL** đang chạy.

### 2. Triển khai Backend
1. Mở Terminal tại: `backend/EduOps.Api`.
2. Mở file `appsettings.json`, chỉnh sửa chuỗi kết nối PostgreSQL tại `ConnectionStrings:DefaultConnection`.
3. Chạy các lệnh:
   ```bash
   dotnet restore
   dotnet ef database update
   dotnet run
   ```
4. Backend sẽ mở ở `http://localhost:5000`. Cổng giao tiếp API Document (Swagger) nằm tại `http://localhost:5000/swagger`.

### 3. Triển khai Frontend
1. Mở Terminal mới tại thư mục `frontend`.
2. Khôi phục các Modules:
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Lưu ý: Luôn dùng cờ `--legacy-peer-deps` để bỏ qua các xung đột nội bộ của ESLint với cấu hình Next.js hiện tại).*
3. Khởi chạy:
   ```bash
   npm run dev
   ```
4. Hệ thống Web sẽ lên sóng tại `http://localhost:3000`. Hệ thống sẽ tự động điều hướng Login tùy vào loại tài khoản.

---

## 🔐 THÔNG TIN TÀI KHOẢN (SEED DATA)
- **Trùm Cuối (Super Admin)**: `admin@eduops.com` / `123456`
- **Quản lý Trung tâm (Center Admin)**: `center1@gmail.com` / `123456`
- **Giáo viên & Trợ giảng**: Vui lòng truy cập cổng Center Admin, vào mục "Nhân sự" để trực tiếp khởi tạo và số hóa nhân viên của riêng mình.

---
*Bản quyền kiến trúc thuộc về đội ngũ EduOps. Sẵn sàng tích hợp Cloud (AWS/Azure) và chịu tải cao (High Availability).*
