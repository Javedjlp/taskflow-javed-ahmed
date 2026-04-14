package com.taskflow.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum TaskPriority {
    LOW("low"),
    MEDIUM("medium"),
    HIGH("high");

    private final String value;

    TaskPriority(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static TaskPriority fromValue(String raw) {
        return Arrays.stream(values())
                .filter(priority -> priority.value.equalsIgnoreCase(raw))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("invalid priority"));
    }
}
