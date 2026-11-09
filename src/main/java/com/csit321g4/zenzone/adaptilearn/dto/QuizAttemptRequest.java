package com.csit321g4.zenzone.adaptilearn.dto;

import com.csit321g4.zenzone.adaptilearn.entity.Difficulty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record QuizAttemptRequest(
        @NotNull Long studentId,
        @NotNull Long quizId,
        @NotNull Difficulty difficulty,
        @Min(0) long completionTimeSeconds,
        @NotNull Map<Long, String> answers
) {
}