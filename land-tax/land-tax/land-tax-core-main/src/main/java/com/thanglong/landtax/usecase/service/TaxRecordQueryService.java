package com.thanglong.landtax.usecase.service;

import com.thanglong.landtax.infrastructure.adapter.persistence.entity.*;
import com.thanglong.landtax.infrastructure.adapter.persistence.jpa.*;
import com.thanglong.landtax.usecase.dto.TaxRecordSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaxRecordQueryService {

    private final RecordJpaRepository recordJpaRepository;
    private final CitizenLocalJpaRepository citizenLocalJpaRepository;
    private final LandParcelJpaRepository landParcelJpaRepository;
    private final TaxDeclarationRepository taxDeclarationRepository;
    private final TaxPaymentJpaRepository taxPaymentJpaRepository;
    private final LandTypeJpaRepository landTypeJpaRepository;

    @Transactional(readOnly = true)
    public List<TaxRecordSummaryResponse> getTaxRecordsForOfficer(List<String> statuses) {
        List<RecordEntity> records = recordJpaRepository.findTaxRecordsByStatuses(statuses);

        return records.stream().map(record -> {
            CitizenLocalEntity citizen = citizenLocalJpaRepository
                    .findById(record.getCitizenId()).orElse(null);

            LandParcelEntity parcel = landParcelJpaRepository
                    .findById(record.getLandParcelId()).orElse(null);

            TaxDeclarationEntity declaration = taxDeclarationRepository
                    .findByRecordId(record.getRecordId()).orElse(null);

            BigDecimal taxAmount = taxPaymentJpaRepository
                    .findByRecordId(record.getRecordId()).stream()
                    .findFirst()
                    .map(TaxPaymentEntity::getTotalAmountDue)
                    .orElse(null);

            return TaxRecordSummaryResponse.builder()
                    .recordId(record.getRecordId())
                    .citizenId(record.getCitizenId())
                    .landParcelId(record.getLandParcelId())
                    .recordCategory(record.getRecordCategory())
                    .currentStatus(record.getCurrentStatus())
                    .submittedAt(record.getSubmittedAt())
                    .fullName(citizen != null ? citizen.getFullName() : null)
                    .senderCccd(citizen != null ? citizen.getCccdNumber() : null)
                    .phoneNumber(citizen != null ? citizen.getPhoneNumber() : null)
                    .address(parcel != null ? parcel.getAddress() : null)
                    .landParcelNumber(parcel != null ? parcel.getParcelNumber() : null)
                    .mapSheetNumber(parcel != null ? parcel.getMapSheetNumber() : null)
                    .area(declaration != null ? declaration.getDeclaredArea()
                            : (parcel != null ? parcel.getAreaSize() : null))
                    .landType(resolveLandTypeLabel(parcel, declaration))
                    .landAddress(parcel != null ? parcel.getAddress() : null)
                    .declaredArea(declaration != null ? declaration.getDeclaredArea() : null)
                    .declaredUsage(declaration != null ? declaration.getDeclaredUsage() : null)
                    .calculatedTaxAmount(taxAmount)
                    .build();
        }).toList();
    }

    @Transactional
    public void updateTaxRecord(Integer recordId, TaxRecordSummaryResponse updates) {
        RecordEntity record = recordJpaRepository.findById(recordId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ"));

        if (updates.getFullName() != null || updates.getSenderCccd() != null) {
            CitizenLocalEntity citizen = citizenLocalJpaRepository.findById(record.getCitizenId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin công dân"));
            if (updates.getFullName() != null) {
                citizen.setFullName(updates.getFullName());
            }
            if (updates.getSenderCccd() != null) {
                citizen.setCccdNumber(updates.getSenderCccd());
            }
            citizenLocalJpaRepository.save(citizen);
        }

        if (updates.getLandParcelNumber() != null || updates.getMapSheetNumber() != null || 
            updates.getArea() != null || updates.getLandType() != null || updates.getLandAddress() != null) {
            LandParcelEntity parcel = landParcelJpaRepository.findById(record.getLandParcelId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin thửa đất"));
            if (updates.getLandParcelNumber() != null) {
                parcel.setParcelNumber(updates.getLandParcelNumber());
            }
            if (updates.getMapSheetNumber() != null) {
                parcel.setMapSheetNumber(updates.getMapSheetNumber());
            }
            if (updates.getArea() != null) {
                parcel.setAreaSize(updates.getArea());
            }
            if (updates.getLandType() != null) {
                parcel.setUsageType(updates.getLandType());
            }
            if (updates.getLandAddress() != null) {
                parcel.setAddress(updates.getLandAddress());
            }
            landParcelJpaRepository.save(parcel);
        }

        // Cập nhật TaxDeclarationEntity
        TaxDeclarationEntity declaration = taxDeclarationRepository.findByRecordId(recordId).orElse(null);
        if (declaration != null) {
            if (updates.getArea() != null) {
                declaration.setDeclaredArea(updates.getArea());
            }
            if (updates.getLandType() != null) {
                declaration.setDeclaredUsage(updates.getLandType());
            }
            taxDeclarationRepository.save(declaration);
        }

        // Cập nhật TaxPaymentEntity
        if (updates.getCalculatedTaxAmount() != null) {
            List<TaxPaymentEntity> payments = taxPaymentJpaRepository.findByRecordId(recordId);
            if (!payments.isEmpty()) {
                for (TaxPaymentEntity payment : payments) {
                    payment.setTotalAmountDue(updates.getCalculatedTaxAmount());
                    taxPaymentJpaRepository.save(payment);
                }
            } else {
                // Nếu chưa có payment thì tạo mới
                TaxPaymentEntity payment = TaxPaymentEntity.builder()
                        .recordId(recordId)
                        .landParcelId(record.getLandParcelId())
                        .taxYear(java.time.Year.now().getValue())
                        .totalAmountDue(updates.getCalculatedTaxAmount())
                        .dueDate(java.time.LocalDate.now().plusMonths(1))
                        .paymentStatus("UNPAID")
                        .build();
                taxPaymentJpaRepository.save(payment);
            }
        }
    }

    private String resolveLandTypeLabel(LandParcelEntity parcel, TaxDeclarationEntity declaration) {
        if (parcel != null && parcel.getLandTypeId() != null) {
            return landTypeJpaRepository.findById(parcel.getLandTypeId())
                    .map(LandTypeEntity::getTypeName)
                    .filter(name -> name != null && !name.isBlank())
                    .orElse(null);
        }
        if (declaration != null && declaration.getDeclaredUsage() != null && !declaration.getDeclaredUsage().isBlank()) {
            return declaration.getDeclaredUsage();
        }
        return parcel != null ? parcel.getUsageType() : null;
    }
}