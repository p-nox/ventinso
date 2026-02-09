package com.example.user_service.service;

import com.example.user_service.dto.response.WalletResponse;

import java.math.BigDecimal;

public interface WalletService {

    WalletResponse getBalance(Long userId);

    void depositToWallet(Long userId, BigDecimal amount);

    boolean checkAndReserveBalance(Long userId, BigDecimal amount);

    void createWalletForUser(Long userId);

    void transfer(Long fromUserId, Long toUserId, BigDecimal amount);

}