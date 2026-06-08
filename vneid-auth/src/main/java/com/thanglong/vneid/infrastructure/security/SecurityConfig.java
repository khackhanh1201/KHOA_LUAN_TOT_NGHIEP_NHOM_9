package com.thanglong.vneid.infrastructure.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Cấu hình Spring Security cho VNeID Auth Service.
 *
 * <p>Kiến trúc xác thực:</p>
 * <ul>
 *   <li>Stateless JWT - không dùng Session</li>
 *   <li>CSRF disabled (REST API, không dùng cookie auth)</li>
 *   <li>Public endpoints: /api/auth/**, /swagger-ui/**, v.v.</li>
 *   <li>Protected endpoints: yêu cầu Bearer JWT hợp lệ</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * Danh sách endpoint công khai - không yêu cầu xác thực.
     */
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/**",
            "/api/vneid/activate/**",
            "/api/qr/**",
            "/api/vneid/internal/**",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/actuator/**",
            "/error"          // Cho phép Spring Boot forward tới /error khi có exception
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Tắt CSRF hoàn toàn - REST API dùng JWT, không cần CSRF token
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Cấu hình CORS từ bean corsConfigurationSource()
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 3. Stateless session - không lưu SecurityContext vào Session
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Tắt form login và HTTP Basic - chỉ dùng JWT
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)

                // 5. Phân quyền endpoint
                .authorizeHttpRequests(auth -> auth
                        // Cho phép toàn bộ OPTIONS preflight request (CORS)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Các endpoint công khai
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        // Tất cả endpoint còn lại yêu cầu xác thực JWT
                        .anyRequest().authenticated()
                )

                // 6. Thêm JWT filter trước UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // allowedOriginPatterns("*") tương thích với allowCredentials(true)
        // trong khi allowedOrigins("*") sẽ bị Spring từ chối khi có credentials
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"
        ));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
