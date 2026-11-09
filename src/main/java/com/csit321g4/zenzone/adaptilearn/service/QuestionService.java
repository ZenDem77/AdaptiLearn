package com.csit321g4.zenzone.adaptilearn.service;

import com.csit321g4.zenzone.adaptilearn.dto.QuestionRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Difficulty;
import com.csit321g4.zenzone.adaptilearn.entity.Question;
import com.csit321g4.zenzone.adaptilearn.repository.QuestionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuizService quizService;

    public QuestionService(QuestionRepository questionRepository, QuizService quizService) {
        this.questionRepository = questionRepository;
        this.quizService = quizService;
    }

    public Question create(QuestionRequest request) {
        Question question = new Question();
        apply(question, request);
        return questionRepository.save(question);
    }

    public List<Question> findAll() {
        return questionRepository.findAll();
    }

    public List<Question> findByDifficulty(Difficulty difficulty) {
        return questionRepository.findByDifficulty(difficulty);
    }

    public List<Question> findByQuiz(Long quizId, Difficulty difficulty) {
        return difficulty == null
                ? questionRepository.findByQuizId(quizId)
                : questionRepository.findByQuizIdAndDifficulty(quizId, difficulty);
    }

    public Question findById(Long id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Question not found"));
    }

    public Question update(Long id, QuestionRequest request) {
        Question question = findById(id);
        apply(question, request);
        return questionRepository.save(question);
    }

    public void delete(Long id) {
        questionRepository.delete(findById(id));
    }

    private void apply(Question question, QuestionRequest request) {
        if (!request.options().contains(request.correctAnswer())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Correct answer must be one of the options");
        }
        question.setText(request.text());
        question.setOptions(new ArrayList<>(request.options()));
        question.setCorrectAnswer(request.correctAnswer());
        question.setDifficulty(request.difficulty());
        question.setQuiz(quizService.findById(request.quizId()));
    }
}