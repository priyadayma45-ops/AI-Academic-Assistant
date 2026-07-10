package com.academicassistant.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private String requestId;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(String message, T data, String requestId) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .requestId(requestId)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        String requestId = org.slf4j.MDC.get("requestId");
        return success(message, data, requestId != null ? requestId : java.util.UUID.randomUUID().toString());
    }

    public static <T> ApiResponse<T> success(String message, String requestId) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .requestId(requestId)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success(String message) {
        String requestId = org.slf4j.MDC.get("requestId");
        return success(message, requestId != null ? requestId : java.util.UUID.randomUUID().toString());
    }

    public static <T> ApiResponse<T> error(String message, T errors, String requestId) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .data(errors)
                .requestId(requestId)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(String message, String requestId) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .requestId(requestId)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
