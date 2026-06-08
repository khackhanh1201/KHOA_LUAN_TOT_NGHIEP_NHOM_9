package com.thanglong.vneid.infrastructure.config;

import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Database connection cho VNeID Auth Service.
 * Spring Boot sẽ tự động cấu hình từ application.yml.
 * Thêm các cấu hình tùy chỉnh nếu cần (connection pool, multiple datasource, v.v.)
 */
@Configuration
public class DatabaseConfig {

    // Spring Boot auto-configures DataSource from application.yml
    // Add custom configuration here if needed (e.g., connection pooling, multiple datasources)
}
