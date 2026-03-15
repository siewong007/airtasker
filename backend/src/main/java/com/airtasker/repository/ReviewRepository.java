package com.airtasker.repository;

import com.airtasker.model.Review;
import com.airtasker.model.Review.ReviewType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByTaskId(Long taskId);

    Page<Review> findByRevieweeId(Long revieweeId, Pageable pageable);

    List<Review> findByRevieweeId(Long revieweeId);

    Optional<Review> findByTaskIdAndReviewerId(Long taskId, Long reviewerId);

    boolean existsByTaskIdAndReviewerId(Long taskId, Long reviewerId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.reviewee.id = :userId")
    Double calculateAverageRating(Long userId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.reviewee.id = :userId")
    Long countByRevieweeId(Long userId);

    List<Review> findByRevieweeIdAndType(Long revieweeId, ReviewType type);
}
