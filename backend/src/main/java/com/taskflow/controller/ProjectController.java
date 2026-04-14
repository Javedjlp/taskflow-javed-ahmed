package com.taskflow.controller;

import com.taskflow.dto.PagedResponse;
import com.taskflow.dto.project.CreateProjectRequest;
import com.taskflow.dto.project.ProjectResponse;
import com.taskflow.dto.project.UpdateProjectRequest;
import com.taskflow.dto.task.TaskStatsResponse;
import com.taskflow.security.SecurityUtils;
import com.taskflow.service.ProjectService;
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
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public Object getProjects(@RequestParam(required = false) Integer page,
                              @RequestParam(required = false) Integer limit) {
        if (page != null && limit != null) {
            return projectService.listAccessibleProjectsPaged(SecurityUtils.currentUser(), page, limit);
        }
        return Map.of("projects", projectService.listAccessibleProjects(SecurityUtils.currentUser()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse createProject(@Valid @RequestBody CreateProjectRequest request) {
        return projectService.createProject(request, SecurityUtils.currentUser());
    }

    @GetMapping("/{id}")
    public ProjectResponse getProject(@PathVariable UUID id) {
        return projectService.getProjectDetails(id, SecurityUtils.currentUser());
    }

    @PatchMapping("/{id}")
    public ProjectResponse updateProject(@PathVariable UUID id, @RequestBody UpdateProjectRequest request) {
        return projectService.updateProject(id, request, SecurityUtils.currentUser());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id, SecurityUtils.currentUser());
    }

    @GetMapping("/{id}/stats")
    public TaskStatsResponse getStats(@PathVariable UUID id) {
        return projectService.getStats(id, SecurityUtils.currentUser());
    }
}
