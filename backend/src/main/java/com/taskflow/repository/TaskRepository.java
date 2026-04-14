package com.taskflow.repository;

import com.taskflow.entity.TaskEntity;
import com.taskflow.entity.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TaskRepository extends JpaRepository<TaskEntity, UUID> {

    @Query("""
            select t from TaskEntity t
            where t.project.id = :projectId
            and (:status is null or t.status = :status)
            and (:assigneeId is null or t.assignee.id = :assigneeId)
            order by t.createdAt desc
            """)
    List<TaskEntity> findByProjectWithFilters(UUID projectId, TaskStatus status, UUID assigneeId);

    @Query("""
            select t from TaskEntity t
            where t.project.id = :projectId
            and (:status is null or t.status = :status)
            and (:assigneeId is null or t.assignee.id = :assigneeId)
            """)
    Page<TaskEntity> findByProjectWithFilters(UUID projectId, TaskStatus status, UUID assigneeId, Pageable pageable);

    List<TaskEntity> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    Optional<TaskEntity> findById(UUID id);
}
