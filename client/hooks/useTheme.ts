import { Colors } from "@/constants/theme";
import { useThemeContext } from "@/context/ThemeContext";

export function useTheme() {
  const { isDark, themeMode, setThemeMode, toggleTheme } = useThemeContext();
  const theme = Colors[isDark ? "dark" : "light"];

  return {
    theme,
    isDark,
    themeMode,
    setThemeMode,
    toggleTheme,
  };
}
