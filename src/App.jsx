import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Home from "./components/Home";
import Schedule from "./components/Schedule";
import Company from "./components/company";
import Membership from "./components/Membership";
import User from "./components/User";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* 로그인 페이지 */}
          <Route path="/login" element={<Login />} />
          {/* 기본 경로에서도 로그인 화면 표시 */}
          <Route path="/" element={<Login />} />
          {/* 홈 페이지 */}
          <Route path="/home" element={<Home />} />
          {/* 일정 추가 페이지 */}
          <Route path="/schedule" element={<Schedule />} />
          {/* 🔍 기업별 */}
          <Route path="/company" element={<Company />} />
          {/* 🔍 기업별 */}
          <Route path="/account" element={<User />} />
          {/* 회원가입 페이지 */}
          <Route path="/membership" element={<Membership />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
