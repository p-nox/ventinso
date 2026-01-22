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
        log.info("Received OrderEvent: id={}, buyerId={}, sellerId={}, itemId={}, price={}",
                event.getId(), event.getBuyerId(), event.getSellerId(), event.getItemId(), event.getPrice());

        try {
            Item item = inventoryService.findItemById(event.getItemId());

            // Safe logging, χωρίς να καλούμε toString() σε lazy-loaded fields
            log.info("Found item: id={}, title={}, condition={}, userId={}",
                    item.getId(), item.getTitle(), item.getCondition(), item.getUserId());

            boolean isValid = inventoryService.isItemValid(item, event);
            log.info("Item validity check for event {}: {}", event.getId(), isValid);

            if (isValid) {
                log.info("Item is valid. Creating reservation for itemId {} and orderId {}", event.getItemId(), event.getId());
                itemReservationService.createReservation(event.getItemId(), event.getId());
                log.info("Reservation created. Sending 'inventory.item.reserved' event");
                kafkaTemplate.send("inventory.item.reserved", event);
            } else {
                log.warn("Item {} is not valid for order {}. Sending 'inventory.item.not_available'", event.getItemId(), event.getId());
                kafkaTemplate.send("inventory.item.not_available", event);
            }
        } catch (ResourceNotFoundException e) {
            log.warn("Item {} not found for order {}. Publishing 'not_available' event.", event.getItemId(), event.getId(), e);
            kafkaTemplate.send("inventory.item.not_available", event);
        } catch (Exception e) {
            log.error("Unexpected error handling OrderEvent {}: {}", event.getId(), e.getMessage(), e);
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