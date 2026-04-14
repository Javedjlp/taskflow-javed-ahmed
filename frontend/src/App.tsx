import { Navigate, Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import { useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export default function App() {
  const { user } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {user ? <Navbar /> : null}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <ProtectedRoute>
              <ProjectDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to={user ? "/projects" : "/login"} replace />} />
      </Routes>
    </Box>
  );
}
