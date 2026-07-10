package com.academicassistant.service;

import com.academicassistant.dto.ForgotPasswordRequest;
import com.academicassistant.dto.JwtResponse;
import com.academicassistant.dto.LoginRequest;
import com.academicassistant.dto.ResetPasswordRequest;
import com.academicassistant.dto.SignupRequest;
import com.academicassistant.dto.TokenRefreshRequest;
import com.academicassistant.dto.TokenRefreshResponse;
import com.academicassistant.dto.VerifyEmailRequest;
import com.academicassistant.entity.RefreshToken;
import com.academicassistant.entity.Role;
import com.academicassistant.entity.Teacher;
import com.academicassistant.entity.User;
import com.academicassistant.exception.BadRequestException;
import com.academicassistant.exception.ResourceNotFoundException;
import com.academicassistant.exception.UnauthorizedException;
import com.academicassistant.repository.RefreshTokenRepository;
import com.academicassistant.repository.TeacherRepository;
import com.academicassistant.repository.UserRepository;
import com.academicassistant.security.JwtTokenProvider;
import com.academicassistant.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ActivityLogService activityLogService;

    @Value("${app.jwt.refresh-expiration-ms}")
    private Long refreshTokenDurationMs;

    @Autowired
    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       TeacherRepository teacherRepository,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordEncoder encoder,
                       JwtTokenProvider jwtTokenProvider,
                       ActivityLogService activityLogService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.teacherRepository = teacherRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.encoder = encoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.activityLogService = activityLogService;
    }

    @Transactional
    public User registerUser(SignupRequest signupRequest, String ipAddress) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        Role userRole;
        try {
            userRole = Role.valueOf("ROLE_" + signupRequest.getRole().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BadRequestException("Invalid role provided. Role must be STUDENT or TEACHER.");
        }

        if (userRole == Role.ROLE_ADMIN) {
            throw new BadRequestException("Direct registration as ADMIN is not allowed.");
        }

        String verificationToken = UUID.randomUUID().toString();

        User user = User.builder()
                .email(signupRequest.getEmail())
                .password(encoder.encode(signupRequest.getPassword()))
                .role(userRole)
                .name(signupRequest.getName())
                .verified(false)
                .verificationToken(verificationToken)
                .build();

        if (userRole == Role.ROLE_STUDENT) {
            user.setCollege(signupRequest.getCollege());
            user.setBranch(signupRequest.getBranch());
            user.setSemester(signupRequest.getSemester());
        }

        User savedUser = userRepository.save(user);

        if (userRole == Role.ROLE_TEACHER) {
            if (signupRequest.getDepartment() == null || signupRequest.getDepartment().trim().isEmpty()) {
                throw new BadRequestException("Department is required for teachers");
            }
            if (signupRequest.getDesignation() == null || signupRequest.getDesignation().trim().isEmpty()) {
                throw new BadRequestException("Designation is required for teachers");
            }

            Teacher teacher = Teacher.builder()
                    .user(savedUser)
                    .department(signupRequest.getDepartment())
                    .designation(signupRequest.getDesignation())
                    .build();

            teacherRepository.save(teacher);
        }

        // Simulate sending email by printing verification link in logs
        log.info("--------------------------------------------------------------------------------");
        log.info("EMAIL VERIFICATION SIMULATION: User Registered successfully");
        log.info("Verification link: http://localhost:5173/verify-email?token={}", verificationToken);
        log.info("--------------------------------------------------------------------------------");

        activityLogService.logActivity(savedUser, "SIGNUP", "User profile created and verification email simulated", ipAddress);

        return savedUser;
    }

    @Transactional
    public JwtResponse authenticateUser(LoginRequest loginRequest, String ipAddress) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!user.isVerified()) {
            throw new BadRequestException("Your email is not verified. Please check your inbox to verify your account.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = jwtTokenProvider.generateJwtToken(authentication);
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        RefreshToken refreshToken = createOrUpdateRefreshToken(userPrincipal.getId());

        activityLogService.logActivity(user, "LOGIN", "Login successful. JWT issued.", ipAddress);

        return JwtResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken.getToken())
                .id(userPrincipal.getId())
                .email(userPrincipal.getUsername())
                .name(user.getName())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public void verifyEmail(String token, String ipAddress) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification token"));

        user.setVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        activityLogService.logActivity(user, "EMAIL_VERIFICATION", "Email verified successfully", ipAddress);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request, String ipAddress) {
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            userRepository.save(user);

            // Simulate sending email
            log.info("--------------------------------------------------------------------------------");
            log.info("PASSWORD RESET SIMULATION: Request received for {}", user.getEmail());
            log.info("Reset password link: http://localhost:5173/reset-password?token={}", resetToken);
            log.info("--------------------------------------------------------------------------------");

            activityLogService.logActivity(user, "PASSWORD_RESET_REQUEST", "Password reset token generated and simulated", ipAddress);
        } else {
            // Log attempt on non-existent account (avoid enumerating accounts in API response but log it)
            log.warn("Password reset requested for non-registered email: {}", request.getEmail());
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request, String ipAddress) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));

        user.setPassword(encoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        userRepository.save(user);

        activityLogService.logActivity(user, "PASSWORD_RESET_SUCCESS", "Password reset successfully", ipAddress);
    }

    @Transactional
    public TokenRefreshResponse refreshAccessToken(TokenRefreshRequest request, String ipAddress) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenRepository.findByToken(requestRefreshToken)
                .map(this::verifyExpiration)
                .map(token -> {
                    User user = token.getUser();
                    String accessToken = jwtTokenProvider.generateTokenFromUsername(user.getEmail());
                    
                    // Rotate refresh token
                    String newRefreshToken = UUID.randomUUID().toString();
                    token.setToken(newRefreshToken);
                    token.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
                    refreshTokenRepository.save(token);

                    activityLogService.logActivity(user, "TOKEN_REFRESH", "Access and Refresh Tokens rotated successfully", ipAddress);

                    return TokenRefreshResponse.builder()
                            .token(accessToken)
                            .refreshToken(newRefreshToken)
                            .build();
                })
                .orElseThrow(() -> new UnauthorizedException("Refresh token is not in database. Please login."));
    }

    @Transactional
    public void logoutUser(Long userId, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        refreshTokenRepository.deleteByUser(user);
        activityLogService.logActivity(user, "LOGOUT", "User logged out. Active sessions closed.", ipAddress);
    }

    private RefreshToken createOrUpdateRefreshToken(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Check if token already exists for the user
        Optional<RefreshToken> existingTokenOpt = refreshTokenRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(userId))
                .findFirst();

        RefreshToken refreshToken;
        if (existingTokenOpt.isPresent()) {
            refreshToken = existingTokenOpt.get();
        } else {
            refreshToken = new RefreshToken();
            refreshToken.setUser(user);
        }

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setExpiryDate(Instant.now().plusMillis(refreshTokenDurationMs));
        return refreshTokenRepository.save(refreshToken);
    }

    private RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException("Refresh token was expired. Please sign in again.");
        }
        return token;
    }
}
