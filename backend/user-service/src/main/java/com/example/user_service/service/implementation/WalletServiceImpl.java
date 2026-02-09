package com.example.user_service.service.implementation;

import com.example.user_service.dto.response.WalletResponse;
import com.example.user_service.entity.Wallet;
import com.example.user_service.exception.ResourceNotFoundException;
import com.example.user_service.repository.WalletRepository;
import com.example.user_service.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;

    @Transactional(readOnly = true)
    @Override
    public WalletResponse getBalance(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Wallet not found"));
        return WalletResponse.builder()
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .build();
    }

    @Transactional
    @Override
    public void depositToWallet(Long userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be greater than zero");
        }

        Wallet wallet = getWallet(userId);
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);
    }

    @Transactional
    @Override
    public boolean checkAndReserveBalance(Long userId, BigDecimal amount) {
        Wallet wallet = getWallet(userId);
        boolean reserved = wallet.reserveAmount(amount);

        if (reserved) {
            walletRepository.save(wallet);
        }
        return reserved;
    }

    @Transactional
    @Override
    public void createWalletForUser(Long userId) {
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .build();
        walletRepository.save(wallet);
    }

    @Override
    @Transactional
    public void transfer(Long fromUserId, Long toUserId, BigDecimal amount) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }

        Wallet fromWallet = getWallet(fromUserId);
        Wallet toWallet = getWallet(toUserId);

        if (fromWallet.getReservedBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient balance in sender's wallet");
        }
        toWallet.setBalance(toWallet.getBalance().add(amount));
        fromWallet.confirmTransfer(amount);

        walletRepository.save(fromWallet);
        walletRepository.save(toWallet);
    }


    private Wallet getWallet(Long userId) {
        return walletRepository.findByUserIdForUpdate(userId).orElseThrow(
                () -> new ResourceNotFoundException("Wallet for user " + userId + " not found")
        );
    }
}
