// src/components/Home.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHome,
  FaSearch,
  FaUser,
  FaRegCalendarAlt,
  FaTimes,
} from "react-icons/fa";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
} from "date-fns";
import axios from "axios";
import "./css/Home.css";
import "./css/Sidebar.css";
import Sidebar from "./Sidebar";
const Home = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editedSchedule, setEditedSchedule] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [calendarType, setCalendarType] = useState(null);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ✅ 서버에서 일정 데이터를 불러오는 함수 (수정)
  const fetchSchedules = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      // JWT에서 userId 추출
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const decodedToken = JSON.parse(atob(base64));
      const userId = decodedToken?.userId;

      if (!userId) {
        console.error("유효하지 않은 사용자 ID");
        return;
      }

      console.log("현재 로그인된 사용자 ID:", userId);

      // 사용자의 일정만 조회
      const response = await axios.get(
        `https://api.gasdg.store/api/applications/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.data && Array.isArray(response.data)) {
        const mappedSchedules = response.data.flatMap((schedule) => {
          const events = [];
          const companyName = schedule.company?.company_name || "회사명 없음"; // 기존 기업명 유지

          if (schedule.submissionDate) {
            events.push({
              ...schedule,
              companyName,
              eventType: "서류 제출",
              eventDate: new Date(schedule.submissionDate)
                .toISOString()
                .split("T")[0],
            });
          }
          if (schedule.interviewDate) {
            events.push({
              ...schedule,
              companyName,
              eventType: "면접",
              eventDate: new Date(schedule.interviewDate)
                .toISOString()
                .split("T")[0],
            });
          }
          if (schedule.acceptanceDate) {
            events.push({
              ...schedule,
              companyName,
              eventType: "최종 발표",
              eventDate: new Date(schedule.acceptanceDate)
                .toISOString()
                .split("T")[0],
            });
          }
          return events;
        });

        setSchedules(mappedSchedules);
        console.log("서버에서 불러온 일정:", mappedSchedules);
      } else {
        console.warn("서버 응답이 비어 있거나 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("일정 데이터를 불러오지 못했습니다.", error);
    }
  };

  // ✅ 컴포넌트가 처음 렌더링될 때 일정 데이터를 가져옴
  useEffect(() => {
    fetchSchedules(); // 데이터를 초기화할 때 호출
    setCurrentDate(new Date());
  }, []); // 빈 배열을 전달하여 컴포넌트 초기 로딩 시 한 번만 호출

  const startCurrentMonth = startOfMonth(currentDate);
  const endCurrentMonth = endOfMonth(currentDate);
  const startOfFirstWeek = startOfWeek(startCurrentMonth, { weekStartsOn: 0 });
  const endOfLastWeek = endOfWeek(endCurrentMonth, { weekStartsOn: 0 });
  const [expandedDate, setExpandedDate] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSlidingNext, setIsSlidingNext] = useState(false);
  const [isSlidingPrev, setIsSlidingPrev] = useState(false);
  const today = new Date(); // 오늘 날짜
  const isTodayCurrentMonth =
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear();

  const days = eachDayOfInterval({
    start: startOfFirstWeek,
    end: endOfLastWeek,
  });

  const weeks = ["일", "월", "화", "수", "목", "금", "토"];

  const handlePrevMonth = () => {
    setIsSlidingPrev(true);
    setIsSlidingNext(false);

    setTimeout(() => {
      setCurrentDate((prevDate) => subMonths(prevDate, 1));
      setIsSlidingPrev(false);
    }, 500);
  };

  const handleNextMonth = () => {
    setIsSlidingNext(true);
    setIsSlidingPrev(false);

    setTimeout(() => {
      setCurrentDate((prevDate) => addMonths(prevDate, 1));
      setIsSlidingNext(false);
    }, 500);
  };
  // ✅ 특정 날짜 클릭 시 해당 날짜의 이벤트만 표시 (수정)
  const handleDateClick = (date) => {
    const formattedDate = format(date, "yyyy-MM-dd");

    const schedulesForDate = schedules.filter(
      (schedule) => schedule.eventDate === formattedDate
    );

    if (schedulesForDate.length > 0) {
      console.log("해당 날짜의 일정:", schedulesForDate);
      setSelectedSchedules([...schedulesForDate]);
      setCurrentSlide(0);
      setEditedSchedule({ ...schedulesForDate[0] });
    } else {
      console.log("해당 날짜의 일정이 없습니다.");
      setSelectedSchedules([]);
      setEditedSchedule(null);
    }
  };

  // ✅ 수정된 일정 데이터를 서버에 저장
  // 상태 저장 버튼 클릭 시 호출되는 함수
  const handleSaveSchedule = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("로그인이 필요합니다.");
        navigate("/login");
        return;
      }

      const payload = {
        applicationId: editedSchedule?.id, // ✅ 올바른 ID 필드명 사용
        status: editedSchedule?.status, // ✅ 한글 상태 값 ("서류통과", "면접대기" 등)
      };

      console.log("저장 요청 데이터:", payload); // 디버깅 로그

      await axios.put(
        "https://api.gasdg.store/api/applications/updateStatus",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      alert("일정 상태가 성공적으로 수정되었습니다.");
      fetchSchedules(); // 최신 데이터 불러오기
      setSelectedSchedule(null);
    } catch (error) {
      console.error("일정 상태 수정 실패", error);
      alert("일정 상태 수정에 실패했습니다.");
    }
  };

  const handleMoreClick = (date) => {
    setExpandedDate(date === expandedDate ? null : date);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) =>
      prev > 0 ? prev - 1 : selectedSchedules.length - 1
    );
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) =>
      prev < selectedSchedules.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="home-container">
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <main
        className={`main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <button
          className="add-schedule-btn"
          onClick={() => navigate("/schedule")}
        >
          일정 추가 +
        </button>

        <div className="calendar-header">
          <button onClick={handlePrevMonth}>{"<"}</button>
          <span>{format(currentDate, "yyyy년 MM월")}</span>
          <button onClick={handleNextMonth}>{">"}</button>
        </div>
        <div
          className={`calendar-grid ${
            isSlidingNext
              ? "slide-next"
              : isSlidingPrev
              ? "slide-prev"
              : "slide-reset"
          }`}
        >
          {weeks.map((week, index) => (
            <div key={index} className="day-header">
              {week}
            </div>
          ))}
          {days.map((day, index) => {
            const formattedDay = format(day, "yyyy-MM-dd");

            const events = schedules.filter(
              (schedule) => schedule.eventDate === formattedDay
            );

            const isExpanded = expandedDate === formattedDay;
            const isToday =
              day.getDate() === today.getDate() &&
              day.getMonth() === today.getMonth() &&
              day.getFullYear() === today.getFullYear();
            return (
              <div
                key={index}
                className={`day-cell ${events.length ? "clickable" : ""} ${
                  isToday ? "today-highlight" : ""
                }`}
                onClick={() => events.length && handleDateClick(day)}
              >
                <div className="day-number">{format(day, "d")}</div>
                <div className="event-container">
                  {events.slice(0, 2).map((event, idx) => (
                    <div key={idx} className="event">
                      <strong>{event.companyName}</strong>
                      <span className="event-type"> {event.eventType}</span>
                    </div>
                  ))}
                  {events.length > 2 && (
                    <button
                      className="more-events-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoreClick(formattedDay);
                      }}
                    >
                      {isExpanded ? "∧ 접기" : `+더보기 (${events.length - 2})`}
                    </button>
                  )}
                  {isExpanded &&
                    events.slice(2).map((event, idx) => (
                      <div key={idx} className="event expanded-event">
                        <strong>{event.companyName}</strong>
                        <span className="event-type"> {event.eventType}</span>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>

        {selectedSchedules.length > 0 && (
          <div className="mini-box">
            <button
              className="close-btn"
              onClick={() => setSelectedSchedules([])}
            >
              <FaTimes />
            </button>

            <div className="slider-container">
              <button className="slider-btn prev-btn" onClick={handlePrevSlide}>
                {"<"}
              </button>

              <div className="slider">
                {selectedSchedules.length > 0 ? (
                  selectedSchedules.map((schedule, index) => (
                    <div
                      key={index}
                      className={`slide ${
                        index === currentSlide ? "active" : ""
                      } ${index < currentSlide ? "slide-left" : "slide-right"}`}
                    >
                      <h2 className="mini-box-header">
                        {schedule?.companyName || "회사명 없음"}
                        <span className="mini-box-event-type">
                          {schedule.eventType}
                        </span>
                      </h2>
                      <div className="home-status-container">
                        <span className="home-status-label">현재 상태:</span>
                        <select
                          className="home-status-select"
                          value={editedSchedule?.status || ""}
                          onChange={(e) =>
                            setEditedSchedule({
                              ...schedule,
                              status: e.target.value,
                              id: schedule.id,
                            })
                          }
                        >
                          {[
                            { label: "서류 지원", value: "서류지원" },
                            { label: "서류 통과", value: "서류통과" },
                            { label: "면접 대기", value: "면접대기" },
                            { label: "면접 진행중", value: "면접진행중" }, // ✅ 공백 제거
                            { label: "면접 통과", value: "면접통과" }, // ✅ 공백 제거
                            { label: "합격", value: "합격" },
                            { label: "불합격", value: "불합격" },
                          ].map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button className="save-btn" onClick={handleSaveSchedule}>
                        상태 저장
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="slide empty">
                    <h2 className="mini-box-header">표시할 일정이 없습니다.</h2>
                  </div>
                )}
              </div>

              <button className="slider-btn next-btn" onClick={handleNextSlide}>
                {">"}
              </button>

              {/* ✅ Dot (페이지 인디케이터) 표시 */}
              <div className="dots">
                {selectedSchedules.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentSlide ? "active" : ""}`}
                    onClick={() => setCurrentSlide(index)}
                  ></span>
                ))}
              </div>

              <button className="slider-btn next-btn" onClick={handleNextSlide}>
                {">"}
              </button>

              <div className="dots">
                {selectedSchedules.map((_, index) => (
                  <span
                    key={index}
                    className={`dot ${index === currentSlide ? "active" : ""}`}
                    onClick={() => setCurrentSlide(index)}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
