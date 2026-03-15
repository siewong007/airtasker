package com.airtasker.controller;

import com.airtasker.dto.OfferDto;
import com.airtasker.service.OfferService;
import com.airtasker.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
@Tag(name = "Offers", description = "Offer management endpoints")
public class OfferController {

    private final OfferService offerService;
    private final UserService userService;

    @GetMapping("/{id}")
    @Operation(summary = "Get offer by ID")
    public ResponseEntity<OfferDto> getOfferById(@PathVariable Long id) {
        return ResponseEntity.ok(offerService.getOfferById(id));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's offers")
    public ResponseEntity<Page<OfferDto>> getMyOffers(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        Long userId = userService.findByEmail(userDetails.getUsername()).getId();
        return ResponseEntity.ok(offerService.getOffersByTaskerId(userId, pageable));
    }

    @PostMapping("/{id}/accept")
    @Operation(summary = "Accept an offer")
    public ResponseEntity<OfferDto> acceptOffer(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(offerService.acceptOffer(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "Reject an offer")
    public ResponseEntity<OfferDto> rejectOffer(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(offerService.rejectOffer(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/withdraw")
    @Operation(summary = "Withdraw an offer")
    public ResponseEntity<OfferDto> withdrawOffer(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(offerService.withdrawOffer(id, userDetails.getUsername()));
    }
}
