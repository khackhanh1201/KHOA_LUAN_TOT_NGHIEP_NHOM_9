package com.thanglong.vneid.infrastructure.adapter.controller;

import com.thanglong.vneid.usecase.dto.*;
import com.thanglong.vneid.usecase.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * REST Controller cho xác thực và đăng nhập VNeID.
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Đăng nhập và quản lý phiên làm việc")
public class AuthController {

    private final QrAuthUseCase qrAuthUseCase;
    private final LoginUseCase loginUseCase;

    public AuthController(QrAuthUseCase qrAuthUseCase, LoginUseCase loginUseCase) {
        this.qrAuthUseCase = qrAuthUseCase;
        this.loginUseCase = loginUseCase;
    }

    @Operation(summary = "Đăng nhập truyền thống (CCCD + Password)")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = loginUseCase.login(request.getCccdNumber(), request.getPassword());
            return ResponseEntity.ok(ApiResponse.success(response, "Đăng nhập thành công"));
        } catch (RuntimeException e) {
            String msg = e.getMessage() != null ? e.getMessage() : "";
            // Map mã lỗi từ LoginUseCase sang errorCode + HTTP status cụ thể cho FE.
            if ("ACCOUNT_INACTIVE".equals(msg)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        ApiResponse.error(
                                "Tài khoản chưa được kích hoạt. Vui lòng kích hoạt tài khoản để tiếp tục đăng nhập.",
                                "ACCOUNT_INACTIVE"
                        )
                );
            }
            if ("ACCOUNT_LOCKED".equals(msg)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(
                        ApiResponse.error(
                                "Tài khoản đã bị khoá. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
                                "ACCOUNT_LOCKED"
                        )
                );
            }
            return ResponseEntity.badRequest().body(ApiResponse.error(msg, "AUTH_FAILED"));
        }
    }

    @Operation(summary = "Chuyển đổi vai trò làm việc")
    @PostMapping("/switch-role")
    public ResponseEntity<ApiResponse<AuthResponse>> switchRole(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody SwitchRoleRequest request) {
        try {
            String token = authHeader.replace("Bearer ", "");
            AuthResponse response = loginUseCase.switchRole(token, request.getTargetRole());
            return ResponseEntity.ok(ApiResponse.success(response, "Chuyển vai trò thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "SWITCH_FAILED"));
        }
    }

    // ──────────────────────────────────────────────────────────────────
    // QR Login Flow (Firebase UID)
    // ──────────────────────────────────────────────────────────────────

    @Operation(summary = "Khởi tạo mã QR đăng nhập")
    @PostMapping("/qr-generate")
    public ResponseEntity<ApiResponse<QrGenerateResponse>> generateQr() {
        QrGenerateResponse response = qrAuthUseCase.generateQr();
        return ResponseEntity.ok(ApiResponse.success(response, "Khởi tạo QR thành công"));
    }

    @Operation(summary = "Kiểm tra trạng thái QR (Polling)")
    @GetMapping("/qr-status")
    public ResponseEntity<ApiResponse<QrStatusResponse>> getQrStatus(@RequestParam("token") String qrToken) {
        ApiResponse<QrStatusResponse> response = qrAuthUseCase.getQrStatus(qrToken);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Handshake cuối cùng: Đăng nhập QR sau khi Mobile xác nhận")
    @PostMapping("/qr-login")
    public ResponseEntity<ApiResponse<AuthResponse>> qrLogin(@Valid @RequestBody QrLoginRequest request) {
        try {
            ApiResponse<AuthResponse> response = qrAuthUseCase.loginByQr(request.getQrToken());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "QR_LOGIN_FAILED"));
        }
    }

    @Operation(summary = "Xác nhận đăng nhập QR từ Mobile (Bằng Firebase UID)")
    @PostMapping("/qr-confirm")
    public ResponseEntity<ApiResponse<Void>> confirmQr(@Valid @RequestBody QrConfirmRequest request) {
        try {
            qrAuthUseCase.confirmQr(request);
            return ResponseEntity.ok(ApiResponse.success(null, "Xác nhận đăng nhập thành công"));
        } catch (RuntimeException e) {
            if ("EXPIRED".equals(e.getMessage())) {
                return ResponseEntity.ok(ApiResponse.error("Mã QR đã hết hạn", "EXPIRED"));
            }
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage(), "INVALID_QR"));
        }
    }
}
