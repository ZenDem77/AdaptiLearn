package com.csit321g4.zenzone.adaptilearn.service;

import com.csit321g4.zenzone.adaptilearn.dto.NotificationRequest;
import com.csit321g4.zenzone.adaptilearn.entity.Notification;
import com.csit321g4.zenzone.adaptilearn.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public NotificationService(NotificationRepository notificationRepository, UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    public Notification create(NotificationRequest request) {
        return notificationRepository.save(apply(new Notification(), request));
    }

    public List<Notification> findAll(Long userId) {
        return userId == null
                ? notificationRepository.findAll()
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification findById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
    }

    public Notification update(Long id, NotificationRequest request) {
        return notificationRepository.save(apply(findById(id), request));
    }

    public void delete(Long id) {
        notificationRepository.delete(findById(id));
    }

    private Notification apply(Notification notification, NotificationRequest request) {
        notification.setUser(userService.findById(request.userId()));
        notification.setMessage(request.message());
        notification.setType(request.type());
        notification.setRead(request.isRead());
        return notification;
    }
}
