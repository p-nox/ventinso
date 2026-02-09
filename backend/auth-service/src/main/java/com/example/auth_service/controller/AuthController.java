package com.example.auth_service.controller;

import com.example.auth_service.dto.*;
import com.example.auth_service.security.JwtTokenProvider;
import com.example.auth_service.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@AllArgsConstructor
@Slf4j
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "User authentication, registration, and profile management")
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user by ID", description = "Retrieve authentication details of a specific user by ID")
    public ResponseEntity<AuthResponse> getUserById(
            @Parameter(description = "ID of the user") @PathVariable Long userId) {
        AuthResponse response = authService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("user/{userId}/password")
    @Operation(summary = "Change password", description = "Update the password of a specific user")
    public ResponseEntity<Void> passwordChange(
            @Parameter(description = "ID of the user") @PathVariable Long userId,
            @Parameter(description = "Updated password details") @RequestBody AuthProfileUpdateRequest updatedPassword) {
        authService.passwordChange(userId, updatedPassword);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("user/{userId}/email")
    @Operation(summary = "Change email", description = "Update the email of a specific user")
    public ResponseEntity<Void> emailChange(
            @Parameter(description = "ID of the user") @PathVariable Long userId,
            @Parameter(description = "Updated email details") @RequestBody AuthProfileUpdateRequest request) {
        authService.emailChange(userId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/register")
    @Operation(summary = "Register new user", description = "Register a new user with username, email, and password")
    public ResponseEntity<?> register(
            @Parameter(description = "Registration details") @RequestBody RegisterRequest registerDto) {
        log.info("Register request received: {}", registerDto);
        Object response = authService.register(registerDto);
        log.info("Register response: {}", response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticate a user and return a JWT token")
    public ResponseEntity<JwtResponse> login(
            @Parameter(description = "Login credentials") @RequestBody LoginRequest loginDto) {
        log.info("Login request received: {}", loginDto.getUsernameOrEmail());
        JwtResponse response = authService.login(loginDto);
        log.info("Login response: {} {}", response.getToken(), response.getUserId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout", description = "Logs out user, cleans up SSE/WebSocket and blacklists token")
    public ResponseEntity<Void> logout(HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        String token = authHeader.substring(7);

        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Long userId = jwtTokenProvider.getUserId(token);

        authService.logout(userId, token);

        return ResponseEntity.ok().build();
    }


}
