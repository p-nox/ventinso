package com.example.auth_service.listener;

import com.example.auth_service.exception.ResourceNotFoundException;
import com.example.auth_service.service.AuthService;
import com.example.order_service.event.OrderEvent;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
@Slf4j
public class OrderEventListener {

    private final AuthService authService;
    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    @KafkaListener(topics = "order.created")
    public void onOrderCreate(OrderEvent event) {

        Long sellerId = event.getSellerId();
        String sellerUsername = event.getSellerUsername();
        Long buyerId = event.getBuyerId();
        String buyerUsername = event.getBuyerUsername();

        try {
            if (authService.areParticipantsValid(sellerId, sellerUsername, buyerId, buyerUsername)) {
                kafkaTemplate.send("auth.participants.verified", event);
            } else {
                kafkaTemplate.send("auth.participants.not.verified", event);
            }
        } catch (ResourceNotFoundException e) {
            kafkaTemplate.send("auth.participants.not.verified", event);
        }
    }
}