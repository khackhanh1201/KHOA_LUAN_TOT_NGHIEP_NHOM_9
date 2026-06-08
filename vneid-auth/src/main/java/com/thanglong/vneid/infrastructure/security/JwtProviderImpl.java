package com.thanglong.vneid.infrastructure.security;

import com.thanglong.vneid.usecase.port.JwtProvider;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Triển khai JWT Provider sử dụng thư viện jjwt.
 *
 * <p><b>Cấu trúc JWT Token:</b></p>
 * <ul>
 *   <li><b>Subject (sub)</b>: Số CCCD 12 số (cccd_number) - định danh chính</li>
 *   <li><b>Claim "cccd"</b>: Số CCCD (duplicate để dễ trích xuất bằng claim name)</li>
 *   <li><b>Claim "email"</b>: Email công dân</li>
 *   <li><b>Claim "role"</b>: Vai trò (ROLE_CITIZEN, ROLE_ADMIN)</li>
 * </ul>
 *
 * <p>Secret key được chia sẻ giữa vneid-auth-service và land-tax-core-service
 * thông qua cấu hình <code>jwt.secret</code> trong application.yml.</p>
 */
@Component
public class JwtProviderImpl implements JwtProvider {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(JwtProviderImpl.class);


    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    private SecretKey secretKey;

    @PostConstruct
    public void init() {
        this.secretKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        log.info("JWT Provider initialized - token expiration: {}ms", jwtExpiration);
    }

    /**
     * Sinh JWT token.
     *
     * @param cccdNumber Số Căn cước công dân 12 số → đặt vào Subject + claim "cccd"
     * @param email      Email công dân → claim "email"
     * @param activeRole Vai trò đang hoạt động → claim "role"
     * @param roles      Danh sách vai trò → claim "roles"
     * @return Chuỗi JWT token đã ký
     */
    @Override
    public String generateToken(String cccdNumber, String email, String activeRole, java.util.List<String> roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        String token = Jwts.builder()
                .subject(cccdNumber)                // Subject = Số CCCD
                .claim("cccd", cccdNumber)          // Custom claim "cccd"
                .claim("email", email)
                .claim("role", activeRole)          // Claim name "role" giữ nguyên để tương thích (activeRole)
                .claim("roles", roles)              // Claim mới "roles" chứa danh sách
                .issuer("vneid-auth-service")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();

        log.info("JWT token generated for CCCD: {}, email: {}, activeRole: {}, roles: {}", cccdNumber, email, activeRole, roles);
        return token;
    }

    /**
     * Trích xuất số CCCD từ token (lấy từ Subject).
     */
    @Override
    public String extractCccd(String token) {
        return getClaims(token).getSubject();
    }

    /**
     * Trích xuất email từ token.
     */
    @Override
    public String extractEmail(String token) {
        return getClaims(token).get("email", String.class);
    }

    /**
     * Trích xuất activeRole từ token.
     */
    @Override
    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    /**
     * Trích xuất danh sách roles từ token.
     */
    @Override
    @SuppressWarnings("unchecked")
    public java.util.List<String> extractRoles(String token) {
        return getClaims(token).get("roles", java.util.List.class);
    }

    /**
     * Xác thực tính hợp lệ của token (chữ ký + thời hạn).
     */
    @Override
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            log.error("JWT token expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.error("Malformed JWT token: {}", e.getMessage());
        } catch (SecurityException e) {
            log.error("Invalid JWT signature: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Parse và verify token, trả về Claims.
     */
    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
