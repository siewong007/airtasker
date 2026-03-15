package com.airtasker.controller;

import com.airtasker.dto.*;
import com.airtasker.model.Task.TaskStatus;
import com.airtasker.service.MessageService;
import com.airtasker.service.OfferService;
import com.airtasker.service.ReviewService;
import com.airtasker.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Task management endpoints")
public class TaskController {

    private final TaskService taskService;
    private final OfferService offerService;
    private final MessageService messageService;
    private final ReviewService reviewService;

    @GetMapping
    @Operation(summary = "Get all tasks with filters")
    public ResponseEntity<Page<TaskDto>> getAllTasks(
            @RequestParam(required = false) TaskStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(taskService.getAllTasks(status, categoryId, minBudget, maxBudget, location, search, pageable));
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Get task title suggestions for autocomplete")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam String q) {
        return ResponseEntity.ok(taskService.getSuggestions(q));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get task by ID")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PostMapping
    @Operation(summary = "Create a new task")
    public ResponseEntity<TaskDto> createTask(
            @Valid @RequestBody TaskCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(taskService.createTask(request, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a task")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable Long id,
            @Valid @RequestBody TaskUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.updateTask(id, request, userDetails.getUsername()));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete/cancel a task")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        taskService.deleteTask(id, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start working on a task (for assigned tasker)")
    public ResponseEntity<TaskDto> startTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.startTask(id, userDetails.getUsername()));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark task as complete (for poster)")
    public ResponseEntity<TaskDto> completeTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(taskService.completeTask(id, userDetails.getUsername()));
    }

    // Offers
    @GetMapping("/{taskId}/offers")
    @Operation(summary = "Get all offers for a task")
    public ResponseEntity<List<OfferDto>> getTaskOffers(@PathVariable Long taskId) {
        return ResponseEntity.ok(offerService.getOffersByTaskId(taskId));
    }

    @PostMapping("/{taskId}/offers")
    @Operation(summary = "Make an offer on a task")
    public ResponseEntity<OfferDto> createOffer(
            @PathVariable Long taskId,
            @Valid @RequestBody OfferCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(offerService.createOffer(taskId, request, userDetails.getUsername()));
    }

    // Messages
    @GetMapping("/{taskId}/messages")
    @Operation(summary = "Get messages for a task")
    public ResponseEntity<List<MessageDto>> getTaskMessages(
            @PathVariable Long taskId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(messageService.getMessagesByTaskId(taskId, userDetails.getUsername()));
    }

    @PostMapping("/{taskId}/messages")
    @Operation(summary = "Send a message for a task")
    public ResponseEntity<MessageDto> createMessage(
            @PathVariable Long taskId,
            @Valid @RequestBody MessageCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(messageService.createMessage(taskId, request, userDetails.getUsername()));
    }

    // Reviews
    @GetMapping("/{taskId}/reviews")
    @Operation(summary = "Get reviews for a task")
    public ResponseEntity<List<ReviewDto>> getTaskReviews(@PathVariable Long taskId) {
        return ResponseEntity.ok(reviewService.getReviewsByTaskId(taskId));
    }

    @PostMapping("/{taskId}/reviews")
    @Operation(summary = "Create a review for a task")
    public ResponseEntity<ReviewDto> createReview(
            @PathVariable Long taskId,
            @Valid @RequestBody ReviewCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reviewService.createReview(taskId, request, userDetails.getUsername()));
    }
}
