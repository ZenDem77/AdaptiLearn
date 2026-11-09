package com.csit321g4.zenzone.adaptilearn.controller;

import com.csit321g4.zenzone.adaptilearn.dto.AdaptiveRuleRequest;
import com.csit321g4.zenzone.adaptilearn.entity.AdaptiveRule;
import com.csit321g4.zenzone.adaptilearn.service.AdaptiveRuleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/adaptive-rules")
public class AdaptiveRuleController {

    private final AdaptiveRuleService adaptiveRuleService;

    public AdaptiveRuleController(AdaptiveRuleService adaptiveRuleService) {
        this.adaptiveRuleService = adaptiveRuleService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdaptiveRule create(@Valid @RequestBody AdaptiveRuleRequest request) {
        return adaptiveRuleService.create(request);
    }

    @GetMapping
    public List<AdaptiveRule> findAll() {
        return adaptiveRuleService.findAll();
    }

    @GetMapping("/{id}")
    public AdaptiveRule findById(@PathVariable Long id) {
        return adaptiveRuleService.findById(id);
    }

    @PutMapping("/{id}")
    public AdaptiveRule update(@PathVariable Long id, @Valid @RequestBody AdaptiveRuleRequest request) {
        return adaptiveRuleService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        adaptiveRuleService.delete(id);
    }
}
