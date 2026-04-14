package com.taskflow.dto.project;

public record UpdateProjectRequest(
        String name,
        String description
) {
}
