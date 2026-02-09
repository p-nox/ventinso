package com.example.inventory_preview_service.listener;

import com.example.inventory_preview_service.service.PreviewService;
import com.example.inventory_service.event.ItemCreateUpdateEvent;
import com.example.inventory_preview_service.event.UserLookUpEvent;
import com.example.inventory_service.event.WatcherUpdateEvent;
import com.example.user_service.event.UserRatingUpdateEvent;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
@Slf4j
public class PreviewEventListener {

    private final PreviewService previewService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = {"inventory.item.updated", "inventory.item.created"})
    public void onItemUpdated(ItemCreateUpdateEvent event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        previewService.updateOrCreateItemPreviewFromEvent(event);
        if ("inventory.item.created".equals(topic)) {
            UserLookUpEvent userUpdateEvent = UserLookUpEvent.builder()
                    .userId(event.getUserId())
                    .build();
            kafkaTemplate.send("preview.user.lookup.requested", userUpdateEvent);
        }
    }

    @KafkaListener(topics = {"inventory.item.deleted"})
    public void onItemDeleted(Long itemId) {
        previewService.deleteItem(itemId);
    }

    @KafkaListener(topics = "user.lookup.completed")
    public void onUserLookUp(UserLookUpEvent event) {
        previewService.updateItemFromUserEvent(event);
    }

    @KafkaListener(topics = "inventory.item.status.updated")
    public void onItemStatusUpdated(ItemCreateUpdateEvent event) {
        previewService.updateItemStatus(event);
    }

    @KafkaListener(topics = {"inventory.item.watchers.updated"})
    public void onItemWatchersUpdated(WatcherUpdateEvent event) {
        previewService.updateItemWatchers(event);
    }

    @KafkaListener(topics = "inventory.item.preference.updated")
    public void onItemPreferenceUpdated(ItemCreateUpdateEvent event) {
        previewService.updateItemPreference(event);
    }

    @KafkaListener(topics = "user.rating.updated")
    public void onUserRatingUpdated(UserRatingUpdateEvent event) { previewService.updateRatingsFromUserEvent(event); }

}