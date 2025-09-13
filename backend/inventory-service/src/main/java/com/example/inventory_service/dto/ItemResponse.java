package com.example.inventory_service.dto;

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
public class ItemResponse {
    private Long id;
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
    private int watchersCount;
    private Boolean openToOffers;
    private Boolean pickUpByAppointment;
    //private String Location;
}
