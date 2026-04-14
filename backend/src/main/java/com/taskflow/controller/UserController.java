package com.taskflow.controller;

import com.taskflow.dto.auth.UserResponse;
import com.taskflow.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Map<String, List<UserResponse>> listUsers() {
        return Map.of("users", userService.listUsers());
    }
}
