package com.example.apigateway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {

    // Order service response
    private Long id;
    private Long buyerId;
    private String buyerUsername;
    private String sellerUsername;
    private Long sellerId;
    private Long itemId;
    private BigDecimal price;
    private String status;
    private LocalDateTime createdAt;
    private Boolean deliveryConfirmed;
    private Boolean arrivalConfirmed;
    private String trackingNumber;
    private LocalDateTime paidAt;
    private LocalDateTime sentAt;
    private LocalDateTime arrivedAt;


    // Preview service response
    private String title;
    private String condition;
    private String thumbnail;

}
