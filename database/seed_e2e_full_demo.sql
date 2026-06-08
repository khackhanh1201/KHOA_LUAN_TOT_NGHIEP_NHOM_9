-- =============================================================================
-- SEED E2E FULL DEMO — chạy sau khi import land_tax_management + vneid_simulator
-- Mục tiêu: đủ dữ liệu test toàn luồng (nộp hồ sơ → địa chính → thuế → thanh toán → thuế hàng năm)
-- Công dân chính: 001201000011 (citizen_local.citizen_id = 5, accounts.account_id = 5)
-- =============================================================================

USE `land-tax`;

-- -----------------------------------------------------------------------------
-- 1. Thửa demo 2011–2015 + GCN (nếu chưa có)
-- -----------------------------------------------------------------------------
INSERT IGNORE INTO land_parcels
  (land_parcel_id, land_type_id, area_id, parcel_number, map_sheet_number, area_size,
   usage_duration, usage_type, usage_origin, address, certificate_number, gcn_book_number)
VALUES
  (2011, 1, 11, 'D2011', '01', 100.00, 'Lâu dài', 'Đất ở đô thị', 'Nhà nước giao đất',
   'Số 12 Nguyễn Xiển, Thanh Liệt, Hà Nội', 'GCN-DEMO-2011', 'GCN-DEMO-2011'),
  (2012, 1, 12, 'D2012', '01', 110.00, 'Lâu dài', 'Đất ở đô thị', 'Nhà nước giao đất',
   'Số 210 Kim Giang, Thanh Liệt, Hà Nội', 'GCN-DEMO-2012', 'GCN-DEMO-2012'),
  (2013, 1, 13, 'D2013', '01',  95.00, 'Lâu dài', 'Đất ở đô thị', 'Nhà nước giao đất',
   'Lô A2 Nghiêm Xuân Yêm, Thanh Liệt, Hà Nội', 'GCN-DEMO-2013', 'GCN-DEMO-2013'),
  (2014, 1, 14, 'D2014', '01',  88.00, 'Lâu dài', 'Đất ở đô thị', 'Nhà nước giao đất',
   'Số 8 Phan Trọng Tuệ, Thanh Liệt, Hà Nội', 'GCN-DEMO-2014', 'GCN-DEMO-2014'),
  (2015, 1, 15, 'D2015', '01', 130.00, 'Lâu dài', 'Đất ở đô thị', 'Nhà nước giao đất',
   'Khu đồng Vực, Thanh Liệt, Hà Nội', 'GCN-DEMO-2015', 'GCN-DEMO-2015');

-- Thửa chưa có chủ — dùng test LAND_OWNERSHIP_NEW
INSERT IGNORE INTO land_parcels
  (land_parcel_id, land_type_id, area_id, parcel_number, map_sheet_number, area_size,
   usage_duration, usage_type, address, certificate_number, gcn_book_number)
VALUES
  (2020, 1, 16, 'D2020', '01', 150.00, 'Lâu dài', 'Đất ở đô thị',
   'Số 20 Cầu Bươu, Thanh Liệt, Hà Nội', 'GCN-E2E-NEW', 'GCN-E2E-NEW');

-- Giá đất cho thửa demo (area 11–15 đã có trong dump; bổ sung nếu thiếu)
INSERT IGNORE INTO land_prices (price_id, land_type_id, area_id, unit_price, applied_from) VALUES
  (2011, 1, 11, 80000000.00, '2026-01-01'),
  (2012, 1, 12, 44100000.00, '2026-01-01'),
  (2013, 1, 13, 52000000.00, '2026-01-01'),
  (2014, 1, 14, 48000000.00, '2026-01-01'),
  (2015, 1, 15, 46000000.00, '2026-01-01'),
  (2020, 1, 16, 45000000.00, '2026-01-01');

-- Chủ sở hữu: Lý Nhã Kỳ (citizen_id = 5) sở hữu thửa 2011–2015
INSERT IGNORE INTO land_owners (ownership_id, citizen_id, land_parcel_id, ownership_type, is_active)
VALUES
  (2011, 5, 2011, 'MAIN', 1),
  (2012, 5, 2012, 'MAIN', 1),
  (2013, 5, 2013, 'MAIN', 1),
  (2014, 5, 2014, 'MAIN', 1),
  (2015, 5, 2015, 'MAIN', 1);

-- Miễn giảm 50% đã APPROVED cho năm 2026 (citizen 5)
UPDATE tax_exempt_subjects
   SET status = 'APPROVED', exemption_rate = 50.00, reason = 'Hộ cận nghèo'
 WHERE citizen_id = 5 AND applied_year = 2026;

-- -----------------------------------------------------------------------------
-- 2. Thuế đất hàng năm 2026 (5 thửa, 2 kỳ/thửa)
-- -----------------------------------------------------------------------------
DELETE tp FROM tax_payments tp
  JOIN records r ON tp.record_id = r.record_id
 WHERE r.record_category = 'ANNUAL_TAX_RENEWAL'
   AND r.citizen_id = 5
   AND r.land_parcel_id IN (2011, 2012, 2013, 2014, 2015);

DELETE FROM records
 WHERE record_category = 'ANNUAL_TAX_RENEWAL'
   AND citizen_id = 5
   AND land_parcel_id IN (2011, 2012, 2013, 2014, 2015);

INSERT INTO records (record_id, citizen_id, land_parcel_id, record_category, current_status) VALUES
(5001, 5, 2011, 'ANNUAL_TAX_RENEWAL', 'APPROVED'),
(5002, 5, 2012, 'ANNUAL_TAX_RENEWAL', 'APPROVED'),
(5003, 5, 2013, 'ANNUAL_TAX_RENEWAL', 'APPROVED'),
(5004, 5, 2014, 'ANNUAL_TAX_RENEWAL', 'APPROVED'),
(5005, 5, 2015, 'ANNUAL_TAX_RENEWAL', 'APPROVED');

INSERT INTO tax_payments (pay_id, record_id, land_parcel_id, tax_year, total_amount_due, due_date, payment_status, transaction_code) VALUES
(5001, 5001, 2011, 2026, 600000.00, '2026-05-31', 'AWAITING_PAYMENT', 'TX-E2E2011K1'),
(5002, 5001, 2011, 2026, 600000.00, '2026-10-31', 'UNPAID',           'TX-E2E2011K2'),
(5003, 5002, 2012, 2026, 363750.00, '2026-05-31', 'AWAITING_PAYMENT', 'TX-E2E2012K1'),
(5004, 5002, 2012, 2026, 363750.00, '2026-10-31', 'UNPAID',           'TX-E2E2012K2'),
(5005, 5003, 2013, 2026, 370350.00, '2026-05-31', 'AWAITING_PAYMENT', 'TX-E2E2013K1'),
(5006, 5003, 2013, 2026, 370350.00, '2026-10-31', 'UNPAID',           'TX-E2E2013K2'),
(5007, 5004, 2014, 2026, 316800.00, '2026-05-31', 'AWAITING_PAYMENT', 'TX-E2E2014K1'),
(5008, 5004, 2014, 2026, 316800.00, '2026-10-31', 'UNPAID',           'TX-E2E2014K2'),
(5009, 5005, 2015, 2026, 448500.00, '2026-05-31', 'AWAITING_PAYMENT', 'TX-E2E2015K1'),
(5010, 5005, 2015, 2026, 448500.00, '2026-10-31', 'UNPAID',           'TX-E2E2015K2');

-- Thông báo thuế hàng năm
INSERT INTO notifications (account_id, title, content, noti_type, is_read)
SELECT 5,
       'Phát hành thuế đất năm 2026',
       'Hệ thống đã phát hành hóa đơn thuế đất hàng năm 2026 cho các thửa 2011–2015.',
       'ANNUAL_TAX_ISSUED',
       0
 WHERE NOT EXISTS (
   SELECT 1 FROM notifications
    WHERE account_id = 5 AND noti_type = 'ANNUAL_TAX_ISSUED'
      AND title LIKE '%2026%'
 );

-- Thửa thanh toán nhanh (parcel 939 CS09999) — citizen 5 chưa sở hữu, dùng sau khi duyệt hồ sơ mới
-- Hoặc dùng parcel 9 (CS1032) citizen 5 đã sở hữu trong dump gốc

SELECT 'E2E seed completed. Citizen 001201000011 = citizen_id 5, account_id 5' AS message;
