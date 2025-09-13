package com.example.inventory_service.listener;

import com.example.inventory_service.service.implementation.EventHandlerService;
import com.example.order_service.event.OrderEvent;
import com.example.user_service.event.UserWatchersUpdateEvent;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
@Slf4j
public class InventoryEventListener {

    private final EventHandlerService eventHandlerService;

    @KafkaListener(topics = "order.created")
    public void onOrderCreated(OrderEvent event) {
        eventHandlerService.handleOrderCreated(event);
    }

    @KafkaListener(topics = "order.cancelled")
    public void onOrderCancelled(OrderEvent event){
        eventHandlerService.handleOrderCancelled(event);
    }

    @KafkaListener(topics = "order.completed")
    public void onOrderCompleted(OrderEvent event){
        eventHandlerService.handleOrderCompleted(event);
    }

    @KafkaListener(topics = "user.item.watchers.update")
    public void onItemWatchersUpdate(UserWatchersUpdateEvent event){ eventHandlerService.handleItemWatchersUpdate(event); }

}
