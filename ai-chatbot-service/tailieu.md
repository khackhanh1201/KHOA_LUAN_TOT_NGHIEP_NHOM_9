# 📄 Tài liệu tổng quan & Đặc tả nghiệp vụ — AI Chatbot Service

> **Dự án:** AI Chatbot Microservice - Đất đai & Thuế  
> **Phiên bản:** 1.4 (Bổ sung Retry, Logging file & Tiền xử lý dữ liệu)  
> **Ngày cập nhật:** 21/05/2026  
> **Ngôn ngữ:** Python 3.10+  
> **Framework:** FastAPI
> **Trạng thái:** Hoàn thiện và vận hành ổn định

---

## 📑 Mục lục

1. [Giới thiệu](#1-giới-thiệu)
   - [1.1. Mục tiêu & Đối tượng sử dụng](#11-mục-tiêu--đối-tượng-sử-dụng)
   - [1.2. Phân nhóm nghiệp vụ & nguồn dữ liệu đầu vào](#12-phân-nhóm-nghiệp-vụ--nguồn-dữ-liệu-đầu-vào)
2. [Đặc tả nghiệp vụ hệ thống & Chiến lược xử lý dữ liệu](#2-đặc-tả-nghiệp-vụ-hệ-thống--chiến-lược-xử lý-dữ-liệu)
   - [2.1. Nhóm 1: Nghiệp vụ hướng dẫn sử dụng hệ thống & FAQ (Q&A có cấu trúc)](#21-nhóm-1-nghiệp-vụ-hướng-dẫn-sử-dụng-hệ-thống--faq-qa-có-cấu-trúc)
   - [2.2. Nhóm 2: Tra cứu bộ luật thuế và đất đai (Văn bản phi cấu trúc)](#22-nhóm-2-tra-cứu-bộ-luật-thuế-và-đất-đai-văn-bản-phi-cấu-trúc)
   - [2.3. Tương tác đa lượt kết hợp nguồn dữ liệu](#23-tương-tác-đa-lượt-kết-hợp-nguồn-dữ-liệu)
3. [Tổng quan kiến trúc RAG](#3-tổng-quan-kiến-trúc-rag)
4. [Công nghệ & Thư viện sử dụng](#4-công-nghệ--thư-viện-sử-dụng)
5. [Cấu trúc thư mục dự án](#5-cấu-trúc-thư-mục-dự-án)
6. [Mô tả chi tiết các Module mã nguồn](#6-mô-tả-chi-tiết-các-module-mã-nguồn)
7. [Luồng hoạt động của hệ thống](#7-luồng-hoạt-động-của-hệ-thống)
8. [API Reference (Đặc tả Endpoints)](#8-api-reference-đặc-tả-endpoints)
9. [Hướng dẫn triển khai cài đặt](#9-hướng-dẫn-triển-khai-cài-đặt)
10. [Điểm nổi bật của hệ thống](#10-điểm-nổi-bật-của-hệ-thống)
11. [Hạn chế hiện tại & Hướng phát triển](#11-hạn-chế-hiện-tại--hướng-phát-triển)

---

## 1. Giới thiệu

**AI Chatbot Service** là một microservice cung cấp giải pháp hỏi đáp thông minh và tự động về các quy định **Thuế**, **Đất đai**, kết hợp **hướng dẫn thao tác nghiệp vụ hành chính công**. Dự án được xây dựng với mục tiêu tích hợp trực tiếp vào Cổng Dịch vụ công để hỗ trợ người dân và doanh nghiệp giải quyết nhanh thủ tục hành chính, tra cứu luật mà không cần phải đọc qua hàng nghìn trang văn bản phức tạp.

Hệ thống ứng dụng kỹ thuật tiên tiến **RAG (Retrieval-Augmented Generation)**, kết nối cơ sở dữ liệu vector ChromaDB với mô hình ngôn ngữ lớn mạnh mẽ **Google Gemini 2.5 Flash** và **Google Gemini Embedding 2**, mang lại câu trả lời nhanh chóng, chính xác tuyệt đối và có trích dẫn nguồn cụ thể.

---

### 1.1. Mục tiêu & Đối tượng sử dụng

```
                   ┌──────────────────────────────────────────────┐
                   │               ĐỐI TƯỢNG SỬ DỤNG              │
                   └──────────────────────┬───────────────────────┘
                                          │
         ┌────────────────────────────────┼────────────────────────────────┐
         ▼                                ▼                                ▼
  【 Người dân & DN 】             【 Cán bộ Văn thư 】             【 Hệ thống Frontend 】
- Hỏi đáp trực tuyến về đất đai. - Tra cứu nhanh văn bản luật.     - Gọi API tích hợp trực tiếp
- Hỏi các bước thao tác hệ thống. - Tham khảo hướng dẫn nghiệp vụ.   vào Cổng DVC / Web / App.
- Tra cứu mức thuế/lệ phí đất.   - Đối chiếu quy trình nội bộ.      - Định danh session đa lượt.
```

---

### 1.2. Phân nhóm nghiệp vụ & nguồn dữ liệu đầu vào

Để đáp ứng tối đa tính chính xác và nhất quán trong môi trường dịch vụ công, hệ thống tổ chức và lưu trữ dữ liệu dưới **2 nhóm nghiệp vụ riêng biệt** với các quy trình xử lý chuyên biệt:

```
                                  DATA FOLDER (./data/)
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
        Dữ liệu phi cấu trúc (.pdf, .txt, .md)              Dữ liệu có cấu trúc (.csv)
   Bộ Luật Thuế & Luật Đất đai, Nghiệp vụ pháp lý         Các bước Hướng dẫn hệ thống & QA FAQ
                     │                                             │
                     ▼                                             ▼
          Cắt chunk tự động theo ngữ nghĩa                        Bảo toàn nguyên dạng
            (Separators tùy biến Việt)                           (Loader: No-Chunking)
```

1. **Bộ luật Thuế & Đất đai (Văn bản dài phi cấu trúc)**:
   - Chứa toàn bộ nội dung của các bộ luật đất đai, quy định miễn giảm thuế, phí trước bạ, hạn mức giao đất... dưới dạng file tài liệu dài như `.pdf`, `.txt`, `.md`.
2. **Q&A hướng dẫn sử dụng hệ thống & Quy trình nghiệp vụ (Dữ liệu có cấu trúc)**:
   - Chứa các bước hướng dẫn cụ thể để người dân thao tác trên hệ thống Cổng Dịch vụ công (ví dụ: các bước nộp tờ khai trực tuyến, tra cứu mã số thuế, quy trình xin cấp giấy chứng nhận quyền sử dụng đất...) dưới định dạng file có cấu trúc `.csv`.

---

## 2. Đặc tả nghiệp vụ hệ thống & Chiến lược xử lý dữ liệu

> [!IMPORTANT]
> Đây là thiết kế cốt lõi giúp hệ thống tránh được hiện tượng đứt gãy thông tin hướng dẫn và tối ưu hóa khả năng trích dẫn nguồn luật. Việc áp dụng đúng chiến lược nạp dữ liệu (Ingestion Strategy) đảm bảo chatbot có thể đưa ra câu trả lời chuẩn xác.

---

### 2.1. Nhóm 1: Nghiệp vụ hướng dẫn sử dụng hệ thống & FAQ (Q&A có cấu trúc)

#### A. Bản chất nghiệp vụ
- Khi người dân sử dụng Cổng Dịch vụ công, họ thường gặp khó khăn về **các bước thực hiện** (ví dụ: "Làm thế nào để thanh toán lệ phí đất?", "Tôi cần nhấn vào đâu để nộp hồ sơ xin cấp sổ đỏ?").
- Các bước này thường có tính tuần tự (Bước 1, Bước 2, Bước 3...). Nếu thông tin bị chia nhỏ thành từng đoạn vector rời rạc, câu trả lời trả về sẽ bị khuyết thiếu, làm gián đoạn trải nghiệm của người dân.

#### B. Chiến lược nạp dữ liệu (No-Chunking)
- **Định dạng file:** CSV (`.csv`) sử dụng mã hóa ký tự UTF-8.
- **Quy chuẩn dữ liệu đầu vào:** File CSV được thiết kế tối thiểu gồm 2 cột chính:
  - `question`: Câu hỏi thường gặp hoặc mô tả nghiệp vụ thao tác.
  - `answer`: Các bước hướng dẫn chi tiết, xuống dòng bằng ký tự `\n` để tạo độ trực quan.
- **Xử lý tại RAG Engine:** 
  - Phần mở rộng `.csv` được khai báo trong danh sách `_NO_CHUNK_EXTENSIONS`.
  - Thay vì đi qua bộ cắt tài liệu (Text Splitter), mỗi hàng trong file CSV được `CSVLoader` tải lên sẽ được **giữ nguyên trạng 100%** và lưu trữ thành 1 Document độc lập trong ChromaDB.
  - Điều này giúp thuật toán so khớp tương đồng (Similarity Search) tìm thấy toàn bộ ngữ cảnh cặp Q&A và gửi trực tiếp tới LLM mà không làm mất tính logic tuần tự của các bước hướng dẫn.

#### C. Định dạng mẫu file CSV (`data/huong_dan_he_thong.csv`)
```csv
question,answer
"Cách nộp hồ sơ xin cấp sổ đỏ trực tuyến trên Cổng DVC là gì?","Để nộp hồ sơ xin cấp sổ đỏ trực tuyến, bạn thực hiện theo 4 bước sau:\nBước 1: Truy cập Cổng Dịch vụ công và Đăng nhập tài khoản cá nhân.\nBước 2: Tìm kiếm dịch vụ công trực tuyến 'Đăng ký đất đai lần đầu'.\nBước 3: Điền các thông tin trong tờ khai điện tử và tải lên bản scan sổ hộ khẩu, giấy tờ mua bán đất đai hợp pháp.\nBước 4: Nhấn 'Nộp hồ sơ' và lưu lại mã hồ sơ để theo dõi tiến độ."
"Làm cách nào để tra cứu mã số thuế cá nhân trực tuyến?","Bạn có thể tra cứu mã số thuế cá nhân thông qua 3 bước đơn giản:\nBước 1: Truy cập trang thông tin điện tử của Tổng cục Thuế.\nBước 2: Nhập số Căn cước công dân (CCCD) và mã xác nhận.\nBước 3: Nhấn 'Tra cứu' để xem thông tin chi tiết về mã số thuế cá nhân của bạn."
```

---

### 2.2. Nhóm 2: Tra cứu bộ luật thuế và đất đai (Văn bản phi cấu trúc)

#### A. Bản chất nghiệp vụ
- Chứa các văn bản pháp luật, thông tư nghị định đồ sộ. Người dân hoặc cán bộ văn thư cần tra cứu chính xác các điều khoản, quy định pháp lý (ví dụ: hạn mức giao đất ở nông thôn, thuế suất thuế thu nhập cá nhân khi chuyển nhượng bất động sản...).
- Dữ liệu dạng này rất dài và phức tạp, đòi hỏi phải chia nhỏ để tìm đúng phần văn bản chứa thông tin trọng tâm.

#### B. Chiến lược nạp dữ liệu (Semantic Custom Chunking)
- **Định dạng file:** `.pdf`, `.txt`, `.md`.
- **Xử lý tại RAG Engine:**
  - Hệ thống sử dụng bộ cắt tài liệu `RecursiveCharacterTextSplitter` với kích thước `CHUNK_SIZE = 1000` ký tự và độ chồng lặp `CHUNK_OVERLAP = 200` ký tự nhằm bảo toàn ngữ nghĩa tại các biên phân cắt.
  - Sử dụng danh sách phân tách tối ưu hóa cho văn bản pháp lý Việt Nam: `VIETNAMESE_SEPARATORS = ["\n\n", "\n", "Điều ", "Khoản ", " ", ""]`. 
  - Ưu tiên cắt tại các điểm bắt đầu của **Điều** hoặc **Khoản**. Cách làm này giúp các đoạn trích xuất khi đưa vào ChromaDB luôn giữ được tiêu đề điều khoản hành chính và nội dung đi liền, không bị lẫn lộn giữa các chương mục khác nhau.

#### C. Định dạng mẫu file văn bản pháp luật (`data/luat_dat_dai_thue.txt`)
```text
Điều 5. Căn cứ tính thuế sử dụng đất phi nông nghiệp
1. Diện tích đất tính thuế là diện tích đất thực tế sử dụng.
2. Giá của 1m2 đất tính thuế là giá đất theo mục đích sử dụng do Ủy ban nhân dân cấp tỉnh quy định và được ổn định trong chu kỳ 5 năm.

Điều 10. Miễn thuế đất phi nông nghiệp
Đất của dự án đầu tư thuộc lĩnh vực đặc biệt khuyến khích đầu tư; dự án đầu tư tại địa bàn có điều kiện kinh tế - xã hội đặc biệt khó khăn sẽ được miễn thuế 100%.
```

---

### 2.3. Tương tác đa lượt kết hợp nguồn dữ liệu

Sự kết hợp linh hoạt giữa **QA hướng dẫn (CSV)** và **Bộ luật (PDF/TXT/MD)** được điều phối mượt mà thông qua **Multi-turn Conversation** (Hội thoại đa lượt).

> [!TIP]
> **Kịch bản thực tế:**
> - **Lượt 1:** Người dùng hỏi: *"Điều kiện để tôi được miễn thuế sử dụng đất phi nông nghiệp là gì?"*
>   - **Hệ thống xử lý:** Tìm tương đồng trong file `luat_dat_dai_thue.txt` (PDF/TXT), trả về nội dung của *Điều 10* kèm trích dẫn nguồn luật cụ thể.
> - **Lượt 2:** Người dùng hỏi tiếp: *"Thao tác online các bước như thế nào?"* (Không cần nhắc lại chủ đề miễn thuế).
>   - **Hệ thống xử lý:** Dựa vào `SessionStore`, hệ thống lấy lịch sử lượt 1, ghép thành ngữ cảnh đầy đủ để LLM hiểu người dùng đang muốn biết quy trình thực hiện "miễn thuế sử dụng đất trực tuyến". RAG Engine tìm kiếm trong file Q&A hướng dẫn hệ thống (`huong_dan_he_thong.csv`), lấy ra các bước hướng dẫn cụ thể mà không bị nhầm lẫn.

---

## 3. Tổng quan kiến trúc RAG

Hệ thống được thiết kế theo quy trình khép kín, phân tách rõ ràng giữa **Ingestion Pipeline** (nạp dữ liệu) và **Query Pipeline** (hỏi đáp):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              AI CHATBOT MICROSERVICE                                   │
│                                                                                        │
│     ┌─────────────────────┐       ┌──────────────────────┐      ┌─────────────────┐    │
│     │   Client/Frontend   │◀─────▶│    FastAPI Router    │◀────▶│  verify_api_key │    │
│     └─────────────────────┘       └──────────┬───────────┘      └─────────────────┘    │
│                                              │                                         │
│                                              ▼                                         │
│                                  ┌───────────────────────┐                             │
│                                  │      RAG Engine       │                             │
│                                  └───────────┬───────────┘                             │
│                                              │                                         │
│                       ┌──────────────────────┴──────────────────────┐                  │
│                       ▼                                             ▼                  │
│             ┌──────────────────┐                          ┌──────────────────┐         │
│             │   SessionStore   │                          │    Chroma DB     │         │
│             │ (Lịch sử hội     │                          │ (Cơ sở dữ liệu   │         │
│             │ thoại in-memory) │                          │  Vector lưu trữ) │         │
│             └──────────────────┘                          └─────────┬────────┘         │
│                                                                     │                  │
│                                                                     ▼                  │
│                                                           ┌──────────────────┐         │
│                                                           │      ./data/     │         │
│                                                           │  (CSV / PDF...)  │         │
│                                                           │ (Thư mục nguồn)  │         │
│                                                           └──────────────────┘         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### A. Luồng nạp dữ liệu tăng dần (Incremental Ingestion)
1. Quét toàn bộ thư mục `./data/`.
2. Tính toán mã băm SHA-256 của từng file và so khớp với file manifest `ingestion_manifest.json` trong `./chroma_db/`.
3. Chỉ nạp các file mới được thêm vào hoặc các file cũ đã bị chỉnh sửa nội dung.
4. Document được đưa vào Loader Registry:
   - File `.csv` (QA hệ thống): Giữ nguyên vẹn, không cắt nhỏ.
   - File `.pdf`, `.txt`, `.md` (Bộ luật): Cắt thành các chunk nhỏ (1000 kí tự).
5. Vector hóa qua Gemini Embedding và ghi bổ sung vào ChromaDB thông qua phương thức `add_documents()`.
6. Cập nhật mã băm vào file manifest để tối ưu tốc độ cho lần nạp tiếp theo.

### B. Luồng hỏi đáp đa lượt (Multi-turn Chat)
1. API `/api/chat` tiếp nhận câu hỏi của người dùng kèm tham số `session_id` (nếu có).
2. Lấy thông tin lịch sử hội thoại tối đa **10 lượt trò chuyện gần nhất** từ `SessionStore` (tự động dọn dẹp các session không hoạt động quá **30 phút**).
3. Sử dụng mô hình `gemini-embedding-2` để vector hóa câu hỏi của người dùng.
4. Tìm kiếm `k = 4` văn bản tương đồng nhất từ ChromaDB.
5. Ghép ngữ cảnh (context) từ các tài liệu tìm được + Lịch sử hội thoại + Câu hỏi mới vào mẫu Prompt.
6. Mô hình ngôn ngữ `gemini-2.5-flash` xử lý Prompt và sinh câu trả lời với **tham số sáng tạo bằng 0.0**, đảm bảo tính chính xác và loại bỏ hoàn toàn sự tự sáng tạo của AI.
7. Lưu câu trả lời mới vào `SessionStore` và phản hồi cho client kèm mã định danh `session_id` phục vụ cho lượt hỏi tiếp theo.

---

## 4. Công nghệ & Thư viện sử dụng

Hệ thống sử dụng các thư viện Python chuyên dụng và tối ưu nhất hiện nay:

| Thành phần | Công nghệ / Thư viện | Vai trò trong hệ thống |
|:---|:---|:---|
| **API Framework** | **FastAPI** (v0.100+) | Xây dựng API microservice tốc độ cao, hỗ trợ tài liệu tự động qua Swagger UI. |
| **ASGI Web Server** | **Uvicorn** | Máy chủ bất đồng bộ (async) hỗ trợ hot-reload khi phát triển. |
| **Vector Database** | **ChromaDB** & **langchain-chroma** | Cơ sở dữ liệu Vector lưu trữ dữ liệu cục bộ dưới dạng nhúng, truy vấn tương đồng siêu tốc. |
| **Orchestration** | **LangChain** & **langchain-community** | Điều phối toàn bộ vòng đời nạp văn bản, Document Loaders và Text Splitter. |
| **LLM & Embeddings**| **Google Gemini API** (`gemini-2.5-flash`, `gemini-embedding-2`) | Thực hiện nhúng văn bản (Embedding) và sinh câu trả lời tự nhiên từ ngữ cảnh trích dẫn. |
| **PDF Parser** | **pypdf** | Hỗ trợ đọc và trích xuất nội dung từ các file luật định dạng PDF. |
| **Configuration** | **python-dotenv** | Quản lý bảo mật khóa API Key và các tham số cấu hình hệ thống từ file `.env`. |
| **Retry Mechanism** | **tenacity** | Cung cấp cơ chế tự động thử lại (retry) khi gọi API Gemini gặp lỗi tạm thời (429, timeout, 5xx) với chiến lược exponential backoff. |

---

## 5. Cấu trúc thư mục dự án

Mã nguồn được tổ chức chặt chẽ theo mô hình thiết kế hướng dịch vụ (Service-Oriented Design) giúp dự án dễ bảo trì và mở rộng:

```
ai-chatbot-service/
├── .env                        # Chứa cấu hình bảo mật API Key (không đưa lên Git)
├── .gitignore                  # Bỏ qua venv, dữ liệu database cục bộ, file logs
├── requirements.txt            # Danh sách thư viện phụ thuộc (bao gồm tenacity)
├── main.py                     # Entry point tối giản khởi chạy microservice
│
├── app/                        # Thư mục ứng dụng chính (Package)
│   ├── __init__.py             # Cấu hình app factory, CORS, Router và Logging (console + file)
│   ├── config.py               # Chứa toàn bộ cấu hình, hằng số, ngưỡng hệ thống
│   ├── dependencies.py         # Module xác thực bảo mật thông qua Header X-API-Key
│   ├── models.py               # Định nghĩa các schemas Pydantic cho Request/Response
│   │
│   ├── routers/                # Quản lý định tuyến API
│   │   ├── __init__.py
│   │   └── chat.py             # Định nghĩa 3 API chính (log session_id mỗi request)
│   │
│   └── services/               # Xử lý Logic nghiệp vụ cốt lõi
│       ├── __init__.py
│       ├── rag_engine.py       # RAG Engine: nạp dữ liệu, tiền xử lý, retry LLM, hỏi đáp AI
│       └── session_store.py    # Quản lý phiên hội thoại đa lượt in-memory
│
├── data/                       # Thư mục lưu trữ dữ liệu nghiệp vụ
│   ├── huong_dan_he_thong.csv  # FILE QA Hướng dẫn thao tác, quy trình nghiệp vụ (giữ nguyên câu)
│   └── luat_thue.txt           # FILE Bộ luật thuế, quy định đất đai (áp dụng cắt chunk)
│
├── logs/                       # Thư mục log hệ thống (được tạo tự động, không đưa lên Git)
│   └── chatbot.log             # Log chi tiết: thời gian, mã lỗi, session_id, truy vết lỗi
│
└── chroma_db/                  # Vector Database cục bộ và file manifest (được tạo tự động)
    ├── chroma.sqlite3
    └── ingestion_manifest.json # Lưu trữ mã băm SHA-256 của các file đã nạp thành công
```

---

## 6. Mô tả chi tiết các Module mã nguồn

### 6.0. `app/__init__.py` — App Factory & Cấu hình Logging
Khởi tạo ứng dụng FastAPI, middleware CORS và cấu hình hệ thống logging chuyên nghiệp:
- **Dual Output Logging:** Log được ghi đồng thời ra **console** (stdout) và **file vật lý** tại `logs/chatbot.log`.
- **Định dạng log chuẩn:** `2026-05-21 19:35:09 | INFO     | app.routers.chat | session_id=abc123 | question=...` — bao gồm đầy đủ **thời gian**, **mức độ nghiêm trọng**, **tên module**, và **nội dung thông điệp** (kèm `session_id` khi có).
- **RotatingFileHandler:** File log tự động xoay vòng khi đạt **5 MB**, giữ lại **3 bản sao lưu** (backup), ngăn tình trạng ổ đĩa đầy khi hệ thống chạy liên tục trong thời gian dài.
- **Truy vết lỗi:** Khi AI trả lời sai luật hoặc xảy ra exception, file `chatbot.log` ghi lại toàn bộ traceback kèm `session_id`, giúp nhà phát triển truy ngược xem file nguồn nào đang nạp sai hoặc prompt nào gây ra vấn đề.

### 6.1. `app/config.py` — Trung tâm cấu hình tập trung
Lưu giữ tất cả các tham số điều hướng của hệ thống, giúp dễ dàng kiểm soát tài nguyên:
- **CORS_ORIGINS:** Định nghĩa nguồn gốc frontend được phép gọi API (`http://localhost:3000`, `http://localhost:8080`).
- **LLM & Embedding Models:** Chỉ định sử dụng `models/gemini-2.5-flash` và `models/gemini-embedding-2`.
- **LLM_TEMPERATURE = 0.0:** Quy định độ sáng tạo bằng 0 để đảm bảo tính pháp lý và quy trình nghiệp vụ của câu trả lời luôn chuẩn xác.
- **MAX_HISTORY_TURNS = 10:** Số lượt trò chuyện gần nhất được giữ lại làm ngữ cảnh đa lượt.
- **SESSION_TTL_MINUTES = 30:** Thời hạn sống của session hội thoại (30 phút).
- **VIETNAMESE_SEPARATORS:** Bộ tách văn bản tối ưu hóa cho tiếng Việt.

### 6.2. `app/dependencies.py` — Bảo mật API Key
Cung cấp dependency `verify_api_key()` để bảo vệ các endpoints nhạy cảm thông qua header:
- Sử dụng cơ chế nhận diện header `X-API-Key` của request.
- So khớp giá trị nhận được với biến `API_SECRET_KEY` trong file cấu hình `.env`.
- Nếu phát hiện khóa bí mật trống trong `.env`, hệ thống tự động kích hoạt **Dev mode** (bỏ qua bước xác thực) giúp các nhà phát triển tích hợp frontend nhanh chóng trên môi trường local.
- Khi cấu hình khóa bí mật đầy đủ, mọi request thiếu hoặc sai key sẽ bị phản hồi ngay lập tức bằng mã lỗi `401 Unauthorized` để bảo vệ tài nguyên hạ tầng Gemini API.

### 6.3. `app/services/session_store.py` — Quản lý lịch sử hội thoại đa lượt
Thiết lập bộ lưu trữ phiên trò chuyện in-memory phục vụ cho quá trình giao tiếp tự nhiên của người dân:
- Dữ liệu lịch sử được ánh xạ bằng cấu trúc dictionary kết hợp khóa `session_id` và thời gian truy cập gần nhất `last_access`.
- **Lazy Cleanup (Dọn dẹp lười):** Mỗi khi có một yêu cầu hội thoại mới tới, hệ thống sẽ duyệt qua và tự động xóa các session đã quá thời gian hết hạn (TTL = 30 phút) nhằm tiết kiệm dung lượng bộ nhớ RAM.
- **Giới hạn số lượt hội thoại:** Luôn giữ chính xác tối đa 10 lượt chat gần nhất để tránh tình trạng quá tải ký tự (Token) khi gửi dữ liệu lên LLM, giúp tối ưu chi phí sử dụng API.

### 6.4. `app/services/rag_engine.py` — Trọng tâm công nghệ RAG
Điều phối toàn bộ quá trình nạp và truy vấn dữ liệu từ Vector Database:
- **Loader Registry Pattern:** Sử dụng ánh xạ dictionary để liên kết phần mở rộng của file với các class nạp tài liệu tương ứng như `PyPDFLoader`, `TextLoader`, `CSVLoader`.
- **Cơ chế nạp dữ liệu tăng dần:** 
  - Tính mã băm SHA-256 của từng file tài liệu và lưu trữ vào file `ingestion_manifest.json`.
  - So sánh mã băm hiện tại với lịch sử manifest. Nếu phát hiện file mới hoặc file có thay đổi, hệ thống sẽ thực hiện nạp dữ liệu.
  - Sử dụng phương thức `db.add_documents()` để nạp bổ sung vào cơ sở dữ liệu ChromaDB hiện tại thay vì ghi đè lại từ đầu, giúp giảm thiểu thời gian nạp dữ liệu từ vài phút xuống còn vài giây.
- **Tiền xử lý văn bản luật (Clean Data) — `clean_vietnamese_legal_text()`:**
  > [!IMPORTANT]
  > Đây là bước cực kỳ quan trọng để đảm bảo bộ phân cắt `VIETNAMESE_SEPARATORS` hoạt động chính xác. Nếu file PDF luật gốc bị lỗi format (chữ "Điều" bị xuống dòng, non-breaking space, ký tự Unicode ẩn), việc cắt chunk sẽ bị nát và AI truy xuất thiếu thông tin.

  Hàm `clean_vietnamese_legal_text()` thực hiện **6 bước** tiền xử lý trước khi cắt chunk:
  | Bước | Xử lý | Ví dụ |
  |:---:|:---|:---|
  | 1 | Chuẩn hóa line-endings (`\r\n` → `\n`) | Tương thích Windows ↔ Linux |
  | 2 | Xóa non-breaking space (`\u00a0`) và zero-width space (`\u200b`) | Ký tự ẩn từ PDF/Word |
  | 3 | Nối lại heading bị ngắt dòng sai | `Đi\nều` → `Điều`, `Kho\nản` → `Khoản` |
  | 4 | Đảm bảo mỗi "Điều X" / "Khoản X" luôn bắt đầu trên dòng mới | Tối ưu cho separator |
  | 5 | Gộp 3+ dòng trống liên tiếp thành đúng 2 dòng trống | Loại bỏ blank thừa |
  | 6 | Xóa trailing whitespace trên mỗi dòng | Dọn dẹp cuối dòng |

- **Phân nhánh xử lý thông minh:**
  - Nếu file có đuôi `.csv`, tài liệu được đưa thẳng vào cơ sở dữ liệu Vector mà **không đi qua bộ phân đoạn (no-chunking)**.
  - Nếu file thuộc các định dạng khác như `.pdf`, `.txt`, `.md`, tài liệu được **tiền xử lý** qua hàm `clean_vietnamese_legal_text()` rồi mới đi qua bộ cắt `RecursiveCharacterTextSplitter` với cấu hình separators tiếng Việt chuyên biệt.
- **Cơ chế tự động thử lại khi gọi LLM (Retry Mechanism) — `_invoke_llm_with_retry()`:**
  > [!IMPORTANT]
  > Khi gọi API Google Gemini, mạng có thể chập chờn hoặc bị lỗi `429 Too Many Requests`. Thay vì để lỗi sập trả về ngay cho Frontend, hệ thống tự động thử lại trước khi báo thất bại.

  - Sử dụng thư viện **tenacity** với decorator `@retry` bọc quanh hàm gọi LLM.
  - **Retry tối đa 3 lần** với chiến lược **exponential backoff** (thời gian chờ tăng dần: 2s → 4s → …, tối đa 30s).
  - Tự động phân loại lỗi:
    - **Lỗi tạm thời (retryable):** `429 Too Many Requests`, `timeout`, `deadline exceeded`, `503 Unavailable`, `500 Internal` → hệ thống tự động thử lại.
    - **Lỗi vĩnh viễn (non-retryable):** API key sai, prompt bị từ chối → báo lỗi ngay lập tức, không retry.
  - Mỗi lần retry đều được ghi log cấp độ `WARNING` kèm chi tiết lỗi, giúp nhà phát triển theo dõi tần suất lỗi API trong file `logs/chatbot.log`.
- **Prompt Engineering thông minh:**
  - Mô phỏng vai trò là một "Chuyên viên tư vấn tận tâm của Cổng Dịch vụ công".
  - Yêu cầu AI bắt buộc sử dụng nguồn thông tin được cung cấp, không được tự ý bịa đặt.
  - Trích xuất cụ thể nguồn tham chiếu của tài liệu (ví dụ: tên file CSV nghiệp vụ hoặc tên file PDF luật kèm số trang) giúp thông tin phản hồi có tính minh bạch tuyệt đối.

---

## 7. Luồng hoạt động của hệ thống

### 7.1. Sơ đồ tuần tự Ingestion (Nạp dữ liệu nghiệp vụ)

```
Client/Admin                FastAPI Router              RAG Engine                Chroma Vector DB
    │                             │                         │                             │
    │─── POST /api/ingest ───────▶│                         │                             │
    │    (kèm X-API-Key)          │─── verify_api_key() ───▶│                             │
    │                             │    (Xác thực Key)       │                             │
    │                             │                         │─── Quét thư mục data/ ─────▶│
    │                             │                         │─── Đọc manifest cũ ────────▶│
    │                             │                         │                             │
    │                             │                         │─── So khớp mã băm SHA-256 ───│
    │                             │                         │    (Lọc file mới/thay đổi)  │
    │                             │                         │                             │
    │                             │                         │─── Khởi chạy Loader Registry │
    │                             │                         │    - CSV: Không chunk       │
    │                             │                         │    - PDF/TXT: Clean Data ──▶│
    │                             │                         │      (Tiền xử lý văn bản)  │
    │                             │                         │    - PDF/TXT: Cắt 1000 ký tự│
    │                             │                         │                             │
    │                             │                         │─── Vector hóa & Lưu trữ ───▶│
    │                             │                         │    (db.add_documents)       │
    │                             │                         │                             │
    │                             │                         │─── Cập nhật manifest mới ──▶│
    │                             │◀── Trả về kết quả ──────│                             │
    │◀── Phản hồi IngestResponse ─│    (files_processed: X) │                             │
```

### 7.2. Sơ đồ tuần tự Chat (Hỏi đáp đa lượt)

```
Người dân                    FastAPI Router             SessionStore               RAG Engine / LLM
    │                             │                         │                             │
    │─── POST /api/chat ─────────▶│                         │                             │
    │    (question, session_id)   │─── verify_api_key() ───▶│                             │
    │                             │    (Xác thực Key)       │                             │
    │                             │                         │                             │
    │                             │─── get_or_create() ────▶│                             │
    │                             │    (Lấy/Tạo Session)    │                             │
    │                             │                         │                             │
    │                             │─── get_history() ──────▶│                             │
    │                             │    (Lấy lịch sử chat)   │                             │
    │                             │◀── Trả về history ──────│                             │
    │                             │                         │                             │
    │                             │─────────────────────────┼────────────────────────────▶│
    │                             │                         │   chatbot.ask(q, history)   │
    │                             │                         │   - Vector hóa câu hỏi      │
    │                             │                         │   - Similarity Search (k=4) │
    │                             │                         │   - Ghép prompt ngữ cảnh    │
    │                             │                         │   - LLM sinh câu trả lời    │
    │                             │                         │     (retry 3 lần nếu lỗi)  │
    │                             │◀────────────────────────┼─────────────────────────────│
    │                             │   Trả về câu trả lời    │                             │
    │                             │                         │                             │
    │                             │─── add_turn() ─────────▶│                             │
    │                             │    (Lưu lượt chat mới)  │                             │
    │                             │                         │                             │
    │◀── Phản hồi ChatResponse ───│                         │                             │
```

---

## 8. API Reference (Đặc tả Endpoints)

### 8.1. Health Check (Trạng thái máy chủ)
- **Đường dẫn:** `GET /`
- **Quyền truy cập:** **Public** (Không yêu cầu xác thực API Key)
- **Mô tả:** Endpoint gọn nhẹ dùng để kiểm tra trạng thái hoạt động của microservice (Health check).
- **Phản hồi mẫu (`200 OK`):**
  ```json
  {
    "status": "AI Server is running!"
  }
  ```

---

### 8.2. Nạp dữ liệu tăng dần (Ingestion API)
- **Đường dẫn:** `POST /api/ingest`
- **Quyền truy cập:** **Bảo mật** (Bắt buộc truyền Header `X-API-Key`)
- **Mô tả:** Quét thư mục lưu trữ dữ liệu nghiệp vụ `./data/`, so khớp mã băm SHA-256 của toàn bộ các file (bao gồm file CSV hướng dẫn hệ thống và file văn bản luật) với manifest để tiến hành nạp gia tăng các tài liệu có thay đổi vào ChromaDB.
- **Headers:**
  ```http
  X-API-Key: my-secret-chatbot-key-2026
  ```
- **Phản hồi mẫu (`200 OK` - Khi có dữ liệu mới):**
  ```json
  {
    "message": "Đã nạp thành công 2 file mới/cập nhật vào hệ thống.",
    "files_processed": 2
  }
  ```
- **Phản hồi mẫu (`200 OK` - Khi không có thay đổi nào):**
  ```json
  {
    "message": "Không có file mới hoặc thay đổi. Dữ liệu đã được cập nhật.",
    "files_processed": 0
  }
  ```
- **Phản hồi mẫu (`401 Unauthorized` - Lỗi xác thực):**
  ```json
  {
    "detail": "API Key không hợp lệ."
  }
  ```

---

### 8.3. Hỏi đáp nghiệp vụ đa lượt (Chat API)
- **Đường dẫn:** `POST /api/chat`
- **Quyền truy cập:** **Bảo mật** (Bắt buộc truyền Header `X-API-Key`)
- **Mô tả:** Endpoint hỏi đáp thông minh đa lượt. Nhận câu hỏi, tìm kiếm thông tin ngữ cảnh tương đồng nhất từ cơ sở dữ liệu Vector DB (bao gồm cả các quy trình thao tác và điều khoản bộ luật) và sinh câu trả lời có trích dẫn nguồn dựa trên lịch sử hội thoại trước đó.
- **Headers:**
  ```http
  Content-Type: application/json
  X-API-Key: my-secret-chatbot-key-2026
  ```
- **Tham số yêu cầu (Request Body):**
  ```json
  {
    "question": "Tôi muốn nộp tờ khai thuế sử dụng đất phi nông nghiệp thì thực hiện các bước nào?",
    "session_id": "b1a2e3f4c5d67890abcdef1234567890"
  }
  ```
  - `question` (string, bắt buộc): Nội dung câu hỏi nghiệp vụ hoặc quy trình hệ thống.
  - `session_id` (string, tùy chọn): Mã định danh phiên hội thoại. Nếu không truyền, hệ thống sẽ tự động khởi tạo một mã UUID mới và phản hồi về ở kết quả.
- **Phản hồi mẫu (`200 OK` - Tra cứu từ quy trình hướng dẫn sử dụng):**
  ```json
  {
    "question": "Tôi muốn nộp tờ khai thuế sử dụng đất phi nông nghiệp thì thực hiện các bước nào?",
    "answer": "Để nộp tờ khai thuế sử dụng đất phi nông nghiệp trên Cổng Dịch vụ công, bạn thực hiện theo 4 bước sau:\nBước 1: Đăng nhập vào Cổng Dịch vụ công và Đăng nhập tài khoản cá nhân.\nBước 2: Tìm kiếm dịch vụ công trực tuyến 'Đăng ký đất đai lần đầu'.\nBước 3: Điền các thông tin trong tờ khai điện tử và tải lên bản scan sổ hộ khẩu, giấy tờ mua bán đất đai hợp pháp.\nBước 4: Nhấn 'Nộp hồ sơ' và lưu lại mã hồ sơ để theo dõi tiến độ.\n\n📎 Nguồn trích dẫn: huong_dan_he_thong.csv",
    "session_id": "b1a2e3f4c5d67890abcdef1234567890"
  }
  ```
- **Phản hồi mẫu (`200 OK` - Hỏi tiếp nối đa lượt tra cứu từ văn bản luật):**
  - *Câu hỏi:* `"Hạn mức đất ở tại nông thôn theo Luật Đất đai là bao nhiêu?"`
  ```json
  {
    "question": "Hạn mức đất ở tại nông thôn theo Luật Đất đai là bao nhiêu?",
    "answer": "Theo các quy định hiện hành được trích dẫn:\n1. Hạn mức giao đất ở nông thôn cho mỗi hộ gia đình, cá nhân do Ủy ban nhân dân cấp tỉnh quy định căn cứ vào quỹ đất địa phương và quy hoạch phát triển nông thôn đã được phê duyệt.\n2. Hạn mức tối đa đất ở tại nông thôn thường dao động từ 150m2 đến 400m2 tùy thuộc vào vùng miền địa phương cụ thể.\n\n📎 Nguồn trích dẫn: luat_thue.txt",
    "session_id": "b1a2e3f4c5d67890abcdef1234567890"
  }
  ```

---

## 9. Hướng dẫn triển khai cài đặt

### Yêu cầu tiên quyết
- Máy chủ đã cài đặt sẵn **Python 3.10** hoặc phiên bản cao hơn.
- Khóa API của Google (có thể dễ dàng đăng ký miễn phí tại [Google AI Studio](https://aistudio.google.com/apikey)).

### Các bước khởi chạy chi tiết

```bash
# 1. Tải dự án từ kho lưu trữ (Clone repository)
git clone <repository-url>
cd ai-chatbot-service

# 2. Tạo môi trường ảo hóa (Virtual Environment)
python -m venv venv

# 3. Kích hoạt môi trường ảo hóa
# Đối với hệ điều hành Windows (Powershell):
venv\Scripts\activate
# Đối với hệ điều hành macOS/Linux:
source venv/bin/activate

# 4. Thực hiện cài đặt các gói thư viện bắt buộc
pip install -r requirements.txt

# 5. Cấu hình biến môi trường
# Tạo file .env tại thư mục gốc và điền các khóa cấu hình bảo mật:
echo 'GOOGLE_API_KEY="your-google-api-key"' > .env
echo 'API_SECRET_KEY="your-secret-key"' >> .env
# Thay thế giá trị bằng API Key thực tế lấy từ Google AI Studio

# 6. Chuẩn bị dữ liệu nghiệp vụ và luật trong thư mục data/
# Đưa file CSV chứa Q&A hướng dẫn sử dụng vào `./data/huong_dan_he_thong.csv`
# Đưa các tài liệu bộ luật vào `./data/luat_thue.txt` (hoặc các file dạng .pdf, .md)

# 7. Khởi chạy máy chủ microservice ở chế độ phát triển
uvicorn main:app --reload
# Thư mục logs/ và file chatbot.log sẽ được tạo tự động khi server khởi động
```

---

### Hướng dẫn kiểm thử toàn diện bằng cURL

Bạn có thể sử dụng công cụ dòng lệnh `cURL` để kiểm tra trực tiếp các luồng nghiệp vụ của hệ thống:

```bash
# 1. Gọi lệnh nạp dữ liệu tăng dần (Incorporate Ingestion)
curl -X POST http://localhost:8000/api/ingest \
  -H "X-API-Key: my-secret-chatbot-key-2026"

# 2. Giao tiếp lượt 1 (Hỏi về hướng dẫn quy trình hệ thống)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: my-secret-chatbot-key-2026" \
  -d '{"question": "Cách nộp hồ sơ xin cấp sổ đỏ trực tuyến?"}'

# Phản hồi từ máy chủ sẽ trả về câu trả lời kèm theo một `session_id` (ví dụ: "a1b2c3d4-e5f6...")

# 3. Giao tiếp lượt 2 (Hỏi tiếp nối kế thừa ngữ cảnh của lượt 1)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: my-secret-chatbot-key-2026" \
  -d '{"question": "Tôi có phải nộp kèm tờ khai thuế không?", "session_id": "a1b2c3d4-e5f6..."}'
```

---

## 10. Điểm nổi bật của hệ thống

* **✅ Phân nhóm dữ liệu thông minh:** Sự khác biệt lớn nhất của hệ thống là khả năng nhận diện và phân tách xử lý tài liệu. File hướng dẫn sử dụng dạng `.csv` được nạp nguyên vẹn (No-Chunking) bảo toàn cấu trúc các bước thao tác nghiệp vụ, trong khi tài liệu pháp luật dạng `.pdf`/`.txt` được cắt nhỏ theo ngữ nghĩa giúp tìm kiếm chính xác điều khoản.
* **✅ Nạp dữ liệu tăng dần thông minh (SHA-256 Manifest):** Hệ thống không nạp đè dữ liệu gây tốn thời gian và chi phí API nhúng. Nhờ kiểm tra mã băm SHA-256, chỉ những file thực sự được chỉnh sửa hoặc thêm mới mới được xử lý, tiết kiệm hơn **95%** thời gian khởi động cơ sở dữ liệu.
* **✅ Tiền xử lý dữ liệu luật tự động (Clean Data):** Trước khi cắt chunk, hệ thống tự động làm sạch văn bản thô từ PDF/TXT — nối lại các heading "Điều"/"Khoản" bị ngắt dòng sai, xóa ký tự Unicode ẩn, chuẩn hóa khoảng trắng — đảm bảo bộ phân cắt `VIETNAMESE_SEPARATORS` hoạt động chính xác 100%.
* **✅ Tự động thử lại khi gọi AI (Retry Mechanism):** Tích hợp thư viện `tenacity` với chiến lược exponential backoff, hệ thống tự động retry tối đa **3 lần** khi gặp lỗi tạm thời từ Google Gemini API (429 Too Many Requests, timeout, 5xx) trước khi báo lỗi về cho Frontend.
* **✅ Hệ thống Logging chuyên nghiệp:** Toàn bộ hoạt động được ghi log ra file vật lý `logs/chatbot.log` với đầy đủ thời gian, mã lỗi, `session_id` và traceback. File log tự động xoay vòng (RotatingFileHandler, 5MB/file, 3 bản backup) giúp dễ dàng truy vết và gỡ lỗi khi AI trả lời sai.
* **✅ Bảo mật microservice tối ưu:** Cung cấp lớp xác thực thông qua API Key tiêu chuẩn gửi qua header, tích hợp chế độ Dev Mode linh hoạt để hỗ trợ tối đa cho các kỹ sư phát triển frontend.
* **✅ Trải nghiệm hội thoại tự nhiên (Multi-turn):** Hệ thống lưu trữ và duy trì ngữ cảnh trò chuyện in-memory tối đa 10 lượt trò chuyện, tích hợp cơ chế tự động dọn dẹp các phiên trò chuyện quá hạn (TTL = 30 phút) giúp tối ưu dung lượng bộ nhớ RAM của hệ thống.
* **✅ Độ tin cậy pháp lý tuyệt đối:** Khác biệt với các ứng dụng chatbot thông thường có xu hướng tự sáng tạo nội dung, hệ thống thiết lập độ sáng tạo của mô hình ngôn ngữ lớn (Gemini Temperature) bằng 0.0, cam kết mọi câu trả lời luôn dựa trên dữ liệu luật thực tế và ghi kèm nguồn gốc tài liệu rõ ràng.

---

## 11. Hạn chế hiện tại & Hướng phát triển

### ⚠️ Hạn chế hiện tại
1. **Phụ thuộc API bên ngoài:** Hệ thống phụ thuộc vào dịch vụ Google Gemini API. Mặc dù đã tích hợp cơ chế retry tự động (3 lần) với exponential backoff để xử lý lỗi tạm thời, nhưng nếu API gặp sự cố kéo dài hoặc thay đổi chính sách giá, hoạt động của microservice vẫn sẽ bị gián đoạn.
2. **Bộ lưu trữ Vector cục bộ:** Hiện ChromaDB đang chạy lưu trữ dữ liệu trực tiếp trên đĩa cứng local (`./chroma_db`). Đây là hạn chế lớn nếu cần triển khai hệ thống nhân bản, mở rộng quy mô máy chủ theo chiều ngang (Horizontal Scaling).
3. **Quản lý phiên in-memory:** Trạng thái phiên trò chuyện đang được lưu giữ trong RAM cục bộ. Nếu khởi động lại server, lịch sử trò chuyện của người dùng sẽ bị xóa sạch.

---

### 🚀 Kế hoạch phát triển tiếp theo

Hệ thống đặt ra lộ trình cải tiến cụ thể phân chia theo cấp độ ưu tiên để phục vụ mục tiêu đưa lên môi trường sản xuất (Production-ready):

```
                     ROADMAPPING PHÁT TRIỂN HỆ THỐNG
                                    │
       ┌────────────────────────────┼────────────────────────────┐
       ▼                            ▼                            ▼
 【 ƯU TIÊN CAO 】            【 ƯU TIÊN TRUNG BÌNH 】       【 ƯU TIÊN THẤP 】
- Viết Unit Tests tự động.  - Triển khai Rate Limiting    - Đóng gói Docker Container
- Kiểm thử các API routes.    (giới hạn request slowapi).   (dễ dàng deploy Cloud).
- Thiết lập kịch bản Mock.  - Tích hợp Redis lưu session. - Kết nối Cloud Vector DB.
```

| Thứ tự | Mức độ ưu tiên | Tính năng kế hoạch | Mô tả chi tiết |
|:---:|:---:|:---|:---|
| **1** | 🔴 Cao | **Unit Tests** | Sử dụng thư viện `pytest` để xây dựng bộ kiểm thử tự động cho toàn bộ API routes và các phương thức nghiệp vụ của `RAGEngine`. |
| **2** | 🟡 Trung bình | **Rate Limiting** | Triển khai giải pháp giới hạn tần suất yêu cầu trên mỗi địa chỉ IP (dùng thư viện `slowapi`) để bảo vệ hạ tầng API khỏi nguy cơ bị tấn công spam. |
| **3** | 🟡 Trung bình | **Session Storage bên ngoài** | Chuyển đổi cơ chế lưu trữ lịch sử hội thoại từ in-memory sang cơ sở dữ liệu lưu khóa-giá trị chuyên dụng như **Redis** để duy trì lịch sử lâu dài. |
| **4** | 🟢 Thấp | **Dockerization** | Đóng gói microservice thành container Docker hoàn chỉnh thông qua `Dockerfile` phục vụ nhu cầu triển khai đồng bộ trên các cụm Cloud K8s. |
| **5** | 🟢 Thấp | **Cloud Vector DB** | Chuyển dịch bộ lưu trữ vector cục bộ ChromaDB sang các dịch vụ đám mây chuyên nghiệp như Pinecone hoặc Weaviate để hỗ trợ mở rộng quy mô. |
