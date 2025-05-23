import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

import { client } from '../streamClient.js';
// import { ChannelSearch } from './messages/components/';

import LogoutIcon from '../assets/icons/exit.png';
import logo from '../assets/icons/white.png';

import '../styles/layout.css';

const cookies = new Cookies();

const Layout = ({ children, setToggleContainer, theme, setTheme, setAuthToken }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check auth token on mount; redirect if missing
  useEffect(() => {
    const token = cookies.get('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Wait for client user to be connected
    if (client.user) {
      setUser(client.user);
      setLoading(false);
    } else {
      // Try connecting user from cookies if client.user not set
      const userId = cookies.get('userId');
      if (!userId) {
        navigate('/');
        return;
      }
      // Reconnect user on client
      client.connectUser(
        {
          id: userId,
          name: cookies.get('username'),
          fullName: cookies.get('fullName'),
          email: cookies.get('email'),
          image: cookies.get('avatarURL'),
          phoneNumber: cookies.get('phoneNumber'),
        },
        token
      ).then(() => {
        setUser(client.user);
        setLoading(false);
      }).catch(() => {
        // Failed to connect user
        navigate('/');
      });
    }
  }, [navigate]);

  // Theme effect
  useEffect(() => {
    const html = document.documentElement;
    const effectiveTheme =
      theme === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : theme;

    html.classList.remove('light', 'dark');
    html.classList.add(effectiveTheme);
  }, [theme]);

  const logout = () => {
    cookies.remove('token', { path: '/' });
    cookies.remove('userId', { path: '/' });
    cookies.remove('username', { path: '/' });
    cookies.remove('fullName', { path: '/' });
    cookies.remove('avatarURL', { path: '/' });
    cookies.remove('hashedPassword', { path: '/' });
    cookies.remove('phoneNumber', { path: '/' });

    setAuthToken(null);
    client.disconnectUser(); 
    navigate('/');
  };

  window.logout = logout;

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <>
      <header className="header">
        <img src={logo} alt="reconnect logo" className="logo" />

        <div className="header-right">
          <div className="header-logout__icon">
            <div className="header-logout__icon-inner" onClick={logout} role="button" tabIndex={0}>
              <img src={LogoutIcon} alt="Logout" />
            </div>
          </div>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-profile">
            {/* <img
              src={user?.image || '/default-avatar.png'}
              alt="Profile"
              className="sidebar-profile-img"
            /> */}
            <p className="sidebar-username">{user?.fullName || user?.name || 'User'}</p>
          </div>

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

        <main className="main-content">
          <Outlet context={{ setTheme, theme }} />
        </main>

        <aside className="search-panel">
          {/* <ChannelSearch setToggleContainer={setToggleContainer} /> */}
        </aside>
      </div>
    </>
  );
};

export default Layout;

