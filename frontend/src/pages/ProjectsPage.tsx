import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject, getProjects } from "../api/projects";
import { parseApiError } from "../hooks/useApiError";

export const ProjectsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setOpen(false);
      setName("");
      setDescription("");
    },
    onError: (err) => setError(parseApiError(err)),
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" mb={3} gap={2}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Projects</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>Create Project</Button>
      </Stack>

      {isLoading ? <Alert severity="info">Loading projects...</Alert> : null}
      {isError ? <Alert severity="error">Failed to load projects.</Alert> : null}
      {!isLoading && projects.length === 0 ? (
        <Alert severity="warning">No projects found. Create your first project to get started.</Alert>
      ) : null}

      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} lg={4} key={project.id}>
            <Card
              sx={{ cursor: "pointer", border: "1px solid #e5e7eb", height: "100%" }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>{project.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {project.description || "No description"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField label="Project Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ name, description: description || undefined })}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
