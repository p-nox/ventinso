package com.example.user_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RatingRequest {
    private Long reviewerId;
    private Long revieweeId;
    private Long orderId;
    private Integer listingDescription;
    private Integer listingPackaging;
    private Integer listingCondition;
    private String comment;
}