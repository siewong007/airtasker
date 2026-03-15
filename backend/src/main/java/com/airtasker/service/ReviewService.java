package com.airtasker.service;

import com.airtasker.dto.ReviewCreateRequest;
import com.airtasker.dto.ReviewDto;
import com.airtasker.exception.BadRequestException;
import com.airtasker.exception.ForbiddenException;
import com.airtasker.exception.ResourceNotFoundException;
import com.airtasker.model.Review;
import com.airtasker.model.Review.ReviewType;
import com.airtasker.model.Task;
import com.airtasker.model.Task.TaskStatus;
import com.airtasker.model.User;
import com.airtasker.repository.ReviewRepository;
import com.airtasker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final NotificationService notificationService;

    public Page<ReviewDto> getReviewsByUserId(Long userId, Pageable pageable) {
        return reviewRepository.findByRevieweeId(userId, pageable)
                .map(ReviewDto::fromEntity);
    }

    public List<ReviewDto> getReviewsByTaskId(Long taskId) {
        return reviewRepository.findByTaskId(taskId).stream()
                .map(ReviewDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ReviewDto getReviewById(Long id) {
        Review review = findById(id);
        return ReviewDto.fromEntity(review);
    }

    @Transactional
    public ReviewDto createReview(Long taskId, ReviewCreateRequest request, String userEmail) {
        Task task = taskService.findById(taskId);
        User reviewer = userService.findByEmail(userEmail);

        if (task.getStatus() != TaskStatus.COMPLETED) {
            throw new BadRequestException("Can only review completed tasks");
        }

        if (reviewRepository.existsByTaskIdAndReviewerId(taskId, reviewer.getId())) {
            throw new BadRequestException("You have already reviewed this task");
        }

        boolean isPoster = task.getPoster().getId().equals(reviewer.getId());
        boolean isTasker = task.getAssignedTasker() != null &&
                task.getAssignedTasker().getId().equals(reviewer.getId());

        if (!isPoster && !isTasker) {
            throw new ForbiddenException("Only the poster or tasker can review this task");
        }

        User reviewee;
        ReviewType type;

        if (isPoster) {
            reviewee = task.getAssignedTasker();
            type = ReviewType.POSTER_TO_TASKER;
        } else {
            reviewee = task.getPoster();
            type = ReviewType.TASKER_TO_POSTER;
        }

        Review review = Review.builder()
                .task(task)
                .reviewer(reviewer)
                .reviewee(reviewee)
                .rating(request.getRating())
                .comment(request.getComment())
                .type(type)
                .build();

        review = reviewRepository.save(review);

        // Update reviewee's rating
        updateUserRating(reviewee.getId());

        notificationService.notifyNewReview(review);

        return ReviewDto.fromEntity(review);
    }

    private void updateUserRating(Long userId) {
        Double avgRating = reviewRepository.calculateAverageRating(userId);
        Long reviewCount = reviewRepository.countByRevieweeId(userId);

        User user = userService.findById(userId);
        user.setRating(avgRating != null ? avgRating : 0.0);
        user.setReviewCount(reviewCount != null ? reviewCount.intValue() : 0);
        userRepository.save(user);
    }

    public Review findById(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id));
    }
}
