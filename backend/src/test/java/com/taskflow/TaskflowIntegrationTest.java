package com.taskflow;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TaskflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private static String token;
    private static String projectId;
    private static String taskId;

    @Test
    @Order(1)
    void registerUser_shouldReturn201WithToken() throws Exception {
        String body = """
                {"name": "Integration User", "email": "integ@test.com", "password": "password123"}
                """;

        MvcResult result = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("integ@test.com"))
                .andExpect(jsonPath("$.user.name").value("Integration User"))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        token = json.get("token").asText();
    }

    @Test
    @Order(2)
    void loginUser_shouldReturn200WithToken() throws Exception {
        String body = """
                {"email": "integ@test.com", "password": "password123"}
                """;

        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("integ@test.com"))
                .andReturn();

        JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
        token = json.get("token").asText();
    }

    @Test
    @Order(3)
    void accessProtectedEndpointWithoutToken_shouldReturn401() throws Exception {
        mockMvc.perform(get("/projects"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("unauthorized"));
    }

    @Test
    @Order(4)
    void createProjectAndTask_fullLifecycle() throws Exception {
        // Create project
        String projectBody = """
                {"name": "Test Project", "description": "Integration test project"}
                """;

        MvcResult projectResult = mockMvc.perform(post("/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Test Project"))
                .andExpect(jsonPath("$.ownerId").isNotEmpty())
                .andReturn();

        JsonNode projectJson = objectMapper.readTree(projectResult.getResponse().getContentAsString());
        projectId = projectJson.get("id").asText();

        // Create task in that project
        String taskBody = """
                {"title": "First Task", "description": "Do something", "priority": "high"}
                """;

        MvcResult taskResult = mockMvc.perform(post("/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("First Task"))
                .andExpect(jsonPath("$.status").value("todo"))
                .andExpect(jsonPath("$.priority").value("high"))
                .andReturn();

        JsonNode taskJson = objectMapper.readTree(taskResult.getResponse().getContentAsString());
        taskId = taskJson.get("id").asText();

        // Update task status
        String updateBody = """
                {"status": "in_progress"}
                """;

        mockMvc.perform(patch("/tasks/" + taskId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("in_progress"));

        // List tasks with filter
        mockMvc.perform(get("/projects/" + projectId + "/tasks?status=in_progress")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tasks[0].title").value("First Task"));

        // Get stats
        mockMvc.perform(get("/projects/" + projectId + "/stats")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.byStatus.in_progress").value(1));
    }
}
