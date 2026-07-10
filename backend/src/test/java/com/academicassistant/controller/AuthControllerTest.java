package com.academicassistant.controller;

import com.academicassistant.dto.LoginRequest;
import com.academicassistant.dto.SignupRequest;
import com.academicassistant.dto.TokenRefreshRequest;
import com.academicassistant.entity.Role;
import com.academicassistant.entity.User;
import com.academicassistant.repository.UserRepository;
import com.academicassistant.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    public void setup() {
        userRepository.deleteAll();
    }

    @Test
    public void testRegisterUser_Success() throws Exception {
        SignupRequest request = new SignupRequest();
        request.setEmail("student@test.com");
        request.setPassword("password123");
        request.setName("John Doe");
        request.setRole("STUDENT");
        request.setCollege("Test College");
        request.setBranch("Computer Science");
        request.setSemester("Semester 1");

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", notNullValue()))
                .andExpect(jsonPath("$.data.email", is("student@test.com")))
                .andExpect(jsonPath("$.data.role", is("ROLE_STUDENT")));
    }

    @Test
    public void testRegisterUser_DuplicateEmail() throws Exception {
        // Pre-create user
        User user = User.builder()
                .email("student@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("John Doe")
                .role(Role.ROLE_STUDENT)
                .verified(true)
                .build();
        userRepository.save(user);

        SignupRequest request = new SignupRequest();
        request.setEmail("student@test.com");
        request.setPassword("password123");
        request.setName("John Doe");
        request.setRole("STUDENT");

        mockMvc.perform(post("/api/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Email is already registered")));
    }

    @Test
    public void testLogin_Success() throws Exception {
        // Pre-create verified user
        User user = User.builder()
                .email("student@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("John Doe")
                .role(Role.ROLE_STUDENT)
                .verified(true)
                .build();
        userRepository.save(user);

        LoginRequest request = new LoginRequest();
        request.setEmail("student@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.data.email", is("student@test.com")))
                .andExpect(jsonPath("$.data.role", is("ROLE_STUDENT")));
    }

    @Test
    public void testLogin_UnverifiedAccount() throws Exception {
        // Pre-create unverified user
        User user = User.builder()
                .email("student@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("John Doe")
                .role(Role.ROLE_STUDENT)
                .verified(false)
                .build();
        userRepository.save(user);

        LoginRequest request = new LoginRequest();
        request.setEmail("student@test.com");
        request.setPassword("password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Your email is not verified. Please check your inbox to verify your account.")));
    }

    @Test
    public void testLogin_InvalidCredentials() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("student@test.com");
        request.setPassword("wrongpassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", is("Invalid email or password")));
    }
}
