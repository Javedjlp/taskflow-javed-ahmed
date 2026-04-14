package com.taskflow.controller;

import com.taskflow.dto.task.CreateTaskRequest;
import com.taskflow.dto.task.TaskResponse;
import com.taskflow.dto.task.UpdateTaskRequest;
import com.taskflow.entity.TaskStatus;
import com.taskflow.security.SecurityUtils;
import com.taskflow.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/projects/{id}/tasks")
    public Object getTasks(@PathVariable("id") UUID projectId,
                           @RequestParam(required = false) TaskStatus status,
                           @RequestParam(required = false) UUID assignee,
                           @RequestParam(required = false) Integer page,
                           @RequestParam(required = false) Integer limit) {
        if (page != null && limit != null) {
            return taskService.listTasksPaged(projectId, status, assignee, SecurityUtils.currentUser(), page, limit);
        }
        return Map.of("tasks", taskService.listTasks(projectId, status, assignee, SecurityUtils.currentUser()));
    }

    @PostMapping("/projects/{id}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse createTask(@PathVariable("id") UUID projectId,
                                   @Valid @RequestBody CreateTaskRequest request) {
        return taskService.createTask(projectId, request, SecurityUtils.currentUser());
    }

    @PatchMapping("/tasks/{id}")
    public TaskResponse updateTask(@PathVariable("id") UUID taskId,
                                   @RequestBody UpdateTaskRequest request) {
        return taskService.updateTask(taskId, request, SecurityUtils.currentUser());
    }

    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTask(@PathVariable("id") UUID taskId) {
        taskService.deleteTask(taskId, SecurityUtils.currentUser());
    }
}
