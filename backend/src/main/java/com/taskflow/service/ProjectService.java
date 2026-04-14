package com.taskflow.service;

import com.taskflow.dto.PagedResponse;
import com.taskflow.dto.project.CreateProjectRequest;
import com.taskflow.dto.project.ProjectResponse;
import com.taskflow.dto.project.UpdateProjectRequest;
import com.taskflow.dto.task.TaskResponse;
import com.taskflow.dto.task.TaskStatsResponse;
import com.taskflow.entity.ProjectEntity;
import com.taskflow.entity.TaskEntity;
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

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository,
                          TaskRepository taskRepository,
                          UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listAccessibleProjects(AuthenticatedUser user) {
        return projectRepository.findAccessibleProjects(user.id())
                .stream()
                .map(project -> new ProjectResponse(
                        project.getId(),
                        project.getName(),
                        project.getDescription(),
                        project.getOwner().getId(),
                        project.getCreatedAt(),
                        null
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public PagedResponse<ProjectResponse> listAccessibleProjectsPaged(AuthenticatedUser user, int page, int limit) {
        Page<ProjectEntity> result = projectRepository.findAccessibleProjects(
                user.id(), PageRequest.of(page - 1, limit, Sort.by(Sort.Direction.DESC, "createdAt")));
        List<ProjectResponse> items = result.getContent().stream()
                .map(project -> new ProjectResponse(
                        project.getId(),
                        project.getName(),
                        project.getDescription(),
                        project.getOwner().getId(),
                        project.getCreatedAt(),
                        null
                ))
                .toList();
        return PagedResponse.of(items, page, limit, result.getTotalElements());
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, AuthenticatedUser user) {
        ProjectEntity project = new ProjectEntity();
        project.setName(request.name().trim());
        project.setDescription(request.description());
        project.setOwner(userRepository.findById(user.id()).orElseThrow(() -> new NotFoundException("not found")));

        project = projectRepository.save(project);
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOwner().getId(),
                project.getCreatedAt(),
                List.of()
        );
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectDetails(UUID projectId, AuthenticatedUser user) {
        ProjectEntity project = getProjectIfAccessible(projectId, user);
        List<TaskResponse> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(this::toTaskResponse)
                .toList();

        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOwner().getId(),
                project.getCreatedAt(),
                tasks
        );
    }

    @Transactional
    public ProjectResponse updateProject(UUID projectId, UpdateProjectRequest request, AuthenticatedUser user) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("not found"));

        if (!project.getOwner().getId().equals(user.id())) {
            throw new ForbiddenException("forbidden");
        }

        if (request.name() != null && !request.name().isBlank()) {
            project.setName(request.name().trim());
        }
        if (request.description() != null) {
            project.setDescription(request.description());
        }

        project = projectRepository.save(project);
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getOwner().getId(),
                project.getCreatedAt(),
                null
        );
    }

    @Transactional
    public void deleteProject(UUID projectId, AuthenticatedUser user) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("not found"));

        if (!project.getOwner().getId().equals(user.id())) {
            throw new ForbiddenException("forbidden");
        }

        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public TaskStatsResponse getStats(UUID projectId, AuthenticatedUser user) {
        getProjectIfAccessible(projectId, user);
        List<TaskEntity> tasks = taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

        Map<String, Long> byStatus = tasks.stream()
                .collect(LinkedHashMap::new,
                        (m, t) -> m.merge(t.getStatus().name().toLowerCase(), 1L, Long::sum),
                        Map::putAll);

        Map<String, Long> byAssignee = tasks.stream()
                .collect(LinkedHashMap::new,
                        (m, t) -> m.merge(t.getAssignee() == null ? "unassigned" : t.getAssignee().getEmail(), 1L, Long::sum),
                        Map::putAll);

        return new TaskStatsResponse(byStatus, byAssignee);
    }

    private ProjectEntity getProjectIfAccessible(UUID projectId, AuthenticatedUser user) {
        ProjectEntity project = projectRepository.findById(projectId)
                .orElseThrow(() -> new NotFoundException("not found"));

        boolean accessible = project.getOwner().getId().equals(user.id()) ||
                taskRepository.findByProjectWithFilters(projectId, null, user.id()).size() > 0;

        if (!accessible) {
            throw new ForbiddenException("forbidden");
        }
        return project;
    }

    private TaskResponse toTaskResponse(TaskEntity task) {
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
