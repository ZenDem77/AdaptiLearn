package com.csit321g4.zenzone.adaptilearn.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record AdaptiveRuleRequest(
        @NotNull Long quizId,
        @DecimalMin("0.0") @DecimalMax("100.0") double minSkillLevel,
        @DecimalMin("0.0") @DecimalMax("100.0") double thresholdScore
) {
}
