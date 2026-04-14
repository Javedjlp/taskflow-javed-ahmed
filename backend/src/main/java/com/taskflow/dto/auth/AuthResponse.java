package com.taskflow.dto.auth;

import java.util.UUID;

public record AuthResponse(
        String token,
        UserSummary user
) {
    public record UserSummary(UUID id, String name, String email) {
    }
}
