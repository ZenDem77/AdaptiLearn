package com.csit321g4.zenzone.adaptilearn.repository;

import com.csit321g4.zenzone.adaptilearn.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    List<QuizAttempt> findByStudentIdOrderBySubmittedAtDesc(Long studentId);

    List<QuizAttempt> findByQuizId(Long quizId);
}