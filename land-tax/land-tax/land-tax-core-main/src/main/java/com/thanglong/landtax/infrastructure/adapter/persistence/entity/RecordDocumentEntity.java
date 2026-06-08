package com.thanglong.landtax.infrastructure.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * JPA Entity cho bang record_documents.
 * Luu thong tin ve file duoc upload len server.
 */
@Entity
@Table(name = "record_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecordDocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "document_id")
    private Long documentId;

    @Column(name = "record_id")
    private Long recordId;  // cho phép null khi mới upload

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "file_type", length = 100)
    private String fileType;
}
