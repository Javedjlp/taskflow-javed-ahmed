package com.taskflow.service;

import com.taskflow.dto.auth.AuthRequest;
import com.taskflow.dto.auth.AuthResponse;
import com.taskflow.dto.auth.RegisterRequest;
import com.taskflow.entity.UserEntity;
import com.taskflow.exception.BadRequestException;
import com.taskflow.repository.UserRepository;
import com.taskflow.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        userRepository.findByEmailIgnoreCase(request.email()).ifPresent(existing -> {
            throw new BadRequestException("email already exists");
        });

        UserEntity user = new UserEntity();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.password()));
        user = userRepository.save(user);

        logger.info("user_registered email={} userId={}", user.getEmail(), user.getId());
        return buildAuthResponse(user);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(AuthRequest request) {
        UserEntity user = userRepository.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new BadRequestException("invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException("invalid credentials");
        }

        logger.info("user_logged_in email={} userId={}", user.getEmail(), user.getId());
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(UserEntity user) {
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(
                token,
                new AuthResponse.UserSummary(user.getId(), user.getName(), user.getEmail())
        );
    }
}
