package com.example.notification_service.listener;

import com.example.auth_service.event.AuthNotificationEvent;
import com.example.auth_service.event.NewUserEvent;
import com.example.inventory_service.event.PriceUpdateEvent;
import com.example.notification_service.dto.NotificationResponse;
import com.example.notification_service.entity.Notification;
import com.example.notification_service.entity.NotificationSettings;
import com.example.notification_service.enums.EventAction;
import com.example.notification_service.repository.NotificationSettingsRepository;
import com.example.notification_service.service.NotificationFactory;
import com.example.notification_service.service.notificationSettings.NotificationSettingsService;
import com.example.notification_service.service.notification.NotificationService;
import com.example.notification_service.service.SseNotificationService;
import com.example.order_service.event.OrderEvent;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationFactory notificationFactory;
    private final NotificationService notificationService;
    private final NotificationSettingsService notificationSettingsService;
    private final SseNotificationService sseNotificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationSettingsRepository notificationPreferencesRepository;


    @KafkaListener(topics = "auth.user.registered")
    public void onUserRegistered(NewUserEvent event) {
        NotificationSettings notificationPreferences = NotificationSettings.withDefaults(event.getUserId());
        notificationPreferencesRepository.save(notificationPreferences);
    }

    @KafkaListener(topics = "auth.email.updated.notification")
    public void onEmailUpdate(AuthNotificationEvent event) {
        Notification authNotification = notificationFactory.buildAuthNotification(event, EventAction.EMAIL_UPDATE);
        NotificationResponse response = notificationService.saveNotification(authNotification);
       // messagingTemplate.convertAndSend("/topic/notifications/" + response.getUserId(), response);

        sseNotificationService.sendNotification(response.getUserId(), response);
    }

    @KafkaListener(topics = "auth.password.updated.notification")
    public void onPasswordUpdate(AuthNotificationEvent event) {
        Notification authNotification = notificationFactory.buildAuthNotification(event, EventAction.PASSWORD_UPDATE);
        NotificationResponse response = notificationService.saveNotification(authNotification);
        //messagingTemplate.convertAndSend("/topic/notifications/" + response.getUserId(), response);

        sseNotificationService.sendNotification(response.getUserId(), response);
    }

    @KafkaListener(topics = "user.watchers.prepared")
    public void onPriceUpdate(PriceUpdateEvent event) {
        log.info("Entering listener: user.price.update.ready for itemId={}", event.getItemId());

        List<Notification> priceUpdateNotifications =
                notificationFactory.buildPriceUpdateNotification(event, EventAction.PRICE_UPDATE);
        List<NotificationResponse> responses = notificationService.saveNotifications(priceUpdateNotifications);


        for (NotificationResponse response : responses) {
            if (!notificationSettingsService.isEnabled(response.getUserId(), EventAction.PRICE_UPDATE, "desktop")) {
                log.info("User {} has desktop PRICE_UPDATE notifications disabled, skipping", response.getUserId());
                continue;
            }

            // SSE notification (Desktop)
            sseNotificationService.sendNotification(response.getUserId(), response);
        }
    }

    @KafkaListener(topics = "order.completed")
    public void onOrderCompleted(OrderEvent event) {
        // Seller's notification
        Notification sellerOrderNotification = notificationFactory.buildOrderNotification(event, EventAction.ORDER_COMPLETED, event.getSellerId());
        NotificationResponse sellerResponse = notificationService.saveNotification(sellerOrderNotification);
        //messagingTemplate.convertAndSend("/topic/notifications/" + sellerResponse.getUserId(), sellerResponse);
        sseNotificationService.sendNotification(sellerResponse.getUserId(), sellerResponse);
    }

    @KafkaListener(topics = "order.cancelled")
    public void onOrderCancelled(OrderEvent event) {
        Long[] userIds = { event.getBuyerId(), event.getSellerId() };
        for (Long userId : userIds) {
            Notification notification = notificationFactory.buildOrderNotification(event, EventAction.ORDER_CANCELLED, userId);
            NotificationResponse response = notificationService.saveNotification(notification);
           // messagingTemplate.convertAndSend("/topic/notifications/" + response.getUserId(), response);
            sseNotificationService.sendNotification(response.getUserId(), response);
        }
    }

    @KafkaListener(topics = "order.confirmed")
    public void onOrderConfirmed(OrderEvent event) {
        Notification sellerOrderNotification = notificationFactory.buildOrderNotification(event, EventAction.ORDER_CONFIRMED, event.getSellerId());
        NotificationResponse response = notificationService.saveNotification(sellerOrderNotification);
       // messagingTemplate.convertAndSend("/topic/notifications/" + response.getUserId(), response);
        sseNotificationService.sendNotification(response.getUserId(), response);
    }

}
