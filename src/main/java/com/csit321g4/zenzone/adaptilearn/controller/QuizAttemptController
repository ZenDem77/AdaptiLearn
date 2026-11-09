package com.csit321g4.zenzone.adaptilearn.controller;

import com.csit321g4.zenzone.adaptilearn.dto.QuizAttemptRequest;
import com.csit321g4.zenzone.adaptilearn.entity.QuizAttempt;
import com.csit321g4.zenzone.adaptilearn.service.QuizAttemptService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attempts")
public class QuizAttemptController {

    private final QuizAttemptService attemptService;

    public QuizAttemptController(QuizAttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public QuizAttempt submit(@Valid @RequestBody QuizAttemptRequest request) {
        return attemptService.submit(request);
    }

    @GetMapping
    public List<QuizAttempt> findAll(@RequestParam(required = false) Long studentId,
                                     @RequestParam(required = false) Long quizId) {
        if (studentId != null) {
            return attemptService.findByStudent(studentId);
        }
        if (quizId != null) {
            return attemptService.findByQuiz(quizId);
        }
        return attemptService.findAll();
    }

    @GetMapping("/{id}")
    public QuizAttempt findById(@PathVariable Long id) {
        return attemptService.findById(id);
    }

    @PutMapping("/{id}")
    public QuizAttempt update(@PathVariable Long id, @Valid @RequestBody QuizAttemptRequest request) {
        return attemptService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        attemptService.delete(id);
    }
}