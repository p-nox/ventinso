package com.example.order_service.service;

import com.example.order_service.entity.Order;
import com.example.order_service.enums.OrderAction;
import com.example.order_service.enums.OrderStatus;
import com.example.order_service.event.OrderEvent;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.example.user_service.event.RatingEvent;

@Slf4j
@Service
@AllArgsConstructor
public class EventHandlerService {

    private final OrderService orderService;
    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;


    public void handlePaymentCompleted(OrderEvent event) {
        orderService.updateOrder(event.getId(), event.getPaidAt());
        updateAndSendEvent(event, OrderStatus.PENDING_DELIVERY, OrderAction.ORDER_COMPLETED, "order.pending.delivery");
    }

    public void handlePaymentFailed(OrderEvent event) {
        updateAndSendEvent(event, OrderStatus.CANCELLED, OrderAction.ORDER_CANCELLED, "order.cancelled");
    }

    public void handleOrderValidation(String topic, OrderEvent event) {
        Order orderEntity = orderService.validateOrder(event.getId(), topic);
        Boolean validItem = orderEntity.getValidItem();
        Boolean validParticipants = orderEntity.getValidParticipants();
        Boolean validBalance = orderEntity.getValidBalance();

        if (validItem == null || validParticipants == null || validBalance == null) {
            log.info("Order {} waiting for all validations. Current state: validItem={}, validParticipants={}, validBalance={}",
                    orderEntity.getId(), validItem, validParticipants, validBalance);
            return;
        }

        boolean isConfirmed = Boolean.TRUE.equals(validItem) && Boolean.TRUE.equals(validParticipants) && Boolean.TRUE.equals(validBalance);
        boolean isCancelled = Boolean.FALSE.equals(validItem) || Boolean.FALSE.equals(validParticipants) || Boolean.FALSE.equals(validBalance);

        if (isConfirmed) {
            updateAndSendEvent(event, OrderStatus.CONFIRMED, OrderAction.ORDER_CONFIRMED, "order.confirmed");
        } else if (isCancelled) {
            log.info("handleOrderValidation: cancelling order {}", orderEntity.getId());
            updateAndSendEvent(event, OrderStatus.CANCELLED, OrderAction.ORDER_CANCELLED, "order.cancelled");
        }
    }

    public void handleRatingSubmitted(RatingEvent event){
        orderService.markOrderRatingSubmitted(event.getOrderId());
    }


    private void updateAndSendEvent(OrderEvent event, OrderStatus status, OrderAction action, String topic) {
        orderService.updateOrderStatus(event.getId(), status);
        event.setAction(action.name());
        kafkaTemplate.send(topic, event);
    }




}
