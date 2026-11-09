package com.csit321g4.zenzone.adaptilearn.controller;

import com.csit321g4.zenzone.adaptilearn.dto.QuizRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Quiz;
import com.csit321g4.zenzone.adaptilearn.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Quiz create(@Valid @RequestBody QuizRequest request) {
        return quizService.create(request);
    }

    @GetMapping
    public List<Quiz> findAll(@RequestParam(required = false) Long lessonId) {
        return lessonId == null ? quizService.findAll() : quizService.findByLesson(lessonId);
    }

    @GetMapping("/{id}")
    public Quiz findById(@PathVariable Long id) {
        return quizService.findById(id);
    }

    @PutMapping("/{id}")
    public Quiz update(@PathVariable Long id, @Valid @RequestBody QuizRequest request) {
        return quizService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        quizService.delete(id);
    }
}