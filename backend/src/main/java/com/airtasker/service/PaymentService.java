package com.airtasker.service;

import com.airtasker.dto.PaymentDto;
import com.airtasker.exception.BadRequestException;
import com.airtasker.exception.ForbiddenException;
import com.airtasker.exception.ResourceNotFoundException;
import com.airtasker.model.Payment;
import com.airtasker.model.Payment.PaymentStatus;
import com.airtasker.model.Task;
import com.airtasker.model.Task.TaskStatus;
import com.airtasker.model.User;
import com.airtasker.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private static final BigDecimal PLATFORM_FEE_PERCENTAGE = new BigDecimal("0.10"); // 10%

    private final PaymentRepository paymentRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final NotificationService notificationService;

    public Page<PaymentDto> getPaymentHistory(String userEmail, Pageable pageable) {
        User user = userService.findByEmail(userEmail);
        return paymentRepository.findByPayerIdOrPayeeId(user.getId(), user.getId(), pageable)
                .map(PaymentDto::fromEntity);
    }

    public PaymentDto getPaymentById(Long id, String userEmail) {
        Payment payment = findById(id);
        User user = userService.findByEmail(userEmail);

        if (!payment.getPayer().getId().equals(user.getId()) &&
                !payment.getPayee().getId().equals(user.getId())) {
            throw new ForbiddenException("You don't have access to this payment");
        }

        return PaymentDto.fromEntity(payment);
    }

    @Transactional
    public PaymentDto createPaymentIntent(Long taskId, String userEmail) {
        Task task = taskService.findById(taskId);
        User payer = userService.findByEmail(userEmail);

        if (!task.getPoster().getId().equals(payer.getId())) {
            throw new ForbiddenException("Only the task poster can create a payment");
        }

        if (task.getStatus() != TaskStatus.ASSIGNED && task.getStatus() != TaskStatus.IN_PROGRESS) {
            throw new BadRequestException("Task must be assigned or in progress to create payment");
        }

        if (task.getAssignedTasker() == null) {
            throw new BadRequestException("No tasker assigned to this task");
        }

        if (paymentRepository.findByTaskId(taskId).isPresent()) {
            throw new BadRequestException("Payment already exists for this task");
        }

        BigDecimal amount = task.getAgreedPrice();
        BigDecimal platformFee = amount.multiply(PLATFORM_FEE_PERCENTAGE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal netAmount = amount.subtract(platformFee);

        Payment payment = Payment.builder()
                .task(task)
                .payer(payer)
                .payee(task.getAssignedTasker())
                .amount(amount)
                .platformFee(platformFee)
                .netAmount(netAmount)
                .status(PaymentStatus.HELD)
                .transactionId(UUID.randomUUID().toString())
                .description("Payment for task: " + task.getTitle())
                .build();

        payment = paymentRepository.save(payment);
        return PaymentDto.fromEntity(payment);
    }

    @Transactional
    public PaymentDto completePayment(Long paymentId, String userEmail) {
        Payment payment = findById(paymentId);
        User user = userService.findByEmail(userEmail);

        if (!payment.getPayer().getId().equals(user.getId())) {
            throw new ForbiddenException("Only the payer can complete the payment");
        }

        if (payment.getStatus() != PaymentStatus.HELD) {
            throw new BadRequestException("Payment must be in HELD status to complete");
        }

        Task task = payment.getTask();
        if (task.getStatus() != TaskStatus.COMPLETED) {
            throw new BadRequestException("Task must be completed before releasing payment");
        }

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setCompletedAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        notificationService.notifyPaymentReceived(payment);

        return PaymentDto.fromEntity(payment);
    }

    @Transactional
    public PaymentDto refundPayment(Long paymentId, String userEmail) {
        Payment payment = findById(paymentId);
        User user = userService.findByEmail(userEmail);

        if (!payment.getPayer().getId().equals(user.getId())) {
            throw new ForbiddenException("Only the payer can request a refund");
        }

        if (payment.getStatus() != PaymentStatus.HELD) {
            throw new BadRequestException("Can only refund payments that are held");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment = paymentRepository.save(payment);
        return PaymentDto.fromEntity(payment);
    }

    public BigDecimal getTotalEarnings(String userEmail) {
        User user = userService.findByEmail(userEmail);
        BigDecimal earnings = paymentRepository.sumEarningsByUserId(user.getId());
        return earnings != null ? earnings : BigDecimal.ZERO;
    }

    public BigDecimal getTotalSpending(String userEmail) {
        User user = userService.findByEmail(userEmail);
        BigDecimal spending = paymentRepository.sumSpendingByUserId(user.getId());
        return spending != null ? spending : BigDecimal.ZERO;
    }

    public Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id));
    }
}
