package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.infrastructure.adapter.controller.exception.ResourceNotFoundException;
import org.springframework.http.HttpStatus;import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Map validation / business argument errors → HTTP 400 cho E2E & API clients.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getDefaultMessage())
                .filter(m -> m != null && !m.isBlank())
                .findFirst()
                .orElse("Du lieu khong hop le");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFound(ResourceNotFoundException ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "Không tìm thấy dữ liệu";
        String lower = message.toLowerCase();
        boolean landPriceMissing = lower.contains("đơn giá") || lower.contains("don gia");
        Map<String, String> body = new LinkedHashMap<>();
        if (landPriceMissing) {
            body.put("error",
                    "Đơn giá của khu vực chưa được cập nhật. Vui lòng đợi cán bộ cập nhật giá và khai báo lại sau.");
            body.put("code", "LAND_PRICE_NOT_FOUND");
        } else {
            body.put("error", message);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String message = ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "Đã xảy ra lỗi xử lý";
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}