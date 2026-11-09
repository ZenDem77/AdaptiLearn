package com.csit321g4.zenzone.adaptilearn.service;

import com.csit321g4.zenzone.adaptilearn.dto.ProgressRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Progress;
import com.csit321g4.zenzone.adaptilearn.repository.ProgressRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final UserService userService;
    private final LessonService lessonService;

    public ProgressService(ProgressRepository progressRepository, UserService userService, LessonService lessonService) {
        this.progressRepository = progressRepository;
        this.userService = userService;
        this.lessonService = lessonService;
    }

    public Progress create(ProgressRequest request) {
        return progressRepository.save(apply(new Progress(), request));
    }

    public List<Progress> findAll(Long userId, Long lessonId) {
        if (userId != null) {
            return progressRepository.findByUserId(userId);
        }
        if (lessonId != null) {
            return progressRepository.findByLessonId(lessonId);
        }
        return progressRepository.findAll();
    }

    public Progress findById(Long id) {
        return progressRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
    }

    public Progress update(Long id, ProgressRequest request) {
        return progressRepository.save(apply(findById(id), request));
    }

    public void delete(Long id) {
        progressRepository.delete(findById(id));
    }

    private Progress apply(Progress progress, ProgressRequest request) {
        progress.setUser(userService.findById(request.userId()));
        progress.setLesson(lessonService.findById(request.lessonId()));
        progress.setStatus(request.status());
        progress.setSkillLevel(request.skillLevel());
        progress.setCompletionTime(request.completionTime());
        return progress;
    }
}
