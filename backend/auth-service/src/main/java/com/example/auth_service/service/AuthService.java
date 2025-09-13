package com.example.auth_service.service;

import com.example.auth_service.dto.*;

public interface AuthService {

    AuthResponse getUserById(Long userId);

    void passwordChange(Long userId, AuthProfileUpdateRequest updatedPassword);

    void emailChange(Long userId, AuthProfileUpdateRequest updatedEmail);

    JwtResponse login(LoginRequest loginDto);

    String register(RegisterRequest registerDto);

    boolean areParticipantsValid(Long sellerId, String sellerUsername, Long buyerId, String buyerUsername);

}
