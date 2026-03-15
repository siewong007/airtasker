package com.airtasker.dto;

import com.airtasker.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {

    private Long id;
    private String email;
    private String name;
    private String bio;
    private String avatarUrl;
    private String location;
    private String phone;
    private List<String> skills;
    private String role;
    private Double rating;
    private Integer reviewCount;
    private Integer completedTasks;
    private Boolean emailVerified;
    private Boolean active;
    private LocalDateTime createdAt;

    public static UserDto fromEntity(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .location(user.getLocation())
                .phone(user.getPhone())
                .skills(user.getSkills())
                .role(user.getRole().name())
                .rating(user.getRating())
                .reviewCount(user.getReviewCount())
                .completedTasks(user.getCompletedTasks())
                .emailVerified(user.getEmailVerified())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
