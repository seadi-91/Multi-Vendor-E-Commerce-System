import React from 'react';
import { AlertCircle } from 'lucide-react';
import './Settings.scss';

const Settings = () => {
  return (
    <div className="settings-coming-soon">
      <div className="icon-wrapper">
        <AlertCircle size={64} color="#6366f1" />
      </div>
      <h1>Settings</h1>
      <p className="coming-soon-text">This page is coming soon.<br />Stay tuned for updates!</p>
    </div>
  );
};

export default Settings;
