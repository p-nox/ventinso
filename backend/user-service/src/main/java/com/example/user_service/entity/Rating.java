package com.example.user_service.entity;

import com.example.user_service.enums.RatingValue;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ratings")
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer; // buyer

    @ManyToOne(optional = false)
    @JoinColumn(name = "reviewee_id", nullable = false)
    private User reviewee; // seller

    @Column(name = "order_id", nullable = false)
    private Long orderId;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_description", nullable = false)
    private RatingValue listingDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_packaging", nullable = false)
    private RatingValue listingPackaging;

    @Enumerated(EnumType.STRING)
    @Column(name = "listing_condition", nullable = false)
    private RatingValue listingCondition;

    @Column(name = "total_rating", nullable = false)
    private int totalRating;

    @Column(name = "comment", length = 1000)
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}
