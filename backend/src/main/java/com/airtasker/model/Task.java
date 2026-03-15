package com.airtasker.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "poster_id", nullable = false)
    private User poster;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(precision = 10, scale = 2)
    private BigDecimal budgetMin;

    @Column(precision = 10, scale = 2)
    private BigDecimal budgetMax;

    private String location;

    private Double latitude;

    private Double longitude;

    @Enumerated(EnumType.STRING)
    private LocationType locationType = LocationType.IN_PERSON;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.OPEN;

    private LocalDate dueDate;

    @Column(nullable = false)
    private Boolean flexible = false;

    @ElementCollection
    @CollectionTable(name = "task_images", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "image_url")
    private List<String> images = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_tasker_id")
    private User assignedTasker;

    @Column(precision = 10, scale = 2)
    private BigDecimal agreedPrice;

    private LocalDateTime assignedAt;

    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<Offer> offers = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<Message> messages = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL)
    private List<Review> reviews = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum TaskStatus {
        OPEN, ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
    }

    public enum LocationType {
        IN_PERSON, REMOTE
    }
}
