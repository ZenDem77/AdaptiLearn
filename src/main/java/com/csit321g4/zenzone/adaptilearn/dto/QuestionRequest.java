package com.csit321g4.zenzone.adaptilearn.dto;

import com.csit321g4.zenzone.adaptilearn.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record QuestionRequest(
        @NotBlank String text,
        @NotEmpty List<String> options,
        @NotBlank String correctAnswer,
        @NotNull Difficulty difficulty,
        @NotNull Long quizId
) {
}