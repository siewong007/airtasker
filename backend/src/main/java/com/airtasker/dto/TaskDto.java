package com.airtasker.dto;

import com.airtasker.model.Task;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TaskDto {
    private Long id;
    private UserDto poster;
    private String title;
    private String description;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private String location;
    private Double latitude;
    private Double longitude;
    private String locationType;
    private CategoryDto category;
    private String status;
    private LocalDate dueDate;
    private Boolean flexible;
    private List<String> images;
    private UserDto assignedTasker;
    private BigDecimal agreedPrice;
    private Integer offerCount;
    private LocalDateTime createdAt;
    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;

    public static TaskDto fromEntity(Task task) {
        return TaskDto.builder()
                .id(task.getId())
                .poster(UserDto.fromEntity(task.getPoster()))
                .title(task.getTitle())
                .description(task.getDescription())
                .budgetMin(task.getBudgetMin())
                .budgetMax(task.getBudgetMax())
                .location(task.getLocation())
                .latitude(task.getLatitude())
                .longitude(task.getLongitude())
                .locationType(task.getLocationType().name())
                .category(task.getCategory() != null ? CategoryDto.fromEntity(task.getCategory()) : null)
                .status(task.getStatus().name())
                .dueDate(task.getDueDate())
                .flexible(task.getFlexible())
                .images(task.getImages())
                .assignedTasker(task.getAssignedTasker() != null ? UserDto.fromEntity(task.getAssignedTasker()) : null)
                .agreedPrice(task.getAgreedPrice())
                .offerCount(task.getOffers() != null ? task.getOffers().size() : 0)
                .createdAt(task.getCreatedAt())
                .assignedAt(task.getAssignedAt())
                .completedAt(task.getCompletedAt())
                .build();
    }
}
