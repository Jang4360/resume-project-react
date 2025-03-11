// src/components/Company.jsx

import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUser,
  FaSearch,
  FaRegCalendarAlt,
  FaTimes,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import { format } from "date-fns";
import axios from "axios"; // Axios 추가
import "./css/Company.css";
import "./css/Sidebar.css";
import Sidebar from "./Sidebar";
// axios.defaults.baseURL = process.env.REACT_APP_API_URL;
const Company = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [calendarType, setCalendarType] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  // 🔍 Spring Boot API로부터 데이터 가져오기
  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "https://api.gasdg.store/api/applications/all",
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ 인증 헤더 추가
            "Content-Type": "application/json",
          },
        }
      );
      setSchedules(response.data);
    } catch (error) {
      console.error("Failed to fetch schedules", error);
    }
  };

  // 날짜 데이터를 "yyyy-MM-dd" 형식으로 변환
  const formatDate = (dateString) => {
    if (!dateString) return "year / month / day";
    return format(new Date(dateString), "yyyy-MM-dd");
  };

  // 🔍 Spring Boot API로 일정 저장
  const handleSave = async () => {
    try {
      // 서버에 전송할 데이터 가공
      const token = localStorage.getItem("token");
      const payload = {
        ...selectedSchedule,
        submissionDate: formatToISOString(selectedSchedule.submissionDate),
        interviewDate: formatToISOString(selectedSchedule.interviewDate),
        acceptanceDate: formatToISOString(selectedSchedule.acceptanceDate),
      };

      await axios.put(
        "https://api.gasdg.store/api/applications/update",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ 인증 헤더 추가
            "Content-Type": "application/json",
          },
        }
      );

      fetchSchedules(); // 저장 후 다시 데이터 불러오기
      setSelectedSchedule(null);

      // 🎉 수정 완료 알림창
      alert("수정되었습니다.");
    } catch (error) {
      console.error("Failed to save schedule", error);
      alert("수정에 실패했습니다.");
    }
  };

  // 🔍 일정 삭제 기능 추가
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.delete(`https://api.gasdg.store/api/applications/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ 인증 헤더 추가
          "Content-Type": "application/json",
        },
      });
      fetchSchedules(); // 삭제 후 다시 데이터 불러오기
      setSelectedSchedule(null);
    } catch (error) {
      console.error("Failed to delete schedule", error);
    }
  };

  const formatToISOString = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString(); // 서버가 기대하는 형식으로 변환
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch = schedule.companyName.includes(searchTerm);
    const matchesStatus = statusFilter
      ? schedule.status === statusFilter
      : true;
    return matchesSearch && matchesStatus;
  });

  const handleCompanyClick = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const closeMiniBox = () => {
    setSelectedSchedule(null);
  };

  const openCalendar = (type) => {
    setCalendarType(type);
    setCalendarVisible(true);
  };
  const closeCalendar = () => {
    setCalendarVisible(false);
  };

  const handleDateSelect = (date) => {
    setSelectedSchedule((prev) => ({
      ...prev,
      [calendarType]: format(date, "yyyy-MM-dd"),
    }));
    setCalendarVisible(false);
  };

  return (
    <div className="company-container">
      <button
        className="add-schedule-btn"
        onClick={() => navigate("/schedule")}
      >
        일정 추가 +
      </button>

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <main
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <div className="filter-container">
          <input
            type="text"
            className="search-bar"
            placeholder="검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">상태</option>
            <option value="서류지원">서류지원</option>
            <option value="서류통과">서류통과</option>
            <option value="면접대기">면접대기</option>
            <option value="면접 진행중">면접 진행중</option>
            <option value="면접 통과">면접 통과</option>
            <option value="합격">합격</option>
            <option value="불합격">불합격</option>
          </select>
        </div>

        <div className="company-list">
          <table>
            <thead>
              <tr>
                <th className="company-header-text">기업</th>
                <th className="status-header-text">현재 상태</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map((schedule, index) => (
                <tr key={index} onClick={() => handleCompanyClick(schedule)}>
                  <td className="company-name">{schedule.companyName}</td>
                  <td className="status-label">{schedule.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedSchedule && (
          <div className="mini-box">
            <button className="close-btn" onClick={closeMiniBox}>
              <FaTimes />
            </button>
            <div className="mini-box-header">
              {selectedSchedule.companyName}
            </div>

            {/* 날짜 및 상태 수정 UI 추가 */}
            {["submissionDate", "interviewDate", "acceptanceDate"].map(
              (type) => (
                <div className="date-field" key={type}>
                  <label>
                    {type === "submissionDate"
                      ? "서류 제출 날짜"
                      : type === "interviewDate"
                      ? "면접 날짜"
                      : "최종 발표 날짜"}
                  </label>
                  <div className="date-input-container">
                    <input
                      type="text"
                      value={formatDate(selectedSchedule[type])}
                      readOnly
                      className="date-input"
                    />
                    <FaRegCalendarAlt
                      className="calendar-icon"
                      onClick={() => openCalendar(type)}
                    />
                  </div>
                </div>
              )
            )}

            {/* 상태 선택 필드 */}
            <div className="status-container">
              <label>현재 상태</label>
              <select
                className="status-select"
                value={selectedSchedule.status || ""}
                onChange={(e) =>
                  setSelectedSchedule({
                    ...selectedSchedule,
                    status: e.target.value,
                  })
                }
              >
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

            {/* 수정 및 삭제 버튼 */}
            <div className="button-group">
              <button
                className="delete-btn"
                onClick={() => handleDelete(selectedSchedule.id)}
              >
                삭제
              </button>
              <button className="save-btn" onClick={handleSave}>
                수정하기
              </button>
            </div>

            {/* 📅 달력 컴포넌트 */}
            {calendarVisible && (
              <div className="calendar-popup">
                <Calendar onChange={handleDateSelect} />
                <button className="calendar-close-btn" onClick={closeCalendar}>
                  <FaTimes />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Company;
