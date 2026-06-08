-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 07, 2026 lúc 11:42 AM
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
-- Cơ sở dữ liệu: `land-tax`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `accounts`
--

CREATE TABLE `accounts` (
  `account_id` int(11) NOT NULL,
  `citizen_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `account_status` varchar(20) DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `accounts`
--

INSERT INTO `accounts` (`account_id`, `citizen_id`, `role_id`, `account_status`) VALUES
(200, 100, 1, 'ACTIVE'),
(201, 101, 4, 'ACTIVE'),
(202, 102, 4, 'ACTIVE'),
(203, 103, 3, 'ACTIVE'),
(204, 104, 3, 'ACTIVE'),
(205, 105, 2, 'ACTIVE'),
(206, 106, 2, 'ACTIVE'),
(207, 107, 2, 'ACTIVE'),
(208, 108, 2, 'ACTIVE'),
(209, 109, 2, 'ACTIVE'),
(210, 110, 2, 'ACTIVE'),
(211, 111, 2, 'ACTIVE'),
(212, 112, 2, 'ACTIVE'),
(213, 113, 2, 'ACTIVE'),
(214, 114, 2, 'ACTIVE'),
(215, 100, 1, 'ACTIVE'),
(216, 101, 4, 'ACTIVE'),
(217, 102, 4, 'ACTIVE'),
(218, 103, 3, 'ACTIVE'),
(219, 104, 3, 'ACTIVE'),
(220, 106, 2, 'ACTIVE'),
(221, 107, 2, 'ACTIVE'),
(222, 108, 2, 'ACTIVE'),
(223, 109, 2, 'ACTIVE'),
(224, 110, 2, 'ACTIVE'),
(225, 111, 2, 'ACTIVE'),
(226, 105, 2, 'ACTIVE'),
(227, 112, 2, 'ACTIVE'),
(228, 113, 2, 'ACTIVE'),
(229, 114, 2, 'ACTIVE');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `areas`
--

CREATE TABLE `areas` (
  `area_id` int(11) NOT NULL,
  `district_code` varchar(20) NOT NULL,
  `ward_code` varchar(20) NOT NULL,
  `street_name` varchar(255) DEFAULT NULL,
  `land_quota` decimal(10,2) DEFAULT NULL,
  `position_level` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `areas`
--

INSERT INTO `areas` (`area_id`, `district_code`, `ward_code`, `street_name`, `land_quota`, `position_level`) VALUES
(1, 'D01', 'W01', 'Phố Huế', 180.00, 1),
(2, 'D01', 'W02', 'Hàng Bài', 180.00, 1),
(3, 'D01', 'W03', 'Kim Mã', 180.00, 1),
(4, 'D01', 'W04', 'Đội Cấn', 180.00, 2),
(5, 'D02', 'W05', 'Dịch Vọng', 180.00, 2),
(6, 'D02', 'W06', 'Mai Dịch', 180.00, 2),
(7, 'D02', 'W07', 'Láng Hạ', 180.00, 2),
(8, 'D02', 'W08', 'Giảng Võ', 180.00, 2),
(9, 'D03', 'W09', 'Tây Mỗ', 180.00, 3),
(10, 'D03', 'W10', 'Mỹ Đình', 180.00, 3),
(11, 'D03', 'W11', 'Nguyễn Xiển', 180.00, 3),
(12, 'D03', 'W11', 'Nguyễn Xiển (khu B)', 180.00, 3),
(13, 'D03', 'W13', 'Trung Hòa', 180.00, 3),
(14, 'D03', 'W14', 'Yên Hòa', 180.00, 3),
(15, 'D_THANH_TRI', 'W_THANH_LIET', 'Thanh Liệt', 180.00, 4),
(16, 'D_THANH_TRI', 'W_KIM_GIANG', 'Kim Giang', 180.00, 4),
(17, 'D_THANH_TRI', 'W_TUU_LIET', 'Tựu Liệt', 180.00, 4);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `citizen_local`
--

CREATE TABLE `citizen_local` (
  `citizen_id` int(11) NOT NULL,
  `cccd_number` varchar(12) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `citizen_local`
--

INSERT INTO `citizen_local` (`citizen_id`, `cccd_number`, `full_name`, `phone_number`, `email`) VALUES
(100, '079090012345', 'Lê Hải Đăng (Admin)', '0911223344', 'dang.lh@mock.vn'),
(101, '079090000002', 'Trần Văn Địa — CB Địa chính P.Thanh Liệt', '0912000002', 'land.officer@mock.vn'),
(102, '079090000004', 'Nguyễn Thị Địa — CB Địa chính P.Kim Giang', '0912000004', 'land.officer2@mock.vn'),
(103, '079090000003', 'Phạm Thu Thuế — CB Thuế Q.1', '0912000003', 'tax.officer@mock.vn'),
(104, '079090000005', 'Lê Văn Thuế — CB Thuế Q.2', '0912000005', 'tax.officer2@mock.vn'),
(105, '001201000011', 'Lý Nhã Kỳ', '0922000011', 'ky.ly@mock.vn'),
(106, '001099012345', 'Nguyễn Văn Bình', '0912999888', 'binh.nv@mock.vn'),
(107, '001122334456', 'Phạm Xuân Ẩn', '0933111222', 'an.px@citizen.vn'),
(108, '001122334457', 'Vũ Trọng Phụng', '0944111222', 'phung.vt@citizen.vn'),
(109, '001122334458', 'Hồ Xuân Hương', '0955111222', 'huong.hx@citizen.vn'),
(110, '001122334459', 'Đinh Bộ Lĩnh', '0966111222', 'linh.db@citizen.vn'),
(111, '001122334460', 'Trần Hưng Đạo', '0977111222', 'dao.th@citizen.vn'),
(112, '001301000001', 'Hoàng Thị Lan', '0901000001', 'lan.ht@citizen.vn'),
(113, '001301000002', 'Đỗ Minh Tuấn', '0901000002', 'tuan.dm@citizen.vn'),
(114, '001301000003', 'Bùi Thị Mai', '0901000003', 'mai.bt@citizen.vn');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `complaints`
--

CREATE TABLE `complaints` (
  `complaints_id` int(11) NOT NULL,
  `citizen_id` int(11) NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `status` varchar(20) DEFAULT 'PENDING',
  `response_note` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `complaints`
--

INSERT INTO `complaints` (`complaints_id`, `citizen_id`, `record_id`, `content`, `status`, `response_note`, `created_at`, `updated_at`) VALUES
(2001, 109, 2005, '[Khiếu nại về số tiền thuế đất đai] - Tôi thắc mắc mức thuế áp cho thửa SEED-2005 cao hơn dự kiến.', 'PENDING', NULL, '2026-05-30 01:00:00', '2026-05-30 01:00:00'),
(2002, 110, 2006, '[Khiếu nại về quyết định thuế] - Đề nghị rà soát lại diện tích chịu thuế thửa SEED-2006.', 'PROCESSING', NULL, '2026-05-15 03:30:00', '2026-05-28 07:20:00'),
(2003, 111, 2007, '[Khiếu nại về thuế đất đai] - Đã thanh toán nhưng chưa nhận được xác nhận đầy đủ trên hệ thống.', 'RESOLVED', 'Cán bộ thuế đã đối soát PayOS mã 250602007891. Hồ sơ #2007 chuyển COMPLETED. Xin cảm ơn ông/bà.', '2026-02-25 04:00:00', '2026-03-05 09:45:00'),
(2004, 105, 2001, '[Khiếu nại về thủ tục] - Đề nghị làm rõ thời hạn xử lý hồ sơ thuế thửa SEED-2001.', 'PENDING', NULL, '2026-06-01 08:00:00', '2026-06-01 08:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `land_owners`
--

CREATE TABLE `land_owners` (
  `ownership_id` int(11) NOT NULL,
  `citizen_id` int(11) NOT NULL,
  `land_parcel_id` int(11) NOT NULL,
  `ownership_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `land_owners`
--

INSERT INTO `land_owners` (`ownership_id`, `citizen_id`, `land_parcel_id`, `ownership_type`) VALUES
(2001, 105, 2001, 'MAIN'),
(2002, 106, 2002, 'MAIN'),
(2003, 107, 2003, 'MAIN'),
(2004, 108, 2004, 'MAIN'),
(2005, 109, 2005, 'MAIN'),
(2006, 110, 2006, 'MAIN'),
(2007, 111, 2007, 'MAIN'),
(2008, 112, 2008, 'MAIN'),
(2009, 113, 2009, 'MAIN'),
(2010, 114, 2010, 'MAIN'),
(2011, 113, 2009, 'PRIMARY'),
(2012, 114, 2010, 'PRIMARY'),
(2013, 113, 2009, 'PRIMARY'),
(2014, 114, 2010, 'PRIMARY'),
(2015, 106, 949, 'PRIMARY'),
(2016, 105, 2011, 'MAIN'),
(2017, 105, 2012, 'MAIN'),
(2018, 105, 2013, 'MAIN'),
(2019, 105, 2014, 'MAIN'),
(2020, 105, 2015, 'MAIN'),
(2021, 106, 2016, 'MAIN'),
(2022, 107, 2017, 'MAIN');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `land_parcels`
--

CREATE TABLE `land_parcels` (
  `land_parcel_id` int(11) NOT NULL,
  `land_type_id` int(11) NOT NULL,
  `area_id` int(11) NOT NULL,
  `parcel_number` varchar(50) NOT NULL,
  `map_sheet_number` varchar(50) NOT NULL,
  `area_size` decimal(10,2) NOT NULL,
  `usage_duration` varchar(100) DEFAULT NULL,
  `usage_type` varchar(100) DEFAULT NULL,
  `usage_origin` text DEFAULT NULL,
  `address` text NOT NULL,
  `certificate_number` varchar(50) DEFAULT NULL,
  `gcn_book_number` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `attached_house` text DEFAULT NULL,
  `attached_other` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `land_parcels`
--

INSERT INTO `land_parcels` (`land_parcel_id`, `land_type_id`, `area_id`, `parcel_number`, `map_sheet_number`, `area_size`, `usage_duration`, `usage_type`, `usage_origin`, `address`, `certificate_number`, `gcn_book_number`, `notes`, `attached_house`, `attached_other`) VALUES
(949, 1, 11, '127', '18', 120.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 16 đường Nguyễn Xiển, phường Thanh Liệt, Hà Nội', 'CV 123458', 'GCN-TEST-2026-001', NULL, NULL, NULL),
(2001, 1, 3, 'SEED-2001', 'MS-20-01', 120.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 20 Kim Mã — Lý Nhã Kỳ', 'CV-SEED-2001', 'GCN-2001', 'Demo: chờ địa chính', NULL, NULL),
(2002, 1, 1, 'SEED-2002', 'MS-20-02', 85.50, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 10 Phố Huế — Nguyễn Văn Bình', 'CV-SEED-2002', 'GCN-2002', 'Demo: chờ địa chính', NULL, NULL),
(2003, 1, 5, 'SEED-2003', 'MS-20-03', 200.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 5 Dịch Vọng — Phạm Xuân Ẩn', 'CV-SEED-2003', 'GCN-2003', 'Demo: chờ cán bộ thuế', NULL, NULL),
(2004, 1, 9, 'SEED-2004', 'MS-20-04', 350.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Tây Mỗ — Vũ Trọng Phụng', 'CV-SEED-2004', 'GCN-2004', 'Demo: chờ cán bộ thuế', NULL, NULL),
(2005, 1, 2, 'SEED-2005', 'MS-20-05', 60.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 15 Hàng Bài — Hồ Xuân Hương', 'CV-SEED-2005', 'GCN-2005', 'Demo: chờ thanh toán', NULL, NULL),
(2006, 1, 4, 'SEED-2006', 'MS-20-06', 90.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 30 Đội Cấn — Đinh Bộ Lĩnh', 'CV-SEED-2006', 'GCN-2006', 'Demo: chờ thanh toán', NULL, NULL),
(2007, 1, 6, 'SEED-2007', 'MS-20-07', 150.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 8 Mai Dịch — Trần Hưng Đạo', 'CV-SEED-2007', 'GCN-2007', 'Demo: đã thanh toán', NULL, NULL),
(2008, 1, 17, 'SEED-2008', 'MS-20-08', 64.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Ngõ 15 Tựu Liệt — Hoàng Thị Lan', 'CV-SEED-2008', 'GCN-2008', 'Demo: đã thanh toán', NULL, NULL),
(2009, 1, 11, 'SEED-2009', 'MS-20-09', 150.50, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 12 Nguyễn Xiển — Đỗ Minh Tuấn', 'CV-SEED-2009', 'GCN-2009', 'Demo: quá hạn nộp tiền', NULL, NULL),
(2010, 1, 12, 'SEED-2010', 'MS-20-10', 80.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 14 Nguyễn Xiển — Bùi Thị Mai', 'CV-SEED-2010', 'GCN-2010', 'Demo: quá hạn nộp tiền', NULL, NULL),
(2011, 1, 3, 'DEMO-2011', 'MS-21-01', 100.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 22 Kim Mã — Lý Nhã Kỳ (luồng demo 1)', 'CV-DEMO-2011', 'GCN-DEMO-2011', 'Slot demo full luồng — chưa có hồ sơ', NULL, NULL),
(2012, 1, 5, 'DEMO-2012', 'MS-21-02', 110.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 7 Dịch Vọng — Lý Nhã Kỳ (luồng demo 2)', 'CV-DEMO-2012', 'GCN-DEMO-2012', 'Slot demo full luồng — chưa có hồ sơ', NULL, NULL),
(2013, 1, 7, 'DEMO-2013', 'MS-21-03', 95.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 3 Láng Hạ — Lý Nhã Kỳ (luồng demo 3)', 'CV-DEMO-2013', 'GCN-DEMO-2013', 'Slot demo full luồng — chưa có hồ sơ', NULL, NULL),
(2014, 1, 8, 'DEMO-2014', 'MS-21-04', 88.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 9 Giảng Võ — Lý Nhã Kỳ (luồng demo 4)', 'CV-DEMO-2014', 'GCN-DEMO-2014', 'Slot demo full luồng — chưa có hồ sơ', NULL, NULL),
(2015, 1, 10, 'DEMO-2015', 'MS-21-05', 130.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 2 Mỹ Đình — Lý Nhã Kỳ (luồng demo 5)', 'CV-DEMO-2015', 'GCN-DEMO-2015', 'Slot demo full luồng — chưa có hồ sơ', NULL, NULL),
(2016, 1, 4, 'DISC-2016', 'MS-22-01', 75.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 32 Đội Cấn — Nguyễn Văn Bình (đối soát lệch)', 'CV-DISC-2016', 'GCN-DISC-2016', 'Demo: DISCREPANCY — thiếu webhook', NULL, NULL),
(2017, 1, 6, 'MISM-2017', 'MS-22-02', 140.00, 'Lâu dài', 'Riêng', 'Nhà nước giao đất', 'Số 10 Mai Dịch — Phạm Xuân Ẩn (lệch số tiền)', 'CV-MISM-2017', 'GCN-MISM-2017', 'Demo: AMOUNT_MISMATCH', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `land_prices`
--

CREATE TABLE `land_prices` (
  `price_id` int(11) NOT NULL,
  `land_type_id` int(11) NOT NULL,
  `area_id` int(11) NOT NULL,
  `unit_price` decimal(18,2) NOT NULL,
  `applied_from` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `land_prices`
--

INSERT INTO `land_prices` (`price_id`, `land_type_id`, `area_id`, `unit_price`, `applied_from`) VALUES
(1, 1, 1, 80000000.00, '2025-01-01'),
(2, 1, 2, 95000000.00, '2025-01-01'),
(3, 1, 3, 80000000.00, '2025-01-01'),
(4, 1, 4, 75000000.00, '2025-01-01'),
(5, 1, 5, 44117647.06, '2025-01-01'),
(6, 1, 6, 48000000.00, '2025-01-01'),
(7, 1, 9, 12138728.32, '2025-01-01'),
(8, 1, 11, 50182725.00, '2025-01-01'),
(9, 1, 12, 50000000.00, '2025-01-01'),
(10, 1, 17, 50000000.00, '2025-01-01'),
(11, 1, 13, 4500000000.00, '2026-06-11'),
(12, 1, 7, 52000000.00, '2025-01-01'),
(13, 1, 8, 48000000.00, '2025-01-01'),
(14, 1, 10, 46000000.00, '2025-01-01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `land_types`
--

CREATE TABLE `land_types` (
  `land_type_id` int(11) NOT NULL,
  `type_code` varchar(10) NOT NULL,
  `type_name` varchar(150) NOT NULL,
  `is_tax_payment` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `land_types`
--

INSERT INTO `land_types` (`land_type_id`, `type_code`, `type_name`, `is_tax_payment`) VALUES
(1, 'ODT', 'Đất ở đô thị', 1),
(2, 'ONT', 'Đất ở nông thôn', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notifications`
--

CREATE TABLE `notifications` (
  `noti_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `noti_type` varchar(50) NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `notifications`
--

INSERT INTO `notifications` (`noti_id`, `account_id`, `title`, `content`, `noti_type`, `is_read`, `created_at`) VALUES
(1, 220, 'Nộp hồ sơ thành công', 'Hồ sơ #2011 đã được tiếp nhận, đang chờ xử lý.', 'DECLARATION_SUBMITTED', 0, '2026-06-06 10:46:23'),
(2, 220, 'Tờ khai thuế đã được duyệt', 'Tờ khai mã #2011 đã được duyệt. Vui lòng thanh toán số tiền thuế trước hạn.', 'TAX_APPROVED', 0, '2026-06-06 10:59:22'),
(3, 226, 'Thanh toán thành công', 'Hóa đơn HD-2026-007 đã được thanh toán qua PayOS. Hồ sơ #2007 hoàn thành.', 'PAYMENT_SUCCESS', 1, '2026-02-20 15:45:00'),
(4, 218, 'Có hồ sơ chờ xử lý', 'Hồ sơ #2003 đã xác minh địa chính, chờ cán bộ thuế tiếp nhận.', 'TAX_PENDING', 0, '2026-04-10 15:05:00'),
(5, 218, 'Đối soát cần xử lý', 'Phát hiện hóa đơn DISCREPANCY mã PAYOS-DISC-DEMO — cần đối soát thủ công.', 'RECON_DISCREPANCY', 0, '2026-05-20 09:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `processing_logs`
--

CREATE TABLE `processing_logs` (
  `plog_id` int(11) NOT NULL,
  `record_id` int(11) NOT NULL,
  `processor_account_id` int(11) NOT NULL,
  `processing_step` varchar(100) NOT NULL,
  `old_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `processor_notes` text DEFAULT NULL,
  `processed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `processing_logs`
--

INSERT INTO `processing_logs` (`plog_id`, `record_id`, `processor_account_id`, `processing_step`, `old_status`, `new_status`, `processor_notes`, `processed_at`) VALUES
(2001, 2003, 201, 'VERIFY_CADASTRAL', 'SUBMITTED', 'VERIFIED', 'Xác minh diện tích và giá đất khớp sổ địa chính.', '2026-04-10 15:00:00'),
(2002, 2004, 202, 'VERIFY_CADASTRAL', 'SUBMITTED', 'VERIFIED', 'Áp giá đất bảng giá Q.2 năm 2026.', '2026-04-14 16:30:00'),
(2003, 2005, 203, 'RECEIVE_TAX', 'VERIFIED', 'PROCESSING', 'Cán bộ thuế tiếp nhận hồ sơ.', '2026-03-06 09:00:00'),
(2004, 2005, 203, 'APPROVE_TAX', 'PROCESSING', 'APPROVED', 'Phát hành thông báo thuế — chờ thanh toán.', '2026-03-07 10:15:00'),
(2005, 2006, 204, 'RECEIVE_TAX', 'VERIFIED', 'PROCESSING', 'Tiếp nhận hồ sơ SEED-2006.', '2026-03-11 08:30:00'),
(2006, 2006, 204, 'APPROVE_TAX', 'PROCESSING', 'APPROVED', 'Duyệt tờ khai, sinh hóa đơn AWAITING_PAYMENT.', '2026-03-12 11:00:00'),
(2007, 2007, 203, 'APPROVE_TAX', 'PROCESSING', 'APPROVED', 'Duyệt và phát hành thông báo thuế.', '2026-02-05 14:00:00'),
(2008, 2007, 203, 'PAYMENT_SUCCESS', 'APPROVED', 'COMPLETED', 'PayOS webhook thành công — mã 250602007891.', '2026-02-20 15:42:00'),
(2009, 2008, 204, 'APPROVE_TAX', 'PROCESSING', 'APPROVED', 'Duyệt hồ sơ SEED-2008.', '2026-02-18 09:00:00'),
(2010, 2008, 204, 'PAYMENT_SUCCESS', 'APPROVED', 'COMPLETED', 'Thanh toán PayOS mã 250602008456.', '2026-03-01 09:18:00'),
(2011, 2009, 203, 'APPROVE_TAX', 'PROCESSING', 'APPROVED', 'Duyệt năm 2025 — hạn nộp 31/10/2025.', '2025-10-08 10:00:00'),
(2012, 2010, 204, 'APPROVE_TAX', 'PROCESSING', 'APPROVED', 'Duyệt năm 2025 — hạn nộp 30/09/2025.', '2025-09-25 11:30:00'),
(2013, 2011, 218, 'RECEIVE', 'VERIFIED', 'PROCESSING', 'Cán bộ thuế tiếp nhận hồ sơ', '2026-06-06 10:58:34'),
(2014, 2011, 218, 'APPROVE', 'PROCESSING', 'APPROVED', 'Hồ sơ hợp lệ, đủ điều kiện phê duyệt', '2026-06-06 10:59:22'),
(2015, 2012, 203, 'APPROVE_TAX', 'PROCESSING', 'APPROVED', 'Duyệt hồ sơ DISC-2016 — chờ đối soát.', '2026-05-18 10:00:00'),
(2016, 2012, 203, 'RECONCILE_ADJUST', 'DISCREPANCY', 'DISCREPANCY', 'Chạy đối soát — không thấy webhook PayOS, đánh dấu DISCREPANCY.', '2026-05-20 09:30:00'),
(2017, 2013, 203, 'APPROVE_TAX', 'PROCESSING', 'APPROVED', 'Duyệt hồ sơ MISM-2017.', '2026-05-10 11:00:00'),
(2018, 2013, 203, 'PAYMENT_SUCCESS', 'APPROVED', 'COMPLETED', 'Thanh toán PayOS — phát hiện lệch số tiền khi đối soát.', '2026-05-12 14:20:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `reconciliation_logs`
--

CREATE TABLE `reconciliation_logs` (
  `log_id` int(11) NOT NULL,
  `transaction_code` varchar(100) NOT NULL,
  `amount_received` decimal(18,2) NOT NULL,
  `bank_trans_id` varchar(100) DEFAULT NULL,
  `webhook_payload` longtext DEFAULT NULL,
  `status` varchar(20) DEFAULT 'UNMATCHED',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `reconciliation_logs`
--

INSERT INTO `reconciliation_logs` (`log_id`, `transaction_code`, `amount_received`, `bank_trans_id`, `webhook_payload`, `status`, `created_at`) VALUES
(1, '250602007891', 2160000.00, 'BANK-250602007891', '{\"orderCode\":\"250602007891\",\"amount\":2160000,\"description\":\"Thanh toan thue dat SEED-2007\"}', 'MATCHED', '2026-02-20 15:42:00'),
(2, '250602008456', 960000.00, 'BANK-250602008456', '{\"orderCode\":\"250602008456\",\"amount\":960000,\"description\":\"Thanh toan thue dat SEED-2008\"}', 'MATCHED', '2026-03-01 09:18:00'),
(3, 'PAYOS-MISM-2017', 1500000.00, 'BANK-MISM-2017', '{\"orderCode\":\"PAYOS-MISM-2017\",\"amount\":1500000,\"description\":\"Chuyen khoan thue dat\"}', 'AMOUNT_MISMATCH', '2026-05-12 14:20:00'),
(4, 'ORPHAN-BANK-001', 500000.00, 'BANK-ORPHAN-001', '{\"description\":\"Giao dich khong map hoa don\"}', 'UNREGISTERED', '2026-05-25 08:00:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `records`
--

CREATE TABLE `records` (
  `record_id` int(11) NOT NULL,
  `citizen_id` int(11) NOT NULL,
  `land_parcel_id` int(11) NOT NULL,
  `record_category` varchar(50) NOT NULL,
  `current_status` varchar(50) DEFAULT 'PENDING',
  `submitted_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `records`
--

INSERT INTO `records` (`record_id`, `citizen_id`, `land_parcel_id`, `record_category`, `current_status`, `submitted_at`) VALUES
(2001, 105, 2001, 'TAX_DECLARATION', 'SUBMITTED', '2026-05-28 09:15:00'),
(2002, 106, 2002, 'TAX_DECLARATION', 'SUBMITTED', '2026-05-25 14:30:00'),
(2003, 107, 2003, 'TAX_DECLARATION', 'VERIFIED', '2026-04-08 10:00:00'),
(2004, 108, 2004, 'TAX_DECLARATION', 'VERIFIED', '2026-04-12 11:20:00'),
(2005, 109, 2005, 'TAX_DECLARATION', 'APPROVED', '2026-03-05 08:45:00'),
(2006, 110, 2006, 'TAX_DECLARATION', 'APPROVED', '2026-03-10 09:00:00'),
(2007, 111, 2007, 'TAX_DECLARATION', 'COMPLETED', '2026-02-01 07:30:00'),
(2008, 112, 2008, 'TAX_DECLARATION', 'COMPLETED', '2026-02-15 08:00:00'),
(2009, 113, 2009, 'TAX_DECLARATION', 'APPROVED', '2025-10-05 10:00:00'),
(2010, 114, 2010, 'TAX_DECLARATION', 'APPROVED', '2025-09-20 09:30:00'),
(2011, 106, 949, 'LAND_OWNERSHIP_NEW', 'APPROVED', '2026-06-06 10:46:23'),
(2012, 106, 2016, 'TAX_DECLARATION', 'APPROVED', '2026-05-18 09:30:00'),
(2013, 107, 2017, 'TAX_DECLARATION', 'COMPLETED', '2026-05-10 10:30:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `record_documents`
--

CREATE TABLE `record_documents` (
  `document_id` int(11) NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_url` text NOT NULL,
  `file_type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `record_documents`
--

INSERT INTO `record_documents` (`document_id`, `record_id`, `file_name`, `file_url`, `file_type`) VALUES
(1, 2011, 'Screenshot 2026-01-15 223237.png', 'https://res.cloudinary.com/ds8nwvczu/image/upload/v1780717583/land-tax/record-documents/file_fcvxk7.png', 'image/png');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `token_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_revoked` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_code` varchar(50) NOT NULL,
  `role_name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`role_id`, `role_code`, `role_name`) VALUES
(1, 'ROLE_ADMIN', 'Quản trị viên'),
(2, 'ROLE_CITIZEN', 'Công dân'),
(3, 'ROLE_TAX_OFFICER', 'Cán bộ Thuế'),
(4, 'ROLE_LAND_OFFICER', 'Cán bộ Địa chính');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tax_declarations`
--

CREATE TABLE `tax_declarations` (
  `declaration_id` int(11) NOT NULL,
  `record_id` int(11) NOT NULL,
  `declared_area` decimal(10,2) NOT NULL,
  `declared_usage` varchar(100) DEFAULT NULL,
  `declaration_notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tax_declarations`
--

INSERT INTO `tax_declarations` (`declaration_id`, `record_id`, `declared_area`, `declared_usage`, `declaration_notes`, `created_at`) VALUES
(2001, 2001, 120.00, 'Đất ở', 'Seed QA — chờ địa chính', '2026-05-28 09:15:00'),
(2002, 2002, 85.50, 'Đất ở', 'Seed QA — chờ địa chính', '2026-05-25 14:30:00'),
(2003, 2003, 200.00, 'Đất ở', 'Seed QA — chờ cán bộ thuế', '2026-04-08 10:00:00'),
(2004, 2004, 350.00, 'Đất ở', 'Seed QA — chờ cán bộ thuế', '2026-04-12 11:20:00'),
(2005, 2005, 60.00, 'Đất ở', 'Seed QA — chờ thanh toán', '2026-03-05 08:45:00'),
(2006, 2006, 90.00, 'Đất ở', 'Seed QA — chờ thanh toán', '2026-03-10 09:00:00'),
(2007, 2007, 150.00, 'Đất ở', 'Seed QA — đã thanh toán', '2026-02-01 07:30:00'),
(2008, 2008, 64.00, 'Đất ở', 'Seed QA — đã thanh toán', '2026-02-15 08:00:00'),
(2009, 2009, 150.50, 'Đất ở', 'Seed QA — quá hạn nộp tiền', '2025-10-05 10:00:00'),
(2010, 2010, 80.00, 'Đất ở', 'Seed QA — quá hạn nộp tiền', '2025-09-20 09:30:00'),
(2014, 2011, 120.00, 'Riêng', 'Khai báo đất mới — Nguyễn Văn Bình', '2026-06-06 10:46:23'),
(2015, 2012, 75.00, 'Đất ở', 'Demo đối soát DISCREPANCY', '2026-05-18 09:30:00'),
(2016, 2013, 140.00, 'Đất ở', 'Demo đối soát AMOUNT_MISMATCH', '2026-05-10 10:30:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tax_exempt_subjects`
--

CREATE TABLE `tax_exempt_subjects` (
  `exempt_id` int(11) NOT NULL,
  `citizen_id` int(11) NOT NULL,
  `uploaded_by_account` int(11) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `exemption_reason` text DEFAULT NULL,
  `discount_rate` decimal(5,2) NOT NULL,
  `uploaded_at` datetime DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'PENDING',
  `applied_year` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tax_exempt_subjects`
--

INSERT INTO `tax_exempt_subjects` (`exempt_id`, `citizen_id`, `uploaded_by_account`, `full_name`, `exemption_reason`, `discount_rate`, `uploaded_at`, `status`, `applied_year`) VALUES
(1, 109, 203, 'Hồ Xuân Hương', 'Đối tượng chính sách — giảm 50% thuế đất', 50.00, '2026-05-01 10:00:00', 'PENDING', 2026),
(2, 110, 204, 'Đinh Bộ Lĩnh', 'Hộ nghèo — miễn 100% thuế đất năm 2026', 100.00, '2026-04-15 09:00:00', 'APPROVED', 2026),
(3, 105, 203, 'Lý Nhã Kỳ', 'Gia đình chính sách — giảm 30%', 30.00, '2026-06-01 08:00:00', 'APPROVED', 2026),
(4, 111, 203, 'Trần Hưng Đạo', 'Người cao tuổi — giảm 20%', 20.00, '2026-03-01 11:00:00', 'APPROVED', 2026);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `tax_payments`
--

CREATE TABLE `tax_payments` (
  `pay_id` int(11) NOT NULL,
  `record_id` int(11) DEFAULT NULL,
  `land_parcel_id` int(11) NOT NULL,
  `tax_year` int(11) NOT NULL,
  `total_amount_due` decimal(18,2) NOT NULL,
  `due_date` date NOT NULL,
  `payment_status` varchar(20) DEFAULT 'UNPAID',
  `transaction_code` varchar(100) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `tax_payments`
--

INSERT INTO `tax_payments` (`pay_id`, `record_id`, `land_parcel_id`, `tax_year`, `total_amount_due`, `due_date`, `payment_status`, `transaction_code`, `paid_at`) VALUES
(2001, 2001, 2001, 2026, 2880000.00, '2026-12-31', 'UNPAID', 'PAYOS-SEED-2001', NULL),
(2002, 2002, 2002, 2026, 2054250.00, '2026-12-31', 'UNPAID', 'PAYOS-SEED-2002', NULL),
(2003, 2003, 2003, 2026, 3000000.00, '2026-12-31', 'UNPAID', 'PAYOS-SEED-2003', NULL),
(2004, 2004, 2004, 2026, 2100000.00, '2026-12-31', 'UNPAID', 'PAYOS-SEED-2004', NULL),
(2005, 2005, 2005, 2026, 1710000.00, '2026-12-31', 'AWAITING_PAYMENT', 'PAYOS-SEED-2005', NULL),
(2006, 2006, 2006, 2026, 2025000.00, '2026-12-31', 'AWAITING_PAYMENT', 'PAYOS-SEED-2006', NULL),
(2007, 2007, 2007, 2026, 2160000.00, '2026-12-31', 'PAID', '250602007891', '2026-02-20 15:42:00'),
(2008, 2008, 2008, 2026, 960000.00, '2026-12-31', 'PAID', '250602008456', '2026-03-01 09:18:00'),
(2009, 2009, 2009, 2025, 2265750.03, '2025-10-31', 'OVERDUE', 'PAYOS-SEED-2009', NULL),
(2010, 2010, 2010, 2025, 1200000.00, '2025-09-30', 'OVERDUE', 'PAYOS-SEED-2010', NULL),
(2011, 2011, 949, 2026, 1806578.10, '2026-12-31', 'AWAITING_PAYMENT', 'PAYOS-SEED-2011', NULL),
(2012, 2012, 2016, 2026, 1350000.00, '2026-12-31', 'DISCREPANCY', 'PAYOS-DISC-DEMO', NULL),
(2013, 2013, 2017, 2026, 2520000.00, '2026-12-31', 'PAID', 'PAYOS-MISM-2017', '2026-05-12 14:20:00');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`account_id`),
  ADD KEY `citizen_id` (`citizen_id`),
  ADD KEY `role_id` (`role_id`);

--
-- Chỉ mục cho bảng `areas`
--
ALTER TABLE `areas`
  ADD PRIMARY KEY (`area_id`);

--
-- Chỉ mục cho bảng `citizen_local`
--
ALTER TABLE `citizen_local`
  ADD PRIMARY KEY (`citizen_id`),
  ADD UNIQUE KEY `cccd_number` (`cccd_number`);

--
-- Chỉ mục cho bảng `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`complaints_id`),
  ADD KEY `fk_complaint_citizen` (`citizen_id`),
  ADD KEY `fk_complaint_record` (`record_id`);

--
-- Chỉ mục cho bảng `land_owners`
--
ALTER TABLE `land_owners`
  ADD PRIMARY KEY (`ownership_id`),
  ADD KEY `citizen_id` (`citizen_id`),
  ADD KEY `land_parcel_id` (`land_parcel_id`);

--
-- Chỉ mục cho bảng `land_parcels`
--
ALTER TABLE `land_parcels`
  ADD PRIMARY KEY (`land_parcel_id`),
  ADD KEY `land_type_id` (`land_type_id`),
  ADD KEY `area_id` (`area_id`);

--
-- Chỉ mục cho bảng `land_prices`
--
ALTER TABLE `land_prices`
  ADD PRIMARY KEY (`price_id`),
  ADD KEY `land_type_id` (`land_type_id`),
  ADD KEY `area_id` (`area_id`);

--
-- Chỉ mục cho bảng `land_types`
--
ALTER TABLE `land_types`
  ADD PRIMARY KEY (`land_type_id`),
  ADD UNIQUE KEY `type_code` (`type_code`);

--
-- Chỉ mục cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`noti_id`),
  ADD KEY `account_id` (`account_id`);

--
-- Chỉ mục cho bảng `processing_logs`
--
ALTER TABLE `processing_logs`
  ADD PRIMARY KEY (`plog_id`),
  ADD KEY `record_id` (`record_id`),
  ADD KEY `processor_account_id` (`processor_account_id`);

--
-- Chỉ mục cho bảng `reconciliation_logs`
--
ALTER TABLE `reconciliation_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Chỉ mục cho bảng `records`
--
ALTER TABLE `records`
  ADD PRIMARY KEY (`record_id`),
  ADD KEY `citizen_id` (`citizen_id`),
  ADD KEY `land_parcel_id` (`land_parcel_id`);

--
-- Chỉ mục cho bảng `record_documents`
--
ALTER TABLE `record_documents`
  ADD PRIMARY KEY (`document_id`),
  ADD KEY `record_id` (`record_id`);

--
-- Chỉ mục cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`token_id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `account_id` (`account_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_code` (`role_code`);

--
-- Chỉ mục cho bảng `tax_declarations`
--
ALTER TABLE `tax_declarations`
  ADD PRIMARY KEY (`declaration_id`),
  ADD UNIQUE KEY `record_id` (`record_id`);

--
-- Chỉ mục cho bảng `tax_exempt_subjects`
--
ALTER TABLE `tax_exempt_subjects`
  ADD PRIMARY KEY (`exempt_id`),
  ADD KEY `citizen_id` (`citizen_id`),
  ADD KEY `uploaded_by_account` (`uploaded_by_account`);

--
-- Chỉ mục cho bảng `tax_payments`
--
ALTER TABLE `tax_payments`
  ADD PRIMARY KEY (`pay_id`),
  ADD UNIQUE KEY `transaction_code` (`transaction_code`),
  ADD KEY `record_id` (`record_id`),
  ADD KEY `land_parcel_id` (`land_parcel_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `accounts`
--
ALTER TABLE `accounts`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=230;

--
-- AUTO_INCREMENT cho bảng `areas`
--
ALTER TABLE `areas`
  MODIFY `area_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `citizen_local`
--
ALTER TABLE `citizen_local`
  MODIFY `citizen_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT cho bảng `complaints`
--
ALTER TABLE `complaints`
  MODIFY `complaints_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2005;

--
-- AUTO_INCREMENT cho bảng `land_owners`
--
ALTER TABLE `land_owners`
  MODIFY `ownership_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2023;

--
-- AUTO_INCREMENT cho bảng `land_parcels`
--
ALTER TABLE `land_parcels`
  MODIFY `land_parcel_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2018;

--
-- AUTO_INCREMENT cho bảng `land_prices`
--
ALTER TABLE `land_prices`
  MODIFY `price_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT cho bảng `land_types`
--
ALTER TABLE `land_types`
  MODIFY `land_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `notifications`
--
ALTER TABLE `notifications`
  MODIFY `noti_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `processing_logs`
--
ALTER TABLE `processing_logs`
  MODIFY `plog_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2019;

--
-- AUTO_INCREMENT cho bảng `reconciliation_logs`
--
ALTER TABLE `reconciliation_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `records`
--
ALTER TABLE `records`
  MODIFY `record_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2014;

--
-- AUTO_INCREMENT cho bảng `record_documents`
--
ALTER TABLE `record_documents`
  MODIFY `document_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `token_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `tax_declarations`
--
ALTER TABLE `tax_declarations`
  MODIFY `declaration_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2017;

--
-- AUTO_INCREMENT cho bảng `tax_exempt_subjects`
--
ALTER TABLE `tax_exempt_subjects`
  MODIFY `exempt_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `tax_payments`
--
ALTER TABLE `tax_payments`
  MODIFY `pay_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2014;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `accounts`
--
ALTER TABLE `accounts`
  ADD CONSTRAINT `accounts_ibfk_1` FOREIGN KEY (`citizen_id`) REFERENCES `citizen_local` (`citizen_id`),
  ADD CONSTRAINT `accounts_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);

--
-- Các ràng buộc cho bảng `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `fk_complaint_citizen` FOREIGN KEY (`citizen_id`) REFERENCES `citizen_local` (`citizen_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_complaint_record` FOREIGN KEY (`record_id`) REFERENCES `records` (`record_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `land_owners`
--
ALTER TABLE `land_owners`
  ADD CONSTRAINT `land_owners_ibfk_1` FOREIGN KEY (`citizen_id`) REFERENCES `citizen_local` (`citizen_id`),
  ADD CONSTRAINT `land_owners_ibfk_2` FOREIGN KEY (`land_parcel_id`) REFERENCES `land_parcels` (`land_parcel_id`);

--
-- Các ràng buộc cho bảng `land_parcels`
--
ALTER TABLE `land_parcels`
  ADD CONSTRAINT `land_parcels_ibfk_1` FOREIGN KEY (`land_type_id`) REFERENCES `land_types` (`land_type_id`),
  ADD CONSTRAINT `land_parcels_ibfk_2` FOREIGN KEY (`area_id`) REFERENCES `areas` (`area_id`);

--
-- Các ràng buộc cho bảng `land_prices`
--
ALTER TABLE `land_prices`
  ADD CONSTRAINT `land_prices_ibfk_1` FOREIGN KEY (`land_type_id`) REFERENCES `land_types` (`land_type_id`),
  ADD CONSTRAINT `land_prices_ibfk_2` FOREIGN KEY (`area_id`) REFERENCES `areas` (`area_id`);

--
-- Các ràng buộc cho bảng `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`);

--
-- Các ràng buộc cho bảng `processing_logs`
--
ALTER TABLE `processing_logs`
  ADD CONSTRAINT `processing_logs_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `records` (`record_id`),
  ADD CONSTRAINT `processing_logs_ibfk_2` FOREIGN KEY (`processor_account_id`) REFERENCES `accounts` (`account_id`);

--
-- Các ràng buộc cho bảng `records`
--
ALTER TABLE `records`
  ADD CONSTRAINT `records_ibfk_1` FOREIGN KEY (`citizen_id`) REFERENCES `citizen_local` (`citizen_id`),
  ADD CONSTRAINT `records_ibfk_2` FOREIGN KEY (`land_parcel_id`) REFERENCES `land_parcels` (`land_parcel_id`);

--
-- Các ràng buộc cho bảng `record_documents`
--
ALTER TABLE `record_documents`
  ADD CONSTRAINT `record_documents_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `records` (`record_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`account_id`);

--
-- Các ràng buộc cho bảng `tax_declarations`
--
ALTER TABLE `tax_declarations`
  ADD CONSTRAINT `tax_declarations_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `records` (`record_id`);

--
-- Các ràng buộc cho bảng `tax_exempt_subjects`
--
ALTER TABLE `tax_exempt_subjects`
  ADD CONSTRAINT `tax_exempt_subjects_ibfk_1` FOREIGN KEY (`citizen_id`) REFERENCES `citizen_local` (`citizen_id`),
  ADD CONSTRAINT `tax_exempt_subjects_ibfk_2` FOREIGN KEY (`uploaded_by_account`) REFERENCES `accounts` (`account_id`);

--
-- Các ràng buộc cho bảng `tax_payments`
--
ALTER TABLE `tax_payments`
  ADD CONSTRAINT `tax_payments_ibfk_1` FOREIGN KEY (`record_id`) REFERENCES `records` (`record_id`),
  ADD CONSTRAINT `tax_payments_ibfk_2` FOREIGN KEY (`land_parcel_id`) REFERENCES `land_parcels` (`land_parcel_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
