import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Common/Logo";
import { PlayIcon, UserIcon, GridIcon, LogOutIcon } from "../Common/Icons";
import "./Navbar.css";

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* Mobile menu toggle */}
        <button className="menu-toggle btn btn-ghost" onClick={onMenuToggle} aria-label="Toggle menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Logo — clicking goes to landing page */}
        <Link to="/" className="navbar-brand">
          <Logo size="sm" />
        </Link>
      </div>

      <div className="navbar-right">
        {/* Quick action */}
        <Link to="/interview/setup" className="btn btn-primary btn-sm navbar-cta">
          <PlayIcon size={13} />
          Start Interview
        </Link>

        {/* User menu */}
        <div className="user-menu" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">Candidate</span>
          </div>
          <svg
            className={`chevron ${dropdownOpen ? "open" : ""}`}
            width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>

          {dropdownOpen && (
            <div className="user-dropdown">
              <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <UserIcon size={14} />
                Profile
              </Link>
              <Link to="/dashboard" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <GridIcon size={14} />
                Dashboard
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item danger" onClick={handleLogout}>
                <LogOutIcon size={14} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
