package com.example.order_service.entity;

import com.example.order_service.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "`orders`")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "seller_username", nullable = false)
    private String sellerUsername;

    @Builder.Default
    @Column(name = "delivery_confirmed", nullable = false)
    private Boolean deliveryConfirmed = false;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "buyer_username", nullable = false)
    private String buyerUsername;

    @Builder.Default
    @Column(name = "arrival_confirmed", nullable = false)
    private Boolean arrivalConfirmed = false;

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "item_title", nullable = false)
    private String itemTitle;

    @Column(name = "item_condition", nullable = false)
    private String itemCondition;

    @Column(nullable = false)
    private String thumbnailUrl;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "rating_submitted", nullable = false)
    private boolean ratingSubmitted = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private OrderStatus status;

    @Column(name = "valid_participants")
    private Boolean validParticipants;

    @Column(name = "valid_item")
    private Boolean validItem;

    @Column(name = "valid_balance")
    private Boolean validBalance;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "arrived_at")
    private LocalDateTime arrivedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


}
