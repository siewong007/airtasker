package com.airtasker.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class UserUpdateRequest {
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    @Size(max = 500, message = "Bio must be less than 500 characters")
    private String bio;

    private String avatarUrl;
    private String location;
    private String phone;
    private List<String> skills;
}
