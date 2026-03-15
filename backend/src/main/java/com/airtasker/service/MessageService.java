package com.airtasker.service;

import com.airtasker.dto.MessageCreateRequest;
import com.airtasker.dto.MessageDto;
import com.airtasker.exception.ForbiddenException;
import com.airtasker.exception.ResourceNotFoundException;
import com.airtasker.model.Message;
import com.airtasker.model.Task;
import com.airtasker.model.User;
import com.airtasker.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<MessageDto> getMessagesByTaskId(Long taskId, String userEmail) {
        Task task = taskService.findById(taskId);
        User user = userService.findByEmail(userEmail);

        // Check if user is poster or assigned tasker
        if (!task.getPoster().getId().equals(user.getId()) &&
                (task.getAssignedTasker() == null || !task.getAssignedTasker().getId().equals(user.getId()))) {
            // Also check if user has made an offer on this task
            boolean hasOffer = task.getOffers().stream()
                    .anyMatch(offer -> offer.getTasker().getId().equals(user.getId()));
            if (!hasOffer) {
                throw new ForbiddenException("You don't have access to messages for this task");
            }
        }

        // Mark messages as read
        messageRepository.markAsReadByTaskAndReceiver(taskId, user.getId());

        return messageRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(MessageDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public MessageDto createMessage(Long taskId, MessageCreateRequest request, String userEmail) {
        Task task = taskService.findById(taskId);
        User sender = userService.findByEmail(userEmail);
        User receiver = userService.findById(request.getReceiverId());

        // Validate sender is part of the task
        boolean isSenderPoster = task.getPoster().getId().equals(sender.getId());
        boolean isSenderTasker = task.getAssignedTasker() != null &&
                task.getAssignedTasker().getId().equals(sender.getId());
        boolean hasSenderOffer = task.getOffers().stream()
                .anyMatch(offer -> offer.getTasker().getId().equals(sender.getId()));

        if (!isSenderPoster && !isSenderTasker && !hasSenderOffer) {
            throw new ForbiddenException("You cannot send messages for this task");
        }

        // Validate receiver is part of the task
        boolean isReceiverPoster = task.getPoster().getId().equals(receiver.getId());
        boolean isReceiverTasker = task.getAssignedTasker() != null &&
                task.getAssignedTasker().getId().equals(receiver.getId());
        boolean hasReceiverOffer = task.getOffers().stream()
                .anyMatch(offer -> offer.getTasker().getId().equals(receiver.getId()));

        if (!isReceiverPoster && !isReceiverTasker && !hasReceiverOffer) {
            throw new ForbiddenException("Cannot send message to this user for this task");
        }

        Message message = Message.builder()
                .task(task)
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .read(false)
                .build();

        message = messageRepository.save(message);

        MessageDto messageDto = MessageDto.fromEntity(message);

        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSendToUser(
                receiver.getEmail(),
                "/queue/messages",
                messageDto
        );

        notificationService.notifyNewMessage(message);

        return messageDto;
    }

    @Transactional
    public void markAsRead(Long taskId, String userEmail) {
        User user = userService.findByEmail(userEmail);
        messageRepository.markAsReadByTaskAndReceiver(taskId, user.getId());
    }

    public Long getUnreadCount(String userEmail) {
        User user = userService.findByEmail(userEmail);
        return messageRepository.countUnreadByUserId(user.getId());
    }

    public List<Long> getTaskIdsWithMessages(String userEmail) {
        User user = userService.findByEmail(userEmail);
        return messageRepository.findTaskIdsWithMessages(user.getId());
    }

    public Message findById(Long id) {
        return messageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Message", id));
    }
}
