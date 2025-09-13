package com.example.inventory_service.entity;

import com.example.inventory_service.enums.AdType;
import com.example.inventory_service.enums.ItemCondition;
import com.example.inventory_service.enums.ItemStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column( nullable = false, length = 100)
    private String title;

    @Column(length = 10000)
    private String description;

    @Column( nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "`condition`", nullable = false,  length = 20)
    private ItemCondition condition; // New,Used,Like-Νew....

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ItemStatus status = ItemStatus.ACTIVE;  // Active,Sold,Hidden...

    @Column(name = "user_id", nullable = false, updatable = false)
    private Long userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "ad_type", nullable = false,  length = 20)
    private AdType type;

    @Builder.Default
    @Column(nullable = false, columnDefinition = "BIGINT DEFAULT 0")
    private Long views = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "watchers_count", nullable = false)
    @Builder.Default
    private int watchersCount = 0;

    @Builder.Default
    @Column(name = "open_to_offers", nullable = false)
    private Boolean openToOffers = false;

    @Builder.Default
    @Column(name = "pickup_by_appointment", nullable = false)
    private Boolean pickUpByAppointment = false;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

