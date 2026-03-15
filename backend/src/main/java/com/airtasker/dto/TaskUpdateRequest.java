package com.airtasker.dto;

import com.airtasker.model.Task.LocationType;
import com.airtasker.model.Task.TaskStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class TaskUpdateRequest {
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @Size(min = 20, max = 5000, message = "Description must be between 20 and 5000 characters")
    private String description;

    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private String location;
    private Double latitude;
    private Double longitude;
    private LocationType locationType;
    private Long categoryId;
    private LocalDate dueDate;
    private Boolean flexible;
    private List<String> images;
    private TaskStatus status;
}
