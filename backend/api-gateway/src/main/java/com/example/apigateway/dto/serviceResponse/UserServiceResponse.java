package com.example.apigateway.dto.serviceResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserServiceResponse {
    private Long userId;
    private String username;
    private int totalSales;
    private Long averageDeliveryTime;    // seconds
    private LocalDateTime registeredAt;
    private String avatarUrl;

    private Double avgDescriptionRating;
    private Double avgPackagingRating;
    private Double avgConditionRating;

    private Double avgOverallRating;
    private Integer totalRatings;

    private List<RatingResponse> ratings;



    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RatingResponse {
        private Long orderId;
        private Integer listingDescription;
        private Integer listingPackaging;
        private Integer listingCondition;
        private String comment;
        private Long reviewerId;
        private String reviewerUsername;
        private LocalDateTime createdAt;
        private String itemTitle;
    }
}


