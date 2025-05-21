import React, { useState, useEffect } from 'react';

const SettingsThemeTabs = () => {
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    const link = document.getElementById('settings-theme-stylesheet');

    if (!link) return;

    if (theme === 'system') {
      link.href = 'styles/settings(system).css';
    } else if (theme === 'light') {
      link.href = 'styles/settings(light).css';
    } else if (theme === 'dark') {
      link.href = 'styles/settings(dark).css';
    }
  }, [theme]);

  return (
    <div className="tabs">
      <button className="tab-button1" onClick={() => setTheme('system')}>System</button>
      <button className="tab-button2" onClick={() => setTheme('light')}>Light</button>
      <button className="tab-button3" onClick={() => setTheme('dark')}>Dark</button>
    </div>
  );
};

export default SettingsThemeTabs;
