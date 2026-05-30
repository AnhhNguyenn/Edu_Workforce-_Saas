# TỔNG QUAN KIẾN TRÚC HỆ THỐNG EDUOPS SAAS VÀ LỘ TRÌNH PHÁT TRIỂN

Dựa trên cấu trúc mã nguồn và các tài liệu kỹ thuật hiện có trong dự án `EduOps SaaS`, dưới đây là tổng hợp toàn bộ bức tranh kiến trúc, chức năng kỹ thuật của cả Frontend (FE) và Backend (BE), cũng như vạch ra định hướng phát triển (Future Direction) cho dự án.

---

## 1. KIẾN TRÚC & CHỨC NĂNG BACKEND (EduOps.Api)

**Công nghệ lõi:** .NET 8.0, C#, PostgreSQL, Entity Framework Core (EF Core).
**Mô hình Kiến trúc:** Clean Architecture & Domain-Driven Design (DDD) chia làm 4 lớp (Domain, Application, Infrastructure, API) đảm bảo sự tách biệt, dễ bảo trì và dễ mở rộng.

### Các chức năng kỹ thuật cốt lõi:
*   **Cơ chế Đa người thuê (Multi-Tenancy & Data Isolation):** 
    *   Hàng trăm Trung tâm (Organization) dùng chung 1 Database.
    *   Giải pháp: Sử dụng **Global Query Filter** của EF Core. Dữ liệu của các Trung tâm được tự động lọc ngầm qua `OrganizationId` mỗi khi truy vấn, đảm bảo Trung tâm A không thể thấy dữ liệu của Trung tâm B. Trừ Super Admin mới có quyền nhìn tổng thể.
*   **Xác thực & Phân quyền (Auth/RBAC):** 
    *   Quản lý đăng nhập bằng **JWT (JSON Web Token)** với cấu hình bảo mật cực chặt.
    *   Phân quyền chi tiết: *Super Admin, Center Admin, Teacher, Assistant.*
*   **Hệ thống Thanh toán & Khóa cổng (Paywall + SePay):**
    *   Sử dụng attribute custom `[RequirePaidSubscription]` bọc ngoài các API. Nếu Gói cước hết hạn, hệ thống trả về lỗi `403` tự động chặn mọi luồng ghi dữ liệu.
    *   Tích hợp trực tiếp **SePay qua Webhook (IPN)** để nhận thông báo chuyển khoản tự động. Hệ thống sẽ verify chữ ký an toàn, và cập nhật trạng thái gói cước (Mở khóa tính năng) theo thời gian thực mà không cần người can thiệp.
*   **Xử lý Tác vụ nền (Background Jobs) bằng Hangfire:** 
    *   Tự động chạy Cron Job kiểm tra hạn Gói cước vào 8:00 sáng và gửi thông báo nhắc nhở vào 21:00 tối hằng ngày.
*   **Thời gian thực (Real-time) bằng SignalR:** 
    *   Đẩy thông báo xuống Frontend ngay tức thì (Ví dụ: Khi SePay báo thanh toán thành công, Hub sẽ báo Frontend đổi giao diện lập tức).
*   **Xử lý GPS Check-in:** Áp dụng công thức Toán học *Haversine* tính khoảng cách dựa trên Tọa độ để xác minh vị trí điểm danh của học viên/giáo viên.
*   **Lưu trữ Đám mây:** Kết nối **Cloudflare R2** (Tương thích S3 API) lưu trữ hình ảnh minh chứng chấm công/báo cáo với chi phí siêu rẻ.
*   **Bảo vệ hệ thống:** Serilog ghi log chuẩn Doanh nghiệp, Rate Limiter chống DDoS, và FluentValidation chặn dữ liệu rác từ vòng gửi xe.

---

## 2. KIẾN TRÚC & CHỨC NĂNG FRONTEND (Next.js)

**Công nghệ lõi:** Next.js 14 (App Router), React 18, Tailwind CSS.

### Các chức năng kỹ thuật cốt lõi:
*   **UI/UX & Design System:** Tối ưu hiệu ứng thị giác với Tailwind CSS + **Shadcn UI** (Lucide icons, clsx). Đảm bảo giao diện hiện đại, chuyên nghiệp của 1 SaaS B2B.
*   **Quản lý State siêu mượt (State Management):**
    *   *Server State:* Dùng **React Query** (TanStack) thay vì `useEffect` thuần túy. Hỗ trợ tự động Caching, hiển thị Loading State tinh tế và tự refetch dữ liệu khi User quay lại màn hình.
    *   *Client State:* Dùng **Zustand** quản lý trạng thái UI Global (siêu gọn nhẹ).
*   **Form & Bắt lỗi:** Dùng **React Hook Form + Zod**. Đảm bảo Validate dữ liệu chặt chẽ ngay khi người dùng đang gõ phím.
*   **Luồng Xác thực Auth cực đỉnh:** 
    *   Sử dụng **NextAuth.js**.
    *   Khi đăng nhập, Token được tự động giải mã (Decode). Giao diện Sidebar (Thanh điều hướng) tự động ẩn/hiện các trang tính năng theo Role (Quyền) của User.
*   **Cơ chế phản ứng với Paywall (Khóa tài khoản):**
    *   Khi trạng thái `SubscriptionStatus` báo Hết Hạn/Bị khóa, Frontend lập tức giăng Banner đỏ cảnh báo.
    *   Tự động vô hiệu hóa (`disabled`) toàn bộ các nút hành động (Thêm/Sửa/Xóa), ép người dùng phải đi sang luồng Thanh Toán (Pricing).
*   **Trải nghiệm thanh toán Realtime (UX Đỉnh cao):** 
    *   Mở Popup quét QR. Kết nối WebSocket qua `@microsoft/signalr`.
    *   Khách quét điện thoại chuyển khoản xong -> Frontend tự động bắn pháo hoa, đóng màn hình và mở khóa hệ thống lập tức **KHÔNG CẦN F5 tải lại trang**.

---

## 3. HƯỚNG ĐI (FUTURE DIRECTION / ROADMAP)

Dựa trên cấu trúc SaaS rất nền tảng hiện tại, dưới đây là lộ trình kỹ thuật & sản phẩm để mở rộng hệ thống lên mức triệu người dùng:

### 🚀 Giai đoạn 1: Tối ưu Hóa Hiệu Năng & Vận Hành (Technical Scaling)
1. **Tích hợp Redis (Caching Layer):** Khi số lượng Trung tâm tăng lên, việc mỗi Request đều query xuống Postgres check Phân quyền/Gói cước sẽ làm nghẽn DB. Bạn cần Redis để lưu trữ Cache tạm thời và giảm tải DB lên đến 80%.
2. **Triển khai CI/CD (DevOps):** Trong file đã có sẵn `Dockerfile`. Bước tiếp theo là cấu hình GitHub Actions / GitLab CI. Mỗi lần `git push`, hệ thống tự Build Container và Deploy thẳng lên server (AWS/GCP/Azure) hoàn toàn tự động, Zero-Downtime.
3. **Observability (Giám sát hệ thống):** Thay vì chỉ đọc file Log (Serilog), cần đẩy log lên **Elastic Stack (ELK)** hoặc **Grafana/Prometheus** để monitor Performance theo thời gian thực (Ram, CPU, Báo động đỏ qua Telegram khi API sập).

### 💼 Giai đoạn 2: Phát triển Tính năng Sản phẩm (Product Extension)
1. **PWA & Mobile App Native:** Chức năng Điểm danh GPS trên Web đôi khi sẽ bị trình duyệt giới hạn quyền vị trí. Hướng tới việc bọc Next.js thành PWA, hoặc đẻ ra một nhánh Mobile App bằng **React Native** riêng cho Phụ huynh và Giáo viên để Push Notification mượt hơn.
2. **Cổng thông tin cho Phụ Huynh (Parent Portal):** Nâng cấp hệ thống để cấp account cho Phụ huynh, giúp họ đăng nhập theo dõi Bảng điểm, Báo cáo chuyên cần, Lịch học và Đóng học phí trực tiếp trên App.
3. **Mở rộng Cổng thanh toán (Payment Gateways):** SePay là rất tốt cho Chuyển khoản nội địa Việt Nam. Cần tích hợp thêm Momo/VNPay hoặc Stripe (nếu có tham vọng đánh mảng quốc tế).

### 🤖 Giai đoạn 3: "Vũ khí" Bí mật - AI & Automation
1. **AI Chatbot & Assistant:** Tích hợp OpenAI/Gemini vào nội bộ hệ thống. Các Trung tâm có thể dùng AI để sinh tự động nội dung bài tập, sinh Lộ trình học (Personalized Learning) hoặc phân tích tự động xu hướng trượt môn của Học viên.
2. **Module Marketing/CRM (Dạng Hubspot/Salesforce thu nhỏ):** Tích hợp công cụ giúp Trung tâm chạy Email Marketing, tạo phễu thu thập Leads học viên, Quản lý Sale chốt sale (Tính năng này giúp tăng doanh thu cho Khách hàng -> Họ sẽ ở lại với SaaS của bạn mãi mãi).
