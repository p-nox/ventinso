package com.example.payment_service.service;


import com.example.payment_service.entity.Payment;
import com.example.payment_service.enums.PaymentMethod;
import com.example.payment_service.enums.PaymentState;
import com.example.payment_service.enums.TransactionType;
import com.example.payment_service.event.PaymentEvent;
import com.example.payment_service.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.model.checkout.Session;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@Slf4j
public class StripeService {

    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, PaymentEvent> kafkaTemplate;

    public StripeService(PaymentRepository paymentRepository, KafkaTemplate<String, PaymentEvent> kafkaTemplate) {
        this.paymentRepository = paymentRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Value("${stripe.api.key}")
    private String stripeApiKey;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeApiKey;
    }


    public String createWalletDepositSession(Long userId, BigDecimal amount, String returnUrl) throws StripeException {
        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(returnUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(returnUrl + "?canceled=true")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("eur")
                                                .setUnitAmount(amountInCents)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Wallet Deposit")
                                                                .build())
                                                .build())
                                .setQuantity(1L)
                                .build())
                // Προσθήκη metadata
                .putMetadata("userId", String.valueOf(userId))
                .build();

        Session session = Session.create(params);
        Payment payment = Payment.builder()
                .amount(amount)
                .userId(userId)
                .state(PaymentState.PENDING)
                .url(session.getUrl())
                .stripeSessionId(session.getId())
                .transactionType(TransactionType.DEPOSIT)
                .paymentMethod(PaymentMethod.STRIPE)
                .build();

        paymentRepository.save(payment);
        log.info("Session metadata: {}", session.getMetadata());
        return session.getUrl();
    }


}
