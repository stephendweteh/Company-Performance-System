import React, { useEffect, useState } from 'react';
import axios from '../services/api';

export const CalendarDashboard = ({ onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [pendingTaskDays, setPendingTaskDays] = useState([]);
  const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const today = new Date();

  const toDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (value) => {
    if (!value) return null;
    return new Date(`${value}T00:00:00`);
  };

  useEffect(() => {
    const fetchPendingTaskDays = async () => {
      try {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const response = await axios.get('/api/tasks', {
          params: {
            status: 'pending',
            start_date: toDateString(monthStart),
            end_date: toDateString(monthEnd),
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const daySet = new Set();

        (response.data || []).forEach((task) => {
          const taskStart = parseDate(task.start_date);
          const taskEnd = parseDate(task.due_date);

          if (!taskStart || !taskEnd) return;

          const rangeStart = taskStart > monthStart ? taskStart : monthStart;
          const rangeEnd = taskEnd < monthEnd ? taskEnd : monthEnd;

          if (rangeStart > rangeEnd) return;

          const cursor = new Date(rangeStart);
          while (cursor <= rangeEnd) {
            daySet.add(cursor.getDate());
            cursor.setDate(cursor.getDate() + 1);
          }
        });

        setPendingTaskDays(Array.from(daySet));
      } catch (error) {
        console.error('Failed to load calendar task indicators:', error);
        setPendingTaskDays([]);
      }
    };

    fetchPendingTaskDays();
  }, [currentDate]);

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const handleDateClick = (day) => {
    setSelectedDay(day);
    onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const isToday = (day) =>
    day === today.getDate() &&
    currentDate.getMonth() === today.getMonth() &&
    currentDate.getFullYear() === today.getFullYear();

  const firstDay = firstDayOfMonth(currentDate);
  const daysCount = daysInMonth(currentDate);

  return (
    <div className="ta-card">
      <div className="ta-card-header flex items-center justify-between">
        <button
          onClick={handlePrevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-whiten transition-colors text-gray-500 hover:text-sidebar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-sidebar">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={handleNextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-whiten transition-colors text-gray-500 hover:text-sidebar"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div className="ta-card-body">
        <div className="grid grid-cols-7 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysCount }, (_, i) => {
            const day = i + 1;
            const active = day === selectedDay;
            const tod = isToday(day);
            const hasPendingTask = pendingTaskDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all
                  ${
                    active
                      ? 'bg-primary text-white shadow-card'
                      : tod
                      ? 'border-1.5 border-primary text-primary font-bold'
                      : 'text-gray-700 hover:bg-primary/10 hover:text-primary'
                  }`}
              >
                {day}
                {hasPendingTask && !active && (
                  <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-warning" />
                )}
              </button>
            );
          })}
        </div>
        {selectedDay && (
          <p className="mt-4 text-center text-xs text-gray-400">
            Selected: <span className="font-semibold text-primary">
              {new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay).toDateString()}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default CalendarDashboard;
