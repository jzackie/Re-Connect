import React from 'react';
import { useOutletContext } from 'react-router-dom';

import './/settings.css'

const Settings = () => {
  const { theme, setTheme } = useOutletContext();

  const buttons = [
    { id: 'system', label: 'System' },
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
  ];

  return (
    <div className="settings-container p-4">
      <h2 className="text-xl mb-4 font-semibold">Theme Mode</h2>
      <div className="tabs">
        {buttons.map(({ id, label }) => (
          <button
            key={id}
            className={`tab-button ${theme === id ? 'active' : ''}`}
            onClick={() => setTheme(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Settings;

