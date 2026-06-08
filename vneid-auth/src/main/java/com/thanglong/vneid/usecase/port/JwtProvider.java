package com.thanglong.vneid.usecase.port;

/**
 * Interface cổng giao tiếp cho dịch vụ JWT.
 * Triển khai cụ thể nằm ở infrastructure layer.
 */
public interface JwtProvider {

    /**
     * Sinh JWT token với số CCCD làm Subject, kèm các claim bổ sung.
     *
     * @param cccdNumber Số Căn cước công dân (12 số) - dùng làm Subject
     * @param email      Email công dân
     * @param activeRole Vai trò đang hoạt động (ví dụ: ROLE_ADMIN)
     * @param roles      Danh sách tất cả vai trò của người dùng
     * @return JWT token string
     */
    String generateToken(String cccdNumber, String email, String activeRole, java.util.List<String> roles);

    String extractCccd(String token);

    String extractEmail(String token);

    String extractRole(String token); // Extract activeRole

    java.util.List<String> extractRoles(String token); // Extract all roles

    boolean validateToken(String token);
}
