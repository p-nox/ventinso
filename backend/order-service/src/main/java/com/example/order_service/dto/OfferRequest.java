package com.example.order_service.dto;

import java.math.BigDecimal;

public record OfferRequest(
        Long sellerId,
        Long buyerId,
        Long itemId,
        BigDecimal offerAmount
) {}
