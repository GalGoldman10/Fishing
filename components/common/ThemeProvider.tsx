import { createContext, useContext, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { colors, ColorScheme, ThemeColors } from '@/constants/theme';
import { useThemeStore } from '@/stores/themeStore';

interface ThemeContextValue {
  colorScheme: ColorScheme;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colorScheme: 'light',
  colors: colors.light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const storedScheme = useThemeStore((s) => s.colorScheme);
  const resolvedSystem: ColorScheme = systemScheme === 'dark' ? 'dark' : 'light';
  const colorScheme: ColorScheme =
    storedScheme === 'system' ? resolvedSystem : storedScheme;
  const themeColors: ThemeColors = colors[colorScheme];

  return (
    <ThemeContext.Provider
      value={{ colorScheme, colors: themeColors, isDark: colorScheme === 'dark' }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
