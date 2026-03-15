package com.airtasker.dto;

import com.airtasker.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDto {
    private Long id;
    private String type;
    private String title;
    private String message;
    private Boolean read;
    private Long referenceId;
    private String referenceType;
    private LocalDateTime createdAt;

    public static NotificationDto fromEntity(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .type(notification.getType().name())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.getRead())
                .referenceId(notification.getReferenceId())
                .referenceType(notification.getReferenceType() != null ? notification.getReferenceType().name() : null)
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
