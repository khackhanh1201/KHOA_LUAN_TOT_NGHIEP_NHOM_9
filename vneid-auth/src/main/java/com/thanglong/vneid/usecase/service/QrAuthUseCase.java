package com.thanglong.vneid.usecase.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.thanglong.vneid.domain.model.Citizen;
import com.thanglong.vneid.domain.model.QrSession;
import com.thanglong.vneid.domain.repository.CitizenRepository;
import com.thanglong.vneid.domain.repository.QrSessionRepository;
import com.thanglong.vneid.usecase.dto.*;
import com.thanglong.vneid.usecase.port.JwtProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

/**
 * Use case xử lý đăng nhập bằng mã QR.
 */
@Service
public class QrAuthUseCase {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(QrAuthUseCase.class);

    private final QrSessionRepository qrSessionRepository;
    private final CitizenRepository citizenRepository;
    private final JwtProvider jwtProvider;

    public QrAuthUseCase(QrSessionRepository qrSessionRepository, CitizenRepository citizenRepository,
            JwtProvider jwtProvider) {
        this.qrSessionRepository = qrSessionRepository;
        this.citizenRepository = citizenRepository;
        this.jwtProvider = jwtProvider;
    }

    /**
     * Khởi tạo mã QR để đăng nhập.
     */
    @Transactional
    public QrGenerateResponse generateQr() {
        String qrToken = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(5);

        QrSession session = QrSession.builder()
                .qrToken(qrToken)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build();

        qrSessionRepository.save(session);
        log.info("Khởi tạo mã QR thành công: {}", qrToken);

        // Sinh Base64 QR Code
        String base64QrCode = generateBase64QrCode(qrToken);

        return QrGenerateResponse.builder()
                .qrToken(qrToken)
                .qrBase64Image(base64QrCode)
                .expiresAt(expiresAt)
                .message("Khởi tạo mã QR thành công")
                .build();
    }

    /**
     * Kiểm tra trạng thái của mã QR (được gọi từ web frontend).
     */
    public ApiResponse<QrStatusResponse> getQrStatus(String qrToken) {
        QrSession session = qrSessionRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new RuntimeException("Mã QR không tồn tại"));

        // Kiểm tra hết hạn
        if (session.getExpiresAt().isBefore(LocalDateTime.now()) && !"SUCCESS".equals(session.getStatus())) {
            session.setStatus("EXPIRED");
            qrSessionRepository.save(session);
        }

        if ("EXPIRED".equals(session.getStatus())) {
            return ApiResponse.error("Mã QR đã hết hạn", "EXPIRED");
        }

        QrStatusResponse response = new QrStatusResponse(session.getStatus(), null);
        return ApiResponse.success(response, session.getStatus());
    }

    /**
     * Handshake cuối cùng: Đăng nhập bằng QR sau khi Mobile đã xác nhận.
     */
    public ApiResponse<AuthResponse> loginByQr(String qrToken) {
        QrSession session = qrSessionRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new RuntimeException("Mã QR không tồn tại"));

        if (!"SUCCESS".equals(session.getStatus())) {
            throw new RuntimeException("Mã QR chưa được xác nhận hoặc đã hết hạn");
        }

        // Sinh JWT Token cho công dân đã xác nhận QR
        Citizen citizen = citizenRepository.findByCccdNumber(session.getCccdNumber())
                .orElseThrow(() -> new RuntimeException("Công dân không tồn tại với CCCD: " + session.getCccdNumber()));

        java.util.List<String> roles = java.util.List.of("ROLE_CITIZEN");
        String activeRole = "ROLE_CITIZEN";
        String fullName = citizen.getFullName() != null ? citizen.getFullName() : "Người dùng";
        String email = citizen.getEmail() != null ? citizen.getEmail() : "";

        String token = jwtProvider.generateToken(
                citizen.getCccdNumber(),
                email,
                activeRole,
                roles);

        log.info("Handshake QR thành công cho CCCD: {}", citizen.getCccdNumber());

        AuthResponse authResponse = AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(citizen.getCccdNumber())
                .fullName(fullName)
                .email(email)
                .activeRole(activeRole)
                .roles(roles)
                .message("SUCCESS")
                .build();

        return ApiResponse.success(authResponse, "Đăng nhập thành công");
    }

    /**
     * Xác nhận đăng nhập từ thiết bị Mobile.
     */
    @Transactional
    public void confirmQr(QrConfirmRequest request) {
        QrSession session = qrSessionRepository.findByQrToken(request.getQrToken())
                .orElseThrow(() -> new RuntimeException("Mã QR không hợp lệ"));

        if ("EXPIRED".equals(session.getStatus())) {
            throw new RuntimeException("EXPIRED");
        }

        if (!"PENDING".equals(session.getStatus())) {
            throw new RuntimeException("Mã QR đã được sử dụng hoặc không hợp lệ");
        }

        if (session.getExpiresAt().isBefore(LocalDateTime.now())) {
            session.setStatus("EXPIRED");
            qrSessionRepository.save(session);
            throw new RuntimeException("EXPIRED");
        }

        Citizen citizen = resolveCitizenFromMobileRequest(request);

        if (!"ACTIVE".equalsIgnoreCase(citizen.getAccountStatus())) {
            throw new RuntimeException("Tài khoản chưa được kích hoạt hoặc đã bị khóa");
        }

        // Cập nhật trạng thái và lưu thông tin công dân
        session.setStatus("SUCCESS");
        session.setCccdNumber(citizen.getCccdNumber());

        qrSessionRepository.save(session);
        log.info("Xác nhận mã QR thành công từ mobile, CCCD: {}", citizen.getCccdNumber());
    }

    private Citizen resolveCitizenFromMobileRequest(QrConfirmRequest request) {
        String mobileToken = trimToNull(request.getMobileToken());
        String cccdNumber = trimToNull(request.getCccdNumber());
        String firebaseUid = trimToNull(request.getFirebaseUid());

        // Ưu tiên cao nhất: token đăng nhập mobile do BE cấp.
        if (mobileToken != null) {
            if (!jwtProvider.validateToken(mobileToken)) {
                throw new RuntimeException("Phiên đăng nhập mobile không hợp lệ hoặc đã hết hạn");
            }
            String cccdFromToken = jwtProvider.extractCccd(mobileToken);
            if (cccdFromToken == null || cccdFromToken.isBlank()) {
                throw new RuntimeException("Không thể xác thực danh tính từ token mobile");
            }
            if (cccdNumber != null && !cccdNumber.equals(cccdFromToken)) {
                throw new RuntimeException("CCCD trong yêu cầu không khớp với phiên đăng nhập mobile");
            }
            return citizenRepository.findByCccdNumber(cccdFromToken)
                    .orElseThrow(() -> new RuntimeException("Công dân không tồn tại với CCCD: " + cccdFromToken));
        }

        // Fallback: app mobile gửi trực tiếp CCCD (khi chưa kèm token).
        if (cccdNumber != null) {
            return citizenRepository.findByCccdNumber(cccdNumber)
                    .orElseThrow(() -> new RuntimeException("Công dân không tồn tại với CCCD: " + cccdNumber));
        }

        // Backward-compatible: luồng cũ dựa vào Firebase UID.
        if (firebaseUid != null) {
            return citizenRepository.findByFirebaseUid(firebaseUid)
                    .orElseThrow(() -> new RuntimeException(
                            "Tài khoản chưa được liên kết với VNeID (Không tìm thấy Firebase UID)"));
        }

        throw new RuntimeException("Thiếu thông tin định danh mobile (mobile_token hoặc cccd_number hoặc firebase_uid)");
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String generateBase64QrCode(String qrToken) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(qrToken, BarcodeFormat.QR_CODE, 250, 250);

            ByteArrayOutputStream pngOutputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", pngOutputStream);
            byte[] pngData = pngOutputStream.toByteArray();
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(pngData);
        } catch (Exception e) {
            log.error("Lỗi khi sinh mã QR", e);
            return null;
        }
    }
}
