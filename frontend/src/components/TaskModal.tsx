import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { Task, TaskPriority, TaskStatus, User } from "../types/models";

type Props = {
  open: boolean;
  users: User[];
  task?: Task;
  onClose: () => void;
  onSubmit: (payload: {
    title: string;
    description?: string;
    status?: TaskStatus;
    priority?: TaskPriority;
    assigneeId?: string | null;
    dueDate?: string | null;
  }) => void;
};

export const TaskModal = ({ open, users, task, onClose, onSubmit }: Props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");

  useEffect(() => {
    if (!task) {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setPriority("medium");
      setAssigneeId("");
      setDueDate("");
      return;
    }

    setTitle(task.title);
    setDescription(task.description ?? "");
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(task.assigneeId ?? "");
    setDueDate(task.dueDate ?? "");
  }, [task]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{task ? "Edit Task" : "Create Task"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={3}
          />

          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              <MenuItem value="todo">Todo</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="done">Done</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Assignee</InputLabel>
            <Select label="Assignee" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <MenuItem value="">Unassigned</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="Due Date"
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={() =>
            onSubmit({
              title,
              description: description || undefined,
              status,
              priority,
              assigneeId: assigneeId || null,
              dueDate: dueDate || null,
            })
          }
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
