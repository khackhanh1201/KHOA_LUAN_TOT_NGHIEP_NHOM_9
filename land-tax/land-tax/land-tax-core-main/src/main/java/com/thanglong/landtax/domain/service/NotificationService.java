package com.thanglong.landtax.domain.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.AccountEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.NotificationEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.NotificationJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service tao thong bao cho nguoi dan.
 *
 * <p>Tim account_id tu citizen_id (bang accounts) roi INSERT vao bang notifications.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class NotificationService {

    private final NotificationJpaRepository notificationJpaRepository;
    private final AccountLookupService accountLookupService;

    /**
     * Thong bao sau khi phat hanh thue nam (cron 01/04).
     */
    public void notifyAnnualTaxBatchForCitizen(Integer citizenId, Integer taxYear) {
        String title = "Thong bao thue dat nam " + taxYear;
        String content = String.format(
                "He thong da phat hanh thue su dung dat nam %d (2 ky, moi ky 50%%). "
                        + "Vui long thanh toan ky 1 truoc ngay 31/05 va ky 2 truoc ngay 31/10.",
                taxYear);
        createNotification(citizenId, title, content, "ANNUAL_TAX_ISSUED");
    }

    /**
     * Nhac nop ky 2 / phan con lai (cron 01/10).
     */
    public void notifySecondInstallmentDue(Integer citizenId, Integer taxYear,
                                            java.math.BigDecimal remaining, Integer recordId) {
        String title = "Nhac nop thue dat nam " + taxYear;
        String content = String.format(
                "Ban con %,.0f VND thue dat nam %d chua nop (ho so #%d). "
                        + "Vui long hoan tat truoc han 31/10 de tranh bi phat cham nop.",
                remaining, taxYear, recordId);
        createNotification(citizenId, title, content, "TAX_INSTALLMENT_2");
    }

    /**
     * Gui thong bao khi to khai duoc DUYET.
     */
    public void notifyDeclarationApproved(Integer citizenId, Integer recordId) {
        String title = "To khai thue da duoc duyet";
        String content = String.format(
                "To khai ma #%d da duoc duyet. Vui long thanh toan so tien thue truoc han.",
                recordId);

        createNotification(citizenId, title, content, "TAX_APPROVED");
    }

    /**
     * Gui thong bao khi to khai bi TU CHOI.
     */
    public void notifyDeclarationRejected(Integer citizenId, Integer recordId, String reason) {
        String title = "To khai thue bi tu choi";
        String content = String.format(
                "To khai ma #%d bi tu choi do: %s. Vui long kiem tra va nop lai.",
                recordId, reason);

        createNotification(citizenId, title, content, "TAX_REJECTED");
    }

    /**
     * Gui thong bao khi thanh toan THANH CONG.
     */
    public void notifyPaymentSuccess(Integer citizenId, Integer payId,
                                      java.math.BigDecimal amount, Integer taxYear) {
        String title = "Thanh toan thue dat thanh cong";
        String content = String.format(
                "Cam on ban da nop thue dat nam %d. Ma thanh toan #%d, " +
                        "so tien: %,.0f VND. He thong da ghi nhan thanh cong.",
                taxYear, payId, amount);

        createNotification(citizenId, title, content, "PAYMENT_SUCCESS");
    }

    /**
     * Công dân đã gửi bổ sung khiếu nại sau yêu cầu của cán bộ.
     */
    public void notifyComplaintSupplementSubmitted(Integer citizenId, Integer complaintId) {
        String title = "Đã gửi bổ sung khiếu nại";
        String content = String.format(
                "Hệ thống đã nhận nội dung bổ sung cho khiếu nại #%d. "
                        + "Hồ sơ đã chuyển về trạng thái chờ xử lý, cán bộ sẽ tiếp tục giải quyết.",
                complaintId);
        createNotification(citizenId, title, content, "COMPLAINT_SUPPLEMENT_SUBMITTED");
    }

    /**
     * Cán bộ địa chính từ chối hồ sơ do khai báo không khớp sổ (trạng thái records → REJECTED).
     */
    public void notifyCadastralFraudRejected(Integer citizenId, Integer recordId,
            java.util.List<String> mismatchMessages) {
        String detail = mismatchMessages == null || mismatchMessages.isEmpty()
                ? "Thông tin khai báo không khớp sổ địa chính"
                : String.join("; ", mismatchMessages);
        String title = "Hồ sơ khai báo bị từ chối";
        String content = String.format(
                "Hồ sơ #%d có thông tin không khớp sổ địa chính: %s. "
                        + "Hồ sơ đã bị hủy. Vui lòng kiểm tra lại và tạo hồ sơ mới.",
                recordId, detail);
        createNotification(citizenId, title, content, "DECLARATION_FRAUD_REJECTED");
    }

    /**
     * Tao thong bao chung cho mot citizen.
     * Tim account_id tu citizen_id qua bang accounts.
     */
    public void createNotification(Integer citizenId, String title, String content, String notiType) {
        // Tim account_id tu citizen_id
        AccountEntity account = accountLookupService.requireCitizenAccount(citizenId);

        NotificationEntity notification = NotificationEntity.builder()
                .accountId(account.getAccountId())
                .title(title)
                .content(content)
                .notiType(notiType)
                .isRead(false)
                .build();

        NotificationEntity saved = notificationJpaRepository.save(notification);

        log.info("Notification created: notiId={}, accountId={}, type={}, title='{}'",
                saved.getNotiId(), account.getAccountId(), notiType, title);
    }
}
