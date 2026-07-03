import { create } from 'zustand';
import { ColorScheme } from '@/constants/theme';

interface ThemeState {
  colorScheme: ColorScheme | 'system';
  setColorScheme: (scheme: ColorScheme | 'system') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  colorScheme: 'system',
  setColorScheme: (colorScheme) => set({ colorScheme }),
}));
