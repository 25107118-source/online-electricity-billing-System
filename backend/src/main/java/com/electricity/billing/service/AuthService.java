package com.electricity.billing.service;

import com.electricity.billing.dto.AuthRequest;
import com.electricity.billing.dto.AuthResponse;
import com.electricity.billing.dto.RegisterRequest;
import com.electricity.billing.entity.Role;
import com.electricity.billing.entity.User;
import com.electricity.billing.exception.BadRequestException;
import com.electricity.billing.repository.UserRepository;
import com.electricity.billing.security.JwtUtils;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse login(AuthRequest request) {
        // Authenticate credentials using Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        if (!user.isActive()) {
            throw new BadRequestException("User account is disabled. Please contact administrator.");
        }

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getConsumerNumber());

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getRole(), user.getConsumerNumber());
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username '" + request.getUsername() + "' is already taken");
        }

        User user = new User(
                request.getUsername(),
                passwordEncoder.encode(request.getPassword()),
                request.getRole() != null ? request.getRole() : Role.ADMIN,
                request.getConsumerNumber()
        );

        user = userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername(), user.getRole().name(), user.getConsumerNumber());
        return new AuthResponse(token, user.getId(), user.getUsername(), user.getRole(), user.getConsumerNumber());
    }
}
