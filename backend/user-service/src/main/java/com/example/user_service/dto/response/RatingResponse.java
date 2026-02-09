package com.example.user_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RatingResponse {
    private Long orderId;
    private Integer listingDescription;
    private Integer listingPackaging;
    private Integer listingCondition;
    private String comment;
    private Long reviewerId;
    private String reviewerUsername;
    private LocalDateTime createdAt;
}