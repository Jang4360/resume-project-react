// src/components/Login.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/Login.css";

const Login = () => {
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이션 훅
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Login.jsx
  const handleLogin = async () => {
    const loginData = {
      email,
      password,
    };

    console.log("📡 로그인 요청 데이터:", loginData);

    try {
      const response = await axios.post(
        "https://api.gasdg.store/api/login",
        loginData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          // ✅ withCredentials 제거
        }
      );

      if (response.status === 200) {
        console.log("✅ 로그인 성공:", response.data);

        // ✅ JWT 토큰을 localStorage에 저장
        const token = response.data.token;
        console.log("저장할 JWT 토큰:", token);
        localStorage.setItem("token", token);

        alert("로그인 성공");
        navigate("/home");
      } else {
        console.warn("⚠️ 로그인 실패:", response);
        alert("로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("❌ 로그인 실패:", error);
      if (error.response) {
        console.error("서버 응답:", error.response.data);
        if (error.response.status === 401) {
          alert("인증에 실패했습니다. 이메일과 비밀번호를 확인하세요.");
        } else {
          alert("로그인에 실패했습니다.");
        }
      } else {
        console.error("📡 요청이 전송되었지만 응답을 받지 못했습니다.");
        alert("서버에 연결할 수 없습니다.");
      }
    }
  };

  return (
    <div className="login-container">
      <h1>RESUME TRACKER</h1>
      <h2>환영합니다</h2>
      <form>
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          placeholder="이메일 입력하세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          placeholder="비밀번호 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="button" className="login-button" onClick={handleLogin}>
          로그인
        </button>

        <p className="signup-text" onClick={() => navigate("/membership")}>
          회원가입
        </p>
      </form>
    </div>
  );
};
export default Login;
