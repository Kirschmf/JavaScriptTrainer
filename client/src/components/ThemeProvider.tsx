import React, { createContext, useContext, useEffect } from "react";
import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Always use dark theme
interface ThemeContextType {
  theme: "dark";
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "dark"
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    // Apply dark theme to document
    const root = window.document.documentElement;
    root.classList.add("dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark" }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Keep this component for visual consistency, but it doesn't do anything now
export function ThemeToggle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Dark theme"
      disabled
    >
      <Moon className="h-5 w-5" />
    </Button>
  );
}