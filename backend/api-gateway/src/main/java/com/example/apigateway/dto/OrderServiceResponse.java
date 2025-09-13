package com.example.apigateway.dto;

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
public class OrderServiceResponse {
    private Long id;
    private Long buyerId;
    private String buyerUsername;
    private String sellerUsername;
    private Long sellerId;
    private Long itemId;
    private BigDecimal price;
    private String status;
    private String trackingNumber;
    private LocalDateTime paidAt;
    private LocalDateTime sentAt;
    private LocalDateTime arrivedAt;
    private String thumbnailUrl;

}
