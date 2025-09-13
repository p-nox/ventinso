package com.example.user_service.service.implementation;

import com.example.auth_service.event.EmailUpdateEvent;
import com.example.auth_service.event.NewUserEvent;
import com.example.inventory_preview_service.event.UserLookUpEvent;
import com.example.inventory_service.event.PriceUpdateEvent;
import com.example.order_service.event.OrderEvent;
import com.example.payment_service.event.PaymentEvent;
import com.example.user_service.entity.User;
import com.example.user_service.service.UserService;
import com.example.user_service.service.WalletService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@AllArgsConstructor
@Slf4j
public class EventHandlerService {

    private final UserService userService;
    private final WalletService walletService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void handleUpdateWatcherListEvent(PriceUpdateEvent event) {
        List<Long> watchers = userService.getWatchersForItem(event.getItemId());
        event.setWatchers(watchers);
        kafkaTemplate.send("user.watchers.prepared", event);
    }

    public void handleUserLookup(UserLookUpEvent event) {
        User user = userService.findUserById(event.getUserId());
        event.setUsername(user.getUsername());
        event.setAvgOverallRating(user.getAvgOverallRating());
        event.setTotalRatings(user.getTotalRatings());
        kafkaTemplate.send("user.lookup.completed", event);
    }

    public void handleNewRegisteredUser(NewUserEvent event) {
        userService.createNewUserProfile(event);
        walletService.createWalletForUser(event.getUserId());
    }

    public void handleUserDeleted(NewUserEvent event) {
        Long userId = event.getUserId();
        userService.deleteUser(userId);
       // walletService.delete(event.getUserId());
    }

    public void handleUserEmailUpdateEvent(EmailUpdateEvent event) {
        Long userId = event.getUserId();
        String updatedEmail = event.getEmail();
        userService.updateUserField(userId, updatedEmail, User::getEmail, User::setEmail);
    }

    public void handleOrderCreatedEvent(OrderEvent event) {
        Long userId = event.getBuyerId();
        BigDecimal price = event.getPrice();
        if(walletService.checkAndReserveBalance(userId, price)){
            event.setPaidAt(LocalDateTime.now());
            kafkaTemplate.send("wallet.balance.valid", event);
        } else {
            kafkaTemplate.send("wallet.balance.insufficient", event);
        }
    }

    public void handleOrderConfirmedEvent(OrderEvent event) {
        Long buyerId = event.getBuyerId();
        Long sellerId = event.getSellerId();
        BigDecimal amount = event.getPrice();
        try {
            walletService.transfer(buyerId, sellerId, amount);
            log.info("Wallet transfer successful for orderId={}", event.getId());
            kafkaTemplate.send("wallet.transfer.completed", event);
        } catch (Exception ex) {
            log.error("Wallet transfer failed for orderId={}, reason: {}", event.getId(), ex.getMessage(), ex);
            kafkaTemplate.send("wallet.transfer.failed", event);
        }
    }

    public void handleOrderCompletedEvent(OrderEvent event) {
        Long userId = event.getSellerId();
        LocalDateTime arrivedAt = event.getArrivedAt();
        LocalDateTime sendAt = event.getSentAt();
        userService.updateSaleStats(userId, sendAt, arrivedAt);
    }

    public void handlePaymentDepositCompleted(PaymentEvent event) {
        Long userId = event.getUserId();
        BigDecimal amount = event.getAmount();
        walletService.depositToWallet(userId, amount);
    }

}
