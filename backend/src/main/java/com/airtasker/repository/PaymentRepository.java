package com.airtasker.repository;

import com.airtasker.model.Payment;
import com.airtasker.model.Payment.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTaskId(Long taskId);

    Page<Payment> findByPayerIdOrPayeeId(Long payerId, Long payeeId, Pageable pageable);

    List<Payment> findByPayerId(Long payerId);

    List<Payment> findByPayeeId(Long payeeId);

    List<Payment> findByStatus(PaymentStatus status);

    @Query("SELECT SUM(p.netAmount) FROM Payment p WHERE p.payee.id = :userId AND p.status = 'COMPLETED'")
    BigDecimal sumEarningsByUserId(Long userId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.payer.id = :userId AND p.status = 'COMPLETED'")
    BigDecimal sumSpendingByUserId(Long userId);

    Optional<Payment> findByTransactionId(String transactionId);
}
