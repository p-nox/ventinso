package com.example.order_service.service;

import com.example.order_service.dto.*;
import com.example.order_service.entity.Order;
import com.example.order_service.event.OrderEvent;
import com.example.order_service.enums.OrderStatus;
import com.example.order_service.exception.ResourceNotFoundException;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.utils.Mapper;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final Mapper mapper;
    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    @Transactional
    @Override
    public void markOrderRatingSubmitted(Long orderId) {
        Order order = findOrderById(orderId);
        order.setRatingSubmitted(true);
    }

    @Override
    public OrderConfirmedResponse createOrder(final OrderRequest request) {
        Order order = mapper.toEntity(request);
        order.setStatus(OrderStatus.PENDING_VALIDATION);

        try {
            Order savedOrder = orderRepository.save(order);
            final OrderEvent orderEvent = OrderEvent.builder()
                    .id(savedOrder.getId())
                    .buyerId(savedOrder.getBuyerId())
                    .buyerUsername(savedOrder.getBuyerUsername())
                    .sellerId(savedOrder.getSellerId())
                    .sellerUsername(savedOrder.getSellerUsername())
                    .itemId(savedOrder.getItemId())
                    .itemTitle(savedOrder.getItemTitle())
                    .price(savedOrder.getPrice())
                    .orderType(request.getOrderType().name())
                    .build();
            kafkaTemplate.send("order.created", orderEvent);

            return OrderConfirmedResponse.builder()
                    .orderId(savedOrder.getId())
                    .build();
        } catch (Exception e) {
            log.error("Failed to create order", e);
            throw e;
        }
    }

    @Transactional
    @Override
    public OrderProgressUpdateDto cancelOrder(Long orderId, Long userId) {
        Order order = findOrderById(orderId);
        order.setStatus(OrderStatus.CANCELLED);
        final OrderEvent orderEvent = OrderEvent.builder()
                .id(order.getId())
                .buyerId(order.getBuyerId())
                .buyerUsername(order.getBuyerUsername())
                .sellerId(order.getSellerId())
                .sellerUsername(order.getSellerUsername())
                .itemId(order.getItemId())
                .itemTitle(order.getItemTitle())
                .price(order.getPrice())
                .paidAt(order.getPaidAt())
                .sentAt(order.getSentAt())
                .arrivedAt(order.getArrivedAt())
                .build();
        kafkaTemplate.send("order.cancelled", orderEvent);
        return mapper.toProgressDto(order);
    }

    @Transactional
    @Override
    public OrderProgressUpdateDto confirmOrderProgress(Long orderId, Long userId) {
        Order order = findOrderById(orderId);
        if (order.getSellerId().equals(userId)) {
            order.setSentAt(LocalDateTime.now());
            order.setDeliveryConfirmed(true);
            order.setStatus(OrderStatus.PENDING_ARRIVAL);
        } else if (order.getBuyerId().equals(userId)) {
            order.setArrivedAt(LocalDateTime.now());
            order.setArrivalConfirmed(true);
            order.setStatus(OrderStatus.COMPLETED);
        }

        if (Boolean.TRUE.equals(order.getArrivalConfirmed()) && Boolean.TRUE.equals(order.getDeliveryConfirmed())) {
            final OrderEvent orderEvent = OrderEvent.builder()
                    .id(order.getId())
                    .buyerId(order.getBuyerId())
                    .buyerUsername(order.getBuyerUsername())
                    .sellerId(order.getSellerId())
                    .sellerUsername(order.getSellerUsername())
                    .itemId(order.getItemId())
                    .itemTitle(order.getItemTitle())
                    .price(order.getPrice())
                    .paidAt(order.getPaidAt())
                    .sentAt(order.getSentAt())
                    .arrivedAt(order.getArrivedAt())
                    .build();
            kafkaTemplate.send("order.completed", orderEvent);
        }
        return mapper.toProgressDto(order);
    }

    @Override
    public Order validateOrder(Long orderId, String topic) {
        Order orderEntity = findOrderById(orderId);
        switch (topic) {
            case "auth.participants.verified" -> orderEntity.setValidParticipants(true);
            case "auth.participants.not.verified" -> orderEntity.setValidParticipants(false);
            case "inventory.item.reserved" -> orderEntity.setValidItem(true);
            case "inventory.item.not_available" -> orderEntity.setValidItem(false);
            case "wallet.balance.valid" -> orderEntity.setValidBalance(true);
            case "wallet.balance.insufficient" -> orderEntity.setValidBalance(false);
            default -> log.warn("Unknown topic: {}", topic);
        }
        return orderRepository.save(orderEntity);
    }

    @Transactional
    @Override
    public void updateOrder(Long orderId, LocalDateTime paidAt) {
        orderRepository.updatePaidAtById(orderId, LocalDateTime.now());
    }

    @Override
    public void updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = findOrderById(orderId);
        order.setStatus(status);
        orderRepository.saveAndFlush(order);
    }

    @Override
    public OrderResponse getOrderById(Long orderId) {
        Order order = findOrderById(orderId);
        return mapper.toResponse(order);
    }

    @Override
    public OrderTitleResponse getOrderTitleById(Long orderId) {
        Order order = findOrderById(orderId);
        return OrderTitleResponse.builder()
                .orderId(order.getId())
                .itemTitle(order.getItemTitle())
                .build();
    }

    @Override
    public List<OrderResponse> getAllOrdersAsSeller(Long userId) {
        List<Order> orders = orderRepository.findAllBySellerId(userId);
        return convertToDtoList(orders);
    }

    @Override
    public List<OrderResponse> getAllOrdersAsBuyer(Long userId) {
        List<Order> orders = orderRepository.findAllByBuyerId(userId);
        return convertToDtoList(orders);
    }

    @Override
    public Order findOrderById(Long orderId) {
        return orderRepository.findById(orderId).orElseThrow(
                () -> new ResourceNotFoundException("Order with id " + orderId + " doesn't exist!")
        );
    }

    private List<OrderResponse> convertToDtoList(List<Order> orders) {
        return orders.stream().map(mapper::toResponse).toList();
    }

}
