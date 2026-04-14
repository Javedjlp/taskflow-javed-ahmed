package com.taskflow.dto.task;

import com.taskflow.entity.TaskPriority;
import com.taskflow.entity.TaskStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TaskResponse(
        UUID id,
        String title,
        String description,
        TaskStatus status,
        TaskPriority priority,
        UUID projectId,
        UUID assigneeId,
        UUID createdBy,
        LocalDate dueDate,
        Instant createdAt,
        Instant updatedAt
) {
}
