package com.example.chat_service.exception;


import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class OfferActiveException extends RuntimeException {
    public OfferActiveException(String message) {
        super(message);
    }
}
