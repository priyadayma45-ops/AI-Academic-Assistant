package com.academicassistant.controller;

import com.academicassistant.config.RequestIdFilter;
import com.academicassistant.dto.ApiResponse;
import com.academicassistant.dto.ForgotPasswordRequest;
import com.academicassistant.dto.JwtResponse;
import com.academicassistant.dto.LoginRequest;
import com.academicassistant.dto.ResetPasswordRequest;
import com.academicassistant.dto.SignupRequest;
import com.academicassistant.dto.TokenRefreshRequest;
import com.academicassistant.dto.TokenRefreshResponse;
import com.academicassistant.dto.VerifyEmailRequest;
import com.academicassistant.entity.User;
import com.academicassistant.security.UserDetailsImpl;
import com.academicassistant.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Slf4j
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    private String getRequestId() {
        return MDC.get(RequestIdFilter.MDC_KEY);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty()) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<User>> registerUser(@Valid @RequestBody SignupRequest signupRequest, HttpServletRequest request) {
        log.info("Received signup request for email: {}", signupRequest.getEmail());
        User user = authService.registerUser(signupRequest, getClientIp(request));
        
        ApiResponse<User> response = ApiResponse.success(
                "Registration successful. A verification link has been sent to your email.",
                user,
                getRequestId()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest, HttpServletRequest request) {
        log.info("Received login request for email: {}", loginRequest.getEmail());
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest, getClientIp(request));
        
        ApiResponse<JwtResponse> response = ApiResponse.success(
                "Login successful",
                jwtResponse,
                getRequestId()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Object>> verifyEmail(@Valid @RequestBody VerifyEmailRequest verifyRequest, HttpServletRequest request) {
        log.info("Received verify-email request with token: {}", verifyRequest.getToken());
        authService.verifyEmail(verifyRequest.getToken(), getClientIp(request));
        
        ApiResponse<Object> response = ApiResponse.success(
                "Email verified successfully. You can now login."
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Object>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest forgotRequest, HttpServletRequest request) {
        log.info("Received forgot-password request for email: {}", forgotRequest.getEmail());
        authService.forgotPassword(forgotRequest, getClientIp(request));
        
        ApiResponse<Object> response = ApiResponse.success(
                "If the email is registered, a password reset link has been sent."
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Object>> resetPassword(@Valid @RequestBody ResetPasswordRequest resetRequest, HttpServletRequest request) {
        log.info("Received reset-password request");
        authService.resetPassword(resetRequest, getClientIp(request));
        
        ApiResponse<Object> response = ApiResponse.success(
                "Password reset successfully. You can now login with your new password."
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenRefreshResponse>> refreshToken(@Valid @RequestBody TokenRefreshRequest refreshRequest, HttpServletRequest request) {
        log.info("Received token refresh request");
        TokenRefreshResponse refreshResponse = authService.refreshAccessToken(refreshRequest, getClientIp(request));
        
        ApiResponse<TokenRefreshResponse> response = ApiResponse.success(
                "Token refreshed successfully",
                refreshResponse,
                getRequestId()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logoutUser(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userPrincipal = (UserDetailsImpl) auth.getPrincipal();
            log.info("Received logout request for user ID: {}", userPrincipal.getId());
            authService.logoutUser(userPrincipal.getId(), getClientIp(request));
            SecurityContextHolder.clearContext();
            
            ApiResponse<Object> response = ApiResponse.success("Logout successful");
            return ResponseEntity.ok(response);
        }
        
        ApiResponse<Object> response = ApiResponse.error("No active session found", getRequestId());
        return ResponseEntity.badRequest().body(response);
    }
}
