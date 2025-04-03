import React, { createContext, useContext, useEffect, useState } from "react";
import { PaintBucket, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { themes, Theme, DEFAULT_THEME_ID, getThemeById } from "@/lib/themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Theme context interface
interface ThemeContextType {
  currentTheme: Theme;
  setThemeById: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  currentTheme: themes[0],
  setThemeById: () => {},
});

// Custom hook to use the theme context
export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);

  useEffect(() => {
    // Check for saved theme in localStorage
    const savedThemeId = localStorage.getItem("jsrunner-theme-id");
    if (savedThemeId) {
      setCurrentTheme(getThemeById(savedThemeId));
    }
    
    // Always ensure dark mode is applied
    const root = window.document.documentElement;
    root.classList.add("dark");
  }, []);

  const setThemeById = (id: string) => {
    const newTheme = getThemeById(id);
    setCurrentTheme(newTheme);
    
    // Save theme preference to localStorage
    localStorage.setItem("jsrunner-theme-id", id);
    
    // Apply theme CSS variables
    applyThemeToDOM(newTheme);
  };

  // Apply the theme to DOM when it changes
  useEffect(() => {
    applyThemeToDOM(currentTheme);
  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, setThemeById }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper function to apply theme to DOM
function applyThemeToDOM(theme: Theme) {
  const root = document.documentElement;
  
  // Apply theme colors as CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
    
    // Also update RGB versions of colors for opacity/rgba usage
    if (key === 'primary') {
      const rgb = hexToRgb(value);
      if (rgb) root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
    else if (key === 'secondary') {
      const rgb = hexToRgb(value);
      if (rgb) root.style.setProperty('--secondary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
    else if (key === 'accent') {
      const rgb = hexToRgb(value);
      if (rgb) root.style.setProperty('--accent-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
    else if (key === 'destructive') {
      const rgb = hexToRgb(value);
      if (rgb) root.style.setProperty('--destructive-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    }
  });
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string) {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  let bigint = parseInt(hex, 16);
  
  // Handle different hex formats (3 or 6 characters)
  if (hex.length === 3) {
    const r = ((bigint >> 8) & 15) * 17;
    const g = ((bigint >> 4) & 15) * 17;
    const b = (bigint & 15) * 17;
    return { r, g, b };
  }
  
  if (hex.length === 6) {
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }
  
  return null;
}

// Theme toggle dropdown
export function ThemeToggle() {
  const { currentTheme, setThemeById } = useTheme();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Change theme">
          <PaintBucket className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Color Themes</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => setThemeById(theme.id)}
            className="flex items-start gap-2"
          >
            <div 
              className="w-4 h-4 rounded-full mt-0.5"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <div>
              <div className="font-medium">{theme.name}</div>
              <div className="text-xs text-muted-foreground">{theme.description}</div>
            </div>
            {currentTheme.id === theme.id && (
              <div className="ml-auto text-primary">✓</div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}