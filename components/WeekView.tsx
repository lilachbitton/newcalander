import React, { useMemo } from 'react';
import { CalendarEvent } from '../types';

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, events }) => {
  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day; // Adjust so 0 is Sunday (start of week)
    return new Date(d.setDate(diff));
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [startOfWeek]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Filter events for this week
  const weekEvents = useMemo(() => {
      const start = new Date(weekDays[0]);
      start.setHours(0,0,0,0);
      const end = new Date(weekDays[6]);
      end.setHours(23,59,59,999);
      
      return events.filter(e => e.start >= start && e.end <= end);
  }, [events, weekDays]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header Row */}
      <div className="flex border-b border-gray-200 overflow-y-scroll scrollbar-hide">
        <div className="w-16 flex-shrink-0 bg-gray-50 border-l border-gray-200"></div> {/* Time axis header */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((date, index) => {
             const isToday = new Date().toDateString() === date.toDateString();
             return (
              <div key={index} className="py-3 text-center border-l border-gray-200 last:border-l-0">
                <div className="text-xs font-semibold text-gray-500 uppercase">
                    {date.toLocaleDateString('he-IL', { weekday: 'long' })}
                </div>
                <div className={`mt-1 text-sm font-bold w-8 h-8 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-800'}`}>
                  {date.getDate()}
                </div>
              </div>
             );
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto relative no-scrollbar">
        <div className="flex min-h-[1440px]"> {/* 24h * 60px/h */}
          
          {/* Time Labels */}
          <div className="w-16 flex-shrink-0 flex flex-col bg-gray-50 border-l border-gray-200 text-xs text-gray-500 font-medium">
            {hours.map((hour) => (
              <div key={hour} className="h-[60px] relative">
                <span className="absolute -top-2.5 right-2">
                  {hour.toString().padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          <div className="flex-1 grid grid-cols-7 relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 z-0 flex flex-col w-full h-full pointer-events-none">
                {hours.map((hour) => (
                    <div key={`line-${hour}`} className="h-[60px] border-b border-gray-100 w-full"></div>
                ))}
            </div>

            {weekDays.map((dayDate, dayIndex) => {
               // Filter events for this specific day
               const dayEvents = weekEvents.filter(e => e.start.toDateString() === dayDate.toDateString());

               return (
                <div key={dayIndex} className="relative h-full border-l border-gray-100 last:border-l-0">
                    {dayEvents.map(event => {
                        const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
                        const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
                        const duration = endMinutes - startMinutes;
                        
                        return (
                            <div
                                key={event.id}
                                className={`absolute left-0.5 right-0.5 rounded px-2 py-1 text-xs border overflow-hidden cursor-pointer hover:brightness-95 transition shadow-sm z-10 ${event.color || 'bg-blue-100 border-blue-200 text-blue-800'}`}
                                style={{
                                    top: `${startMinutes}px`, // 1min = 1px height
                                    height: `${Math.max(duration, 20)}px`
                                }}
                            >
                                <div className="font-semibold">{event.title}</div>
                                <div>{event.start.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})} - {event.end.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</div>
                            </div>
                        );
                    })}
                </div>
               );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeekView;
