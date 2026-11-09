package com.csit321g4.zenzone.adaptilearn.service;

import com.csit321g4.zenzone.adaptilearn.dto.QuizAttemptRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Question;
import com.csit321g4.zenzone.adaptilearn.entity.QuizAttempt;
import com.csit321g4.zenzone.adaptilearn.entity.Role;
import com.csit321g4.zenzone.adaptilearn.entity.User;
import com.csit321g4.zenzone.adaptilearn.repository.QuizAttemptRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class QuizAttemptService {

    private final QuizAttemptRepository attemptRepository;
    private final UserService userService;
    private final QuizService quizService;
    private final QuestionService questionService;

    public QuizAttemptService(QuizAttemptRepository attemptRepository,
                              UserService userService,
                              QuizService quizService,
                              QuestionService questionService) {
        this.attemptRepository = attemptRepository;
        this.userService = userService;
        this.quizService = quizService;
        this.questionService = questionService;
    }

    public QuizAttempt submit(QuizAttemptRequest request) {
        QuizAttempt attempt = new QuizAttempt();
        apply(attempt, request);
        return attemptRepository.save(attempt);
    }

    public List<QuizAttempt> findAll() {
        return attemptRepository.findAll();
    }

    public List<QuizAttempt> findByStudent(Long studentId) {
        return attemptRepository.findByStudentIdOrderBySubmittedAtDesc(studentId);
    }

    public List<QuizAttempt> findByQuiz(Long quizId) {
        return attemptRepository.findByQuizId(quizId);
    }

    public QuizAttempt findById(Long id) {
        return attemptRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attempt not found"));
    }

    public QuizAttempt update(Long id, QuizAttemptRequest request) {
        QuizAttempt attempt = findById(id);
        apply(attempt, request);
        return attemptRepository.save(attempt);
    }

    public void delete(Long id) {
        attemptRepository.delete(findById(id));
    }

    private void apply(QuizAttempt attempt, QuizAttemptRequest request) {
        User student = userService.findById(request.studentId());
        if (student.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students can submit attempts");
        }

        List<Question> questions = questionService.findByQuiz(request.quizId(), request.difficulty());
        if (questions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No questions at this difficulty for the quiz");
        }

        int correct = 0;
        for (Question question : questions) {
            String answer = request.answers().get(question.getId());
            if (question.getCorrectAnswer().equals(answer)) {
                correct++;
            }
        }

        double percent = Math.round(correct * 10000.0 / questions.size()) / 100.0;

        attempt.setStudent(student);
        attempt.setQuiz(quizService.findById(request.quizId()));
        attempt.setDifficulty(request.difficulty());
        attempt.setCorrectCount(correct);
        attempt.setTotalQuestions(questions.size());
        attempt.setScorePercent(percent);
        attempt.setCompletionTimeSeconds(request.completionTimeSeconds());
    }
}