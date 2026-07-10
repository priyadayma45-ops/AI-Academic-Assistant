package com.academicassistant.controller;

import com.academicassistant.entity.User;
import com.academicassistant.entity.Role;
import com.academicassistant.repository.UserRepository;
import com.academicassistant.security.JwtTokenProvider;
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

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AiControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private String jwtToken;

    @BeforeEach
    public void setup() {
        userRepository.deleteAll();

        // Create test user
        User testUser = User.builder()
                .email("student@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("John Doe")
                .role(Role.ROLE_STUDENT)
                .verified(true)
                .createdAt(LocalDateTime.now())
                .build();
        testUser = userRepository.save(testUser);

        // Generate JWT
        jwtToken = jwtTokenProvider.generateTokenFromUsername(testUser.getEmail());
    }

    @Test
    public void testCheckGrammar_Success() throws Exception {
        String requestBody = "{\"text\": \"This is teh sentence with spelling mistake recieve.\"}";

        mockMvc.perform(post("/api/v1/ai/grammar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .header("Authorization", "Bearer " + jwtToken)
                        .header("X-Request-ID", "test-grammar-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.errors", hasSize(2)))
                .andExpect(jsonPath("$.data.errors[0].originalText", is("teh")))
                .andExpect(jsonPath("$.data.errors[0].correctedText", is("the")))
                .andExpect(jsonPath("$.data.fullyCorrectedText", containsString("This is the sentence with spelling mistake receive")));
    }

    @Test
    public void testCheckGrammar_BlankText() throws Exception {
        String requestBody = "{\"text\": \"\"}";

        mockMvc.perform(post("/api/v1/ai/grammar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Validation failed")));
    }

    @Test
    public void testRewrite_Success() throws Exception {
        String requestBody = "{\"text\": \"Explain coding clearly.\", \"tone\": \"ACADEMIC\"}";

        mockMvc.perform(post("/api/v1/ai/rewrite")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", containsString("Mocked Rewritten Text - Tone: ACADEMIC")));
    }

    @Test
    public void testSummarize_Success() throws Exception {
        String requestBody = "{\"text\": \"Spring Boot makes it easy to create stand-alone production applications.\", \"length\": \"SHORT\"}";

        mockMvc.perform(post("/api/v1/ai/summarize")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", containsString("Mocked Summary - Length: SHORT")));
    }
}
