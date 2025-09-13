package com.example.user_service.listener;

import com.example.auth_service.event.EmailUpdateEvent;
import com.example.auth_service.event.NewUserEvent;
import com.example.inventory_preview_service.event.UserLookUpEvent;
import com.example.inventory_service.event.PriceUpdateEvent;
import com.example.order_service.event.OrderEvent;
import com.example.payment_service.event.PaymentEvent;
import com.example.user_service.service.implementation.EventHandlerService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
@Slf4j
public class UserEventListener {

    private final EventHandlerService eventHandlerService;

    @KafkaListener(topics = "inventory.item.price.updated")
    public void onPriceUpdate(PriceUpdateEvent event) {
        eventHandlerService.handleUpdateWatcherListEvent(event);
    }

    @KafkaListener(topics = "preview.user.lookup.requested")
    public void onUserLookupRequest(UserLookUpEvent event) {
        eventHandlerService.handleUserLookup(event);
    }

    @KafkaListener(topics = "auth.user.registered")
    public void onNewRegisteredUser(NewUserEvent event) {
        eventHandlerService.handleNewRegisteredUser(event);
    }

    @KafkaListener(topics = "auth.user.deleted")
    public void onUserDeleted(NewUserEvent event) {
        eventHandlerService.handleUserDeleted(event);
    }

    @KafkaListener(topics = "auth.email.updated")
    public void onEmailUpdate(EmailUpdateEvent event) {
        eventHandlerService.handleUserEmailUpdateEvent(event);
    }

    @KafkaListener(topics = "order.created")
    public void onOrderCreated(OrderEvent event) {
        eventHandlerService.handleOrderCreatedEvent(event);
    }

    // εδω οταν κανει ο seller accept δεσμευω το ποσο
    @KafkaListener(topics = "order.confirmed")
    public void onOrderConfirmed(OrderEvent event) {
        eventHandlerService.handleOrderConfirmedEvent(event);
    }

    @KafkaListener(topics = "order.completed")
    public void onOrderCompleted(OrderEvent event) {
        eventHandlerService.handleOrderCompletedEvent(event);
    }

    @KafkaListener(topics = "payment.deposit.completed")
    public void onPaymentDepositCompleted(PaymentEvent event) { eventHandlerService.handlePaymentDepositCompleted(event); }
}