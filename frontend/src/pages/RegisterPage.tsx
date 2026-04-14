import { Alert, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { register } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { parseApiError } from "../hooks/useApiError";

export const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const next: { name?: string; email?: string; password?: string } = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      next.name = "Name is required";
    }

    if (!trimmedEmail) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = "Enter a valid email";
    }

    if (!password) {
      next.password = "Password is required";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    setError(null);
    if (!validate()) {
      return;
    }
    mutation.mutate({ name: name.trim(), email: email.trim(), password });
  };

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      login(data);
      navigate("/projects");
    },
    onError: (err) => setError(parseApiError(err)),
  });

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: 4, border: "1px solid #e5e7eb" }}>
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Create Account
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password ?? "Minimum 8 characters"}
            fullWidth
          />
          <Button
            size="large"
            variant="contained"
            disabled={mutation.isPending}
            onClick={handleSubmit}
          >
            {mutation.isPending ? "Creating..." : "Register"}
          </Button>
          <Typography variant="body2">
            Already have an account? <Link to="/login">Sign in</Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
};
