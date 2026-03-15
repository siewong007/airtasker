package com.airtasker.repository;

import com.airtasker.model.Offer;
import com.airtasker.model.Offer.OfferStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {

    List<Offer> findByTaskId(Long taskId);

    Page<Offer> findByTaskId(Long taskId, Pageable pageable);

    Page<Offer> findByTaskerId(Long taskerId, Pageable pageable);

    List<Offer> findByTaskIdAndStatus(Long taskId, OfferStatus status);

    Optional<Offer> findByTaskIdAndTaskerId(Long taskId, Long taskerId);

    boolean existsByTaskIdAndTaskerId(Long taskId, Long taskerId);

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.tasker.id = :taskerId AND o.status = 'ACCEPTED'")
    Long countAcceptedByTaskerId(Long taskerId);

    @Query("SELECT COUNT(o) FROM Offer o WHERE o.task.id = :taskId")
    Long countByTaskId(Long taskId);
}
