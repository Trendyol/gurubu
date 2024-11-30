import React, { createContext, useContext, useState, ReactNode } from "react";

export type ThemeType = "default" | "snow";

interface ThemeContextType {
  currentTheme: ThemeType;
  isThemeActive: boolean;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>("default");
  const [isThemeActive, setIsThemeActive] = useState(false);

  const setTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
  };

  const toggleTheme = () => {
    setIsThemeActive((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{ currentTheme, isThemeActive, setTheme, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
};