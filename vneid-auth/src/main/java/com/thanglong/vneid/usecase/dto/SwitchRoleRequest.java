package com.thanglong.vneid.usecase.dto;

import jakarta.validation.constraints.NotBlank;

public class SwitchRoleRequest {
    @NotBlank(message = "Vai trò đích không được để trống")
    private String targetRole;

    public SwitchRoleRequest() {}

    public SwitchRoleRequest(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getTargetRole() { return targetRole; }
    public void setTargetRole(String targetRole) { this.targetRole = targetRole; }
}
