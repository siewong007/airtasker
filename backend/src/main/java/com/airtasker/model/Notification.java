package com.airtasker.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private Boolean read = false;

    private Long referenceId; // Can be task_id, offer_id, etc.

    @Enumerated(EnumType.STRING)
    private ReferenceType referenceType;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    public enum NotificationType {
        NEW_OFFER,
        OFFER_ACCEPTED,
        OFFER_REJECTED,
        NEW_MESSAGE,
        TASK_ASSIGNED,
        TASK_COMPLETED,
        NEW_REVIEW,
        PAYMENT_RECEIVED,
        SYSTEM
    }

    public enum ReferenceType {
        TASK, OFFER, MESSAGE, REVIEW, PAYMENT
    }
}
