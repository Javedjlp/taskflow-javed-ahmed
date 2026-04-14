import { Alert, Box, Button, Container, Paper, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";
import { parseApiError } from "../hooks/useApiError";

export const LoginPage = () => {
  const { login: authenticate } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      next.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      next.email = "Enter a valid email";
    }

    if (!password) {
      next.password = "Password is required";
    }

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    setError(null);
    if (!validate()) {
      return;
    }
    mutation.mutate({ email: email.trim(), password });
  };

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      authenticate(data);
      navigate("/projects");
    },
    onError: (err) => setError(parseApiError(err)),
  });

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={0} sx={{ p: 4, border: "1px solid #e5e7eb" }}>
        <Stack spacing={2}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Welcome Back
          </Typography>
          <Typography color="text.secondary">Sign in to continue managing projects and delivery tasks.</Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
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
            helperText={fieldErrors.password}
            fullWidth
          />
          <Button
            size="large"
            variant="contained"
            disabled={mutation.isPending}
            onClick={handleSubmit}
          >
            {mutation.isPending ? "Signing in..." : "Sign In"}
          </Button>
          <Box>
            <Typography variant="body2">
              New here? <Link to="/register">Create account</Link>
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};
