package com.example.user_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(name = "UserSummaryResponse", description = "Summary info of a user, including ratings and stats")
public class UserSummaryResponse {

    @Schema(description = "Unique ID of the user", example = "123")
    private Long userId;

    @Schema(description = "Username of the user", example = "john_doe")
    private String username;

    @Schema(description = "Total number of sales completed by the user", example = "42")
    private int totalSales;

    @Schema(description = "Average delivery time in seconds", example = "3600")
    private Long averageDeliveryTime;    // seconds

    @Schema(description = "User registration date and time", example = "2025-09-08T12:30:00")
    private LocalDateTime registeredAt;

    @Schema(description = "URL of the user's avatar image", example = "https://example.com/avatar.jpg")
    private String avatarUrl;

    @Schema(description = "Average rating for item description quality", example = "4.5")
    private Double avgDescriptionRating;

    @Schema(description = "Average rating for packaging quality", example = "4.0")
    private Double avgPackagingRating;

    @Schema(description = "Average rating for item condition", example = "4.8")
    private Double avgConditionRating;

    @Schema(description = "Overall average rating", example = "4.4")
    private Double avgOverallRating;

    @Schema(description = "Total number of ratings received", example = "20")
    private Integer totalRatings;

    @Schema(description = "List of detailed ratings for this user")
    private List<RatingResponse> ratings;
}
