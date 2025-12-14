import React from 'react';
import { CalendarEvent } from '../types';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
}

const MonthView: React.FC<MonthViewProps> = ({ currentDate, events }) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
  const days = [];

  // Pad empty slots before first day
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Fill days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return events.filter(
      (e) =>
        e.start.getDate() === date.getDate() &&
        e.start.getMonth() === date.getMonth() &&
        e.start.getFullYear() === date.getFullYear()
    );
  };

  const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-sm font-semibold text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((date, index) => {
          const dayEvents = getEventsForDay(date);
          const isToday =
            date &&
            new Date().toDateString() === date.toDateString();

          return (
            <div
              key={index}
              className={`
                min-h-[100px] border-b border-l border-gray-100 p-2 transition-colors hover:bg-gray-50
                ${!date ? 'bg-gray-50/50' : ''}
              `}
            >
              {date && (
                <>
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`
                        text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                        ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}
                      `}
                    >
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="space-y-1 overflow-y-auto max-h-[80px] no-scrollbar">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1.5 py-0.5 rounded truncate ${event.color || 'bg-blue-100 text-blue-700'}`}
                      >
                         {event.start.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })} {event.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
