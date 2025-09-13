package com.example.payment_service.controller;

import com.example.payment_service.entity.Payment;
import com.example.payment_service.enums.PaymentState;
import com.example.payment_service.event.PaymentEvent;
import com.example.payment_service.repository.PaymentRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.headers.Header;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;

@Slf4j
@RestController
@RequestMapping("/stripe")
@Tag(name = "Stripe Webhook", description = "Endpoints for Stripe payment webhooks")
public class StripeWebhookController {

    private final PaymentRepository paymentRepository;
    private final KafkaTemplate<String, PaymentEvent> kafkaTemplate;

    public StripeWebhookController(PaymentRepository paymentRepository,
                                   KafkaTemplate<String, PaymentEvent> kafkaTemplate) {
        this.paymentRepository = paymentRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Value("${stripe.webhook.secret}")
    private String webhookSecret;

    @Operation(
            summary = "Handle Stripe webhook events",
            description = "Processes Stripe webhook events, such as checkout.session.completed, and updates payment state.",
            responses = {
                    @ApiResponse(
                            responseCode = "200",
                            description = "Webhook processed successfully",
                            content = @Content(schema = @Schema(type = "string"))
                    ),
                    @ApiResponse(
                            responseCode = "400",
                            description = "Invalid webhook signature",
                            content = @Content(schema = @Schema(type = "string"))
                    )
            }
    )
    @PostMapping("/webhook")
    public String handleStripeWebhook(
            @Parameter(description = "Stripe signature header", required = true)
            @RequestHeader("Stripe-Signature") String sigHeader,

            @Parameter(description = "Raw webhook payload", required = true)
            @RequestBody String payload) {

        Event event;

        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature: {}", e.getMessage());
            return "";
        }

        log.info("Received Stripe event: {}", event.getType());

        if ("checkout.session.completed".equals(event.getType())) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                JsonNode sessionNode = mapper.readTree(event.getData().getObject().toJson());

                JsonNode metadataNode = sessionNode.get("metadata");
                if (metadataNode == null || metadataNode.get("userId") == null) {
                    log.warn("No userId metadata in session: {}", sessionNode.get("id").asText());
                    return "";
                }

                Long userId = metadataNode.get("userId").asLong();
                String sessionId = sessionNode.get("id").asText();
                log.info("Processing payment for userId: {}, sessionId: {}", userId, sessionId);

                Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                        .orElseThrow(() -> new RuntimeException("Payment not found"));

                payment.setState(PaymentState.COMPLETED);
                paymentRepository.save(payment);
                log.info("Payment marked as COMPLETED: {}", payment.getId());

                PaymentEvent paymentEvent = PaymentEvent.builder()
                        .userId(userId)
                        .amount(payment.getAmount())
                        .paymentId(payment.getId())
                        .build();

                kafkaTemplate.send("payment.deposit.completed", paymentEvent);
                log.info("Sent PaymentEvent to Kafka for userId: {}", userId);

            } catch (Exception e) {
                log.error("Error processing checkout.session.completed: ", e);
            }
        }
        return "";
    }
}
