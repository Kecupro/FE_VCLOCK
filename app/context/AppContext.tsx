"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppContextType {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load dark mode preference from localStorage on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('adminDarkMode');
    if (savedDarkMode !== null) {
      setIsDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('adminDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value: AppContextType = {
    isSidebarCollapsed,
    toggleSidebar,
    isDarkMode,
    toggleDarkMode,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 