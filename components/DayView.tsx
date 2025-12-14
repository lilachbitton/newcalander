import React from 'react';
import { CalendarEvent } from '../types';

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
}

const DayView: React.FC<DayViewProps> = ({ currentDate, events }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Filter for current day
  const dayEvents = events.filter(e => 
    e.start.getDate() === currentDate.getDate() && 
    e.start.getMonth() === currentDate.getMonth() &&
    e.start.getFullYear() === currentDate.getFullYear()
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="p-4 border-b border-gray-200 text-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">{currentDate.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto relative no-scrollbar">
         <div className="flex min-h-[1440px]">
            {/* Time Labels */}
            <div className="w-20 flex-shrink-0 flex flex-col bg-gray-50 border-l border-gray-200 text-sm text-gray-500 font-medium">
                {hours.map((hour) => (
                <div key={hour} className="h-[60px] relative border-b border-gray-100/50">
                    <span className="absolute -top-3 right-4">
                    {hour.toString().padStart(2, '0')}:00
                    </span>
                </div>
                ))}
            </div>

            {/* Event Area */}
            <div className="flex-1 relative">
                {/* Horizontal Guides */}
                <div className="absolute inset-0 z-0 flex flex-col w-full h-full pointer-events-none">
                    {hours.map((hour) => (
                        <div key={`line-${hour}`} className="h-[60px] border-b border-gray-100 w-full"></div>
                    ))}
                </div>

                {dayEvents.map(event => {
                    const startMinutes = event.start.getHours() * 60 + event.start.getMinutes();
                    const endMinutes = event.end.getHours() * 60 + event.end.getMinutes();
                    const duration = endMinutes - startMinutes;

                    return (
                        <div
                            key={event.id}
                            className={`absolute right-4 left-4 rounded-md p-3 text-sm border shadow-md cursor-pointer hover:scale-[1.01] transition-transform z-10 ${event.color || 'bg-blue-100 border-blue-200 text-blue-800'}`}
                            style={{
                                top: `${startMinutes}px`,
                                height: `${Math.max(duration, 30)}px`
                            }}
                        >
                            <div className="font-bold text-base">{event.title}</div>
                            <div className="opacity-90">{event.start.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})} - {event.end.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'})}</div>
                        </div>
                    );
                })}

                {/* Current Time Indicator (Visual Polish) */}
                {new Date().toDateString() === currentDate.toDateString() && (
                    <div 
                        className="absolute w-full border-t-2 border-red-500 z-20 pointer-events-none"
                        style={{ top: `${new Date().getHours() * 60 + new Date().getMinutes()}px` }}
                    >
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                    </div>
                )}
            </div>
         </div>
      </div>
    </div>
  );
};

export default DayView;
