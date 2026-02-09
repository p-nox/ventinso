package com.example.user_service.dto.request;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferRequest(Long fromUserId, Long toUserId, BigDecimal amount, UUID refId) {}
