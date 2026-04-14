package com.taskflow.service;

import com.taskflow.dto.PagedResponse;
import com.taskflow.dto.task.CreateTaskRequest;
import com.taskflow.dto.task.TaskResponse;
import com.taskflow.dto.task.UpdateTaskRequest;
import com.taskflow.entity.ProjectEntity;
import com.taskflow.entity.TaskEntity;
import com.taskflow.entity.TaskPriority;
import com.taskflow.entity.TaskStatus;
import com.taskflow.entity.UserEntity;
import com.taskflow.exception.ForbiddenException;
import com.taskflow.exception.NotFoundException;
import com.taskflow.repository.ProjectRepository;
import com.taskflow.repository.TaskRepository;
import com.taskflow.repository.UserRepository;
import com.taskflow.security.AuthenticatedUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

    public TaskService(TaskRepository taskRepository,
                       ProjectRepository projectRepository,
                       UserRepository userRepository,
                       SseService sseService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.sseService = sseService;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> listTasks(UUID projectId, TaskStatus status, UUID assigneeId, AuthenticatedUser user) {
        ProjectEntity project = projectRepository.findById(projectId).orElseThrow(() -> new NotFoundException("not found"));
        if (!project.getOwner().getId().equals(user.id()) && !userHasTaskInProject(projectId, user.id())) {
            throw new ForbiddenException("forbidden");
        }

        return taskRepository.findByProjectWithFilters(projectId, status, assigneeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<TaskResponse> listTasksPaged(UUID projectId, TaskStatus status, UUID assigneeId, AuthenticatedUser user, int page, int limit) {
        ProjectEntity project = projectRepository.findById(projectId).orElseThrow(() -> new NotFoundException("not found"));
        if (!project.getOwner().getId().equals(user.id()) && !userHasTaskInProject(projectId, user.id())) {
            throw new ForbiddenException("forbidden");
        }

        Page<TaskEntity> result = taskRepository.findByProjectWithFilters(
                projectId, status, assigneeId, PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<TaskResponse> items = result.getContent().stream().map(this::toResponse).toList();
        return PagedResponse.of(items, page, limit, result.getTotalElements());
    }

    @Transactional
    public TaskResponse createTask(UUID projectId, CreateTaskRequest request, AuthenticatedUser user) {
        ProjectEntity project = projectRepository.findById(projectId).orElseThrow(() -> new NotFoundException("not found"));
        if (!project.getOwner().getId().equals(user.id()) && !userHasTaskInProject(projectId, user.id())) {
            throw new ForbiddenException("forbidden");
        }

        TaskEntity task = new TaskEntity();
        task.setTitle(request.title().trim());
        task.setDescription(request.description());
        task.setStatus(request.status() == null ? TaskStatus.TODO : request.status());
        task.setPriority(request.priority() == null ? TaskPriority.MEDIUM : request.priority());
        task.setProject(project);
        task.setCreatedBy(userRepository.findById(user.id()).orElseThrow(() -> new NotFoundException("not found")));
        task.setDueDate(request.dueDate());

        if (request.assigneeId() != null) {
            UserEntity assignee = userRepository.findById(request.assigneeId()).orElseThrow(() -> new NotFoundException("not found"));
            task.setAssignee(assignee);
        }

        TaskResponse response = toResponse(taskRepository.save(task));
        sseService.broadcast("task-created", Map.of("projectId", projectId.toString(), "task", response));
        return response;
    }

    @Transactional
    public TaskResponse updateTask(UUID taskId, UpdateTaskRequest request, AuthenticatedUser user) {
        TaskEntity task = taskRepository.findById(taskId).orElseThrow(() -> new NotFoundException("not found"));
        boolean isOwner = task.getProject().getOwner().getId().equals(user.id());
        boolean isCreator = task.getCreatedBy().getId().equals(user.id());
        boolean isAssignee = task.getAssignee() != null && task.getAssignee().getId().equals(user.id());
        if (!isOwner && !isCreator && !isAssignee) {
            throw new ForbiddenException("forbidden");
        }

        if (request.title() != null && !request.title().isBlank()) {
            task.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.status() != null) {
            task.setStatus(request.status());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        if (request.assigneeId() != null) {
            UserEntity assignee = userRepository.findById(request.assigneeId()).orElseThrow(() -> new NotFoundException("not found"));
            task.setAssignee(assignee);
        }

        TaskResponse updated = toResponse(taskRepository.save(task));
        sseService.broadcast("task-updated", Map.of("projectId", task.getProject().getId().toString(), "task", updated));
        return updated;
    }

    @Transactional
    public void deleteTask(UUID taskId, AuthenticatedUser user) {
        TaskEntity task = taskRepository.findById(taskId).orElseThrow(() -> new NotFoundException("not found"));
        boolean isOwner = task.getProject().getOwner().getId().equals(user.id());
        boolean isCreator = task.getCreatedBy().getId().equals(user.id());
        if (!isOwner && !isCreator) {
            throw new ForbiddenException("forbidden");
        }
        String projectId = task.getProject().getId().toString();
        String deletedTaskId = taskId.toString();
        taskRepository.delete(task);
        sseService.broadcast("task-deleted", Map.of("projectId", projectId, "taskId", deletedTaskId));
    }

    private boolean userHasTaskInProject(UUID projectId, UUID userId) {
        return !taskRepository.findByProjectWithFilters(projectId, null, userId).isEmpty();
    }

    private TaskResponse toResponse(TaskEntity task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getProject().getId(),
                task.getAssignee() == null ? null : task.getAssignee().getId(),
                task.getCreatedBy().getId(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
