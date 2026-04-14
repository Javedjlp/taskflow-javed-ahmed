package com.taskflow.dto.task;

import java.util.Map;

public record TaskStatsResponse(
        Map<String, Long> byStatus,
        Map<String, Long> byAssignee
) {
}
