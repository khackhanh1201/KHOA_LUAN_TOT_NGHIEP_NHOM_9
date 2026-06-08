package com.thanglong.landtax.infrastructure.adapter.persistence.jpa;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.RecordDocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface RecordDocumentJpaRepository extends JpaRepository<RecordDocumentEntity, Long> {
    List<RecordDocumentEntity> findByRecordId(Long recordId);

    List<RecordDocumentEntity> findByFileNameStartingWith(String prefix);
}
