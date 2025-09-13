package com.example.inventory_preview_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserLookUpEvent {
    private Long userId;
    private String username;
    private Double avgOverallRating;
    private Integer totalRatings;
}
