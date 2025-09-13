package com.example.payment_service.controller;

import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.service.PaymentService;
import com.example.payment_service.service.StripeService;
import com.stripe.exception.StripeException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@AllArgsConstructor
@Slf4j
@Tag(name = "Payments", description = "User payments and wallet deposit management")
public class PaymentController {

    private final StripeService stripeService;
    private final PaymentService paymentService;

    @Operation(
            summary = "Create checkout session for wallet deposit",
            description = "Creates a Stripe checkout session for depositing funds into a user's wallet."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Session created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid parameters"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @PostMapping("/wallet/deposit/{userId}")
    public ResponseEntity<Map<String, String>> payIntent(
            @Parameter(description = "User ID for the deposit") @PathVariable Long userId,
            @Parameter(description = "Deposit amount") @RequestParam BigDecimal amount,
            @Parameter(description = "Return URL after payment completion") @RequestParam String returnUrl
    ) throws StripeException {
        Map<String, String> response = new HashMap<>();
        String checkoutUrl = stripeService.createWalletDepositSession(userId, amount, returnUrl);
        response.put("checkoutUrl", checkoutUrl);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Get all payments of a user",
            description = "Retrieves all payments made by a specific user."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List of user payments retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "User not found")
    })
    @GetMapping("/user/{userId}")
    public List<PaymentResponse> getUserPayments(
            @Parameter(description = "User ID to fetch payments for") @PathVariable Long userId
    ) {
        return paymentService.getPaymentsForUser(userId);
    }
}

