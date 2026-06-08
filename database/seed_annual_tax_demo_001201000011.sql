-- Demo thuế đất hàng năm cho công dân 001201000011 (Lý Nhã Kỳ, citizen_id=105)
-- Thửa 2011-2015 đã có sẵn; script này INSERT record + 2 kỳ thanh toán/năm.
-- Miễn giảm 30% (APPROVED 2026) đã được tính vào số tiền.

USE `land-tax`;

-- Dọn dữ liệu annual cũ (nếu chạy lại demo)
DELETE tp FROM tax_payments tp
  JOIN records r ON tp.record_id = r.record_id
 WHERE r.record_category = 'ANNUAL_TAX_RENEWAL'
   AND r.citizen_id = 105
   AND r.land_parcel_id IN (2011, 2012, 2013, 2014, 2015);

DELETE FROM records
 WHERE record_category = 'ANNUAL_TAX_RENEWAL'
   AND citizen_id = 105
   AND land_parcel_id IN (2011, 2012, 2013, 2014, 2015);

DELETE FROM notifications
 WHERE account_id = 205
   AND noti_type IN ('ANNUAL_TAX_ISSUED', 'TAX_INSTALLMENT_2');

-- records: 1 hồ sơ / thửa
INSERT INTO records (record_id, citizen_id, land_parcel_id, record_category, current_status) VALUES
(5001, 105, 2011, 'ANNUAL_TAX_RENEWAL', 'APPROVED'),
(5002, 105, 2012, 'ANNUAL_TAX_RENEWAL', 'APPROVED'),
(5003, 105, 2013, 'ANNUAL_TAX_RENEWAL', 'APPROVED'),
(5004, 105, 2014, 'ANNUAL_TAX_RENEWAL', 'APPROVED'),
(5005, 105, 2015, 'ANNUAL_TAX_RENEWAL', 'APPROVED');

-- tax_payments: Kỳ 1 due 31/05 AWAITING_PAYMENT, Kỳ 2 due 31/10 UNPAID
-- Số tiền = (thuế lũy tiến × 70%) / 2
INSERT INTO tax_payments (pay_id, record_id, land_parcel_id, tax_year, total_amount_due, due_date, payment_status, transaction_code) VALUES
-- Thửa 2011: 100m² × 80tr × 0.03% = 2.400.000 → 1.680.000/năm
(5001, 5001, 2011, 2026,  840000.00, '2026-05-31', 'AWAITING_PAYMENT', 'TX-DEMO2011K1'),
(5002, 5001, 2011, 2026,  840000.00, '2026-10-31', 'UNPAID',           'TX-DEMO2011K2'),
-- Thửa 2012: 110m² × ~44,1tr × 0.03% → 1.019.117,65/năm
(5003, 5002, 2012, 2026,  509558.83, '2026-05-31', 'AWAITING_PAYMENT', 'TX-DEMO2012K1'),
(5004, 5002, 2012, 2026,  509558.82, '2026-10-31', 'UNPAID',           'TX-DEMO2012K2'),
-- Thửa 2013: 95m² × 52tr × 0.03% → 1.037.400/năm
(5005, 5003, 2013, 2026,  518700.00, '2026-05-31', 'AWAITING_PAYMENT', 'TX-DEMO2013K1'),
(5006, 5003, 2013, 2026,  518700.00, '2026-10-31', 'UNPAID',           'TX-DEMO2013K2'),
-- Thửa 2014: 88m² × 48tr × 0.03% → 887.040/năm
(5007, 5004, 2014, 2026,  443520.00, '2026-05-31', 'AWAITING_PAYMENT', 'TX-DEMO2014K1'),
(5008, 5004, 2014, 2026,  443520.00, '2026-10-31', 'UNPAID',           'TX-DEMO2014K2'),
-- Thửa 2015: 130m² × 46tr × 0.03% → 1.255.800/năm
(5009, 5005, 2015, 2026,  627900.00, '2026-05-31', 'AWAITING_PAYMENT', 'TX-DEMO2015K1'),
(5010, 5005, 2015, 2026,  627900.00, '2026-10-31', 'UNPAID',           'TX-DEMO2015K2');

INSERT INTO notifications (account_id, title, content, noti_type, is_read) VALUES
(205,
 'Phát hành thuế đất năm 2026',
 'Hệ thống đã phát hành hóa đơn thuế đất hàng năm 2026 cho các thửa 2011–2015. Vui lòng thanh toán Kỳ 1 trước 31/05/2026.',
 'ANNUAL_TAX_ISSUED',
 0);
