package com.thanglong.landtax.usecase.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private Integer citizenId;
    private String cccdNumber;
    private String fullName;
    private String email;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String address;
    private List<String> roles;
    private String activeRole;
}
