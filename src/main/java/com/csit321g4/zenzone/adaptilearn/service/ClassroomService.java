package com.csit321g4.zenzone.adaptilearn.service;

import com.csit321g4.zenzone.adaptilearn.dto.ClassroomRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Classroom;
import com.csit321g4.zenzone.adaptilearn.entity.Role;
import com.csit321g4.zenzone.adaptilearn.entity.User;
import com.csit321g4.zenzone.adaptilearn.repository.ClassroomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.ArrayList;

@Service
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final UserService userService;

    public ClassroomService(ClassroomRepository classroomRepository, UserService userService) {
        this.classroomRepository = classroomRepository;
        this.userService = userService;
    }

    public Classroom create(ClassroomRequest request) {
        return classroomRepository.save(apply(new Classroom(), request));
    }

    public List<Classroom> findAll() {
        return classroomRepository.findAll();
    }

    public Classroom findById(Long id) {
        return classroomRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Classroom not found"));
    }

    public Classroom update(Long id, ClassroomRequest request) {
        return classroomRepository.save(apply(findById(id), request));
    }

    public void delete(Long id) {
        classroomRepository.delete(findById(id));
    }

    private Classroom apply(Classroom classroom, ClassroomRequest request) {
        classroom.setName(request.name());
        classroom.setSubject(request.subject());
        classroom.setJoinCode(request.joinCode());
        List<User> students = new ArrayList<>();
        for (Long studentId : request.studentIds()) {
            User student = userService.findById(studentId);
            if (student.getRole() != Role.STUDENT) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only students can be enrolled in a classroom");
            }
            students.add(student);
        }
        classroom.setStudents(students);
        return classroom;
    }
}
