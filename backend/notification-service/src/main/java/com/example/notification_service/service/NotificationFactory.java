package com.example.notification_service.service;

import com.example.auth_service.event.AuthNotificationEvent;
import com.example.inventory_service.event.PriceUpdateEvent;
import com.example.notification_service.entity.Notification;
import com.example.notification_service.enums.EventAction;
import com.example.notification_service.enums.NotificationType;
import com.example.order_service.event.OrderEvent;
import lombok.AllArgsConstructor;

import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;

@Component
@AllArgsConstructor
public class NotificationFactory {


    public List<Notification> buildPriceUpdateNotification(PriceUpdateEvent e, EventAction action) {

        NumberFormat nf = NumberFormat.getNumberInstance(Locale.forLanguageTag("el-GR"));
        nf.setMaximumFractionDigits(0);
        nf.setMinimumFractionDigits(0);

        String oldPriceStr = nf.format(e.getOldPrice());
        String newPriceStr = nf.format(e.getPrice());

        String message = "Price dropped! \"" + e.getTitle() + "\" is now available from "
                + oldPriceStr + " to " + newPriceStr + ". Don't miss out!";

        return e.getWatchers().stream()
                .map(watcherId -> Notification.builder()
                        .itemId(e.getItemId())
                        .message(message)
                        .type(NotificationType.INVENTORY)
                        .action(action)
                        .thumbnail(e.getThumbnail())
                        .redirectUrl("/item/" + e.getItemId())
                        .userId(watcherId)
                        .isRead(false)
                        .build())
                .toList();
    }


    public Notification buildItemSoldNotification(OrderEvent e, EventAction action) {
        String message = "Someone just bought \"" + e.getItemTitle() + "\". Check it out!";

        return Notification.builder()
                .itemId(e.getItemId())
                .message(message)
                .type(NotificationType.INVENTORY)
                .action(action)
                .redirectUrl("/item/" + e.getItemId())
                .userId(e.getSellerId())
                .isRead(false)
                .build();
    }

    public Notification buildAuthNotification(AuthNotificationEvent e, EventAction action) {
        String message = switch (action) {
            case EMAIL_UPDATE -> "Your email address was successfully updated.";
            case PASSWORD_UPDATE -> "Your password was successfully changed.";
            default -> throw new IllegalArgumentException("Unsupported auth event: " + action);
        };

        return Notification.builder()
                .userId(e.getUserId())
                .message(message)
                .type(NotificationType.SECURITY)
                .action(action)
                .redirectUrl("/user/" + e.getUserId())
                .isRead(false)
                .build();
    }

    public Notification buildOrderNotification(OrderEvent e, EventAction action, Long userId) {
        String itemTitle = e.getItemTitle();
        String message = switch (action) {
            case ORDER_COMPLETED -> "Your order for \"" + itemTitle + "\" has been successfully completed! You can now rate the buyer.";
            case ORDER_CANCELLED -> "Your order for \"" + itemTitle + "\" has been cancelled.";
            case ORDER_CONFIRMED -> e.getBuyerUsername() + " bought " + itemTitle + ". Confirm shipment now.";
            default -> throw new IllegalArgumentException("Unsupported order event: " + action);
        };

        return Notification.builder()
                .userId(userId)
                .message(message)
                .type(NotificationType.ORDER)
                .action(action)
                .redirectUrl("/order/" + e.getId())
                .isRead(false)
                .build();
    }
}
