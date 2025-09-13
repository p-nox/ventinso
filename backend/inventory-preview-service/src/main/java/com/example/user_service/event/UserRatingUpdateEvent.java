package com.example.user_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRatingUpdateEvent {
    private Long userId;
    private Double avgOverallRating;
    private Integer totalRatings;
}