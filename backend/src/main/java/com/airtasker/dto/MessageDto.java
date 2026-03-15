package com.airtasker.dto;

import com.airtasker.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageDto {
    private Long id;
    private Long taskId;
    private UserDto sender;
    private UserDto receiver;
    private String content;
    private Boolean read;
    private LocalDateTime createdAt;

    public static MessageDto fromEntity(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .taskId(message.getTask().getId())
                .sender(UserDto.fromEntity(message.getSender()))
                .receiver(UserDto.fromEntity(message.getReceiver()))
                .content(message.getContent())
                .read(message.getRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
