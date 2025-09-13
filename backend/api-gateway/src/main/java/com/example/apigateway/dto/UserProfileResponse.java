package com.example.apigateway.dto;

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
public class UserProfileResponse {

    // UserServiceResponse
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


    // PreviewServiceResponse
    private List<PreviewServiceResponse> items;
}
