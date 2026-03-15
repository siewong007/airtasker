package com.airtasker.dto;

import com.airtasker.model.Offer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OfferDto {
    private Long id;
    private Long taskId;
    private UserDto tasker;
    private BigDecimal price;
    private String message;
    private Integer estimatedHours;
    private String status;
    private LocalDateTime createdAt;

    public static OfferDto fromEntity(Offer offer) {
        return OfferDto.builder()
                .id(offer.getId())
                .taskId(offer.getTask().getId())
                .tasker(UserDto.fromEntity(offer.getTasker()))
                .price(offer.getPrice())
                .message(offer.getMessage())
                .estimatedHours(offer.getEstimatedHours())
                .status(offer.getStatus().name())
                .createdAt(offer.getCreatedAt())
                .build();
    }
}
