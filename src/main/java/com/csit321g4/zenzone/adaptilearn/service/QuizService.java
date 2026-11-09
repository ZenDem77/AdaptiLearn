package com.csit321g4.zenzone.adaptilearn.service;

import com.csit321g4.zenzone.adaptilearn.dto.QuizRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Lesson;
import com.csit321g4.zenzone.adaptilearn.entity.Quiz;
import com.csit321g4.zenzone.adaptilearn.repository.QuizRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class QuizService {

    private final QuizRepository quizRepository;
    private final LessonService lessonService;

    public QuizService(QuizRepository quizRepository, LessonService lessonService) {
        this.quizRepository = quizRepository;
        this.lessonService = lessonService;
    }

    public Quiz create(QuizRequest request) {
        Quiz quiz = new Quiz();
        apply(quiz, request);
        return quizRepository.save(quiz);
    }

    public List<Quiz> findAll() {
        return quizRepository.findAll();
    }

    public List<Quiz> findByLesson(Long lessonId) {
        return quizRepository.findByLessonId(lessonId);
    }

    public Quiz findById(Long id) {
        return quizRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found"));
    }

    public Quiz update(Long id, QuizRequest request) {
        Quiz quiz = findById(id);
        apply(quiz, request);
        return quizRepository.save(quiz);
    }

    public void delete(Long id) {
        quizRepository.delete(findById(id));
    }

    private void apply(Quiz quiz, QuizRequest request) {
        Lesson lesson = lessonService.findById(request.lessonId());
        quiz.setTitle(request.title());
        quiz.setLesson(lesson);
    }
}