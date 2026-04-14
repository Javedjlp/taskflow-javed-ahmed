import { Box, Card, CardContent, Chip, IconButton, Paper, Stack, Typography } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import type { DragEvent } from "react";
import type { Task, TaskStatus } from "../types/models";

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: "todo", label: "Todo", color: "#f59e0b" },
  { status: "in_progress", label: "In Progress", color: "#3b82f6" },
  { status: "done", label: "Done", color: "#10b981" },
];

type Props = {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

export const KanbanBoard = ({ tasks, onStatusChange, onEdit, onDelete }: Props) => {
  const handleDragStart = (e: DragEvent<HTMLDivElement>, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (task && task.status !== status) {
        onStatusChange(taskId, status);
      }
    }
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
        gap: 2,
        minHeight: 400,
      }}
    >
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        return (
          <Paper
            key={col.status}
            variant="outlined"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.status)}
            sx={{
              p: 2,
              minHeight: 300,
              bgcolor: "action.hover",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: col.color }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {col.label}
              </Typography>
              <Chip label={columnTasks.length} size="small" />
            </Stack>

            <Stack spacing={1.5} sx={{ flex: 1 }}>
              {columnTasks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
                  Drop tasks here
                </Typography>
              ) : null}

              {columnTasks.map((task) => (
                <Card
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  sx={{
                    cursor: "grab",
                    "&:active": { cursor: "grabbing" },
                    "&:hover": { boxShadow: 4 },
                    transition: "box-shadow 0.15s",
                  }}
                >
                  <CardContent sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {task.title}
                      </Typography>
                      <Stack direction="row" spacing={0}>
                        <IconButton size="small" onClick={() => onEdit(task)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => onDelete(task.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                    {task.description ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }} noWrap>
                        {task.description}
                      </Typography>
                    ) : null}
                    <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                      <Chip label={task.priority} size="small" color="secondary" variant="outlined" />
                      {task.dueDate ? (
                        <Chip label={`Due ${task.dueDate}`} size="small" variant="outlined" />
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
};
