package com.airtasker.service;

import com.airtasker.dto.NotificationDto;
import com.airtasker.model.*;
import com.airtasker.model.Notification.NotificationType;
import com.airtasker.model.Notification.ReferenceType;
import com.airtasker.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Page<NotificationDto> getNotificationsByUser(String userEmail, Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationDto::fromEntity);
    }

    public List<NotificationDto> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void notifyNewOffer(Offer offer) {
        Notification notification = Notification.builder()
                .user(offer.getTask().getPoster())
                .type(NotificationType.NEW_OFFER)
                .title("New Offer")
                .message(offer.getTasker().getName() + " made an offer of $" + offer.getPrice() + " on your task")
                .referenceId(offer.getTask().getId())
                .referenceType(ReferenceType.TASK)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        sendRealTimeNotification(offer.getTask().getPoster().getEmail(), notification);
    }

    @Transactional
    public void notifyOfferAccepted(Offer offer) {
        Notification notification = Notification.builder()
                .user(offer.getTasker())
                .type(NotificationType.OFFER_ACCEPTED)
                .title("Offer Accepted")
                .message("Your offer on \"" + offer.getTask().getTitle() + "\" has been accepted!")
                .referenceId(offer.getTask().getId())
                .referenceType(ReferenceType.TASK)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        sendRealTimeNotification(offer.getTasker().getEmail(), notification);
    }

    @Transactional
    public void notifyOfferRejected(Offer offer) {
        Notification notification = Notification.builder()
                .user(offer.getTasker())
                .type(NotificationType.OFFER_REJECTED)
                .title("Offer Not Accepted")
                .message("Your offer on \"" + offer.getTask().getTitle() + "\" was not accepted")
                .referenceId(offer.getTask().getId())
                .referenceType(ReferenceType.TASK)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        sendRealTimeNotification(offer.getTasker().getEmail(), notification);
    }

    @Transactional
    public void notifyTaskAssigned(Task task) {
        Notification notification = Notification.builder()
                .user(task.getAssignedTasker())
                .type(NotificationType.TASK_ASSIGNED)
                .title("Task Assigned")
                .message("You've been assigned to \"" + task.getTitle() + "\"")
                .referenceId(task.getId())
                .referenceType(ReferenceType.TASK)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        sendRealTimeNotification(task.getAssignedTasker().getEmail(), notification);
    }

    @Transactional
    public void notifyTaskCompleted(Task task) {
        // Notify tasker
        Notification taskerNotification = Notification.builder()
                .user(task.getAssignedTasker())
                .type(NotificationType.TASK_COMPLETED)
                .title("Task Completed")
                .message("\"" + task.getTitle() + "\" has been marked as complete")
                .referenceId(task.getId())
                .referenceType(ReferenceType.TASK)
                .read(false)
                .build();

        taskerNotification = notificationRepository.save(taskerNotification);
        sendRealTimeNotification(task.getAssignedTasker().getEmail(), taskerNotification);
    }

    @Transactional
    public void notifyNewMessage(Message message) {
        Notification notification = Notification.builder()
                .user(message.getReceiver())
                .type(NotificationType.NEW_MESSAGE)
                .title("New Message")
                .message(message.getSender().getName() + " sent you a message")
                .referenceId(message.getTask().getId())
                .referenceType(ReferenceType.TASK)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        sendRealTimeNotification(message.getReceiver().getEmail(), notification);
    }

    @Transactional
    public void notifyNewReview(Review review) {
        Notification notification = Notification.builder()
                .user(review.getReviewee())
                .type(NotificationType.NEW_REVIEW)
                .title("New Review")
                .message(review.getReviewer().getName() + " left you a " + review.getRating() + "-star review")
                .referenceId(review.getId())
                .referenceType(ReferenceType.REVIEW)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        sendRealTimeNotification(review.getReviewee().getEmail(), notification);
    }

    @Transactional
    public void notifyPaymentReceived(Payment payment) {
        Notification notification = Notification.builder()
                .user(payment.getPayee())
                .type(NotificationType.PAYMENT_RECEIVED)
                .title("Payment Received")
                .message("You've received $" + payment.getNetAmount() + " for completing a task")
                .referenceId(payment.getId())
                .referenceType(ReferenceType.PAYMENT)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        sendRealTimeNotification(payment.getPayee().getEmail(), notification);
    }

    private void sendRealTimeNotification(String userEmail, Notification notification) {
        messagingTemplate.convertAndSendToUser(
                userEmail,
                "/queue/notifications",
                NotificationDto.fromEntity(notification)
        );
    }
}
