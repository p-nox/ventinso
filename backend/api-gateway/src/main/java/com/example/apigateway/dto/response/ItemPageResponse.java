package com.example.apigateway.dto.response;

import com.example.apigateway.dto.serviceResponse.InventoryServiceResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ItemPageResponse {

    private InventoryServiceResponse item;
    private UserPreview user;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserPreview {
        private Long userId;
        private String username;
        private String avatarUrl;
        private LocalDateTime registeredAt;
        private Double avgOverallRating;
        private Integer totalRatings;
    }
}
