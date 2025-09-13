package com.example.order_service.listener;

import com.example.order_service.event.OrderEvent;
import com.example.order_service.service.EventHandlerService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import com.example.user_service.event.RatingEvent;

@Component
@AllArgsConstructor
@Slf4j
public class OrderEventListener {

   private final EventHandlerService eventHandlerService;

    @KafkaListener(topics = "wallet.transfer.completed")
    public void onPaymentCompleted(OrderEvent event){
       eventHandlerService.handlePaymentCompleted(event);
    }

    @KafkaListener(topics = "wallet.transfer.failed")
    public void onPaymentFailed(OrderEvent event){
        eventHandlerService.handlePaymentFailed(event);
    }

    @KafkaListener(topics = {
            "auth.participants.verified",
            "auth.participants.not.verified",
            "inventory.item.reserved",
            "inventory.item.not_available",
            "wallet.balance.valid",
            "wallet.balance.insufficient"
    })
    public void onOrderValidation(ConsumerRecord<String, OrderEvent> incomingRecord) {
        eventHandlerService.handleOrderValidation(incomingRecord.topic(), incomingRecord.value());
    }

    @KafkaListener(topics = "user.rating.submitted")
    public void onRatingsSubmitted(RatingEvent event){
        eventHandlerService.handleRatingSubmitted(event);
    }

}

