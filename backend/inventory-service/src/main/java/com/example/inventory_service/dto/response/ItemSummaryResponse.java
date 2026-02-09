package com.example.inventory_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ItemSummaryResponse {
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