package com.airtasker.controller;

import com.airtasker.dto.PaymentDto;
import com.airtasker.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment management endpoints")
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/history")
    @Operation(summary = "Get payment history for current user")
    public ResponseEntity<Page<PaymentDto>> getPaymentHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(paymentService.getPaymentHistory(userDetails.getUsername(), pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<PaymentDto> getPaymentById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentService.getPaymentById(id, userDetails.getUsername()));
    }

    @PostMapping("/create-intent")
    @Operation(summary = "Create a payment intent for a task")
    public ResponseEntity<PaymentDto> createPaymentIntent(
            @RequestParam Long taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(paymentService.createPaymentIntent(taskId, userDetails.getUsername()));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Complete/release a payment")
    public ResponseEntity<PaymentDto> completePayment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentService.completePayment(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Refund a payment")
    public ResponseEntity<PaymentDto> refundPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentService.refundPayment(id, userDetails.getUsername()));
    }

    @GetMapping("/earnings")
    @Operation(summary = "Get total earnings for current user")
    public ResponseEntity<Map<String, BigDecimal>> getTotalEarnings(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(Map.of("total", paymentService.getTotalEarnings(userDetails.getUsername())));
    }

    @GetMapping("/spending")
    @Operation(summary = "Get total spending for current user")
    public ResponseEntity<Map<String, BigDecimal>> getTotalSpending(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(Map.of("total", paymentService.getTotalSpending(userDetails.getUsername())));
    }
}
