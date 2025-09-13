package com.example.auth_service.exception;

import org.springframework.http.HttpStatus;

public class EmailAlreadyInUseException extends RuntimeException {
    public EmailAlreadyInUseException(HttpStatus httpStatus, String message) {
        super(message);
    }
}
