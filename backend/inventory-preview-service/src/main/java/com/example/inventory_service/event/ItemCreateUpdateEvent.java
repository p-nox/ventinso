package com.example.inventory_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ItemCreateUpdateEvent {
    private String itemId;
    private String title;
    private String description;
    private BigDecimal price;
    private String condition; // New-Used-Like new....
    private String status;  //Active-sold-hidden...
    private String type;  // Buy,Sell
    private Long userId;
    private String category;
    private LocalDateTime createdAt;
    private String thumbnailUrl;
    private Boolean openToOffers;
    private Boolean pickUpByAppointment;
}