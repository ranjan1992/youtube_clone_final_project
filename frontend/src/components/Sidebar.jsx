import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Home', path: '/' },
  { icon: '🔥', label: 'Trending', path: '/?category=Gaming' },
  { icon: '🎵', label: 'Music', path: '/?category=Music' },
  { icon: '🎮', label: 'Gaming', path: '/?category=Gaming' },
  { icon: '📰', label: 'News', path: '/?category=News' },
  { icon: '⚽', label: 'Sports', path: '/?category=Sports' },
];

const Sidebar = ({ isOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : 'sidebar--collapsed'}`}>
      <nav>
        {NAV_ITEMS.map((item) => (
          <Link to={item.path} key={item.label} className="sidebar-item">
            <span className="sidebar-icon">{item.icon}</span>
            {isOpen && <span className="sidebar-label">{item.label}</span>}
          </Link>
        ))}

        <hr className="sidebar-divider" />

        {user ? (
          <Link to="/channel/my" className="sidebar-item">
            <span className="sidebar-icon">📺</span>
            {isOpen && <span className="sidebar-label">My Channel</span>}
          </Link>
        ) : (
          isOpen && (
            <div className="sidebar-signin">
              <p>Sign in to like videos, comment, and subscribe.</p>
              <button onClick={() => navigate('/login')} className="sidebar-signin-btn">
                Sign In
              </button>
            </div>
          )
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
