package com.csit321g4.zenzone.adaptilearn.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LessonRequest(
        @NotBlank String title,
        String description,
        String content,
        @NotNull Long teacherId,
        @NotNull Long classroomId
) {
}