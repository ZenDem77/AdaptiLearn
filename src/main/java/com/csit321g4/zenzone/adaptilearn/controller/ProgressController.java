package com.csit321g4.zenzone.adaptilearn.controller;

import com.csit321g4.zenzone.adaptilearn.dto.ProgressRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Progress;
import com.csit321g4.zenzone.adaptilearn.service.ProgressService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Progress create(@Valid @RequestBody ProgressRequest request) {
        return progressService.create(request);
    }

    @GetMapping
    public List<Progress> findAll(@RequestParam(required = false) Long userId,
                                  @RequestParam(required = false) Long lessonId) {
        return progressService.findAll(userId, lessonId);
    }

    @GetMapping("/{id}")
    public Progress findById(@PathVariable Long id) {
        return progressService.findById(id);
    }

    @PutMapping("/{id}")
    public Progress update(@PathVariable Long id, @Valid @RequestBody ProgressRequest request) {
        return progressService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        progressService.delete(id);
    }
}
