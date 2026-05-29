# EduOps SaaS Frontend - Developer Guide

Dự án Frontend được xây dựng bằng **Next.js 14** kết hợp với hệ sinh thái React hiện đại, thiết kế tối ưu cho trải nghiệm người dùng (UX) và khả năng mở rộng của một nền tảng SaaS.

---

## 🏗 1. Công Nghệ Cốt Lõi (Tech Stack)
- **Framework:** Next.js 14 (App Router)
- **Styling & UI:** Tailwind CSS kết hợp với **Shadcn UI** (thông qua `lucide-react`, `clsx`, `tailwind-merge`).
- **Quản lý State:** 
  - Server State (Gọi API): **React Query (@tanstack/react-query)** + **Axios**.
  - Client State (Global UI): **Zustand**.
- **Xác thực (Auth):** **NextAuth.js** (Sử dụng JWT Token Strategy).
- **Form & Validation:** **React Hook Form** kết hợp với **Zod** để bắt lỗi siêu chuẩn từ lúc gõ phím.
- **Realtime:** **SignalR** (@microsoft/signalr) để nhận thông báo tức thời từ Backend.

---

## ⚙️ 2. Phân Tích Kỹ Thuật Chuyên Sâu (Core Modules)

### 2.1. Xác thực & Phân quyền (NextAuth + Zustand)
- Mọi API call gọi sang Backend đều được đính kèm `Bearer Token` do **NextAuth** quản lý.
- Có logic tự động bóc tách (Decode) JWT Token để lấy `Role` (SUPER_ADMIN, CENTER_ADMIN, TEACHER, ASSISTANT) và `SubscriptionStatus`.
- Phân quyền động: Cụm Navigation Menu (Sidebar) sẽ tự động ẩn/hiện các trang (Routes) dựa vào `Role` của người dùng hiện tại.

### 2.2. Paywall & Giao diện Khóa tài khoản
- Khi Center Admin đăng nhập, FE sẽ soi trường `SubscriptionStatus`. Nếu giá trị là `EXPIRED` (Hết hạn) hoặc `LOCKED` (Bị khóa do nợ tiền):
  - **Banner cảnh báo:** Sẽ hiển thị một dòng Alert màu đỏ ở đầu mọi trang.
  - **Disable Action:** Tự động vô hiệu hóa các nút "Thêm mới", "Chỉnh sửa" bằng `disabled={isExpired}`.
  - Ép người dùng điều hướng sang trang `Pricing` để mua Gói.

### 2.3. Tích hợp Thanh toán SePay & Realtime (SignalR)
- **Luồng Frontend:**
  1. Gọi API lấy `QrCodeUrl` từ Backend.
  2. Hiển thị Popup quét mã QR.
  3. Khởi tạo một kết nối WebSocket bằng `SignalR Hub` tới `/hub/notifications`.
- Khi người dùng chuyển khoản xong, màn hình sẽ KHÔNG cần f5 (tải lại trang). Hub sẽ bắt được sự kiện `ReceiveNotification`, bắn pháo hoa ăn mừng (hiện Toast Success), đóng Popup QR và lập tức Dispatch hàm cập nhật lại Session (Chuyển `Status` về `ACTIVE`).

### 2.4. Data Fetching với React Query
- Mọi dữ liệu như Danh sách Giáo viên, Danh sách Lớp học đều không dùng `useEffect` thuần túy.
- Sử dụng **React Query** (`useQuery`, `useMutation`) để hưởng lợi từ cơ chế: Caching tự động, tự động Refetch khi focus lại trình duyệt, và trạng thái `isLoading` / `isError` mượt mà.

---

## 🚀 Hướng Dẫn Cài Đặt (Setup & Run)

Khi clone code về máy, bạn (hoặc FE Developer khác) chỉ cần làm đúng 3 bước sau để chạy dự án:

### Bước 1: Cấu hình biến môi trường
Mở thư mục `frontend`, tìm file `env.example` và đổi tên nó thành `.env.local`. 
File này sẽ chứa các đường dẫn kết nối đến Backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_HUB_URL=http://localhost:5000/hub/notifications
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=chuoi_bao_mat_bất_kỳ
```

### Bước 2: Cài đặt thư viện (Dependencies)
Mở Terminal tại thư mục `frontend` và chạy lệnh sau để cài đặt toàn bộ thư viện:
```bash
npm install
```

### Bước 3: Chạy dự án
Sau khi cài đặt xong, gõ lệnh sau để khởi động App ở chế độ Development:
```bash
npm run dev
```

Cuối cùng, mở trình duyệt và truy cập: `http://localhost:3000`

---
**Lưu ý:** Để test tính năng Đăng nhập và Thanh toán hoạt động hoàn hảo, hãy chắc chắn rằng bạn đã chạy Backend song song ở port `5000`.
