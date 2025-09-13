package com.example.user_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RatingEvent {
    private Long reviewerId;
    private Long revieweeId;
    private Long orderId;
}
