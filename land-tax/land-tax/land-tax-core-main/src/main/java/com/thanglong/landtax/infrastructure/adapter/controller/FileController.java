package com.thanglong.landtax.infrastructure.adapter.controller;

import com.thanglong.landtax.infrastructure.adapter.external.CloudinaryAdapter;
import com.thanglong.landtax.infrastructure.adapter.external.CloudinaryAdapter.UploadResult;
import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordDocumentEntity;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.RecordDocumentJpaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * File Controller — upload tai lieu dinh kem ho so (Cloudinary + metadata DB).
 *
 * <ul>
 *   <li>POST /api/files/upload     — Upload len Cloudinary, ghi record_documents</li>
 *   <li>GET  /api/files/{filename} — Legacy: file cu luu tren o cung local</li>
 *   <li>GET  /api/files/my-files   — Danh sach metadata file</li>
 *   <li>DELETE /api/files/delete/{id} — Xoa Cloudinary + ban ghi DB</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("null")
public class FileController {

    private final RecordDocumentJpaRepository recordDocumentJpaRepository;
    private final CloudinaryAdapter cloudinaryAdapter;

    /** Legacy: file cu upload truoc khi chuyen Cloudinary */
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    private static final long MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024L;
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "relatedEntityType", required = false) String relatedEntityType,
            @RequestParam(value = "relatedEntityId", required = false) Long relatedEntityId) {

        String uploaderCccd = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("POST /api/files/upload - uploader={}, originalName={}, size={}",
                uploaderCccd, file.getOriginalFilename(), file.getSize());

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File khong duoc de trong"));
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", String.format("File vuot qua kich thuoc toi da %d MB",
                            MAX_FILE_SIZE_BYTES / 1024 / 1024)
            ));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Dinh dang file khong duoc ho tro. Chi chap nhan: anh, PDF, Word, Excel"
            ));
        }

        String originalFilename = file.getOriginalFilename() != null
                ? file.getOriginalFilename() : "unknown";

        UploadResult uploadResult;
        try {
            uploadResult = cloudinaryAdapter.uploadFile(file);
        } catch (RuntimeException e) {
            log.error("Cloudinary upload error: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Khong the upload file len Cloudinary: " + e.getMessage()
            ));
        }

        String fileUrl = uploadResult.secureUrl();

        RecordDocumentEntity document = RecordDocumentEntity.builder()
                .recordId(
                        "RECORD".equalsIgnoreCase(relatedEntityType) && relatedEntityId != null
                                ? relatedEntityId
                                : null
                )
                .fileName(originalFilename)
                .fileUrl(fileUrl)
                .fileType(safeFileType(contentType))
                .build();

        try {
            RecordDocumentEntity saved = recordDocumentJpaRepository.save(document);
            log.info("record_document id={}, cloudinaryUrl={}", saved.getDocumentId(), fileUrl);

            return ResponseEntity.ok(Map.of(
                    "documentId", saved.getDocumentId(),
                    "originalFilename", originalFilename,
                    "fileName", saved.getFileName(),
                    "file_url", fileUrl,
                    "fileUrl", fileUrl,
                    "publicId", uploadResult.publicId() != null ? uploadResult.publicId() : "",
                    "contentType", contentType,
                    "fileSize", file.getSize(),
                    "uploadedAt", LocalDateTime.now().toString(),
                    "message", "Upload file len Cloudinary thanh cong"
            ));
        } catch (Exception e) {
            cloudinaryAdapter.deleteFile(fileUrl, uploadResult.resourceType());
            log.error("Loi luu record_documents, da rollback Cloudinary: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Khong the luu thong tin file: " + e.getMessage()
            ));
        }
    }

    /**
     * Legacy — chi phuc vu file cu luu tren o cung (URL localhost:8080/api/files/...).
     * File moi dung truc tiep URL Cloudinary trong record_documents.file_url.
     */
    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String filename) {
        log.info("GET /api/files/{} (legacy local)", filename);

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Path filePath = uploadPath.resolve(filename).normalize();

            if (!filePath.startsWith(uploadPath)) {
                return ResponseEntity.badRequest().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String detectedContentType = Files.probeContentType(filePath);
            if (detectedContentType == null) {
                detectedContentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(detectedContentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + (resource.getFilename() != null ? resource.getFilename() : "file") + "\"")
                    .body(resource);

        } catch (MalformedURLException e) {
            log.error("URL khong hop le: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            log.error("Loi doc file: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/my-files")
    public ResponseEntity<?> getMyFiles() {
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("GET /api/files/my-files - cccd={}", cccd);

        List<RecordDocumentEntity> myFiles = recordDocumentJpaRepository.findAll();
        return ResponseEntity.ok(Map.of("data", myFiles, "total", myFiles.size()));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteFile(@PathVariable Long id) {
        String cccd = SecurityContextHolder.getContext().getAuthentication().getName();
        log.info("DELETE /api/files/delete/{} - requester={}", id, cccd);

        return recordDocumentJpaRepository.findById(id)
                .<ResponseEntity<?>>map(document -> {
                    deletePhysicalFile(document);

                    recordDocumentJpaRepository.deleteById(id);
                    log.info("Da xoa ban ghi record_document id={}", id);

                    return ResponseEntity.ok(Map.of(
                            "deletedId", id,
                            "message", "Xoa file thanh cong"
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void deletePhysicalFile(RecordDocumentEntity document) {
        String fileUrl = document.getFileUrl();
        if (fileUrl != null && fileUrl.contains("cloudinary.com")) {
            cloudinaryAdapter.deleteFile(fileUrl);
            return;
        }
        if (fileUrl != null && fileUrl.contains("/api/files/")) {
            try {
                String filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
                Path filePath = Paths.get(uploadDir).toAbsolutePath().resolve(filename).normalize();
                Files.deleteIfExists(filePath);
                log.info("Da xoa file local legacy: {}", filePath);
            } catch (IOException e) {
                log.warn("Khong the xoa file local legacy: {}", e.getMessage());
            }
            return;
        }
        try {
            URI uri = URI.create(fileUrl != null ? fileUrl : "");
            if ("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme())) {
                return;
            }
        } catch (Exception ignored) {
            // fall through
        }
    }

    /**
     * Rut gon content-type cho vua cot file_type varchar(50) trong DB.
     */
    private static String safeFileType(String contentType) {
        if (contentType == null) return null;
        // MIME type cua docx/xlsx dai > 50 ky tu, rut gon
        if (contentType.contains("wordprocessingml")) return "application/docx";
        if (contentType.contains("spreadsheetml")) return "application/xlsx";
        if (contentType.length() > 50) return contentType.substring(0, 50);
        return contentType;
    }
}
