package com.taskflow.dto;

import java.util.List;

public record PagedResponse<T>(
        List<T> data,
        int page,
        int limit,
        long total,
        int totalPages
) {
    public static <T> PagedResponse<T> of(List<T> data, int page, int limit, long total) {
        int totalPages = limit > 0 ? (int) Math.ceil((double) total / limit) : 1;
        return new PagedResponse<>(data, page, limit, total, totalPages);
    }
}
