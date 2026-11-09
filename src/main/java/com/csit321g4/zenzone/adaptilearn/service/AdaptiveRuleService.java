package com.csit321g4.zenzone.adaptilearn.service;

import com.csit321g4.zenzone.adaptilearn.dto.AdaptiveRuleRequest;
import com.csit321g4.zenzone.adaptilearn.entity.AdaptiveRule;
import com.csit321g4.zenzone.adaptilearn.repository.AdaptiveRuleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdaptiveRuleService {

    private final AdaptiveRuleRepository adaptiveRuleRepository;
    private final QuizService quizService;

    public AdaptiveRuleService(AdaptiveRuleRepository adaptiveRuleRepository, QuizService quizService) {
        this.adaptiveRuleRepository = adaptiveRuleRepository;
        this.quizService = quizService;
    }

    public AdaptiveRule create(AdaptiveRuleRequest request) {
        return adaptiveRuleRepository.save(apply(new AdaptiveRule(), request));
    }

    public List<AdaptiveRule> findAll() {
        return adaptiveRuleRepository.findAll();
    }

    public AdaptiveRule findById(Long id) {
        return adaptiveRuleRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Adaptive rule not found"));
    }

    public AdaptiveRule update(Long id, AdaptiveRuleRequest request) {
        return adaptiveRuleRepository.save(apply(findById(id), request));
    }

    public void delete(Long id) {
        adaptiveRuleRepository.delete(findById(id));
    }

    private AdaptiveRule apply(AdaptiveRule adaptiveRule, AdaptiveRuleRequest request) {
        adaptiveRule.setQuiz(quizService.findById(request.quizId()));
        adaptiveRule.setMinSkillLevel(request.minSkillLevel());
        adaptiveRule.setThresholdScore(request.thresholdScore());
        return adaptiveRule;
    }
}
