import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';

import { client } from '../streamClient.js'
import { ChannelSearch } from './messages/components/'

import LogoutIcon from '../assets/icons/exit.png';
import logo from '../assets/icons/white.png';

import '../styles/layout.css';

const cookies = new Cookies();

const Layout = ({ children, setToggleContainer, theme, setTheme, setAuthToken }) => {
  const defaultTheme = theme || 'system';
  const html = document.documentElement;
  const navigate = useNavigate();

  useEffect(() => {
    if(!cookies.get('token')) {
      navigate('/');
    }
  }, [navigate]);

  const location = useLocation();
  
  const isActive = (path) => location.pathname === path ? 'active' : '';
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const html = document.documentElement;

    const effectiveTheme =
      theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;

    html.classList.remove('light', 'dark');
    html.classList.add(effectiveTheme);
  }, [theme]);


  const getChannels = async (text) => {
    try {
      // TODO: FETCH CHANNELS
    } catch (error) {
      setQuery('')
    }
  }

  const onSearch = (event) => {
    event.preventDefault();

    setLoading(true);
    setQuery(event.target.value);
    getChannels(event.target.value);
  }

  const user = client.user;
  const userAvatar = user?.image

  const logout = () => {
    cookies.remove('token', { path: '/' });
    cookies.remove('userId', { path: '/' });
    cookies.remove('username', { path: '/' });
    cookies.remove('fullName', { path: '/' });
    cookies.remove('avatarURL', { path: '/' });
    cookies.remove('hashedPassword', { path: '/' });
    cookies.remove('phoneNumber', { path: '/' });

    setAuthToken(null); // Update App state to reflect logout
    navigate('/'); // Redirect to Auth page
  };

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <img src={logo} alt="reconnect logo" className="logo" />

        <div className='header-right'>
          <div className="profile-circle">
            <img 
              src={userAvatar || '/default-avatar.png'}
              alt="Profile"
              className="profile-img"
            />
          </div>

          <div className='header-logout__icon'>
            <div className='header-logout__icon-inner' onClick={logout}>
              <img src={LogoutIcon} alt='Logout Image' 
              preview={logout}/>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <ul>
              <li className={isActive('/lostAndFound')}>
                <Link to="/lostAndFound">📦 Lost and Found</Link>
              </li>
              <li className={isActive('/messages')}>
                <Link to="/messages">💬 Messages</Link>
              </li>
              <li className={isActive('/notifications')}>
                <Link to="/notifications">🔔 Notification</Link>
              </li>
              <li className={isActive('/settings')}>
                <Link to="/settings">⚙️ Settings</Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <Outlet context={{ setTheme, theme }} />
        </main>

        {/* Search Panel */}
        <aside className="search-panel">
          <ChannelSearch setToggleContainer={setToggleContainer} />
        </aside>
      </div>
    </>
  );
};

export default Layout;
