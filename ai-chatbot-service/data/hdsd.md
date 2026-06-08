## B1. Đăng nhập

### B.1.1. Chức năng Đăng nhập trên VNeID
Khi người dùng truy cập vào ứng dụng, hệ thống hiển thị màn hình đăng nhập tích hợp Cổng xác thực Quốc gia VNeID. Người dùng có thể đăng nhập bằng tài khoản số định danh cá nhân (CCCD) và mật khẩu hoặc sử dụng mã QR Code thông qua ứng dụng VNeID di động.

* **Đăng nhập bằng tài khoản định danh:** Người dùng nhập số CCCD (12 chữ số) và mật khẩu, sau đó nhấn **Đăng nhập**. 
    * Nếu thông tin chính xác, hệ thống điều hướng người dùng tới trang chủ. 
    * Trường hợp sai mật khẩu hoặc số định danh, hệ thống hiển thị thông báo lỗi.
* **Đăng nhập bằng QR Code:** Hệ thống tự động tạo mã QR Code động ở phần bên phải màn hình. Người dùng mở ứng dụng VNeID trên điện thoại di động, quét mã QR này và xác nhận đăng nhập. Trình duyệt Web sẽ tự động nhận diện trạng thái và chuyển tiếp vào trang chủ.
* **Kích hoạt tài khoản định danh:** Đối với tài khoản chưa được kích hoạt, công dân chọn chức năng **Kích hoạt ngay**, nhập số định danh, số điện thoại và email đăng ký để nhận mã OTP xác thực qua email, sau đó thiết lập mật khẩu mới.

### B.1.2 Trang chủ Cổng thông tin định danh điện tử
Sau khi đăng nhập thành công, người dùng được điều hướng tới Cổng dịch vụ liên kết dữ liệu quốc gia.

* **Chuyển hướng:** Người dùng nhấn mục **Đất đai** ở menu trái $\rightarrow$ hệ thống chuyển sang Hệ thống Quản lý thuế đất đai và hiển thị giao diện theo đúng vai trò của công dân.

---

## B2. Giao diện Admin

### B.2.1. Bảng điều khiển Quản trị
Khi đăng nhập với vai trò Admin, từ Trang chủ Cổng định danh nhấn **Đất đai**, hệ thống mở Bảng điều khiển để Admin xem nhanh tình hình hệ thống.

* **Sức khỏe nền tảng & Cảnh báo:** Xem nhanh tỷ lệ hoạt động, Truy cập 24h, Tài khoản, Hồ sơ kẹt, TK bị khóa và Cảnh báo hệ thống (Hồ sơ chờ xử lý, Khiếu nại, Tài khoản bị khóa).
* **Thao tác:** Nhấn **Làm mới dữ liệu** để cập nhật số liệu.
* **Nhật ký nền tảng:** Cuộn xuống xem Nhật ký nền tảng theo ba tab: Hệ thống & Dữ liệu, Bảo mật & Tài khoản, Cảnh báo lỗi.

### B.2.2. Quản lý người dùng
Admin truy cập chức năng **Quản lý người dùng** từ menu sidebar để quản lý toàn bộ các tài khoản công dân và cán bộ tác nghiệp.

* **Thông tin hiển thị:** Danh sách người dùng hiển thị các trường thông tin cơ bản: Họ tên, Email liên hệ, Vai trò hiện tại (Quản trị viên, Cán bộ Thuế, Cán bộ Địa chính, Người dân), Số định danh cá nhân (CCCD) và Trạng thái tài khoản (Đang hoạt động hoặc Không hoạt động).
* **Bộ lọc & Tìm kiếm:** Admin có thể gõ từ khóa để tìm kiếm nhanh theo Họ tên, Email, CCCD hoặc lọc danh sách theo vai trò chuyên biệt thông qua dropdown phân loại vai trò.

### B.2.3 Phân & Ủy quyền
Đây là chức năng quan trọng quản lý quyền hạn truy cập của cán bộ và ủy quyền quyền quản trị tối cao.

* **Phân quyền:** Nhấn **Thiết lập quyền** $\rightarrow$ chọn Cán bộ Thuế / Cán bộ Địa chính / Người dân $\rightarrow$ **Lưu phân quyền**. 
  > *Lưu ý an toàn: Tab Phân quyền này không hỗ trợ gán quyền Quản trị viên (Admin) để ngăn chặn việc cấp quyền bừa bãi.*
* **Tab Ủy quyền:** Cho phép Admin hiện tại bàn giao hoàn toàn quyền Quản trị tối cao (`ROLE_ADMIN`) cho một tài khoản cán bộ khác.
    * Thao tác: Nhấn **Ủy quyền Admin** $\rightarrow$ **Xác nhận ủy quyền**. 
    * *Lưu ý: Sau khi ủy quyền, tài khoản Admin hiện tại chuyển thành Người dân và bị đăng xuất.*

### B.2.4. Lịch sử thao tác
Cung cấp khả năng kiểm toán bảo mật, ghi lại mọi hoạt động nghiệp vụ của toàn bộ công dân và cán bộ trên hệ thống.

* **Tra cứu & Lọc:** Tra cứu theo ID Log/CCCD/IP, lọc theo loại hành động và ngày.
* **Thao tác:** * Nhấn **Xem chi tiết** để xem thông tin một thao tác.
    * Nhấn **Xuất dữ liệu (CSV)** để kết xuất.
    * Nhấn **Làm mới dữ liệu** để cập nhật bảng.

### B.2.5. Báo cáo – Thống kê
Phân tích tổng hợp số liệu thu nộp thuế đất và xử lý hồ sơ trên địa phương quản lý.

* **Kết xuất báo cáo:** * Nhấn **Xuất CSV** cho dữ liệu lưu lượng.
    * Mục báo cáo tiêu chuẩn: **Xuất Excel** (Báo cáo luân chuyển hồ sơ) hoặc **Xuất PDF** (Danh sách Miễn Giảm thuế).
* **Thao tác:** Nhấn **Làm mới dữ liệu** để cập nhật.

### B.2.6. Quản lý Danh mục
Chức năng này dùng để cấu hình các tham số gốc cho hoạt động tính toán thuế tự động của hệ thống.

* **Đối tượng Miễn/Giảm thuế:** Admin có thể tải lên tập tin Excel mẫu chứa danh sách công dân thuộc diện chính sách. Hệ thống sẽ tự động quét, đối khớp CCCD và lưu trữ để tự động áp dụng chính sách giảm trừ.
* **Hạn mức đất ở ($m^2$):** Nhấn biểu tượng **bánh răng** trên mỗi khu vực để cấu hình hạn mức.

---

## B.3. Giao diện Cán bộ Thuế

### B.3.1. Bảng điều khiển Cán bộ Thuế
Trang quản trị hoạt động thuế đất đai của địa bàn phụ trách, cung cấp bức tranh tổng thể về nghĩa vụ tài chính và dòng tiền thuế của người dân.

* **Các chỉ số điều hành:** Thống kê số lượng tờ khai thuế đất đang chờ duyệt, các hóa đơn thuế quá hạn nộp, tổng số đơn khiếu nại thuế mới tiếp nhận, và các hồ sơ ưu tiên cần xử lý ngay.
* **Biểu đồ phân tích nhanh:** Biểu đồ tròn phân tách tỷ trọng hồ sơ theo trạng thái và mức độ ưu tiên.

### B.3.2. Quản lý hồ sơ thuế
Chức năng lưu trữ và quản lý tập trung toàn bộ sổ bộ thuế đất đai của công dân theo từng niên độ kế hoạch.

* **Tìm kiếm & Lọc:** Tìm nhanh theo CCCD/số hồ sơ ở ô tìm kiếm, hoặc nhấn **Tìm kiếm nâng cao** để lọc theo Mã hồ sơ, Họ tên, CCCD, Địa chỉ $\rightarrow$ nhấn **Đóng** để áp dụng, **Xóa bộ lọc** để bỏ điều kiện.
* **Thao tác cơ bản:** Trên mỗi dòng, nhấn biểu tượng **mắt** để xem chi tiết, biểu tượng **tải xuống** để xuất hồ sơ.
* **Màn hình Chi tiết hồ sơ:** Cán bộ xem đầy đủ Thông tin chung, Thông tin thửa đất và Nghĩa vụ tài chính. Phía trên có ba nút thao tác:
    * **Cập nhật:** Chỉnh sửa thông tin hồ sơ.
    * **Xuất dữ liệu:** Mở popup chọn định dạng PDF hoặc DOC, có thể **Xem trước dữ liệu** rồi nhấn **Xuất dữ liệu ngay**.
    * **Lịch sử:** Mở popup Lịch sử thay đổi hiển thị các mốc xử lý theo thời gian.

### B.3.3. Quản lý và Phê duyệt Hồ sơ khai thuế
Nơi cán bộ tiếp nhận các hồ sơ khai thuế đất đã qua bước xác minh thông tin địa chính.

* **Danh sách hiển thị:** Chi tiết Mã hồ sơ khai thuế, Tên công dân, Mục đích sử dụng, Diện tích đất, Ngày nhận hồ sơ.
* **Quy trình phê duyệt & áp thuế:** Cán bộ click vào dòng hồ sơ để xem chi tiết. Hệ thống tự động tính số tiền thuế dự kiến. Cán bộ kiểm tra lại các điều kiện miễn giảm:
    * Nhấn **Phê duyệt** để sinh hóa đơn thuế nộp về tài khoản công dân.
    * Nhấn **Từ chối** (nếu thiếu chứng từ hoặc sai thông tin) kèm lý do phản hồi.

### B.3.4. Quản lý nghĩa vụ và Đối soát thanh toán
Hệ thống cung cấp danh sách toàn bộ các giao dịch nộp tiền thuế của công dân và công cụ đối soát tự động hóa đơn với sao kê ngân hàng (PayOS).

* **Tìm kiếm & Lọc:** Lọc nhanh theo tab (Tất cả, Chờ thanh toán, Đã thanh toán). Tìm kiếm nâng cao theo Mã giao dịch, Đối tượng MST, Trạng thái.
* **Thao tác cơ bản:** Nhấn biểu tượng **mắt** để xem chi tiết, biểu tượng **hóa đơn** để xem chứng từ giao dịch.
* **Đối soát thanh toán:** Nhấn nút **Đối soát thanh toán**. Hệ thống tự động đối chiếu Tín hiệu PayOS (webhook) với Thông tin hệ thống (database). 
    * Lọc theo Tất cả / Khớp / Lệch. 
    * Với dòng sai lệch (Ví dụ: Không thấy tín hiệu webhook), cán bộ nhấn **Xử lý lỗi** để xử lý thủ công.

### B.3.5. Giải quyết khiếu nại về thuế đất
Tiếp nhận và phản hồi các đơn khiếu nại, thắc mắc của công dân.

* **Quản lý luồng xử lý:** Theo dõi danh sách qua các trạng thái: Chờ xử lý, Đang xử lý, Chờ công dân bổ sung thông tin, Đã giải quyết.
* **Thao tác xử lý:** * Click **Xem chi tiết**, xem nội dung giải trình và tài liệu đính kèm.
    * Cập nhật trạng thái giải quyết, phản hồi thông điệp giải thích hoặc điều chỉnh/miễn giảm lại hóa đơn thuế nếu khiếu nại có cơ sở pháp lý.

### B.3.6. Tạo Báo cáo thống kê doanh thu thuế
Hỗ trợ Cán bộ Thuế lập các báo cáo tài chính về tình hình thu nộp ngân sách.

* **Biểu đồ phân tích:** Biến động thu theo thời gian (12 tháng), So sánh số thu giữa các khu vực (Top 5) và Bảng dữ liệu chi tiết theo tuyến đường.
* **Kết xuất báo cáo:** Nhấn **Tạo báo cáo thống kê** ở góc phải.
    * Nhập tên báo cáo, thiết lập phạm vi (theo khu vực Đường/Phường).
    * Chọn khoảng thời gian và loại thuế suất.
    * Nhấn **Tạo báo cáo** để tải về dưới dạng file CSV/Excel.

---

## B.4. Giao diện Cán bộ Địa chính

### B.4.1. Bảng điều khiển Cán bộ Địa chính
Giao diện quản lý trung tâm để nắm bắt nhanh tình hình hồ sơ đất đai và tiến độ xác minh.

* **Chỉ số thống kê chính:** Tổng số hồ sơ cần xử lý, tỷ lệ đã hoàn thành xác minh, số lượng hồ sơ đã xác minh và đang xử lý dở dang.
* **Danh sách công việc khẩn cấp:** Lối tắt truy cập nhanh các hồ sơ mới cần đối chiếu thực địa hoặc dữ liệu số quốc gia.

### B.4.2. Sổ địa chính số - Quản lý thửa đất
Quản lý và tra cứu thông tin các thửa đất trên địa bàn.

* **Tra cứu:** Tìm theo thửa đất số/địa chỉ.
* **Thao tác cơ bản:** Nhấn biểu tượng **mắt** để mở Chi tiết thửa đất. Tại đây có nút **Xuất PDF** và **Cập nhật thông tin**.
* **Đẩy dữ liệu:** Cập nhật sổ địa chính lên hệ thống bằng hai hình thức:
    * *Bằng Excel (.xlsx, .csv):* Tải biểu mẫu chuẩn, điền dữ liệu rồi kéo thả tệp $\rightarrow$ **Xác nhận đẩy dữ liệu**.
    * *Thủ công:* Điền trực tiếp một bản ghi trên form $\rightarrow$ **Xác nhận đẩy dữ liệu**.

### B.4.3. Quản lý giá đất
Quản lý và cập nhật giá đất theo quy định Nhà nước.

* **Tra cứu:** Tìm theo loại đất/khu vực.
* **Thao tác:** * Nhấn **Nhập giá đất** để thêm mức giá mới.
    * Nhấn **Xuất Excel** để kết xuất bảng giá.
    * Nhấn biểu tượng **mắt** để xem Chi tiết Giá đất và lịch sử điều chỉnh.

### B.4.4. Xử lý hồ sơ địa chính
Tiếp nhận yêu cầu đăng ký biến động đất đai từ Cổng công dân.

* **Phân loại luồng:** Bộ lọc theo tab: Tất cả, Chờ xác minh, Chờ xử lý, Đang duyệt, Đã duyệt.
* **Quy trình đối chiếu:** Xem chi tiết thông tin khai báo, đối sánh với cơ sở dữ liệu quốc gia và ghi nhận kết quả:
    * Nhấn **Xác nhận** (nếu thông tin khớp) để chuyển tiếp hồ sơ sang cơ quan Thuế.
    * Nhấn **Từ chối** (nếu phát hiện sai lệch diện tích, ranh giới) kèm theo mô tả lý do.

### B.4.5. Xử lý khiếu nại
Tiếp nhận và xử lý các phản ánh về thông tin thửa đất, ranh giới.

* **Phân loại luồng:** Lọc nhanh theo tab: Tất cả, Chờ xử lý, Đang xử lý, Chờ bổ sung, Đã giải quyết.
* **Thao tác cơ bản:** Nhấn biểu tượng **mắt** để mở chi tiết, biểu tượng **tải xuống** để xuất hồ sơ.
* **Thao tác xử lý tại màn chi tiết:**
    * **Yêu cầu bổ sung** $\rightarrow$ nhập mô tả tài liệu cần bổ sung $\rightarrow$ **Xác nhận**.
    * **Cập nhật ghi chú** $\rightarrow$ ghi chú nội bộ.
    * **Từ chối** $\rightarrow$ từ chối khiếu nại.
    * **Giải quyết** $\rightarrow$ nhập kết luận giải quyết $\rightarrow$ **Xác nhận**.

### B.4.6. Báo cáo Thống kê Địa chính
Hỗ trợ tổng hợp báo cáo định kỳ về tình hình biến động đất đai.

* **Chỉ số hiệu suất:** Biểu đồ tỷ lệ hoàn thành hồ sơ đúng hạn, số lượng tiếp nhận mới theo tháng, và phân loại giao dịch.
* **Xuất báo cáo:** Chọn kỳ báo cáo và nhấn **Xuất báo cáo** để tải file thống kê.

---

## B.5. Giao diện Chủ đất (Công dân)

### B.5.1. Bảng điều khiển Công dân
Giao diện quản lý tổng quan nghĩa vụ thuế dành riêng cho công dân.

* **Chỉ số thống kê:** Tổng tiền phải nộp, số tiền đã nộp, hóa đơn trễ hạn và tỷ lệ hồ sơ hoàn thành.
* **Lối tắt thao tác:** Truy cập nhanh: Tra cứu thông tin đất, Nộp hồ sơ khai thuế, và Nộp thuế.
* **Sidebar điều hướng:** Chuyển đổi qua lại giữa các màn hình quản lý chi tiết.

### B.5.2. Tra cứu thông tin Thửa đất
Xem danh sách thửa đất thuộc quyền sở hữu.

* **Danh sách hiển thị:** Bảng chứa thông tin: Số vào sổ cấp GCN, Thửa đất số, Tờ bản đồ, Loại đất, Địa chỉ.
* **Bộ lọc & Xem chi tiết:** Nhập từ khóa (số GCN hoặc địa chỉ) để lọc. Nhấn biểu tượng **mắt** để xem thông tin chi tiết đầy đủ (diện tích hạn mức, thời hạn, tài sản gắn liền) và tải tài liệu định dạng PDF.

### B.5.3. Xem nghĩa vụ thuế đất đai
Quản lý các khoản thuế và nghĩa vụ tài chính.

* **Bộ lọc:** Lọc nhanh theo tab: Tất cả, Chưa thanh toán, Đã thanh toán.
* **Hiển thị trạng thái:** Đã thanh toán, Chưa thanh toán, hoặc Được miễn thuế.
* **Chi tiết thông báo:** Nhấn biểu tượng **mắt** để mở popup Chi tiết biên lai/Thông báo thuế.

### B.5.4. Khai báo thuế đất đai
Theo dõi lịch sử và khởi tạo tờ khai mới.

* **Lọc trạng thái:** Theo dõi theo tab Chờ xử lý, Đã duyệt, Bị từ chối.
* **Khởi tạo tờ khai mới:** Nhấn nút **Tạo hồ sơ** màu đỏ để bắt đầu quy trình 4 bước:
    1. **Xác thực danh tính:** Hệ thống tự động điền thông tin định danh cấp độ 2 từ VNeID $\rightarrow$ Nhấn **Tiếp tục**.
    2. **Thông tin thửa đất:** Điền chi tiết thửa đất cần khai báo (Số hiệu, Diện tích, Mục đích...) $\rightarrow$ Nhấn **Tiếp tục**.
    3. **Tải lên tài liệu:** Đính kèm bản quét Giấy chứng nhận QSDĐ, giấy tờ miễn giảm.
    4. **Xác nhận và Gửi:** Soát lỗi bản tổng hợp và nhấn **Gửi hồ sơ**. Hệ thống cấp mã số hồ sơ tự động.
* **Hủy hồ sơ:** Người dân có thể nhấn **Hủy hồ sơ** đối với các hồ sơ chưa được xử lý.

### B.5.5. Tra cứu thuế và Thanh toán trực tuyến
Quản lý thanh toán đóng tiền vào ngân sách nhà nước.

* **Tra cứu khoản nộp:** Lọc theo tab Chờ thanh toán và Lịch sử giao dịch.
* **Thao tác thanh toán:** * Nhấn **Xem chi tiết** để xem bảng tính thuế lũy tiến.
    * Nhấn nút **Thanh toán** $\rightarrow$ Hệ thống hiển thị mã QR liên kết PayOS $\rightarrow$ Quét mã để nộp. 
    * Nếu khoản thuế hiển thị **Được miễn thuế**, công dân không cần thanh toán.

### B.5.6. Khiếu nại
Gửi phản ánh khi phát hiện sai sót dữ liệu.

* **Khởi tạo khiếu nại:** * Chọn Loại phản ánh (Thuế hoặc Đất đai).
    * Chọn Hồ sơ liên quan từ danh sách.
    * Chọn Tiêu đề khiếu nại (về số tiền, thanh toán...).
    * Đính kèm File PDF biên lai/thông báo thuế.
    * Nhập Nội dung chi tiết (Bắt buộc).
    * Nhấn **Gửi khiếu nại ngay**.

### B.5.7. Nhận Thông báo hệ thống và cảnh báo biến động
* **Hộp thư thông báo nhanh:** Nhấp chuột vào biểu tượng **quả chuông** trên Header để xem 5 thông báo mới nhất.
* **Trang quản lý thông báo:** Chọn **Xem tất cả** để lọc thông báo chưa đọc, đánh dấu đã đọc. Mỗi thông báo đều có đường dẫn truy cập nhanh tới hồ sơ tương ứng.