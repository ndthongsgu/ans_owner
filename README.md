# ans_customer — React + TypeScript + Vite ⚡

**Mô tả ngắn:** ứng dụng Client (Customer) dùng React + TypeScript với Vite. README này hướng dẫn nhanh cách cài đặt, chạy ở môi trường phát triển, build và các lệnh thông dụng.

---

## 🛠 Yêu cầu trước

- Node.js >= 18 (khuyến nghị LTS)
- npm (hoặc pnpm / yarn)

Kiểm tra phiên bản:

```bash
node -v
npm -v
```

---

## 🚀 Khởi động nhanh

1. Cài dependencies:

```bash
# từ thư mục ans_customer
npm install
# hoặc nếu muốn cài chính xác theo lockfile
npm ci
```

2. Chạy dev server (hot reload):

```bash
npm run dev
```
Mặc định Vite sẽ chạy ở `http://localhost:5173` (hoặc port được log ra).

3. Build production:

```bash
npm run build
```

4. Preview bản build (local):

```bash
npm run preview
```

---

## 🔧 Biến môi trường

- Tạo file `.env` hoặc `.env.local` để cấu hình URL API và biến client-side.
- Biến muốn expose cho client **phải** có tiền tố `VITE_`.

Ví dụ `.env`:

```ini
VITE_API_URL=https://api.example.com
VITE_MAP_KEY=your-map-key
```

> **Tip:** lưu mẫu vào `.env.example` để dev khác biết cần những biến nào.

---

## ✅ Lint & Kiểm tra

- Lint project:

```bash
npm run lint
```

- Type check: phần build gọi `tsc -b` nên chạy `npm run build` sẽ phát hiện lỗi type.
- Tests: hiện tại chưa có cấu hình test. Nếu cần, mình có thể thêm `vitest`/`jest`.

---

## 🔁 Các lệnh thường dùng

- **dev:** `npm run dev` — chạy server dev
- **build:** `npm run build` — build production (`tsc -b && vite build`)
- **preview:** `npm run preview` — preview build
- **lint:** `npm run lint` — chạy ESLint

---

## 📦 Docker (tùy chọn)

Nếu muốn, mình có thể thêm `Dockerfile` + `docker-compose.yml` để build image và chạy cùng backend/API.

---

## 🐛 Troubleshooting nhanh

- Lỗi module / node-gyp: xóa `node_modules` và `package-lock.json`, sau đó `npm ci`.
- Port trùng: Vite sẽ log port; đổi biến `PORT` hoặc dùng `npx kill-port <port>`.

---

## 🔚 Ghi chú

- Nếu cần mình sẽ bổ sung: Docker, CI (GitHub Actions), mẫu `.env.example`, hoặc test setup.

---

Muốn mình thêm phần nào tiếp theo (Docker / CI / .env.example / test)? ✨```
