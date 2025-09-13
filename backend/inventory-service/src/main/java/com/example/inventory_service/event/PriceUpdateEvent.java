package com.example.inventory_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PriceUpdateEvent {
    private Long itemId;
    private BigDecimal price;
    private BigDecimal oldPrice;
    private String title;
    private String action = "PRICE_UPDATE";
    private List<Long> watchers;
}
