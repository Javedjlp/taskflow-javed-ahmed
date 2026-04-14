import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { ViewList, ViewKanban } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { createTask, deleteTask, getProjectById, updateTask } from "../api/projects";
import { getUsers } from "../api/users";
import { parseApiError } from "../hooks/useApiError";
import { useTaskSSE } from "../hooks/useTaskSSE";
import { TaskModal } from "../components/TaskModal";
import { KanbanBoard } from "../components/KanbanBoard";
import type { Task, TaskStatus } from "../types/models";

export const ProjectDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  useTaskSSE(id);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getProjectById(id as string),
    enabled: Boolean(id),
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const filteredTasks = useMemo(() => {
    if (!project) return [];
    return project.tasks.filter((task) => {
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
      if (assigneeFilter !== "ALL" && task.assigneeId !== assigneeFilter) return false;
      return true;
    });
  }, [project, statusFilter, assigneeFilter]);

  const createMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => createTask(id as string, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project", id] });
      setModalOpen(false);
      setEditingTask(undefined);
    },
    onError: (err) => setError(parseApiError(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Record<string, unknown> }) =>
      updateTask(taskId, payload),
    onMutate: async ({ taskId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ["project", id] });
      const prev = queryClient.getQueryData(["project", id]);
      queryClient.setQueryData(["project", id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          tasks: old.tasks.map((task: Task) => (task.id === taskId ? { ...task, ...payload } : task)),
        };
      });
      return { prev };
    },
    onError: (err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["project", id], context.prev);
      }
      setError(parseApiError(err));
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
    onSuccess: () => {
      setModalOpen(false);
      setEditingTask(undefined);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project", id] });
    },
    onError: (err) => setError(parseApiError(err)),
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {isLoading ? <Alert severity="info">Loading project details...</Alert> : null}
      {isError ? <Alert severity="error">Failed to load project.</Alert> : null}
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {project ? (
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{project.name}</Typography>
              <Typography color="text.secondary">{project.description || "No description provided"}</Typography>
            </Box>
            <Button variant="contained" onClick={() => { setModalOpen(true); setEditingTask(undefined); }}>
              Add Task
            </Button>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_e, v) => { if (v) setViewMode(v); }}
              size="small"
            >
              <ToggleButton value="list"><ViewList fontSize="small" />&nbsp;List</ToggleButton>
              <ToggleButton value="kanban"><ViewKanban fontSize="small" />&nbsp;Board</ToggleButton>
            </ToggleButtonGroup>

            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="todo">Todo</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 220 }} size="small">
              <InputLabel>Assignee</InputLabel>
              <Select value={assigneeFilter} label="Assignee" onChange={(e) => setAssigneeFilter(e.target.value)}>
                <MenuItem value="ALL">All</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {filteredTasks.length === 0 ? <Alert severity="warning">No tasks for the selected filters.</Alert> : null}

          {viewMode === "kanban" ? (
            <KanbanBoard
              tasks={filteredTasks}
              onStatusChange={(taskId, newStatus) =>
                updateMutation.mutate({ taskId, payload: { status: newStatus } })
              }
              onEdit={(task) => {
                setEditingTask(task);
                setModalOpen(true);
              }}
              onDelete={(taskId) => deleteMutation.mutate(taskId)}
            />
          ) : (
          <Stack spacing={2}>
            {filteredTasks.map((task) => (
              <Card key={task.id} sx={{ border: "1px solid #e5e7eb" }}>
                <CardContent>
                  <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="h6">{task.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {task.description || "No description"}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Chip label={task.status} color="primary" size="small" />
                        <Chip label={task.priority} color="secondary" size="small" />
                        <Chip label={task.dueDate ? `Due ${task.dueDate}` : "No due date"} size="small" />
                      </Stack>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setEditingTask(task);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button color="error" variant="outlined" onClick={() => deleteMutation.mutate(task.id)}>
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
          )}
        </Stack>
      ) : null}

      <TaskModal
        open={modalOpen}
        users={users}
        task={editingTask}
        onClose={() => {
          setModalOpen(false);
          setEditingTask(undefined);
        }}
        onSubmit={(payload) => {
          if (editingTask) {
            updateMutation.mutate({ taskId: editingTask.id, payload });
            return;
          }
          createMutation.mutate(payload);
        }}
      />
    </Container>
  );
};
