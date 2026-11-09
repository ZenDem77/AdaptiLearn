package com.csit321g4.zenzone.adaptilearn.controller;

import com.csit321g4.zenzone.adaptilearn.dto.LessonRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Lesson;
import com.csit321g4.zenzone.adaptilearn.service.LessonService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lessons")
public class LessonController {

    private final LessonService lessonService;

    public LessonController(LessonService lessonService) {
        this.lessonService = lessonService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Lesson create(@Valid @RequestBody LessonRequest request) {
        return lessonService.create(request);
    }

    @GetMapping
    public List<Lesson> findAll(@RequestParam(required = false) Long teacherId) {
        return teacherId == null ? lessonService.findAll() : lessonService.findByTeacher(teacherId);
    }

    @GetMapping("/{id}")
    public Lesson findById(@PathVariable Long id) {
        return lessonService.findById(id);
    }

    @PutMapping("/{id}")
    public Lesson update(@PathVariable Long id, @Valid @RequestBody LessonRequest request) {
        return lessonService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        lessonService.delete(id);
    }
}