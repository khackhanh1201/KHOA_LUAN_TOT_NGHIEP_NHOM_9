package com.thanglong.landtax.infrastructure.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

@Configuration
@EnableConfigurationProperties(CloudinaryProperties.class)
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary(CloudinaryProperties props) {
        if (!StringUtils.hasText(props.getCloudName())
                || !StringUtils.hasText(props.getApiKey())
                || !StringUtils.hasText(props.getApiSecret())) {
            throw new IllegalStateException(
                    "Thieu cau hinh Cloudinary: cloudinary.cloud-name, api-key, api-secret");
        }
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", props.getCloudName(),
                "api_key", props.getApiKey(),
                "api_secret", props.getApiSecret(),
                "secure", true
        ));
    }
}
