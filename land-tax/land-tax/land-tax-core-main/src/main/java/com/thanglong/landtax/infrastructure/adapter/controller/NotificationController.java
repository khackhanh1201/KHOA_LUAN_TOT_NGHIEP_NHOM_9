package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.NotificationEntity;
import com.thanglong.landtax.domain.service.AccountLookupService;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.CitizenLocalJpaRepository;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.NotificationJpaRepository;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationJpaRepository notificationJpaRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final AccountLookupService accountLookupService;

    private Integer resolveAccountId() {
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        return citizenLocalJpaRepository.findByCccdNumber(cccd)
                .map(c -> accountLookupService.requireCitizenAccount(c.getCitizenId()).getAccountId())
                .orElse(null);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<List<NotificationEntity>> getMyNotifications() {
        Integer accountId = resolveAccountId();
        if (accountId == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(
            notificationJpaRepository.findByAccountIdOrderByCreatedAtDesc(accountId)
        );
    }

    @GetMapping("/me/unread-count")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Integer accountId = resolveAccountId();
        if (accountId == null) return ResponseEntity.ok(Map.of("count", 0L));
        long count = notificationJpaRepository.countByAccountIdAndIsReadFalse(accountId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{notiId}/read")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, String>> markAsRead(@PathVariable Integer notiId) {
        Integer accountId = resolveAccountId();
        NotificationEntity noti = notificationJpaRepository.findById(notiId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!noti.getAccountId().equals(accountId)) {
            throw new AccessDeniedException("Forbidden");
        }
        noti.setIsRead(true);
        notificationJpaRepository.save(noti);
        return ResponseEntity.ok(Map.of("message", "OK"));
    }

    @PutMapping("/read-all")
    @PreAuthorize("hasRole('CITIZEN')")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        Integer accountId = resolveAccountId();
        if (accountId == null) return ResponseEntity.ok(Map.of("message", "OK", "updated", 0));
        List<NotificationEntity> list =
            notificationJpaRepository.findByAccountIdAndIsReadFalseOrderByCreatedAtDesc(accountId);
        list.forEach(n -> n.setIsRead(true));
        notificationJpaRepository.saveAll(list);
        return ResponseEntity.ok(Map.of("message", "OK", "updated", list.size()));
    }
}