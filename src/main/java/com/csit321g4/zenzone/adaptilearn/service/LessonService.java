package com.csit321g4.zenzone.adaptilearn.service;

import com.csit321g4.zenzone.adaptilearn.dto.LessonRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Lesson;
import com.csit321g4.zenzone.adaptilearn.entity.Role;
import com.csit321g4.zenzone.adaptilearn.entity.User;
import com.csit321g4.zenzone.adaptilearn.repository.LessonRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class LessonService {

    private final LessonRepository lessonRepository;
    private final UserService userService;
    private final ClassroomService classroomService;

    public LessonService(LessonRepository lessonRepository, UserService userService, ClassroomService classroomService) {
        this.lessonRepository = lessonRepository;
        this.userService = userService;
        this.classroomService = classroomService;
    }

    public Lesson create(LessonRequest request) {
        Lesson lesson = new Lesson();
        apply(lesson, request);
        return lessonRepository.save(lesson);
    }

    public List<Lesson> findAll() {
        return lessonRepository.findAll();
    }

    public List<Lesson> findByTeacher(Long teacherId) {
        return lessonRepository.findByTeacherId(teacherId);
    }

    public Lesson findById(Long id) {
        return lessonRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lesson not found"));
    }

    public Lesson update(Long id, LessonRequest request) {
        Lesson lesson = findById(id);
        apply(lesson, request);
        return lessonRepository.save(lesson);
    }

    public void delete(Long id) {
        lessonRepository.delete(findById(id));
    }

    private void apply(Lesson lesson, LessonRequest request) {
        User teacher = userService.findById(request.teacherId());
        if (teacher.getRole() != Role.TEACHER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only teachers can manage lessons");
        }
        lesson.setTitle(request.title());
        lesson.setDescription(request.description());
        lesson.setContent(request.content());
        lesson.setTeacher(teacher);
        lesson.setClassroom(classroomService.findById(request.classroomId()));
    }
}