package com.airtasker.service;

import com.airtasker.dto.OfferCreateRequest;
import com.airtasker.dto.OfferDto;
import com.airtasker.exception.BadRequestException;
import com.airtasker.exception.ForbiddenException;
import com.airtasker.exception.ResourceNotFoundException;
import com.airtasker.model.Offer;
import com.airtasker.model.Offer.OfferStatus;
import com.airtasker.model.Task;
import com.airtasker.model.Task.TaskStatus;
import com.airtasker.model.User;
import com.airtasker.repository.OfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OfferService {

    private final OfferRepository offerRepository;
    private final TaskService taskService;
    private final UserService userService;
    private final NotificationService notificationService;

    public List<OfferDto> getOffersByTaskId(Long taskId) {
        return offerRepository.findByTaskId(taskId).stream()
                .map(OfferDto::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<OfferDto> getOffersByTaskerId(Long taskerId, Pageable pageable) {
        return offerRepository.findByTaskerId(taskerId, pageable)
                .map(OfferDto::fromEntity);
    }

    public OfferDto getOfferById(Long id) {
        Offer offer = findById(id);
        return OfferDto.fromEntity(offer);
    }

    @Transactional
    public OfferDto createOffer(Long taskId, OfferCreateRequest request, String userEmail) {
        Task task = taskService.findById(taskId);
        User tasker = userService.findByEmail(userEmail);

        if (task.getStatus() != TaskStatus.OPEN) {
            throw new BadRequestException("Can only make offers on open tasks");
        }

        if (task.getPoster().getId().equals(tasker.getId())) {
            throw new BadRequestException("Cannot make an offer on your own task");
        }

        if (offerRepository.existsByTaskIdAndTaskerId(taskId, tasker.getId())) {
            throw new BadRequestException("You have already made an offer on this task");
        }

        Offer offer = Offer.builder()
                .task(task)
                .tasker(tasker)
                .price(request.getPrice())
                .message(request.getMessage())
                .estimatedHours(request.getEstimatedHours())
                .status(OfferStatus.PENDING)
                .build();

        offer = offerRepository.save(offer);

        notificationService.notifyNewOffer(offer);

        return OfferDto.fromEntity(offer);
    }

    @Transactional
    public OfferDto acceptOffer(Long offerId, String userEmail) {
        Offer offer = findById(offerId);
        Task task = offer.getTask();

        if (!task.getPoster().getEmail().equals(userEmail)) {
            throw new ForbiddenException("Only the task poster can accept offers");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new BadRequestException("Can only accept pending offers");
        }

        if (task.getStatus() != TaskStatus.OPEN) {
            throw new BadRequestException("Task is no longer open for offers");
        }

        // Accept this offer
        offer.setStatus(OfferStatus.ACCEPTED);
        offerRepository.save(offer);

        // Reject all other pending offers
        List<Offer> otherOffers = offerRepository.findByTaskIdAndStatus(task.getId(), OfferStatus.PENDING);
        for (Offer other : otherOffers) {
            if (!other.getId().equals(offerId)) {
                other.setStatus(OfferStatus.REJECTED);
                offerRepository.save(other);
                notificationService.notifyOfferRejected(other);
            }
        }

        // Assign the tasker to the task
        taskService.assignTasker(task.getId(), offer.getTasker().getId(), offer.getPrice());
        notificationService.notifyOfferAccepted(offer);

        return OfferDto.fromEntity(offer);
    }

    @Transactional
    public OfferDto rejectOffer(Long offerId, String userEmail) {
        Offer offer = findById(offerId);
        Task task = offer.getTask();

        if (!task.getPoster().getEmail().equals(userEmail)) {
            throw new ForbiddenException("Only the task poster can reject offers");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new BadRequestException("Can only reject pending offers");
        }

        offer.setStatus(OfferStatus.REJECTED);
        offer = offerRepository.save(offer);

        notificationService.notifyOfferRejected(offer);

        return OfferDto.fromEntity(offer);
    }

    @Transactional
    public OfferDto withdrawOffer(Long offerId, String userEmail) {
        Offer offer = findById(offerId);

        if (!offer.getTasker().getEmail().equals(userEmail)) {
            throw new ForbiddenException("Only the offer owner can withdraw their offer");
        }

        if (offer.getStatus() != OfferStatus.PENDING) {
            throw new BadRequestException("Can only withdraw pending offers");
        }

        offer.setStatus(OfferStatus.WITHDRAWN);
        offer = offerRepository.save(offer);
        return OfferDto.fromEntity(offer);
    }

    public Offer findById(Long id) {
        return offerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offer", id));
    }
}
