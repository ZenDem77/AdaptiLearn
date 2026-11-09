package com.csit321g4.zenzone.adaptilearn.controller;

import com.csit321g4.zenzone.adaptilearn.dto.NotificationRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Notification;
import com.csit321g4.zenzone.adaptilearn.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Notification create(@Valid @RequestBody NotificationRequest request) {
        return notificationService.create(request);
    }

    @GetMapping
    public List<Notification> findAll(@RequestParam(required = false) Long userId) {
        return notificationService.findAll(userId);
    }

    @GetMapping("/{id}")
    public Notification findById(@PathVariable Long id) {
        return notificationService.findById(id);
    }

    @PutMapping("/{id}")
    public Notification update(@PathVariable Long id, @Valid @RequestBody NotificationRequest request) {
        return notificationService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        notificationService.delete(id);
    }
}
