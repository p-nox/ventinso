package com.example.order_service.enums;

public enum OrderStatus {
    PENDING_VALIDATION,       // Order is created, waiting for system validation
    PENDING_DELIVERY,         // Order is validated, waiting to be delivered
    PENDING_ARRIVAL,          // Order created, waiting for seller's acceptance
    ACCEPTED,                 // Seller has accepted the order
    CONFIRMED,                // Order confirmed by the system
    SENT,                     // Order has been sent by the seller
    PENDING_CONFIRMATION,     // Waiting for buyer to confirm receipt
    COMPLETED,                // Buyer confirmed receipt, order completed
    CANCELLED                 // Order has been cancelled
}
