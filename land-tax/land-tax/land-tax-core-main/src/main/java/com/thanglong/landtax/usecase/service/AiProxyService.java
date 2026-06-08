package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.usecase.dto.ChatRequestDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Service
@Slf4j
public class AiProxyService {

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;
    private final String aiSecretKey;

    public AiProxyService(
            RestTemplateBuilder restTemplateBuilder,
            @Value("${ai.service-url}") String aiServiceUrl,
            @Value("${ai.secret-key}") String aiSecretKey) {
        this.aiServiceUrl = aiServiceUrl;
        this.aiSecretKey = aiSecretKey;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(30))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }

    /**
     * Forwards a chat request to the AI microservice.
     *
     * @param request the chat request DTO from the frontend
     * @return ResponseEntity containing the AI service's raw JSON response
     */
    public ResponseEntity<String> forwardChatRequest(ChatRequestDTO request) {
        String url = aiServiceUrl + "/api/chat";
        log.info("Forwarding chat request to AI service: {}", url);

        try {
            HttpEntity<ChatRequestDTO> httpEntity = new HttpEntity<>(request, buildHeaders());

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    httpEntity,
                    String.class
            );

            log.info("AI service responded with status: {}", response.getStatusCode());
            return response;

        } catch (ResourceAccessException e) {
            log.error("AI service timeout or connection error: {}", e.getMessage());
            return buildServiceUnavailableResponse();
        } catch (Exception e) {
            log.error("Unexpected error while calling AI service: {}", e.getMessage(), e);
            return buildServiceUnavailableResponse();
        }
    }

    /**
     * Forwards an ingest trigger request to the AI microservice.
     *
     * @return ResponseEntity containing the AI service's raw JSON response
     */
    public ResponseEntity<String> forwardIngestRequest() {
        String url = aiServiceUrl + "/api/ingest";
        log.info("Forwarding ingest request to AI service: {}", url);

        try {
            HttpEntity<Void> httpEntity = new HttpEntity<>(buildHeaders());

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    httpEntity,
                    String.class
            );

            log.info("AI ingest service responded with status: {}", response.getStatusCode());
            return response;

        } catch (ResourceAccessException e) {
            log.error("AI service timeout or connection error during ingest: {}", e.getMessage());
            return buildServiceUnavailableResponse();
        } catch (Exception e) {
            log.error("Unexpected error while calling AI ingest service: {}", e.getMessage(), e);
            return buildServiceUnavailableResponse();
        }
    }

    /**
     * Builds the standard HTTP headers required by the AI microservice.
     */
    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-Key", aiSecretKey);
        return headers;
    }

    /**
     * Builds a standard 503 Service Unavailable response for AI service failures.
     */
    private ResponseEntity<String> buildServiceUnavailableResponse() {
        String errorBody = "{\"error\": \"Hệ thống AI đang bận, vui lòng thử lại sau.\"}";
        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .contentType(MediaType.APPLICATION_JSON)
                .body(errorBody);
    }
}
