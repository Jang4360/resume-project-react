// src/components/Membership.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Membership.css";
import axios from "axios";

const Membership = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      return;
    }

    try {
      const response = await axios.post("/users/join", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        alert("회원가입이 완료되었습니다.");
        navigate("/login"); // 회원가입 성공 시 로그인 화면으로 이동
      } else {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("회원가입 실패", error);
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="membership-container">
      <h1>회원가입</h1>
      <form>
        <label htmlFor="name">이름</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="이름을 입력하세요"
          value={formData.name}
          onChange={handleChange}
        />

        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="이메일을 입력하세요"
          value={formData.email}
          onChange={handleChange}
        />

        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="비밀번호 입력하세요"
          value={formData.password}
          onChange={handleChange}
        />

        <label htmlFor="confirmPassword">비밀번호 확인</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="비밀번호를 다시 입력하세요"
          value={formData.confirmPassword}
          onChange={handleChange}
          className={!passwordMatch ? "input-error" : ""}
        />
        {!passwordMatch && (
          <p className="error-text">입력한 비밀번호가 다릅니다</p>
        )}

        <button type="button" className="signup-button" onClick={handleSubmit}>
          회원가입
        </button>
      </form>
    </div>
  );
};

export default Membership;
