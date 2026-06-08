-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 07, 2026 lúc 11:43 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `vneid`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `citizens`
--

CREATE TABLE `citizens` (
  `cccd_number` varchar(12) NOT NULL,
  `phone_number` varchar(15) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `passcode_hash` varchar(255) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `dob` date DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `account_status` varchar(20) DEFAULT 'ACTIVE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(255) DEFAULT NULL,
  `firebase_uid` varchar(255) DEFAULT NULL,
  `firebase_email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `citizens`
--

INSERT INTO `citizens` (`cccd_number`, `phone_number`, `password_hash`, `passcode_hash`, `full_name`, `dob`, `gender`, `account_status`, `created_at`, `email`, `firebase_uid`, `firebase_email`) VALUES
('001099012345', '0912999888', '123456', '123456', 'Nguyễn Văn Bình', '1999-01-01', 'Nam', 'ACTIVE', '2025-10-05 04:00:00', 'binh.nv@mock.vn', NULL, 'binh.nv@mock.vn'),
('001122334456', '0933111222', '123456', '123456', 'Phạm Xuân Ẩn', '1975-06-12', 'Nam', 'ACTIVE', '2025-11-01 01:00:00', 'an.px@citizen.vn', NULL, 'an.px@citizen.vn'),
('001122334457', '0944111222', '123456', '123456', 'Vũ Trọng Phụng', '1980-02-28', 'Nam', 'ACTIVE', '2025-11-05 01:00:00', 'phung.vt@citizen.vn', NULL, 'phung.vt@citizen.vn'),
('001122334458', '0955111222', '123456', '123456', 'Hồ Xuân Hương', '1982-07-07', 'Nữ', 'ACTIVE', '2025-12-01 01:00:00', 'huong.hx@citizen.vn', NULL, 'huong.hx@citizen.vn'),
('001122334459', '0966111222', '123456', '123456', 'Đinh Bộ Lĩnh', '1978-04-18', 'Nam', 'ACTIVE', '2025-12-10 01:00:00', 'linh.db@citizen.vn', NULL, 'linh.db@citizen.vn'),
('001122334460', '0977111222', '123456', '123456', 'Trần Hưng Đạo', '1965-12-25', 'Nam', 'ACTIVE', '2026-01-05 01:00:00', 'dao.th@citizen.vn', NULL, 'dao.th@citizen.vn'),
('001201000011', '0922000011', '123456', '123456', 'Lý Nhã Kỳ', '1989-09-09', 'Nữ', 'ACTIVE', '2025-10-01 03:00:00', 'ky.ly@mock.vn', NULL, 'ky.ly@mock.vn'),
('001301000001', '0901000001', '123456', '123456', 'Hoàng Thị Lan', '1992-03-14', 'Nữ', 'ACTIVE', '2026-01-20 02:00:00', 'lan.ht@citizen.vn', NULL, 'lan.ht@citizen.vn'),
('001301000002', '0901000002', '123456', '123456', 'Đỗ Minh Tuấn', '1988-08-30', 'Nam', 'ACTIVE', '2026-02-01 02:00:00', 'tuan.dm@citizen.vn', NULL, 'tuan.dm@citizen.vn'),
('001301000003', '0901000003', '123456', '123456', 'Bùi Thị Mai', '1995-01-22', 'Nữ', 'ACTIVE', '2026-02-10 02:00:00', 'mai.bt@citizen.vn', NULL, 'mai.bt@citizen.vn'),
('079090000002', '0912000002', '123456', '123456', 'Trần Văn Địa — CB Địa chính P.Thanh Liệt', '1985-05-15', 'Nam', 'ACTIVE', '2025-08-01 01:05:00', 'land.officer@mock.vn', NULL, 'land.officer@mock.vn'),
('079090000003', '0912000003', '123456', '123456', 'Phạm Thu Thuế — CB Thuế Q.1', '1988-08-20', 'Nữ', 'ACTIVE', '2025-08-01 01:10:00', 'tax.officer@mock.vn', NULL, 'tax.officer@mock.vn'),
('079090000004', '0912000004', '123456', '123456', 'Nguyễn Thị Địa — CB Địa chính P.Kim Giang', '1987-03-20', 'Nữ', 'ACTIVE', '2025-09-10 02:00:00', 'land.officer2@mock.vn', NULL, 'land.officer2@mock.vn'),
('079090000005', '0912000005', '123456', '123456', 'Lê Văn Thuế — CB Thuế Q.2', '1986-11-11', 'Nam', 'ACTIVE', '2025-09-15 02:30:00', 'tax.officer2@mock.vn', NULL, 'tax.officer2@mock.vn'),
('079090012345', '0911223344', '123456', '123456', 'Lê Hải Đăng (Admin)', '1990-01-01', 'Nam', 'ACTIVE', '2025-08-01 01:00:00', 'dang.lh@mock.vn', NULL, 'dang.lh@mock.vn');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `otp_requests`
--

CREATE TABLE `otp_requests` (
  `id` bigint(20) NOT NULL,
  `cccd_number` varchar(12) NOT NULL,
  `otp_code` varchar(6) NOT NULL,
  `email` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_used` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `qr_login_sessions`
--

CREATE TABLE `qr_login_sessions` (
  `qr_token` varchar(255) NOT NULL,
  `cccd_number` varchar(12) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `qr_login_sessions`
--

INSERT INTO `qr_login_sessions` (`qr_token`, `cccd_number`, `status`, `expires_at`, `created_at`) VALUES
('06046498-57f4-45ec-a061-1d896c4544c5', NULL, 'PENDING', '2026-06-06 04:07:36', '2026-06-06 04:02:36'),
('0d28fd83-ef1a-4135-b61c-848d57f4f162', NULL, 'PENDING', '2026-06-05 16:56:55', '2026-06-05 16:51:55'),
('14d7f33f-5e51-413a-8fbc-916258a9bd94', NULL, 'PENDING', '2026-06-06 03:51:34', '2026-06-06 03:46:34'),
('162984fb-8776-4c8a-96fc-ac7a3039d809', NULL, 'EXPIRED', '2026-06-05 18:11:00', '2026-06-05 18:06:00'),
('199e20b0-91b5-4731-b478-c77beca6a384', NULL, 'EXPIRED', '2026-06-05 18:05:01', '2026-06-05 18:00:01'),
('27d33cc1-9331-437c-b016-04b77ce9c35c', NULL, 'PENDING', '2026-06-06 03:57:00', '2026-06-06 03:52:00'),
('3414cd4a-768d-4e9d-9435-708baa49a601', NULL, 'PENDING', '2026-06-05 18:05:01', '2026-06-05 18:00:01'),
('4692caf7-58ee-434a-acb5-6ea5df0ff21d', NULL, 'PENDING', '2026-06-06 04:07:36', '2026-06-06 04:02:36'),
('4aaf0889-0178-4c77-8e4a-45fc5a75a22d', NULL, 'PENDING', '2026-06-06 03:59:29', '2026-06-06 03:54:29'),
('4bdeee4b-8974-4e3a-a35c-cf53fc35b099', NULL, 'PENDING', '2026-06-05 18:05:01', '2026-06-05 18:00:01'),
('516d635e-6cfc-4101-929f-faa8fd01d15f', NULL, 'PENDING', '2026-06-06 04:07:36', '2026-06-06 04:02:36'),
('59c7c687-85a9-451a-88fd-a70ea7033bc4', NULL, 'PENDING', '2026-06-06 03:59:29', '2026-06-06 03:54:29'),
('5bae9336-0283-4875-94ff-5a27ee6bcf1f', NULL, 'EXPIRED', '2026-06-05 18:17:00', '2026-06-05 18:12:00'),
('690fba64-3553-436c-b6bb-2ce285ad7287', NULL, 'PENDING', '2026-06-06 04:07:36', '2026-06-06 04:02:36'),
('7212ca34-89d8-4ada-8689-1fc44ceb3f1b', NULL, 'PENDING', '2026-06-06 04:05:35', '2026-06-06 04:00:35'),
('7244e8a4-f7b3-4905-85ed-37ce7834686c', NULL, 'EXPIRED', '2026-06-06 03:51:34', '2026-06-06 03:46:34'),
('780e53b7-d3e9-4117-96dd-d8081f586bb4', NULL, 'PENDING', '2026-06-06 03:59:29', '2026-06-06 03:54:29'),
('816dfa3f-2cda-424a-9426-f117e4c3fcc9', NULL, 'PENDING', '2026-06-06 04:05:35', '2026-06-06 04:00:35'),
('885817b2-0e1f-46ac-9e66-f28a9cc84490', NULL, 'PENDING', '2026-06-05 16:56:55', '2026-06-05 16:51:55'),
('94557002-c12a-436b-b1d9-425c2abd93a1', NULL, 'PENDING', '2026-06-06 04:05:35', '2026-06-06 04:00:35'),
('9dca065c-cacb-46d3-9902-e90cf2596b3f', NULL, 'PENDING', '2026-06-06 03:26:57', '2026-06-06 03:21:57'),
('a10c499a-9dfc-4e23-8ed1-8a41d89db3b4', NULL, 'PENDING', '2026-06-06 04:05:35', '2026-06-06 04:00:35'),
('c43f2e4a-7920-4820-a864-ebf53675b652', NULL, 'PENDING', '2026-06-05 18:23:00', '2026-06-05 18:18:00'),
('c94c9788-eb43-4804-bbf6-fbad4f28eaa2', NULL, 'PENDING', '2026-06-06 03:51:34', '2026-06-06 03:46:34'),
('d1379c5d-22f1-47d9-9dc0-b8f00c57d2dd', NULL, 'PENDING', '2026-06-06 03:51:34', '2026-06-06 03:46:34'),
('f4207306-ee44-457d-837b-4c7887fc9a98', NULL, 'PENDING', '2026-06-05 18:05:01', '2026-06-05 18:00:01'),
('f9740ad3-f4aa-4693-b72b-a606b24a319c', NULL, 'PENDING', '2026-06-06 03:59:29', '2026-06-06 03:54:29');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `citizens`
--
ALTER TABLE `citizens`
  ADD PRIMARY KEY (`cccd_number`),
  ADD UNIQUE KEY `phone_number` (`phone_number`);

--
-- Chỉ mục cho bảng `otp_requests`
--
ALTER TABLE `otp_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `cccd_number` (`cccd_number`);

--
-- Chỉ mục cho bảng `qr_login_sessions`
--
ALTER TABLE `qr_login_sessions`
  ADD PRIMARY KEY (`qr_token`),
  ADD KEY `cccd_number` (`cccd_number`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `otp_requests`
--
ALTER TABLE `otp_requests`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `otp_requests`
--
ALTER TABLE `otp_requests`
  ADD CONSTRAINT `otp_requests_ibfk_1` FOREIGN KEY (`cccd_number`) REFERENCES `citizens` (`cccd_number`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `qr_login_sessions`
--
ALTER TABLE `qr_login_sessions`
  ADD CONSTRAINT `qr_login_sessions_ibfk_1` FOREIGN KEY (`cccd_number`) REFERENCES `citizens` (`cccd_number`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
