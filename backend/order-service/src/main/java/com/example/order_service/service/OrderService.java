package com.example.order_service.service;

import com.example.order_service.dto.*;
import com.example.order_service.entity.Order;
import com.example.order_service.enums.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {
    
    void markOrderRatingSubmitted(Long orderId);

    OrderConfirmedResponse createOrder(OrderRequest request);

    OrderProgressUpdateDto cancelOrder(Long orderId, Long userId);

    OrderProgressUpdateDto confirmOrderProgress(Long orderId, Long userId);

    Order validateOrder(Long orderId, String topic);

    void updateOrder(Long orderId, LocalDateTime paidAt);

    void updateOrderStatus(Long orderId, OrderStatus status);

    OrderResponse getOrderById(Long orderId);

    OrderTitleResponse getOrderTitleById(Long orderId);

    List<OrderResponse> getAllOrdersAsSeller(Long userId);

    List<OrderResponse> getAllOrdersAsBuyer(Long userId);

    Order findOrderById(Long orderId);
}
