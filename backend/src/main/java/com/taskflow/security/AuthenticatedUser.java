package com.taskflow.security;

import java.util.UUID;

public record AuthenticatedUser(UUID id, String email) {
}
