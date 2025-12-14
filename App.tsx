import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, RefreshCw, AlertCircle, Settings, Save } from 'lucide-react';
import { ViewMode, CalendarEvent } from './types';
import { fetchOrigamiSlots } from './services/origamiService';
import ViewSwitcher from './components/ViewSwitcher';
import MonthView from './components/MonthView';
import WeekView from './components/WeekView';
import DayView from './components/DayView';

// Local Storage Keys
const LS_BASE_URL = 'origami_base_url';
const LS_COLLECTION = 'origami_collection_id';
const LS_API_KEY = 'origami_api_key';

const App: React.FC = () => {
  // Config State
  const [config, setConfig] = useState({
    baseUrl: localStorage.getItem(LS_BASE_URL) || 'https://razerstar.origami.ms/api/v1',
    collectionId: localStorage.getItem(LS_COLLECTION) || 'e_90',
    apiKey: localStorage.getItem(LS_API_KEY) || ''
  });
  
  const [isConfigured, setIsConfigured] = useState(!!localStorage.getItem(LS_API_KEY));
  const [showSettings, setShowSettings] = useState(!localStorage.getItem(LS_API_KEY));

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>('week');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load events when configured
  useEffect(() => {
    if (isConfigured && !showSettings) {
      loadEvents();
    }
  }, [isConfigured, showSettings]);

  const saveConfig = () => {
    localStorage.setItem(LS_BASE_URL, config.baseUrl);
    localStorage.setItem(LS_COLLECTION, config.collectionId);
    localStorage.setItem(LS_API_KEY, config.apiKey);
    setIsConfigured(true);
    setShowSettings(false);
    setError(null);
  };

  const loadEvents = async () => {
    if (!config.apiKey) return;

    setLoading(true);
    setError(null);
    try {
      const { events: data, error: errorMsg } = await fetchOrigamiSlots(config.baseUrl, config.collectionId, config.apiKey);
      if (errorMsg) {
          setError(errorMsg);
      } else {
          setEvents(data);
      }
    } catch (err) {
      setError('שגיאה לא צפויה בטעינת הנתונים');
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
    else newDate.setDate(newDate.getDate() - 1);
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

  // --- Render Settings Screen (If not configured or requested) ---
  if (showSettings) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans" dir="rtl">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
                  <div className="bg-blue-600 p-6 text-white text-center">
                      <CalendarIcon size={48} className="mx-auto mb-3 opacity-90" />
                      <h1 className="text-2xl font-bold">הגדרות חיבור ליומן</h1>
                      <p className="text-blue-100 mt-2">אנא הזן את פרטי החיבור למערכת אוריגמי</p>
                  </div>
                  
                  <div className="p-8 space-y-6">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">כתובת API (Base URL)</label>
                          <input 
                              type="text" 
                              value={config.baseUrl}
                              onChange={(e) => setConfig({...config, baseUrl: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left"
                              dir="ltr"
                              placeholder="https://company.origami.ms/api/v1"
                          />
                          <p className="text-xs text-gray-500 mt-1">חייב להסתיים ב-<code>/api/v1</code></p>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">מזהה אוסף (Collection ID)</label>
                          <input 
                              type="text" 
                              value={config.collectionId}
                              onChange={(e) => setConfig({...config, collectionId: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left"
                              dir="ltr"
                              placeholder="e_90"
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">מפתח API (API Key)</label>
                          <input 
                              type="password" 
                              value={config.apiKey}
                              onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left"
                              dir="ltr"
                              placeholder="הדבק כאן את המפתח..."
                          />
                      </div>

                      <button 
                          onClick={saveConfig}
                          disabled={!config.apiKey || !config.baseUrl}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                          <Save size={20} />
                          שמור והתחבר
                      </button>

                      {isConfigured && (
                          <button onClick={() => setShowSettings(false)} className="w-full text-gray-500 text-sm hover:underline">
                              ביטול וחזרה ליומן
                          </button>
                      )}
                  </div>
              </div>
          </div>
      );
  }

  // --- Render Calendar App ---
  return (
    <div className="flex flex-col h-screen bg-gray-50 text-slate-800" dir="rtl">
      {/* Top Navigation Bar */}
      <header className="flex-none bg-white border-b border-gray-200 shadow-sm z-30 px-4 md:px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <CalendarIcon size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 tracking-tight">יומן פגישות</h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4 bg-gray-50 p-1 rounded-xl border border-gray-200">
             <button onClick={handleNext} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
               <ChevronRight size={20} />
             </button>
             
             <span className="min-w-[120px] text-center font-bold text-lg text-gray-800 select-none hidden md:block">
                {getHeaderTitle()}
             </span>
             {/* Mobile Title */}
             <span className="md:hidden text-sm font-bold px-2">{getHeaderTitle()}</span>

             <button onClick={handlePrev} className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-600">
               <ChevronLeft size={20} />
             </button>
             <button onClick={handleToday} className="mr-2 px-3 py-1 text-xs md:text-sm font-semibold text-gray-700 bg-white shadow-sm rounded-md border border-gray-200 hover:bg-gray-50">
                היום
             </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all"
                title="הגדרות"
            >
                <Settings size={20} />
            </button>
            <button 
                onClick={loadEvents} 
                disabled={loading}
                title="רענן"
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
        
        {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50 backdrop-blur-sm">
                <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <RefreshCw className="animate-spin text-blue-600 mb-3" size={32} />
                    <span className="text-gray-600 font-medium">טוען נתונים...</span>
                </div>
            </div>
        )}

        {!loading && error && (
             <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-lg flex flex-col items-center gap-2 max-w-lg animate-fade-in-down">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <AlertCircle size={24} className="text-red-600" />
                    שגיאה בטעינת נתונים
                </div>
                <p className="text-center opacity-90">{error}</p>
                <button 
                    onClick={() => setShowSettings(true)}
                    className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
                >
                    בדוק הגדרות
                </button>
            </div>
        )}

        <div className="h-full animate-fade-in bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {view === 'month' && <MonthView currentDate={currentDate} events={events} />}
          {view === 'week' && <WeekView currentDate={currentDate} events={events} />}
          {view === 'day' && <DayView currentDate={currentDate} events={events} />}
        </div>
      </main>
    </div>
  );
};

export default App;