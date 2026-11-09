package com.csit321g4.zenzone.adaptilearn.repository;

import com.csit321g4.zenzone.adaptilearn.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByTeacherId(Long teacherId);
}