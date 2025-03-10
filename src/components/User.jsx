// src/components/User.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import Sidebar from "./Sidebar"; // 공통 Sidebar 컴포넌트 가져오기
import "./css/User.css";
import "./css/Sidebar.css";

const User = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // 사이드바 상태 추가

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }
      try {
        const response = await axios.get(
          "https://api.gasdg.store/api/users/info",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setUserName(response.data.name || "이름 없음");
        setUserEmail(response.data.email || "이메일 없음");
      } catch (error) {
        console.error("사용자 정보를 가져오는 데 실패했습니다.", error);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("로그아웃되었습니다.");
    navigate("/login");
  };

  return (
    <div className="user-container">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <div className="account-card">
          <h1>계정 정보</h1>
          <div className="user-info">
            <p>
              <strong>이름:</strong> {userName}
            </p>
            <p>
              <strong>이메일:</strong> {userEmail}
            </p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="icon" /> 로그아웃
          </button>
        </div>
      </main>
    </div>
  );
};
export default User;
