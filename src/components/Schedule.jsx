// src/components/Schedule.jsx

import React, { useState } from "react";
import "./css/Schedule.css";
import { FaRegCalendarAlt, FaTimes } from "react-icons/fa";
import Calendar from "react-calendar";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // ✅ Axios 추가

const Schedule = () => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState({
    company: "",
    documentDate: "",
    interviewDate: "",
    finalDate: "",
    status: "서류지원", // 기본 상태값 설정
  });
  // 이전 화면으로 돌아가는 함수
  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back(); // 이전 페이지로 돌아감
    } else {
      navigate("/home"); // 만약 history가 없다면 기본적으로 홈으로 이동
    }
  };

  const [calendarType, setCalendarType] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);

  // ✅ 캘린더 열기
  const openCalendar = (type) => {
    setCalendarType(type);
    setCalendarVisible(true);
  };

  // ✅ 날짜 선택 시 처리
  const handleDateSelect = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");
    setSchedule((prev) => ({ ...prev, [calendarType]: formattedDate }));
    setCalendarVisible(false);
  };

  // ✅ 입력 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchedule((prev) => ({ ...prev, [name]: value }));
  };

  // Schedule.jsx (일정 생성 페이지)

  const handleCreateSchedule = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("📦 저장된 JWT 토큰:", token);

      let userId;
      try {
        const parts = token.split(".");
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const decodedToken = JSON.parse(atob(base64));
        userId = decodedToken?.userId;

        if (!userId) {
          console.error("JWT에서 userId를 찾을 수 없습니다.");
          alert("인증 정보가 올바르지 않습니다. 다시 로그인해 주세요.");
          navigate("/login");
          return;
        }
        console.log("현재 로그인된 사용자 ID:", userId);
      } catch (error) {
        console.error("JWT 토큰 디코딩 오류:", error);
        alert("유효하지 않은 인증 정보입니다. 다시 로그인해 주세요.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "https://api.gasdg.store/api/applications/save",
        {
          companyName: schedule.company,
          submissionDate: schedule.documentDate,
          interviewDate: schedule.interviewDate,
          acceptanceDate: schedule.finalDate,
          status: schedule.status,
          userId: userId, // ✅ 올바르게 userId 전달
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("응답 데이터:", response.data);
      alert("일정이 성공적으로 저장되었습니다.");
      navigate("/home", { replace: true });
      window.location.reload();
    } catch (error) {
      console.error("일정 저장 실패", error);
      if (error.response && error.response.status === 403) {
        alert("인증이 필요합니다. 다시 로그인해 주세요.");
        navigate("/login");
      } else {
        alert("일정 저장에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="schedule-container">
      <div className="schedule-box">
        {/* ❌ X 버튼 추가 */}
        <button className="close-btn" onClick={handleClose}>
          <FaTimes />
        </button>
        <h2 className="schedule-title">일정 추가</h2>

        <div className="schedule-field">
          <label>기업</label>
          <input
            type="text"
            name="company"
            value={schedule.company}
            onChange={handleChange}
            placeholder="기업명을 입력하세요"
          />
        </div>

        {["documentDate", "interviewDate", "finalDate"].map((type, idx) => (
          <div key={idx} className="schedule-field">
            <label>
              {type === "documentDate"
                ? "서류 제출 날짜"
                : type === "interviewDate"
                ? "면접 날짜"
                : "최종 발표 날짜"}
            </label>
            <div className="date-picker">
              <span>{schedule[type] || "year / month / day"}</span>
              <FaRegCalendarAlt
                className="calendar-icon"
                onClick={() => openCalendar(type)}
              />
            </div>
          </div>
        ))}

        <div className="schedule-field">
          <label>현재 상태</label>
          <select name="status" value={schedule.status} onChange={handleChange}>
            {[
              "서류지원",
              "서류통과",
              "면접대기",
              "면접 진행중",
              "면접 통과",
              "합격",
              "불합격",
            ].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <button className="create-btn" onClick={handleCreateSchedule}>
          생성하기
        </button>
      </div>

      {calendarVisible && (
        <div className="calendar-container">
          {/* ❌ 달력 닫기 버튼 추가 */}
          <button
            className="calendar-close-btn"
            onClick={() => setCalendarVisible(false)}
          >
            <FaTimes />
          </button>
          <Calendar onChange={handleDateSelect} />
        </div>
      )}
    </div>
  );
};

export default Schedule;
