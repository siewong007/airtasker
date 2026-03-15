package com.airtasker.dto;

import com.airtasker.model.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewDto {
    private Long id;
    private Long taskId;
    private UserDto reviewer;
    private UserDto reviewee;
    private Integer rating;
    private String comment;
    private String type;
    private LocalDateTime createdAt;

    public static ReviewDto fromEntity(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .taskId(review.getTask().getId())
                .reviewer(UserDto.fromEntity(review.getReviewer()))
                .reviewee(UserDto.fromEntity(review.getReviewee()))
                .rating(review.getRating())
                .comment(review.getComment())
                .type(review.getType().name())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
