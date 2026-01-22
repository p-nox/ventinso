package com.example.order_service.event;

import com.example.order_service.enums.OrderType;
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
public class OrderEvent {
    private Long id;
    private Long buyerId;
    private String buyerUsername;
    private Long sellerId;
    private String sellerUsername;
    private Long itemId;
    private BigDecimal price;
    private String itemTitle;
    private String checkoutUrl;
    private String action;

    private String orderType;

    private LocalDateTime paidAt;
    private LocalDateTime sentAt;
    private LocalDateTime arrivedAt;
}
