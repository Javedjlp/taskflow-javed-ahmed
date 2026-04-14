package com.taskflow.dto.task;

import com.taskflow.entity.TaskPriority;
import com.taskflow.entity.TaskStatus;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateTaskRequest(
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        UUID assigneeId,
        LocalDate dueDate
) {
}
