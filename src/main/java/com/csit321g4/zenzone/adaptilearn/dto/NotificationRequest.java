package com.csit321g4.zenzone.adaptilearn.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificationRequest(
        @NotNull Long userId,
        @NotBlank String message,
        @NotBlank String type,
        boolean isRead
) {
}
