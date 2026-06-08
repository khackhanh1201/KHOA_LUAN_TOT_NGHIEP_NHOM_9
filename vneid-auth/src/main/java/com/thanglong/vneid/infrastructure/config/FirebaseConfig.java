package com.thanglong.vneid.infrastructure.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;

/**
 * Cấu hình Firebase Admin SDK.
 */
@Configuration
public class FirebaseConfig {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FirebaseConfig.class);


    @Value("${firebase.config-file}")
    private String firebaseConfigFile;

    @PostConstruct
    public void initFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(
                                new ClassPathResource(firebaseConfigFile).getInputStream()))
                        .build();

                FirebaseApp.initializeApp(options);
                log.info("Firebase initialized successfully");
            }
        } catch (IOException e) {
            log.warn("Firebase config file not found: {}. Firebase features will be disabled.", firebaseConfigFile);
        }
    }
}
