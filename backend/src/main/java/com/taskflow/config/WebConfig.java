package com.taskflow.config;

import com.taskflow.entity.TaskPriority;
import com.taskflow.entity.TaskStatus;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(String.class, TaskStatus.class, TaskStatus::fromValue);
        registry.addConverter(String.class, TaskPriority.class, TaskPriority::fromValue);
    }
}
