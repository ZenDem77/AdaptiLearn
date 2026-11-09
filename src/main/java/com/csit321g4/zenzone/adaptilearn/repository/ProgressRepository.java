package com.csit321g4.zenzone.adaptilearn.repository;

import com.csit321g4.zenzone.adaptilearn.entity.Progress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProgressRepository extends JpaRepository<Progress, Long> {

    List<Progress> findByUserId(Long userId);

    List<Progress> findByLessonId(Long lessonId);
}
