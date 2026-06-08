package com.thanglong.landtax.infrastructure.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * JPA Entity cho bang citizens local trong land_tax_management.
 * Luu y: citizen_id su dung kieu INT tu tang (khac voi VNeID service dung String CCCD).
 * Truong cccd_number lien ket nguoc ve VNeID service.
 * Ngay sinh / dia chi lay truc tiep tu VNeID khi doc profile — khong luu tai day.
 */
@Entity
@Table(name = "citizen_local")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CitizenLocalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "citizen_id")
    private Integer citizenId;

    @Column(name = "cccd_number", unique = true, nullable = false, length = 12)
    private String cccdNumber;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone_number", length = 15)
    private String phoneNumber;
}
