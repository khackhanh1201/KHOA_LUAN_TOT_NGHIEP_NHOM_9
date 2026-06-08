package com.thanglong.landtax;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableFeignClients
@EnableScheduling
@EnableJpaRepositories(basePackages = "com.thanglong.landtax.infrastructure.adapter.persistence.jpa")
public class LandTaxCoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(LandTaxCoreApplication.class, args);
    }
}
