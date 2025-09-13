package com.example.user_service.entity;

import com.example.user_service.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table( name = "users")
public class User {

    @Id
    @Column( updatable = false)
    private Long id;

    @Column( nullable = false)
    private String name;

    @Column( nullable = false, unique = true)
    private String username;

    @Column( nullable = false, unique = true)
    private String email;

    @Builder.Default
    @Column( name = "avatar_url")
    private String avatarUrl = "default.png";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserStatus status;

    @Builder.Default
    @Column( name = "total_sales" )
    private int totalSales = 0;

    @Builder.Default
    @Column( name = "average_delivery_time" )
    private Long averageDeliveryTime = 0L;    // seconds

    @Builder.Default
    @Column(name = "avg_description_rating")
    private Double avgDescriptionRating = 0.0;

    @Builder.Default
    @Column(name = "avg_packaging_rating")
    private Double avgPackagingRating = 0.0;

    @Builder.Default
    @Column(name = "avg_condition_rating")
    private Double avgConditionRating = 0.0;

    @Builder.Default
    @Column(name = "avg_overall_rating")
    private Double avgOverallRating = 0.0;

    @Builder.Default
    @Column(name = "total_ratings")
    private Integer totalRatings = 0;

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Set<Favorite> favourites = new HashSet<>();

    @Column( name = "registered_at", nullable = false, updatable = false)
    private LocalDateTime registeredAt;

}
