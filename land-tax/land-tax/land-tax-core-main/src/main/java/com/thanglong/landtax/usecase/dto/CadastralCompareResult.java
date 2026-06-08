package com.thanglong.landtax.usecase.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Kết quả đối chiếu tờ khai với sổ địa chính (khớp logic FE cadastralCompare.js).
 */
@Getter
@Builder
public class CadastralCompareResult {

    private final boolean hasMismatch;
    private final Map<String, Boolean> mismatches;
    private final List<String> mismatchMessages;
    private final String summaryMessage;

    public static CadastralCompareResult ok() {
        return CadastralCompareResult.builder()
                .hasMismatch(false)
                .mismatches(Map.of())
                .mismatchMessages(List.of())
                .summaryMessage("")
                .build();
    }

    public static CadastralCompareResult withMismatches(LinkedHashMap<String, Boolean> mismatches,
                                                        List<String> messages) {
        return CadastralCompareResult.builder()
                .hasMismatch(!mismatches.isEmpty())
                .mismatches(mismatches)
                .mismatchMessages(messages)
                .summaryMessage(String.join("; ", messages))
                .build();
    }
}
