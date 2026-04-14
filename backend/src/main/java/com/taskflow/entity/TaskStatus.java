package com.taskflow.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Arrays;

public enum TaskStatus {
    TODO("todo"),
    IN_PROGRESS("in_progress"),
    DONE("done");

    private final String value;

    TaskStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static TaskStatus fromValue(String raw) {
        return Arrays.stream(values())
                .filter(status -> status.value.equalsIgnoreCase(raw))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("invalid status"));
    }
}
