package com.csit321g4.zenzone.adaptilearn.repository;

import com.csit321g4.zenzone.adaptilearn.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    List<Quiz> findByLessonId(Long lessonId);
}