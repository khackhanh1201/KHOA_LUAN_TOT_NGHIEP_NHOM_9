package com.thanglong.landtax.infrastructure.adapter.external;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Upload / xoa file tren Cloudinary (khong luu tren o cung server).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryAdapter {

    private static final String UPLOAD_FOLDER = "land-tax/record-documents";

    private final Cloudinary cloudinary;

    public record UploadResult(String secureUrl, String publicId, String resourceType) {}

    /**
     * Upload file len Cloudinary.
     */
    @SuppressWarnings("unchecked")
    public UploadResult uploadFile(MultipartFile file) {
        try {
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", UPLOAD_FOLDER,
                            "resource_type", "auto",
                            "use_filename", true,
                            "unique_filename", true
                    )
            );
            String url = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            String resourceType = (String) uploadResult.get("resource_type");
            log.info("Cloudinary upload OK: publicId={}, url={}", publicId, url);
            return new UploadResult(url, publicId, resourceType);
        } catch (IOException e) {
            log.error("Cloudinary upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Upload file len Cloudinary that bai: " + e.getMessage(), e);
        }
    }

    /**
     * Xoa file tren Cloudinary theo public_id hoac URL da luu trong DB.
     */
    public void deleteFile(String fileUrlOrPublicId) {
        deleteFile(fileUrlOrPublicId, "raw");
    }

    public void deleteFile(String fileUrlOrPublicId, String resourceType) {
        if (fileUrlOrPublicId == null || fileUrlOrPublicId.isBlank()) {
            return;
        }
        String publicId = fileUrlOrPublicId.contains("cloudinary.com")
                ? extractPublicIdFromUrl(fileUrlOrPublicId)
                : fileUrlOrPublicId;
        if (publicId == null || publicId.isBlank()) {
            log.warn("Khong trich xuat duoc public_id tu: {}", fileUrlOrPublicId);
            return;
        }
        // Cloudinary destroy() không hỗ trợ resource_type "auto".
        // Phải chỉ định cụ thể: "image", "raw", hoặc "video".
        String safeType = (resourceType != null && !"auto".equals(resourceType))
                ? resourceType : "raw";
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", safeType));
            log.info("Cloudinary deleted publicId={}, resourceType={}", publicId, safeType);
        } catch (IOException e) {
            log.warn("Cloudinary delete failed publicId={}: {}", publicId, e.getMessage());
        }
    }

    static String extractPublicIdFromUrl(String secureUrl) {
        if (secureUrl == null || !secureUrl.contains("/upload/")) {
            return null;
        }
        String rest = secureUrl.substring(secureUrl.indexOf("/upload/") + "/upload/".length());
        if (rest.matches("^v\\d+/.*")) {
            rest = rest.replaceFirst("^v\\d+/", "");
        }
        int queryIdx = rest.indexOf('?');
        if (queryIdx >= 0) {
            rest = rest.substring(0, queryIdx);
        }
        int dot = rest.lastIndexOf('.');
        int slash = rest.lastIndexOf('/');
        if (dot > slash) {
            rest = rest.substring(0, dot);
        }
        return rest.isBlank() ? null : rest;
    }
}
