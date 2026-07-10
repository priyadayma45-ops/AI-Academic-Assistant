package com.academicassistant.controller;

import com.academicassistant.entity.Document;
import com.academicassistant.entity.User;
import com.academicassistant.entity.Role;
import com.academicassistant.repository.DocumentRepository;
import com.academicassistant.repository.UserRepository;
import com.academicassistant.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class DocumentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testUser;
    private String jwtToken;

    @BeforeEach
    public void setup() {
        documentRepository.deleteAll();
        userRepository.deleteAll();

        // Create test student user
        testUser = User.builder()
                .email("student@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("John Doe")
                .role(Role.ROLE_STUDENT)
                .verified(true)
                .createdAt(LocalDateTime.now())
                .build();
        testUser = userRepository.save(testUser);

        // Generate valid JWT
        jwtToken = jwtTokenProvider.generateTokenFromUsername(testUser.getEmail());
    }

    @Test
    public void testUploadDocument_Success() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "assignment.pdf",
                MediaType.APPLICATION_PDF_VALUE,
                "Mock Assignment Content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(mockFile)
                        .header("Authorization", "Bearer " + jwtToken)
                        .header("X-Request-ID", "test-upload-id"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("uploaded successfully")))
                .andExpect(jsonPath("$.data.filename", is("assignment.pdf")))
                .andExpect(jsonPath("$.data.status", is("PENDING")));
    }

    @Test
    public void testUploadDocument_InvalidExtension() throws Exception {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "exploit.exe",
                MediaType.APPLICATION_OCTET_STREAM_VALUE,
                "Malicious Content".getBytes()
        );

        mockMvc.perform(multipart("/api/v1/documents/upload")
                        .file(mockFile)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Unsupported file type")));
    }

    @Test
    public void testGetDashboardStats() throws Exception {
        // Seed database with a completed document
        Document doc1 = Document.builder()
                .user(testUser)
                .filename("history.docx")
                .filePath("h_ref.docx")
                .fileSize(1024L)
                .status("COMPLETED")
                .score(85)
                .build();
        documentRepository.save(doc1);

        // Seed database with a pending document
        Document doc2 = Document.builder()
                .user(testUser)
                .filename("maths.pdf")
                .filePath("m_ref.pdf")
                .fileSize(2048L)
                .status("PROCESSING")
                .build();
        documentRepository.save(doc2);

        mockMvc.perform(get("/api/v1/documents/stats")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalAssignments", is(2)))
                .andExpect(jsonPath("$.data.averageScore", is(85.0)))
                .andExpect(jsonPath("$.data.pendingAssignments", is(1)))
                .andExpect(jsonPath("$.data.completedAssignments", is(1)))
                .andExpect(jsonPath("$.data.recentDocuments", hasSize(2)));
    }

    @Test
    public void testGetDocumentDetails_Success() throws Exception {
        Document doc = Document.builder()
                .user(testUser)
                .filename("literature.txt")
                .filePath("l_ref.txt")
                .fileSize(512L)
                .status("COMPLETED")
                .score(92)
                .build();
        doc = documentRepository.save(doc);

        mockMvc.perform(get("/api/v1/documents/" + doc.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.filename", is("literature.txt")))
                .andExpect(jsonPath("$.data.score", is(92)));
    }

    @Test
    public void testGetDocumentDetails_Forbidden() throws Exception {
        // Create second user
        User otherUser = User.builder()
                .email("other@test.com")
                .password(passwordEncoder.encode("password123"))
                .name("Other Student")
                .role(Role.ROLE_STUDENT)
                .verified(true)
                .createdAt(LocalDateTime.now())
                .build();
        otherUser = userRepository.save(otherUser);

        // Create document owned by second user
        Document doc = Document.builder()
                .user(otherUser)
                .filename("confidential.pdf")
                .filePath("conf_ref.pdf")
                .fileSize(2048L)
                .status("PENDING")
                .build();
        doc = documentRepository.save(doc);

        // Attempt access with testUser JWT
        mockMvc.perform(get("/api/v1/documents/" + doc.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("not authorized")));
    }
}
