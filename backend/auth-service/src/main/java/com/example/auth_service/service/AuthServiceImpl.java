package com.example.auth_service.service;

import com.example.auth_service.dto.*;
import com.example.auth_service.entity.Role;
import com.example.auth_service.entity.User;
import com.example.auth_service.enums.RoleType;
import com.example.auth_service.enums.UserStatus;
import com.example.auth_service.event.AuthNotificationEvent;
import com.example.auth_service.event.EmailUpdateEvent;
import com.example.auth_service.event.NewUserEvent;
import com.example.auth_service.exception.EmailAlreadyInUseException;
import com.example.auth_service.exception.ResourceNotFoundException;
import com.example.auth_service.exception.UsernameAlreadyTakenException;
import com.example.auth_service.repository.AuthRepository;
import com.example.auth_service.repository.RoleRepository;
import com.example.auth_service.security.AuthUserDetails;
import com.example.auth_service.security.JwtTokenProvider;
import com.example.auth_service.utils.Mapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final Mapper mapper;
    private final KafkaTemplate<String, Object> kafkaTemplate;


    @Override
    public AuthResponse getUserById(Long userId) {
        User user = findUserById(userId);
        return mapper.toDto(user);
    }

    @Transactional
    @Override
    public void passwordChange(Long userId, AuthProfileUpdateRequest updatedPassword) {
        User user = findUserById(userId);
        user.setPassword(passwordEncoder.encode(updatedPassword.getPassword()));

        AuthNotificationEvent authEvent = AuthNotificationEvent.builder()
                .userId(user.getId())
                .action("PASSWORD_UPDATE")
                .build();
        kafkaTemplate.send("auth.password.updated.notification", authEvent);
    }

    @Transactional
    @Override
    public void emailChange(Long userId, AuthProfileUpdateRequest updatedEmail) {

        User user = findUserById(userId);
        user.setEmail(updatedEmail.getEmail());

        EmailUpdateEvent emailUpdateEvent = EmailUpdateEvent.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .build();
        kafkaTemplate.send("auth.email.updated", emailUpdateEvent);

        AuthNotificationEvent authEvent = AuthNotificationEvent.builder()
                .userId(user.getId())
                .action("EMAIL_UPDATE")
                .build();
        kafkaTemplate.send("auth.email.updated.notification", authEvent);
    }


    @Override
    public JwtResponse login(LoginRequest loginDto) {
        Logger log = LoggerFactory.getLogger(getClass());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginDto.getUsernameOrEmail(),
                        loginDto.getPassword()));

        log.info("Authentication successful for user: {}", loginDto.getUsernameOrEmail());

        SecurityContextHolder.getContext().setAuthentication(authentication);

        AuthUserDetails userDetails = (AuthUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getId();

        String token = jwtTokenProvider.generateToken(authentication, userId);

        log.info("JWT token generated for user ID: {}", userId);

        return JwtResponse.builder()
                .token(token)
                .userId(userId)
                .build();
    }

    @Override
    public String register(RegisterRequest registerDto) {

        if(authRepository.existsByUsername(registerDto.getUsername())) {
            throw new UsernameAlreadyTakenException(HttpStatus.BAD_REQUEST, "The username is already taken");
        }

        if(Boolean.TRUE.equals(authRepository.existsByEmail((registerDto.getEmail())))){
            throw new EmailAlreadyInUseException(HttpStatus.BAD_REQUEST, "This email address is already registered");
        }

        User user = User.builder()
                .username(registerDto.getUsername())
                .email(registerDto.getEmail())
                .password(passwordEncoder.encode(registerDto.getPassword()))
                .status(UserStatus.ACTIVE)
                .build();

        Set<Role> roles = new HashSet<>();
        Role userRole = roleRepository.findByType(RoleType.USER);
        roles.add(userRole);
        user.setRoles(roles);

        authRepository.save(user);

        NewUserEvent newUserEvent = NewUserEvent.builder()
                                    .userId(user.getId())
                                    .name(registerDto.getName())
                                    .username(user.getUsername())
                                    .email(user.getEmail())
                                    .status(user.getStatus())
                                    .registeredAt(user.getRegisteredAt())
                                    .build();

        kafkaTemplate.send("auth.user.registered", newUserEvent);
        return "User register successfully";
    }

    @Override
    public boolean areParticipantsValid(Long sellerId, String sellerUsername, Long buyerId, String buyerUsername) {
        User savedSeller = findUserById(sellerId);
        User savedBuyer = findUserById(buyerId);

        boolean validSeller = UserStatus.ACTIVE.equals(savedSeller.getStatus())
                && savedSeller.getUsername().equals(sellerUsername);
        boolean validBuyer = UserStatus.ACTIVE.equals(savedBuyer.getStatus())
                && savedBuyer.getUsername().equals(buyerUsername);

        return validSeller && validBuyer;
    }

    private User findUserById(Long userId){
        return authRepository.findById(userId).orElseThrow(
                () -> new ResourceNotFoundException("User with id" + userId + " doesn't exist!")
        );
    }

}
