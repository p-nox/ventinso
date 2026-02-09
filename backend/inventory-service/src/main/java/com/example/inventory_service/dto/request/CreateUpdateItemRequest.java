package com.example.inventory_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateUpdateItemRequest {
    private String title;
    private String description;
    private Float price;
    private String condition; // New,Used,Like new....
    private String type;  //Active,Sold,Hidden...
    private Long userId;
    private Long categoryId;
    private String thumbnail;
    private Boolean openToOffers;
    private Boolean pickUpByAppointment;

    //private String Location;
}
