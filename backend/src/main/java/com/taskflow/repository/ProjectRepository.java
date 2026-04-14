package com.taskflow.repository;

import com.taskflow.entity.ProjectEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<ProjectEntity, UUID> {

    @Query("""
            select distinct p from ProjectEntity p
            left join TaskEntity t on t.project.id = p.id
            where p.owner.id = :userId or t.assignee.id = :userId
            order by p.createdAt desc
            """)
    List<ProjectEntity> findAccessibleProjects(UUID userId);

    @Query("""
            select distinct p from ProjectEntity p
            left join TaskEntity t on t.project.id = p.id
            where p.owner.id = :userId or t.assignee.id = :userId
            """)
    Page<ProjectEntity> findAccessibleProjects(UUID userId, Pageable pageable);

}
