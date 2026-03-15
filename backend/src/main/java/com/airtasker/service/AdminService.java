package com.airtasker.service;

import com.airtasker.dto.CategoryDto;
import com.airtasker.dto.TaskDto;
import com.airtasker.dto.UserDto;
import com.airtasker.exception.ResourceNotFoundException;
import com.airtasker.model.Category;
import com.airtasker.model.Task;
import com.airtasker.model.User;
import com.airtasker.repository.CategoryRepository;
import com.airtasker.repository.TaskRepository;
import com.airtasker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;

    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalTasks", taskRepository.count());
        stats.put("totalCategories", categoryRepository.count());
        stats.put("openTasks", taskRepository.findByStatus(Task.TaskStatus.OPEN, Pageable.unpaged()).getTotalElements());
        stats.put("completedTasks", taskRepository.findByStatus(Task.TaskStatus.COMPLETED, Pageable.unpaged()).getTotalElements());
        return stats;
    }

    public Page<UserDto> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserDto::fromEntity);
    }

    public Page<TaskDto> getAllTasks(Pageable pageable) {
        return taskRepository.findAll(pageable).map(TaskDto::fromEntity);
    }

    @Transactional
    public void toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setActive(!user.getActive());
        userRepository.save(user);
    }

    @Transactional
    public void setUserRole(Long userId, User.UserRole role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void cancelTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));
        task.setStatus(Task.TaskStatus.CANCELLED);
        taskRepository.save(task);
    }

    @Transactional
    public CategoryDto createCategory(String name, String description, String icon, String slug) {
        Category category = Category.builder()
                .name(name)
                .description(description)
                .icon(icon)
                .slug(slug)
                .active(true)
                .build();
        category = categoryRepository.save(category);
        return CategoryDto.fromEntity(category);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, String name, String description, String icon) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        if (name != null) category.setName(name);
        if (description != null) category.setDescription(description);
        if (icon != null) category.setIcon(icon);
        category = categoryRepository.save(category);
        return CategoryDto.fromEntity(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
