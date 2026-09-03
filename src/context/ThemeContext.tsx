import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useApp } from './AppContext';
import {
  THEME_PRESETS,
  LOGO_ICON_OPTIONS,
  ThemePreset,
  applyThemeToDOM,
  getContrastTextColor,
} from '../lib/themeUtils';

interface ThemeContextType {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  logoIcon: string;
  themePreset: string;
  contrastText: string;
  isDarkMode: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  presets: ThemePreset[];
  logoOptions: typeof LOGO_ICON_OPTIONS;
  updateTheme: (changes: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    logoIcon?: string;
    themePreset?: string;
    darkMode?: boolean;
  }) => void;
  applyPreset: (presetId: string) => void;
  setClinicLogo: (logoUrl: string | undefined) => void;
  setLogoIcon: (iconId: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeTenant, updateTenantInfo } = useApp();

  const primaryColor = activeTenant?.primaryColor || '#2563eb';
  const secondaryColor = activeTenant?.secondaryColor || '#0ea5e9';
  const accentColor = activeTenant?.accentColor || '#38bdf8';
  const logoUrl = activeTenant?.logoUrl;
  const logoIcon = activeTenant?.logoIcon || 'activity';
  const themePreset = activeTenant?.themePreset || 'ocean';

  // Dark Mode State with LocalStorage & Tenant synchronization
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('clinicflow_dark_mode');
      if (saved !== null) {
        return saved === 'true';
      }
      if (typeof activeTenant?.darkMode === 'boolean') {
        return activeTenant.darkMode;
      }
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch {
      // Fallback in case of restricted iframe storage
    }
    return false;
  });

  // Sync dark mode state when activeTenant changes
  useEffect(() => {
    if (typeof activeTenant?.darkMode === 'boolean' && activeTenant.darkMode !== isDarkMode) {
      setIsDarkMode(activeTenant.darkMode);
    }
  }, [activeTenant?.darkMode]);

  // Apply dark class & theme to DOM
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
      try {
        localStorage.setItem('clinicflow_dark_mode', isDarkMode ? 'true' : 'false');
      } catch {
        // Storage fallback
      }
    }
  }, [isDarkMode]);

  // Apply theme colors to DOM whenever activeTenant color settings change
  useEffect(() => {
    applyThemeToDOM({
      primaryColor,
      secondaryColor,
      accentColor,
    });
  }, [primaryColor, secondaryColor, accentColor]);

  const contrastText = useMemo(() => getContrastTextColor(primaryColor), [primaryColor]);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    updateTenantInfo({ darkMode: next });
  };

  const setDarkMode = (enabled: boolean) => {
    setIsDarkMode(enabled);
    updateTenantInfo({ darkMode: enabled });
  };

  const updateTheme = (changes: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    logoUrl?: string;
    logoIcon?: string;
    themePreset?: string;
    darkMode?: boolean;
  }) => {
    if (typeof changes.darkMode === 'boolean') {
      setIsDarkMode(changes.darkMode);
    }

    updateTenantInfo({
      ...changes,
    });

    applyThemeToDOM({
      primaryColor: changes.primaryColor || primaryColor,
      secondaryColor: changes.secondaryColor || secondaryColor,
      accentColor: changes.accentColor || accentColor,
    });
  };

  const applyPreset = (presetId: string) => {
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (found) {
      updateTheme({
        primaryColor: found.primaryColor,
        secondaryColor: found.secondaryColor,
        accentColor: found.accentColor,
        themePreset: found.id,
      });
    }
  };

  const setClinicLogo = (url: string | undefined) => {
    updateTheme({ logoUrl: url });
  };

  const setLogoIcon = (iconId: string) => {
    updateTheme({ logoIcon: iconId });
  };

  const value = useMemo(
    () => ({
      primaryColor,
      secondaryColor,
      accentColor,
      logoUrl,
      logoIcon,
      themePreset,
      contrastText,
      isDarkMode,
      darkMode: isDarkMode,
      toggleDarkMode,
      setDarkMode,
      presets: THEME_PRESETS,
      logoOptions: LOGO_ICON_OPTIONS,
      updateTheme,
      applyPreset,
      setClinicLogo,
      setLogoIcon,
    }),
    [
      primaryColor,
      secondaryColor,
      accentColor,
      logoUrl,
      logoIcon,
      themePreset,
      contrastText,
      isDarkMode,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
