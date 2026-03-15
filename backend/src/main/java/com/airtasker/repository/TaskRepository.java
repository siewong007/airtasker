package com.airtasker.repository;

import com.airtasker.model.Task;
import com.airtasker.model.Task.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    Page<Task> findByStatus(TaskStatus status, Pageable pageable);

    Page<Task> findByPosterId(Long posterId, Pageable pageable);

    Page<Task> findByAssignedTaskerId(Long taskerId, Pageable pageable);

    Page<Task> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.status = :status AND t.category.id = :categoryId")
    Page<Task> findByStatusAndCategoryId(TaskStatus status, Long categoryId, Pageable pageable);

    @Query("SELECT t FROM Task t WHERE " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:minBudget IS NULL OR t.budgetMin >= :minBudget) AND " +
           "(:maxBudget IS NULL OR t.budgetMax <= :maxBudget) AND " +
           "(:location IS NULL OR LOWER(t.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Task> findWithFilters(
            @Param("status") TaskStatus status,
            @Param("categoryId") Long categoryId,
            @Param("minBudget") BigDecimal minBudget,
            @Param("maxBudget") BigDecimal maxBudget,
            @Param("location") String location,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT t FROM Task t WHERE t.status = 'OPEN' ORDER BY t.createdAt DESC")
    List<Task> findRecentOpenTasks(Pageable pageable);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.poster.id = :userId")
    Long countByPosterId(Long userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.assignedTasker.id = :userId AND t.status = 'COMPLETED'")
    Long countCompletedByTaskerId(Long userId);

    @Query("SELECT DISTINCT t.title FROM Task t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :query, '%')) AND t.status = 'OPEN' ORDER BY t.title")
    List<String> findTitleSuggestions(@Param("query") String query, Pageable pageable);
}
