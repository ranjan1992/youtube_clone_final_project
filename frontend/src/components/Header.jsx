import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = ({ onToggleSidebar, onSearch }) => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn" onClick={onToggleSidebar} aria-label="Menu">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <Link to="/" className="logo">
          <svg viewBox="0 0 90 20" width="90" height="20">
            <text x="0" y="16" fill="#FF0000" fontSize="20" fontWeight="bold">▶</text>
            <text x="22" y="16" fill="white" fontSize="14" fontWeight="bold">YouTube</text>
          </svg>
        </Link>
      </div>

      <form className="header-center" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn" aria-label="Search">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
      </form>

      <div className="header-right">
        {user ? (
          <div className="user-menu" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="avatar-circle">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            {showDropdown && (
              <div className="dropdown">
                <div className="dropdown-user">
                  <div className="avatar-circle">{user.username?.charAt(0).toUpperCase()}</div>
                  <span>{user.username}</span>
                </div>
                <hr className="dropdown-divider" />
                <Link to="/channel/my" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                  My Channel
                </Link>
                <button className="dropdown-item" onClick={handleLogout}>Sign out</button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="signin-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
