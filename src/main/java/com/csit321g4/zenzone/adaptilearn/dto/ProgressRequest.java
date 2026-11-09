package com.csit321g4.zenzone.adaptilearn.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProgressRequest(
        @NotNull Long userId,
        @NotNull Long lessonId,
        @NotBlank String status,
        @DecimalMin("0.0") @DecimalMax("100.0") double skillLevel,
        @Min(0) long completionTime
) {
}
