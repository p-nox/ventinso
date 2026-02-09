package com.example.user_service.controller;

import com.example.user_service.dto.request.TransferRequest;
import com.example.user_service.dto.response.WalletResponse;
import com.example.user_service.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
@Tag(name = "Wallet", description = "Wallet operations and balance management")
public class WalletController {

    private final WalletService walletService;

    @PostMapping("/transfer")
    @Operation(summary = "Transfer credits", description = "Transfer funds from one user wallet to another")
    public ResponseEntity<String> transfer(@RequestBody TransferRequest dto) {
        walletService.transfer(dto.fromUserId(), dto.toUserId(), dto.amount());
        return ResponseEntity.ok("Transfer completed");
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get wallet balance", description = "Retrieve the wallet balance of a specific user")
    public ResponseEntity<WalletResponse> getBalance(
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        WalletResponse response = walletService.getBalance(userId);
        return ResponseEntity.ok(response);
    }
}