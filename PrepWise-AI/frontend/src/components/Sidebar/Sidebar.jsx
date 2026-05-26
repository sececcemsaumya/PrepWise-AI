import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Common/Logo";
import {
  GridIcon,
  FileTextIcon,
  PlayIcon,
  ClockIcon,
  BarChartIcon,
  UserIcon,
  LogOutIcon,
} from "../Common/Icons";
import "./Sidebar.css";

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <GridIcon size={18} />,
  },
  {
    path: "/upload-resume",
    label: "Upload Resume",
    icon: <FileTextIcon size={18} />,
  },
  {
    path: "/interview/setup",
    label: "New Interview",
    icon: <PlayIcon size={18} />,
    highlight: true,
  },
  {
    path: "/history",
    label: "Interview History",
    icon: <ClockIcon size={18} />,
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: <BarChartIcon size={18} />,
  },
  {
    path: "/profile",
    label: "Profile",
    icon: <UserIcon size={18} />,
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        {/* Logo — clicking goes to landing page */}
        <div className="sidebar-logo">
          <Link to="/" style={{ textDecoration: "none" }}>
            <Logo size="md" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""} ${item.highlight ? "highlight" : ""}`
              }
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.highlight && <span className="nav-badge">New</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{getInitials(user?.name)}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user?.name}</span>
              <span className="sidebar-user-email">{user?.email}</span>
            </div>
          </div>
          <button className="sidebar-logout btn btn-ghost btn-sm" onClick={handleLogout}>
            <LogOutIcon size={14} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
