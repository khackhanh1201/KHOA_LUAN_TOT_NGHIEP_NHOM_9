package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.usecase.dto.ChatRequestDTO;
import com.thanglong.landtax.usecase.service.AiProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class ChatbotController {

    private final AiProxyService aiProxyService;

    /**
     * Receives a chat question from the Frontend and forwards it to the AI microservice.
     *
     * @param request the chat request containing the question and session ID
     * @return the AI service's response, passed through as-is
     */
    @PostMapping("/chat")
    @PreAuthorize("hasAnyRole('CITIZEN', 'TAX_OFFICER', 'LAND_OFFICER')")
    public ResponseEntity<String> chat(@RequestBody ChatRequestDTO request) {
        log.info("POST /api/v1/chat - question='{}', session_id='{}'",
                request.getQuestion(), request.getSessionId());
        return aiProxyService.forwardChatRequest(request);
    }

    /**
     * Triggers the AI microservice's data ingestion pipeline.
     *
     * @return the AI service's response, passed through as-is
     */
    @PostMapping("/ai/ingest")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> ingest() {
        log.info("POST /api/v1/ai/ingest - triggering data ingestion");
        return aiProxyService.forwardIngestRequest();
    }
}
