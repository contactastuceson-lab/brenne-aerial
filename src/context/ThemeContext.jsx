import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (t) => {
      if (t === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else if (t === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        // system
        root.classList.remove('dark', 'light');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) root.classList.add('dark');
        else root.classList.add('light');
      }
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e) => {
        root.classList.remove('dark', 'light');
        if (e.matches) root.classList.add('dark');
        else root.classList.add('light');
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}