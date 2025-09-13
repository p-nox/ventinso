package com.example.notification_service.listener;

import com.example.auth_service.event.AuthNotificationEvent;
import com.example.inventory_service.event.PriceUpdateEvent;
import com.example.notification_service.dto.NotificationResponse;
import com.example.notification_service.entity.Notification;
import com.example.notification_service.enums.EventAction;
import com.example.notification_service.service.NotificationFactory;
import com.example.notification_service.service.NotificationPreferencesService;
import com.example.notification_service.service.NotificationService;
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
    private final NotificationPreferencesService notificationPreferencesService;
    private final SimpMessagingTemplate messagingTemplate;


    @KafkaListener(topics = "auth.email.updated.notification")
    public void onEmailUpdate(AuthNotificationEvent event) {
        log.info("Entering listener: auth.email.updated.notification for userId={}", event.getUserId());

        if (!notificationPreferencesService.isEnabled(event.getUserId(), EventAction.EMAIL_UPDATE)) {
            log.info("User {} has disabled EMAIL_UPDATE notifications, skipping", event.getUserId());
            return;
        }

        Notification authNotification = notificationFactory.buildAuthNotification(event, EventAction.EMAIL_UPDATE);
        NotificationResponse response = notificationService.saveNotification(authNotification);
        messagingTemplate.convertAndSend("/topic/notifications/" + response.getUserId(), response);
    }

    @KafkaListener(topics = "auth.password.updated.notification")
    public void onPasswordUpdate(AuthNotificationEvent event) {
        log.info("Entering listener: auth.password.updated.notification for userId={}", event.getUserId());

//        if (!notificationPreferencesService.isEnabled(event.getUserId(), EventAction.PASSWORD_UPDATE)) {
//            log.info("User {} has disabled EMAIL_UPDATE notifications, skipping", event.getUserId());
//            return;
//        }

        Notification authNotification = notificationFactory.buildAuthNotification(event, EventAction.PASSWORD_UPDATE);
        NotificationResponse response = notificationService.saveNotification(authNotification);
        messagingTemplate.convertAndSend("/topic/notifications/" + response.getUserId(), response);
    }

    @KafkaListener(topics = "user.watchers.prepared")
    public void onPriceUpdate(PriceUpdateEvent event) {
        log.info("Entering listener: user.price.update.ready for itemId={}", event.getItemId());

        List<Notification> authNotification = notificationFactory.buildPriceUpdateNotification(event, EventAction.PRICE_UPDATE);
        List<NotificationResponse> responses = notificationService.saveNotifications(authNotification);
        responses.forEach(response ->
                messagingTemplate.convertAndSend("/topic/notifications/" + response.getUserId(), response)
        );
    }

    @KafkaListener(topics = "order.completed")
    public void onOrderCompleted(OrderEvent event) {
        log.info("Entering listener: order.completed for orderId={}", event.getId());
        // Seller's notification
        Notification sellerOrderNotification = notificationFactory.buildOrderNotification(event, EventAction.ORDER_COMPLETED, event.getSellerId());
        NotificationResponse sellerResponse = notificationService.saveNotification(sellerOrderNotification);
        messagingTemplate.convertAndSend("/topic/notifications/" + sellerResponse.getUserId(), sellerResponse);
    }

    @KafkaListener(topics = "order.cancelled")
    public void onOrderCancelled(OrderEvent event) {
        log.info("Entering listener: order.cancelled for orderId={}", event.getId());

        Long[] userIds = { event.getBuyerId(), event.getSellerId() };
        for (Long userId : userIds) {
            Notification notification = notificationFactory.buildOrderNotification(event, EventAction.ORDER_CANCELLED, userId);
            NotificationResponse response = notificationService.saveNotification(notification);
            messagingTemplate.convertAndSend("/topic/notifications/" + response.getUserId(), response);
        }
    }

    @KafkaListener(topics = "order.confirmed")
    public void onOrderConfirmed(OrderEvent event) {
        log.info("Entering listener: order.confirmed for orderId={}", event.getId());
        Notification sellerOrderNotification = notificationFactory.buildOrderNotification(event, EventAction.ORDER_CONFIRMED, event.getSellerId());
        NotificationResponse response = notificationService.saveNotification(sellerOrderNotification);
        messagingTemplate.convertAndSend("/topic/notifications/" + response.getUserId(), response);
    }

}
