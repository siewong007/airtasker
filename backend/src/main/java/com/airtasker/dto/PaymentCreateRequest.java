package com.airtasker.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentCreateRequest {
    @NotNull(message = "Task ID is required")
    private Long taskId;
}
