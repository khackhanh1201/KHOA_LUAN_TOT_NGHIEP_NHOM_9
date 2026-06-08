package com.thanglong.landtax.infrastructure.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "cloudinary")
public class CloudinaryProperties {

    /** cloud-name trong application.yml */
    private String cloudName;

    /** api-key trong application.yml */
    private String apiKey;

    /** api-secret trong application.yml */
    private String apiSecret;
}
