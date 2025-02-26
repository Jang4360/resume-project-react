// src/components/Sidebar.jsx

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaUser,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import "./css/Sidebar.css";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 사이드바 접기/펼치기 핸들러
  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isSidebarOpen ? <FaAngleLeft /> : <FaAngleRight />}
      </button>

      <div className="menu-items">
        <div className="logo">RESUME TRACKER</div>
        <ul>
          <li
            className={location.pathname === "/home" ? "active" : ""}
            onClick={() => navigate("/home")}
          >
            <FaHome className="icon" />
            {isSidebarOpen && <span>Home</span>}
          </li>
          <li
            className={location.pathname === "/company" ? "active" : ""}
            onClick={() => navigate("/company")}
          >
            <FaSearch className="icon" />
            {isSidebarOpen && <span>Company</span>}
          </li>
          <li
            className={location.pathname === "/account" ? "active" : ""}
            onClick={() => navigate("/account")}
          >
            <FaUser className="icon" />
            {isSidebarOpen && <span>Account</span>}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
