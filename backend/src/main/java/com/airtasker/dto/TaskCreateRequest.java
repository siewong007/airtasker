package com.airtasker.dto;

import com.airtasker.model.Task.LocationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class TaskCreateRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 5000, message = "Description must be between 20 and 5000 characters")
    private String description;

    @Positive(message = "Minimum budget must be positive")
    private BigDecimal budgetMin;

    @NotNull(message = "Maximum budget is required")
    @Positive(message = "Maximum budget must be positive")
    private BigDecimal budgetMax;

    private String location;
    private Double latitude;
    private Double longitude;
    private LocationType locationType = LocationType.IN_PERSON;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private LocalDate dueDate;
    private Boolean flexible = false;
    private List<String> images;
}
