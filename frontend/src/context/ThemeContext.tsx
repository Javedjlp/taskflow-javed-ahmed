import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";

type ThemeContextValue = {
  mode: "light" | "dark";
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = "taskflow_theme";

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === "dark" ? "dark" : "light";
  });

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#0f766e" },
          secondary: { main: "#2563eb" },
          ...(mode === "light"
            ? { background: { default: "#f6f8fb", paper: "#ffffff" } }
            : {}),
        },
        shape: { borderRadius: 12 },
        typography: { fontFamily: "'Poppins', 'Segoe UI', sans-serif" },
      }),
    [mode]
  );

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeContextProvider");
  }
  return context;
};
