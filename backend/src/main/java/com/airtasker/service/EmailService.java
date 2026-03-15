package com.airtasker.service;

import com.airtasker.model.User;
import com.airtasker.model.VerificationToken;
import com.airtasker.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final VerificationTokenRepository tokenRepository;

    @Transactional
    public String createVerificationToken(User user) {
        // Remove any existing tokens for this user
        tokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        VerificationToken verificationToken = VerificationToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .build();

        tokenRepository.save(verificationToken);
        return token;
    }

    public void sendVerificationEmail(User user, String token) {
        String verificationUrl = "http://localhost:5173/verify-email?token=" + token;

        // Placeholder - in production, integrate with Spring Mail or an email service
        log.info("=== EMAIL VERIFICATION ===");
        log.info("To: {}", user.getEmail());
        log.info("Subject: Verify your TaskMarket account");
        log.info("Body: Hi {}, click this link to verify your email: {}", user.getName(), verificationUrl);
        log.info("==========================");
    }

    @Transactional
    public boolean verifyToken(String token) {
        return tokenRepository.findByToken(token)
                .filter(vt -> !vt.isExpired())
                .map(vt -> {
                    User user = vt.getUser();
                    user.setEmailVerified(true);
                    tokenRepository.delete(vt);
                    return true;
                })
                .orElse(false);
    }
}
