package com.airtasker.dto;

import com.airtasker.model.Payment;
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
public class PaymentDto {
    private Long id;
    private Long taskId;
    private UserDto payer;
    private UserDto payee;
    private BigDecimal amount;
    private BigDecimal platformFee;
    private BigDecimal netAmount;
    private String status;
    private String transactionId;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public static PaymentDto fromEntity(Payment payment) {
        return PaymentDto.builder()
                .id(payment.getId())
                .taskId(payment.getTask().getId())
                .payer(UserDto.fromEntity(payment.getPayer()))
                .payee(UserDto.fromEntity(payment.getPayee()))
                .amount(payment.getAmount())
                .platformFee(payment.getPlatformFee())
                .netAmount(payment.getNetAmount())
                .status(payment.getStatus().name())
                .transactionId(payment.getTransactionId())
                .description(payment.getDescription())
                .createdAt(payment.getCreatedAt())
                .completedAt(payment.getCompletedAt())
                .build();
    }
}
