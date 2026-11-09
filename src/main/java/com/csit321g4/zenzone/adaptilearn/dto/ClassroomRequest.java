package com.csit321g4.zenzone.adaptilearn.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ClassroomRequest(
        @NotBlank String name,
        @NotBlank String subject,
        @NotBlank String joinCode,
        @NotNull List<Long> studentIds
) {
}
