package com.example.inventory_service.service.implementation;

import com.example.inventory_service.entity.Item;
import com.example.inventory_service.entity.ItemReservation;
import com.example.inventory_service.enums.ItemStatus;
import com.example.inventory_service.exception.ResourceNotFoundException;
import com.example.inventory_service.service.InventoryService;
import com.example.inventory_service.service.ItemReservationService;
import com.example.order_service.event.OrderEvent;
import com.example.user_service.event.UserWatchersUpdateEvent;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Slf4j
public class EventHandlerService {

    private final ItemReservationService itemReservationService;
    private final InventoryService inventoryService;
    private final KafkaTemplate<String, OrderEvent> kafkaTemplate;

    public void handleOrderCreated(OrderEvent event) {
        try {
            Item item = inventoryService.findItemById(event.getItemId());
            boolean isValid = inventoryService.isItemValid(item, event);
            if (isValid) {
                itemReservationService.createReservation(event.getItemId(), event.getId());
                kafkaTemplate.send("inventory.item.reserved", event);
            } else {
                kafkaTemplate.send("inventory.item.not_available", event);
            }
        } catch (ResourceNotFoundException e) {
            log.warn("Item {} not found. Publishing not-available event.", event.getItemId());
            kafkaTemplate.send("inventory.item.not_available", event);
        }
    }

    public void handleOrderCancelled(OrderEvent event) {
        ItemReservation itemReservation = itemReservationService
                .getByItemIdAndOrderId(event.getItemId(), event.getId());

        if (itemReservation != null) {
            itemReservationService.cancelReservation(itemReservation);
            inventoryService.updateItemStatus(event.getItemId(), ItemStatus.ACTIVE.name());
            kafkaTemplate.send("inventory.item.unreserved", event);
        }
    }

    public void handleOrderCompleted(OrderEvent event) {
        ItemReservation itemReservation = itemReservationService
                .getByItemIdAndOrderId(event.getItemId(), event.getId());
        itemReservationService.cancelReservation(itemReservation);
        inventoryService.updateItemStatus(event.getItemId(), ItemStatus.SOLD.name());
        kafkaTemplate.send("inventory.item.sold", event);
    }

    public void handleItemWatchersUpdate(UserWatchersUpdateEvent event){
        inventoryService.updateWatchersCount(event.getItemId(), event.getDelta());
    }
}