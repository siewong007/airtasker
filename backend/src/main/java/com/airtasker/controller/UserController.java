package com.airtasker.controller;

import com.airtasker.dto.ReviewDto;
import com.airtasker.dto.TaskDto;
import com.airtasker.dto.UserDto;
import com.airtasker.dto.UserUpdateRequest;
import com.airtasker.service.ReviewService;
import com.airtasker.service.TaskService;
import com.airtasker.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;
    private final TaskService taskService;
    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get all users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(
                userService.getAllUsers().stream()
                        .map(UserDto::fromEntity)
                        .collect(Collectors.toList())
        );
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(UserDto.fromEntity(userService.getUserById(id)));
    }

    @PutMapping("/{id}/profile")
    @Operation(summary = "Update user profile")
    public ResponseEntity<UserDto> updateUserProfile(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(UserDto.fromEntity(userService.updateUserProfile(id, request)));
    }

    @PutMapping("/{id}/password")
    @Operation(summary = "Change user password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id, @RequestParam String oldPassword, @RequestParam String newPassword) {
        userService.changePassword(id, oldPassword, newPassword);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/tasks")
    @Operation(summary = "Get tasks posted by user")
    public ResponseEntity<Page<TaskDto>> getUserTasks(
            @PathVariable Long id,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(taskService.getTasksByPoster(id, pageable));
    }

    @GetMapping("/{id}/assigned-tasks")
    @Operation(summary = "Get tasks assigned to user")
    public ResponseEntity<Page<TaskDto>> getAssignedTasks(
            @PathVariable Long id,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(taskService.getTasksByTasker(id, pageable));
    }

    @GetMapping("/{id}/reviews")
    @Operation(summary = "Get reviews for a user")
    public ResponseEntity<Page<ReviewDto>> getUserReviews(
            @PathVariable Long id,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(reviewService.getReviewsByUserId(id, pageable));
    }
}
