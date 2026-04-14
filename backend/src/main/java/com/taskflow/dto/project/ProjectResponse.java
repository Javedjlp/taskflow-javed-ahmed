package com.taskflow.dto.project;

import com.taskflow.dto.task.TaskResponse;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ProjectResponse(
        UUID id,
        String name,
        String description,
        UUID ownerId,
        Instant createdAt,
        List<TaskResponse> tasks
) {
}
