package com.example.payment_service.service;

import com.example.payment_service.dto.PaymentResponse;
import com.example.payment_service.entity.Payment;
import com.example.payment_service.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    public List<PaymentResponse> getPaymentsForUser(Long userId) {
        List<Payment> payments = paymentRepository.findByUserId(userId);

        return payments.stream()
                .map(payment -> {
                    String maskedId = String.format("TX%03d", payment.getId());

                    log.info("Mapping payment id {} -> maskedId {} for userId {}",
                            payment.getId(), maskedId, userId);

                    return PaymentResponse.builder()
                            .id(maskedId)
                            .type(payment.getTransactionType().name().toLowerCase())   // deposit, withdrawal
                            .status(payment.getState().name().toLowerCase())         // pending, completed, failed
                            .amount(payment.getAmount())
                            .paymentUrl(payment.getUrl())
                            .date(payment.getCreatedAt().format(formatter))
                            .build();
                })
                .collect(Collectors.toList());
    }
}