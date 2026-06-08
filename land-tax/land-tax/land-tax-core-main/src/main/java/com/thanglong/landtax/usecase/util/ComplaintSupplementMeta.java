package com.thanglong.landtax.usecase.util;

import java.util.regex.Pattern;

/**
 * Metadata trong {@code response_note} khi trạng thái NEED_SUPPLEMENT — biết cán bộ thuế hay địa chính yêu cầu.
 */
public final class ComplaintSupplementMeta {

    public static final String ROLE_TAX = "TAX_OFFICER";
    public static final String ROLE_LAND = "LAND_OFFICER";

    private static final Pattern TAG_PREFIX = Pattern.compile(
            "^\\[\\[SUPPLEMENT_BY:(TAX_OFFICER|LAND_OFFICER)\\]\\]\\s*\\n?",
            Pattern.MULTILINE
    );

    private ComplaintSupplementMeta() {
    }

    public static String prefixRole(String role, String note) {
        String body = note != null ? note.trim() : "";
        return "[[SUPPLEMENT_BY:" + role + "]]\n" + body;
    }

    public static Parsed parse(String responseNote) {
        if (responseNote == null || responseNote.isBlank()) {
            return new Parsed(null, null);
        }
        var matcher = TAG_PREFIX.matcher(responseNote);
        if (matcher.find()) {
            String role = matcher.group(1);
            String note = TAG_PREFIX.matcher(responseNote).replaceFirst("").trim();
            return new Parsed(role, note.isEmpty() ? null : note);
        }
        return new Parsed(null, responseNote.trim());
    }

    public record Parsed(String role, String note) {
    }
}
