package com.airtasker.service;

import com.airtasker.dto.TaskCreateRequest;
import com.airtasker.dto.TaskDto;
import com.airtasker.dto.TaskUpdateRequest;
import com.airtasker.exception.BadRequestException;
import com.airtasker.exception.ForbiddenException;
import com.airtasker.exception.ResourceNotFoundException;
import com.airtasker.model.Category;
import com.airtasker.model.Task;
import com.airtasker.model.Task.TaskStatus;
import com.airtasker.model.User;
import com.airtasker.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserService userService;
    private final CategoryService categoryService;
    private final NotificationService notificationService;

    public Page<TaskDto> getAllTasks(
            TaskStatus status,
            Long categoryId,
            BigDecimal minBudget,
            BigDecimal maxBudget,
            String location,
            String search,
            Pageable pageable) {
        return taskRepository.findWithFilters(status, categoryId, minBudget, maxBudget, location, search, pageable)
                .map(TaskDto::fromEntity);
    }

    public TaskDto getTaskById(Long id) {
        Task task = findById(id);
        return TaskDto.fromEntity(task);
    }

    @Transactional
    public TaskDto createTask(TaskCreateRequest request, String userEmail) {
        User poster = userService.findByEmail(userEmail);
        Category category = categoryService.findById(request.getCategoryId());

        if (request.getBudgetMin() != null && request.getBudgetMax() != null
                && request.getBudgetMin().compareTo(request.getBudgetMax()) > 0) {
            throw new BadRequestException("Minimum budget cannot be greater than maximum budget");
        }

        Task task = Task.builder()
                .poster(poster)
                .title(request.getTitle())
                .description(request.getDescription())
                .budgetMin(request.getBudgetMin())
                .budgetMax(request.getBudgetMax())
                .location(request.getLocation())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .locationType(request.getLocationType())
                .category(category)
                .status(TaskStatus.OPEN)
                .dueDate(request.getDueDate())
                .flexible(request.getFlexible())
                .images(request.getImages())
                .build();

        task = taskRepository.save(task);
        return TaskDto.fromEntity(task);
    }

    @Transactional
    public TaskDto updateTask(Long id, TaskUpdateRequest request, String userEmail) {
        Task task = findById(id);

        if (!task.getPoster().getEmail().equals(userEmail)) {
            throw new ForbiddenException("You can only update your own tasks");
        }

        if (task.getStatus() != TaskStatus.OPEN) {
            throw new BadRequestException("Can only update tasks with OPEN status");
        }

        if (request.getTitle() != null) {
            task.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription());
        }
        if (request.getBudgetMin() != null) {
            task.setBudgetMin(request.getBudgetMin());
        }
        if (request.getBudgetMax() != null) {
            task.setBudgetMax(request.getBudgetMax());
        }
        if (request.getLocation() != null) {
            task.setLocation(request.getLocation());
        }
        if (request.getLatitude() != null) {
            task.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            task.setLongitude(request.getLongitude());
        }
        if (request.getLocationType() != null) {
            task.setLocationType(request.getLocationType());
        }
        if (request.getCategoryId() != null) {
            task.setCategory(categoryService.findById(request.getCategoryId()));
        }
        if (request.getDueDate() != null) {
            task.setDueDate(request.getDueDate());
        }
        if (request.getFlexible() != null) {
            task.setFlexible(request.getFlexible());
        }
        if (request.getImages() != null) {
            task.setImages(request.getImages());
        }

        task = taskRepository.save(task);
        return TaskDto.fromEntity(task);
    }

    @Transactional
    public void deleteTask(Long id, String userEmail) {
        Task task = findById(id);

        if (!task.getPoster().getEmail().equals(userEmail)) {
            throw new ForbiddenException("You can only delete your own tasks");
        }

        if (task.getStatus() != TaskStatus.OPEN) {
            throw new BadRequestException("Can only delete tasks with OPEN status");
        }

        task.setStatus(TaskStatus.CANCELLED);
        taskRepository.save(task);
    }

    @Transactional
    public TaskDto assignTasker(Long taskId, Long taskerId, BigDecimal agreedPrice) {
        Task task = findById(taskId);
        User tasker = userService.findById(taskerId);

        task.setAssignedTasker(tasker);
        task.setAgreedPrice(agreedPrice);
        task.setStatus(TaskStatus.ASSIGNED);
        task.setAssignedAt(LocalDateTime.now());

        task = taskRepository.save(task);

        notificationService.notifyTaskAssigned(task);

        return TaskDto.fromEntity(task);
    }

    @Transactional
    public TaskDto startTask(Long id, String userEmail) {
        Task task = findById(id);

        if (task.getAssignedTasker() == null || !task.getAssignedTasker().getEmail().equals(userEmail)) {
            throw new ForbiddenException("Only the assigned tasker can start the task");
        }

        if (task.getStatus() != TaskStatus.ASSIGNED) {
            throw new BadRequestException("Task must be in ASSIGNED status to start");
        }

        task.setStatus(TaskStatus.IN_PROGRESS);
        task = taskRepository.save(task);
        return TaskDto.fromEntity(task);
    }

    @Transactional
    public TaskDto completeTask(Long id, String userEmail) {
        Task task = findById(id);

        if (!task.getPoster().getEmail().equals(userEmail)) {
            throw new ForbiddenException("Only the task poster can mark the task as complete");
        }

        if (task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new BadRequestException("Task must be in IN_PROGRESS status to complete");
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(LocalDateTime.now());
        task = taskRepository.save(task);

        userService.incrementCompletedTasks(task.getAssignedTasker().getId());
        notificationService.notifyTaskCompleted(task);

        return TaskDto.fromEntity(task);
    }

    public Page<TaskDto> getTasksByPoster(Long posterId, Pageable pageable) {
        return taskRepository.findByPosterId(posterId, pageable)
                .map(TaskDto::fromEntity);
    }

    public Page<TaskDto> getTasksByTasker(Long taskerId, Pageable pageable) {
        return taskRepository.findByAssignedTaskerId(taskerId, pageable)
                .map(TaskDto::fromEntity);
    }

    public List<String> getSuggestions(String query) {
        if (query == null || query.trim().length() < 2) {
            return Collections.emptyList();
        }
        return taskRepository.findTitleSuggestions(query.trim(),
                org.springframework.data.domain.PageRequest.of(0, 10));
    }

    public Task findById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
    }
}
