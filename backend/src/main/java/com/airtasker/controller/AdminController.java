package com.airtasker.controller;

import com.airtasker.dto.CategoryDto;
import com.airtasker.dto.TaskDto;
import com.airtasker.dto.UserDto;
import com.airtasker.model.User;
import com.airtasker.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin management endpoints")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get platform statistics")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users (paginated)")
    public ResponseEntity<Page<UserDto>> getUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @GetMapping("/tasks")
    @Operation(summary = "Get all tasks (paginated)")
    public ResponseEntity<Page<TaskDto>> getTasks(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllTasks(pageable));
    }

    @PostMapping("/users/{id}/toggle-active")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<Void> toggleUserActive(@PathVariable Long id) {
        adminService.toggleUserActive(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/{id}/set-role")
    @Operation(summary = "Set user role")
    public ResponseEntity<Void> setUserRole(@PathVariable Long id, @RequestParam String role) {
        adminService.setUserRole(id, User.UserRole.valueOf(role));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tasks/{id}/cancel")
    @Operation(summary = "Cancel a task")
    public ResponseEntity<Void> cancelTask(@PathVariable Long id) {
        adminService.cancelTask(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/categories")
    @Operation(summary = "Create a category")
    public ResponseEntity<CategoryDto> createCategory(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.createCategory(
                body.get("name"), body.get("description"), body.get("icon"), body.get("slug")));
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update a category")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(adminService.updateCategory(id, body.get("name"), body.get("description"), body.get("icon")));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        adminService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
