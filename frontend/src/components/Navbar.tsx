import { AppBar, Box, Button, IconButton, Toolbar, Tooltip, Typography } from "@mui/material";
import { DarkMode, LightMode } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider", backdropFilter: "blur(10px)" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, cursor: "pointer" }} onClick={() => navigate("/projects")}>
          TaskFlow
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="body2">Signed in as {user?.name}</Typography>
          <Tooltip title={mode === "light" ? "Dark mode" : "Light mode"}>
            <IconButton onClick={toggleMode} size="small">
              {mode === "light" ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
