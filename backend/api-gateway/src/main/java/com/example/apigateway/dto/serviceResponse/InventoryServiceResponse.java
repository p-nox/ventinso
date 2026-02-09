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
public class InventoryServiceResponse {
    private Long itemId;
    private String title;
    private String description;
    private Float price;
    private String condition; // New,Used,Like new....
    private String status;  //Active,Sold,Hidden...
    private String type; // Buy,Sell
    private Long userId;
    private Long views;
    private String category;
    private LocalDateTime createdAt;
    private List<String> imageUrls;
    private String thumbnailUrl;
    private int watchers;
    private Boolean openToOffers;
    private Boolean pickUpByAppointment;
    private int totalItems;

    private List<ItemSummaryResponse> listOfUserItems;


    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemSummaryResponse {
        private Long itemId;
        private Long userId;
        private String title;
        private String status;
        private Float price;
        private String condition;
        private int watchers;
        private String thumbnailUrl;
        private Boolean openToOffers;
        private Boolean pickUpByAppointment;

    }

}