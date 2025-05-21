import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { MessagePage, LostAndFoundPage, Notification, Settings, Auth, Layout } from './components';

const cookies = new Cookies();

const App = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');

  // Use state for authToken, initialize from cookie
  const [authToken, setAuthToken] = useState(cookies.get('token'));
  const [isThemeReady, setIsThemeReady] = useState(false);

  // Effect to watch theme changes (your existing logic)
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      root.classList.remove('dark');
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'system') {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        }
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);
    setIsThemeReady(true);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') applyTheme();
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  if (!isThemeReady) return null;

  return (
    <Routes>
      <Route path="/Auth" element={<Auth />} />
      {!authToken ? (
        <Route path="/" element={<Auth />} />
      ) : (
        <>
          <Route
            element={
              <Layout
                theme={theme}
                setTheme={setTheme}
                setAuthToken={setAuthToken}  // Pass setAuthToken to Layout
              />
            }
          >
            <Route path="/messages" element={<MessagePage />} />
            <Route path="/lostAndFound" element={<LostAndFoundPage />} />
            <Route path="/notifications" element={<Notification />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<div>Welcome to Re:Connect!</div>} />
          </Route>
        </>
      )}
    </Routes>
  );
};

export default App;

