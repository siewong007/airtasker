package com.airtasker.repository;

import com.airtasker.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByTaskIdOrderByCreatedAtAsc(Long taskId);

    Page<Message> findByTaskId(Long taskId, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.task.id = :taskId AND (m.sender.id = :userId OR m.receiver.id = :userId) ORDER BY m.createdAt ASC")
    List<Message> findByTaskIdAndUserId(Long taskId, Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.read = false")
    Long countUnreadByUserId(Long userId);

    @Query("SELECT DISTINCT m.task.id FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId")
    List<Long> findTaskIdsWithMessages(Long userId);

    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.task.id = :taskId AND m.receiver.id = :userId AND m.read = false")
    void markAsReadByTaskAndReceiver(Long taskId, Long userId);
}
