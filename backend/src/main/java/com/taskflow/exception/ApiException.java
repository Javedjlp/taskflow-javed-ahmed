package com.taskflow.exception;

public class ApiException extends RuntimeException {

    public ApiException(String message) {
        super(message);
    }
}
