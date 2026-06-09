# Xây dựng hệ thống Quản lý Đất đai và Thuế đất tích hợp xác thực VNeID

Dự án khóa luận tốt nghiệp — nền tảng hỗ trợ **công dân** khai báo và nộp hồ sơ thuế đất, **cán bộ địa chính** tiếp nhận & đối chiếu sổ, **cán bộ thuế** xử lý và thu tiền, kèm **xác thực VNeID**, **thanh toán PayOS** và **chatbot AI** tư vấn pháp luật đất đai.

> **Lưu ý:** Dự án chỉ dùng cho môi trường phát triển / demo học tập. Không triển khai production với cấu hình mặc định.

---

## Mục lục

- [Kiến trúc](#kiến-trúc)
- [Công nghệ](#công-nghệ)
- [Vai trò người dùng](#vai-trò-người-dùng)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt](#cài-đặt)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Tài khoản demo](#tài-khoản-demo)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Luồng nghiệp vụ](#luồng-nghiệp-vụ-chính)
- [Biến môi trường](#biến-môi-trường)
- [API](#api)
- [Xử lý sự cố](#xử-lý-sự-cố-thường-gặp)

---

## Kiến trúc

```mermaid
flowchart LR
  FE[React Web kltn2026 :5173]
  AUTH[vneid-auth :9090]
  CORE[land-tax-core :8080]
  AI[ai-chatbot :8000]
  DB[(MySQL)]
  FE --> AUTH
  FE --> CORE
  CORE --> AUTH
  CORE --> AI
  AUTH --> DB
  CORE --> DB
```

| Thành phần | Thư mục | Port |
|------------|---------|------|
| Frontend web | `kltn2026/` | `5173` |
| VNeID Auth | `vneid-auth/` | `9090` |
| Land Tax Core API | `land-tax/land-tax/land-tax-core-main/` | `8080` |
| AI Chatbot (RAG) | `ai-chatbot-service/` | `8000` |
| MySQL | `database/` (script SQL) | `3306` |
| App VNeID (Android) | `AppVneID/` | — |

---

## Công nghệ

| Layer | Stack |
|-------|--------|
| Frontend | React 19, Vite, React Router, Bootstrap |
| Backend | Spring Boot 3, Java 17, Spring Security, JPA |
| Auth | JWT, VNeID simulator, Gmail OTP |
| AI | FastAPI, LangChain, Google Gemini, FAISS |
| DB | MySQL 8 |
| Upload | Cloudinary |
| Thanh toán | PayOS |

---

## Vai trò người dùng

| Role | Màn hình chính |
|------|----------------|
| `ROLE_CITIZEN` | Khai báo thuế, nộp hồ sơ, thanh toán, chatbot |
| `ROLE_LAND_OFFICER` | Xử lý hồ sơ địa chính, khiếu nại đất |
| `ROLE_TAX_OFFICER` | Tiếp nhận hồ sơ thuế, duyệt, quản lý thanh toán |
| `ROLE_ADMIN` | Quản trị người dùng, lịch sử thao tác, cấu hình |

---

## Yêu cầu hệ thống

- **Java 17+** và **Maven 3.8+**
- **Node.js 18+** và **npm**
- **Python 3.10+** (cho chatbot)
- **MySQL 8**
- **Git**

Tài khoản dịch vụ (tuỳ tính năng cần dùng):

- Gmail App Password (gửi OTP / kích hoạt tài khoản)
- Cloudinary (upload tài liệu hồ sơ)
- PayOS (thanh toán trực tuyến)
- Google Gemini API (chatbot)
- Firebase (tuỳ chọn — đăng nhập QR qua app Android)

---

## Cài đặt

> Mọi lệnh dưới đây chạy từ **thư mục gốc** repository (`KHOA_LUAN_TOT_NGHIEP_NHOM_9`).

### 1. Clone repository

```powershell
git clone https://github.com/khackhanh1201/KHOA_LUAN_TOT_NGHIEP_NHOM_9.git
cd KHOA_LUAN_TOT_NGHIEP_NHOM_9
```

### 2. Cấu hình biến môi trường

```powershell
copy .env.example .env
```

Mở `.env` và điền giá trị thật.

**Tối thiểu để chạy đăng nhập + nghiệp vụ cơ bản:**

| Biến | Ghi chú |
|------|---------|
| `DB_PASSWORD` | Mật khẩu MySQL local |
| `JWT_SECRET` | Chuỗi bí mật ≥ 32 ký tự |
| `INTERNAL_API_SECRET` | Chuỗi bí mật giao tiếp nội bộ |

Hai biến **bắt buộc trùng nhau** giữa `vneid-auth` và `land-tax`:

- `JWT_SECRET`
- `INTERNAL_API_SECRET`

**Thêm khi dùng chatbot** — trong `.env` điền key **do bạn tự đặt** (chuỗi bí mật bất kỳ, ví dụ `my-local-chatbot-2026`). Xem mẫu trong [`.env.example`](.env.example):

```env
AI_SECRET_KEY=<key-cua-ban>
API_SECRET_KEY=<key-cua-ban>
GOOGLE_API_KEY=<google-gemini-api-key-that>
```

- `AI_SECRET_KEY`: land-tax gửi header `X-API-Key` khi proxy sang chatbot
- `API_SECRET_KEY`: ai-chatbot-service xác thực request — **phải trùng** `AI_SECRET_KEY`
- `GOOGLE_API_KEY`: Gemini embedding + sinh câu trả lời (lấy từ Google AI Studio)

> **Không** ghi key thật vào `README.md` hay commit `.env` lên Git. Chỉ lưu trong file `.env` trên máy local.

File `.env` **không được commit** lên Git (đã có trong `.gitignore`). Script `load-env.ps1` nạp `.env` gốc vào biến môi trường PowerShell trước khi chạy Java/Python.

### 3. Tạo database MySQL

```sql
CREATE DATABASE `vneid` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE `land-tax` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Import schema và dữ liệu mẫu từ thư mục `database/`:

| File | Database |
|------|----------|
| `vneid (2).sql` | `vneid` |
| `land-tax (2).sql` | `land-tax` |

> Dữ liệu seed chỉ dùng cho **demo**: CCCD, email, mật khẩu (`123456`) đều là dữ liệu giả.

**MySQL Workbench / DBeaver:** mở file SQL và chạy trên database tương ứng.

**CLI — CMD (khuyến nghị trên Windows):**

```cmd
mysql -u root -p vneid < "database\vneid (2).sql"
mysql -u root -p land-tax < "database\land-tax (2).sql"
```

**CLI — PowerShell** (toán tử `<` không hoạt động trực tiếp):

```powershell
Get-Content "database\vneid (2).sql" | mysql -u root -p vneid
Get-Content "database\land-tax (2).sql" | mysql -u root -p land-tax
```

### 4. Cài dependency Frontend

```powershell
cd kltn2026
npm install
cd ..
```

### 5. Cài dependency AI Chatbot (tuỳ chọn)

```powershell
cd ai-chatbot-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
```

> Lần đầu `mvn spring-boot:run` sẽ tải dependency Maven — cần kết nối internet và có thể mất vài phút.

---

## Chạy ứng dụng

Cần **4 terminal** (hoặc 3 nếu không dùng chatbot), tất cả mở từ **thư mục gốc** repo.

Thứ tự khuyến nghị: **MySQL** → **VNeID Auth** → **Land Tax** → **Chatbot** → **nạp vector chatbot** → **Frontend**.

### Cách nhanh — dùng script PowerShell (Windows)

```powershell
# Đảm bảo đang ở thư mục gốc repo
cd KHOA_LUAN_TOT_NGHIEP_NHOM_9

# Terminal 1 — VNeID Auth (:9090)
.\scripts\run-vneid-auth.ps1

# Terminal 2 — Land Tax Core (:8080)
.\scripts\run-land-tax.ps1

# Terminal 3 (tuỳ chọn) — AI Chatbot (:8000)
.\scripts\run-chatbot.ps1

# Terminal 4 — Frontend (:5173)
cd kltn2026
npm run dev
```

Script `run-*.ps1` tự gọi `scripts/load-env.ps1` để nạp biến từ `.env`.

### Cách thủ công

```powershell
# Nạp env một lần mỗi terminal (từ thư mục gốc repo)
. .\scripts\load-env.ps1

# VNeID Auth
cd vneid-auth
mvn spring-boot:run

# Land Tax Core (terminal khác)
cd land-tax\land-tax\land-tax-core-main
mvn spring-boot:run

# Chatbot (terminal khác)
cd ai-chatbot-service
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --reload-dir app --port 8000

# Frontend (terminal khác)
cd kltn2026
npm run dev
```

### Nạp dữ liệu vector cho Chatbot (lần đầu)

Thư mục `chroma_db/` không có sẵn trong Git. Sau khi chatbot chạy, gọi ingest **một lần** để index tài liệu trong `ai-chatbot-service/data/`:

```powershell
# Nạp .env trước — dùng đúng API_SECRET_KEY bạn đã đặt trong .env
. .\scripts\load-env.ps1
curl -X POST http://localhost:8000/api/ingest -H "X-API-Key: $env:API_SECRET_KEY"
```

Hoặc thay trực tiếp bằng key trong `.env` của bạn (không dán key thật vào README):

```powershell
curl -X POST http://localhost:8000/api/ingest -H "X-API-Key: <key-cua-ban-trong-.env>"
```

Nếu chưa cấu hình `API_SECRET_KEY`, có thể bỏ header (dev mode — chatbot bỏ qua xác thực khi secret trống):

```powershell
curl -X POST http://localhost:8000/api/ingest
```

Frontend gọi chatbot **qua land-tax** (`POST /api/v1/chat`), không gọi thẳng port `8000`.

### Truy cập

| Dịch vụ | URL |
|---------|-----|
| Web app | http://localhost:5173 |
| Land Tax API | http://localhost:8080/api |
| VNeID Auth API | http://localhost:9090/api |
| AI Chatbot (trực tiếp) | http://localhost:8000 |
| Chatbot qua FE (proxy) | http://localhost:8080/api/v1/chat |

### IntelliJ / IDE

Trong Run Configuration của từng Spring Boot app, thêm **Environment variables** (copy từ `.env`) hoặc chạy `load-env.ps1` trong terminal IDE trước khi start.

### App Android VNeID (tuỳ chọn)

1. Mở project `AppVneID/` bằng Android Studio
2. Tải `google-services.json` từ Firebase Console → đặt vào `AppVneID/app/`
3. File `google-services.json` **không commit** lên Git

`vneid-auth` không bắt buộc Firebase để chạy — thiếu `firebase-service-account.json` chỉ tắt tính năng Firebase Admin, đăng nhập CCCD + mật khẩu vẫn hoạt động.

---

## Tài khoản demo

Sau khi import SQL seed, dùng **CCCD + mật khẩu `123456`** để đăng nhập tại http://localhost:5173:

| Vai trò | CCCD | Họ tên |
|---------|------|--------|
| Admin | `079090012345` | Lê Hải Đăng |
| Cán bộ địa chính | `079090000002` | Trần Văn Địa |
| Cán bộ thuế | `079090000003` | Phạm Thu Thuế |
| Công dân | `001099012345` | Nguyễn Văn Bình |
| Công dân | `001201000011` | Lý Nhã Kỳ |

> Mật khẩu trong seed là plaintext `123456` (demo only). Không dùng cho production.

---

## Cấu trúc thư mục

```
KHOA_LUAN_TOT_NGHIEP_NHOM_9/
├── kltn2026/                      # Frontend React (Vite)
├── vneid-auth/                    # Microservice đăng nhập VNeID, JWT, OTP
├── land-tax/land-tax/
│   └── land-tax-core-main/        # API nghiệp vụ: hồ sơ, thuế, địa chính, PayOS
├── ai-chatbot-service/            # Chatbot RAG pháp luật đất đai
│   ├── data/                      # Tài liệu nguồn cho RAG
│   └── .env.example               # Mẫu env riêng (hoặc dùng .env gốc)
├── AppVneID/                      # Ứng dụng Android VNeID (tuỳ chọn)
├── database/                      # Script SQL schema & seed
├── scripts/
│   ├── load-env.ps1               # Nạp .env vào PowerShell
│   ├── run-vneid-auth.ps1
│   ├── run-land-tax.ps1
│   └── run-chatbot.ps1
├── .env.example                   # Mẫu cấu hình backend (commit được)
├── .env                           # Cấu hình local (KHÔNG commit)
└── README.md
```

---

## Luồng nghiệp vụ chính

### Khai báo & nộp hồ sơ (công dân)

1. Đăng nhập qua VNeID Auth
2. Khai báo thông tin thửa đất, ước tính thuế
3. Nộp hồ sơ → trạng thái `SUBMITTED` / `PENDING`

### Xử lý hồ sơ (cán bộ địa chính)

1. Mở **Xử lý hồ sơ** → chọn hồ sơ chờ xác minh
2. Bấm **Tiếp nhận & xác minh** — hệ thống đối chiếu sổ địa chính
3. **Khớp sổ** → `VERIFIED` — chuyển sang cán bộ thuế
4. **Sai lệch** → `REJECTED`, hủy thanh toán (`CANCELLED`), gửi thông báo chi tiết từng trường cho công dân

### Xử lý thuế (cán bộ thuế)

1. Tiếp nhận hồ sơ `VERIFIED`
2. Duyệt / yêu cầu bổ sung
3. Công dân thanh toán qua PayOS

### Trạng thái hồ sơ (tóm tắt)

```
SUBMITTED / PENDING / FRAUD_SUSPECTED
        → (địa chính verify) → VERIFIED hoặc REJECTED
VERIFIED → (thuế tiếp nhận) → PROCESSING → APPROVED
```

---

## Biến môi trường

Xem đầy đủ trong [`.env.example`](.env.example) và [`ai-chatbot-service/.env.example`](ai-chatbot-service/.env.example).

| Nhóm | Biến chính | Bắt buộc |
|------|------------|----------|
| MySQL | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `VNEID_DB_NAME`, `LANDTAX_DB_NAME` | Có |
| Xác thực | `JWT_SECRET`, `INTERNAL_API_SECRET` | Có |
| Email OTP | `SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD` | Kích hoạt tài khoản / OTP |
| Firebase | `FIREBASE_CONFIG_FILE` | Tuỳ chọn |
| Upload | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Upload tài liệu |
| AI | `GOOGLE_API_KEY`, `GEMINI_API_KEY`, `AI_SERVICE_URL`, `AI_SECRET_KEY`, `API_SECRET_KEY` | Chatbot |
| PayOS | `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, `PAYOS_RETURN_URL`, `PAYOS_CANCEL_URL` | Thanh toán |

**Quy tắc đồng bộ secret:**

| Service A | Biến A | Service B | Biến B |
|-----------|--------|-----------|--------|
| vneid-auth | `JWT_SECRET` | land-tax | `JWT_SECRET` |
| vneid-auth | `INTERNAL_API_SECRET` | land-tax | `INTERNAL_API_SECRET` |
| land-tax | `AI_SECRET_KEY` | ai-chatbot | `API_SECRET_KEY` |

Chatbot ưu tiên đọc `.env` gốc monorepo, sau đó ghi đè bởi `ai-chatbot-service/.env` (nếu có).

---

## API

| Service | Base URL | Ví dụ |
|---------|----------|--------|
| VNeID Auth | `http://localhost:9090/api` | `POST /auth/login` |
| Land Tax | `http://localhost:8080/api` | `GET /records`, `PUT /records/{id}/verify` |
| Land Tax (chatbot proxy) | `http://localhost:8080/api/v1` | `POST /chat` |
| AI Chatbot (trực tiếp) | `http://localhost:8000` | `POST /api/chat`, `POST /api/ingest` |

Frontend gọi Auth qua port `9090`, nghiệp vụ qua port `8080` (cấu hình trong `kltn2026/src/infrastructure/`). Widget chatbot trên web gọi `http://localhost:8080/api/v1/chat`.

---

## Xử lý sự cố thường gặp

| Triệu chứng | Nguyên nhân thường gặp |
|-------------|------------------------|
| `401` / `403` khi gọi API | `JWT_SECRET` không khớp giữa 2 service Java, hoặc token hết hạn |
| `500` khi khai báo thuế | Thiếu đơn giá đất trong bảng `land_prices` |
| `404` `/api/taxes/calculate` | Backend chưa chạy hoặc thiếu dữ liệu giá đất |
| Spring Boot không kết nối DB | Chưa chạy `load-env.ps1` / thiếu `DB_PASSWORD` trong `.env` |
| Chatbot: "chưa có dữ liệu" | Chưa gọi `POST /api/ingest` sau lần chạy đầu |
| Chatbot `401` qua land-tax | `AI_SECRET_KEY` ≠ `API_SECRET_KEY` trong `.env` |
| Chatbot không trả lời | Thiếu `GOOGLE_API_KEY`, service port `8000` chưa bật, hoặc land-tax chưa chạy |
| OTP email không gửi | Sai `SPRING_MAIL_PASSWORD` (cần Gmail App Password) |
| Script `.ps1` báo lỗi | Chạy script không từ thư mục gốc repo, hoặc chưa tạo `.env` |
| Import SQL lỗi trên PowerShell | Dùng `Get-Content ... \| mysql` thay vì toán tử `<` |

---

## Giấy phép

Dự án phục vụ mục đích **học tập / khóa luận tốt nghiệp**. Liên hệ tác giả trước khi sử dụng cho mục đích thương mại.

---
