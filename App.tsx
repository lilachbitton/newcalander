import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Settings, X } from 'lucide-react';
import { ViewMode, CalendarEvent } from './types';
import { fetchOrigamiSlots } from './services/origamiService';
import ViewSwitcher from './components/ViewSwitcher';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('week');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [apiBaseUrl, setApiBaseUrl] = useState('https://razerstar.origami.ms/api/v1');
  const [collectionId, setCollectionId] = useState('e_90');

  // Initial fetch
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { events: data, error: errorMsg } = await fetchOrigamiSlots(apiBaseUrl, collectionId);
      setEvents(data);
      if (errorMsg) {
          setError(errorMsg);
          // Auto-open settings if it looks like a config error to help the user
          if (errorMsg.includes('הגדרות') || errorMsg.includes('כתובת') || errorMsg.includes('אימות')) {
            setShowSettings(true);
          }
      }
    } catch (err) {
      setError('שגיאה לא צפויה');
    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() - 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() - 7);
    else newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (view === 'month') newDate.setMonth(newDate.getMonth() + 1);
    else if (view === 'week') newDate.setDate(newDate.getDate() + 7);
    else newDate.setDate(newDate.getDate() - 1); // Fixed direction for Hebrew
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getHeaderTitle = () => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    if (view === 'day') {
        return currentDate.toLocaleDateString('he-IL', { ...options, day: 'numeric' });
    }
    return currentDate.toLocaleDateString('he-IL', options);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 text-slate-800">
      {/* Top Navigation Bar */}
      <header className="flex-none bg-white border-b border-gray-200 shadow-sm z-30 px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CalendarIcon size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">יומן פגישות</h1>
          </div>

          <div className="flex items-center gap-6 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
             <button onClick={handleNext} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
               <ChevronRight size={20} />
             </button>
             
             <button onClick={handleToday} className="px-4 py-1.5 text-sm font-semibold text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all">
                היום
             </button>
             
             <span className="min-w-[140px] text-center font-bold text-lg text-gray-800 select-none">
                {getHeaderTitle()}
             </span>

             <button onClick={handlePrev} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
               <ChevronLeft size={20} />
             </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all"
                title="הגדרות חיבור"
            >
                <Settings size={20} />
            </button>
            <button 
                onClick={loadEvents} 
                disabled={loading}
                title="רענן נתונים"
                className={`p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all ${loading ? 'animate-spin' : ''}`}
            >
                <RefreshCw size={20} />
            </button>
            <ViewSwitcher currentView={view} onChange={setView} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden p-4 md:p-6 relative">
        
        {loading && events.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
                <div className="flex flex-col items-center">
                    <RefreshCw className="animate-spin text-blue-600 mb-2" size={32} />
                    <span className="text-gray-500 font-medium">טוען יומן...</span>
                </div>
            </div>
        )}

        {/* Error / Info Toast */}
        {!loading && error && (
             <div className="absolute bottom-6 left-6 z-50 bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-xl animate-fade-in-up" dir="rtl">
                <AlertCircle size={20} className="flex-shrink-0 mt-0.5 text-amber-600" />
                <div className="text-sm">
                    <p className="font-bold">מצב הדגמה (שגיאת חיבור)</p>
                    <p className="mt-1 opacity-90 break-words">{error}</p>
                    <button 
                        onClick={() => setShowSettings(true)}
                        className="mt-2 text-blue-600 hover:underline font-medium"
                    >
                        בדוק הגדרות שרת
                    </button>
                </div>
            </div>
        )}

        <div className="h-full animate-fade-in">
          {view === 'month' && <MonthView currentDate={currentDate} events={events} />}
          {view === 'week' && <WeekView currentDate={currentDate} events={events} />}
          {view === 'day' && <DayView currentDate={currentDate} events={events} />}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-bold text-gray-800">הגדרות חיבור ל-Origami</h3>
                    <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-sm mb-4">
                        אנא וודא שהכתובת היא כתובת ה-API ולא כתובת המערכת הרגילה.<br/>
                        היא צריכה להסתיים ב-<code>/api/v1</code>.
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">כתובת שרת (Base URL)</label>
                        <input 
                            type="text" 
                            value={apiBaseUrl}
                            onChange={(e) => setApiBaseUrl(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left"
                            dir="ltr"
                            placeholder="https://razerstar.origami.ms/api/v1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                           לדוגמה: <code>https://your-instance.origami.ms/api/v1</code>
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">מזהה אוסף (Collection ID)</label>
                        <input 
                            type="text" 
                            value={collectionId}
                            onChange={(e) => setCollectionId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-left"
                            dir="ltr"
                            placeholder="e_90"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                           המזהה של המשאב באוריגמי (למשל: <code>e_90</code>)
                        </p>
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-50">
                        <button 
                            onClick={() => setShowSettings(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            סגור
                        </button>
                        <button 
                            onClick={() => {
                                setShowSettings(false);
                                loadEvents();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            שמור וטען מחדש
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;