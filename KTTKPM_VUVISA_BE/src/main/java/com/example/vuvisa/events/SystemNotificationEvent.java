package com.example.vuvisa.events;

import com.example.vuvisa.entities.User;
import com.example.vuvisa.enums.NotificationType;
import lombok.Getter;

@Getter
public class SystemNotificationEvent {
    private final String title;
    private final String message;
    private final User recipient;
    private final NotificationType type;

    public SystemNotificationEvent(String title, String message, User recipient) {
        this.title = title;
        this.message = message;
        this.recipient = recipient;
        this.type = NotificationType.SYSTEM_ANNOUNCEMENT;
    }

}
