package com.example.user_service.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferRequest(Long fromUserId, Long toUserId, BigDecimal amount, UUID refId) {}
