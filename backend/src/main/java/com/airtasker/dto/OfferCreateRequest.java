package com.airtasker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OfferCreateRequest {
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @Size(max = 1000, message = "Message must be less than 1000 characters")
    private String message;

    @Positive(message = "Estimated hours must be positive")
    private Integer estimatedHours;
}
