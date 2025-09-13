package com.example.auth_service.exception;

import org.springframework.http.HttpStatus;

public class UsernameAlreadyTakenException extends RuntimeException {
    public UsernameAlreadyTakenException(HttpStatus httpStatus, String message) {
        super(message);
    }
}
