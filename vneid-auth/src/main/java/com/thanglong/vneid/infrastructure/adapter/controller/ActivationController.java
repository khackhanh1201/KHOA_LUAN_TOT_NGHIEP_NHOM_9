package com.thanglong.vneid.infrastructure.adapter.controller;

import com.thanglong.vneid.domain.model.Citizen;
import com.thanglong.vneid.usecase.dto.*;
import com.thanglong.vneid.usecase.service.ActivationUseCase;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller cho kích hoạt tài khoản.
 */
@RestController
@RequestMapping("/api/vneid/activate")
public class ActivationController {

    private final ActivationUseCase activationUseCase;

    public ActivationController(ActivationUseCase activationUseCase) {
        this.activationUseCase = activationUseCase;
    }

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<ActivationRequestResponse>> requestActivation(@Valid @RequestBody ActivationRequest request) {
        String maskedEmail = activationUseCase.requestActivation(
                request.getCccdNumber(), request.getPhoneNumber(), request.getEmail());
        
        ActivationRequestResponse response = new ActivationRequestResponse(
                maskedEmail, "OTP đã được gửi đến email đăng ký của bạn");
        
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        activationUseCase.verifyOtp(request.getCccdNumber(), request.getOtpCode());
        return ResponseEntity.ok(ApiResponse.success(null, "Xác thực OTP thành công"));
    }

    @PostMapping("/set-password")
    public ResponseEntity<ApiResponse<ActivationSetPasswordResponse>> setPassword(@Valid @RequestBody SetPasswordRequest request) {
        Citizen citizen = activationUseCase.setPassword(request.getCccdNumber(), request.getPassword());
        
        ActivationSetPasswordResponse response = new ActivationSetPasswordResponse(
                citizen.getFullName(), 
                citizen.getCccdNumber(), 
                "Tài khoản đã được kích hoạt thành công"
        );
        
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }
}
