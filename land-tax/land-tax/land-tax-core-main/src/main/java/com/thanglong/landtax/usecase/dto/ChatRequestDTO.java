package com.thanglong.landtax.usecase.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRequestDTO {

    private String question;

    @JsonProperty("session_id")
    private String sessionId;
}
