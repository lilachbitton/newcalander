import { CalendarEvent, OrigamiRecord } from '../types';

const FIELD_START = 'fld_1544';
const FIELD_END = 'fld_1545';

export const fetchOrigamiSlots = async (baseUrl?: string, collectionId?: string): Promise<{ events: CalendarEvent[], error?: string }> => {
  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        baseUrl: baseUrl,
        collectionId: collectionId
      })
    });

    // Even if status is 200, check if the JSON contains an "error" field
    const data = await response.json();

    if (data.error) {
      console.warn("Proxy returned error:", data.error, data.details);
      
      // Improve user-friendly messages based on technical details
      let userMsg = data.error;
      const details = (data.details || '').toLowerCase();
      
      if (userMsg.includes('Configuration Error')) {
        userMsg = 'שגיאת הגדרות בשרת: חסר מפתח API (ORIGAMI_API_KEY)';
      } else if (details.includes('login') || details.includes('signin') || details.includes('כניסה')) {
        userMsg = 'שגיאת אימות: השרת הפנה לדף כניסה. אנא וודא שה-Base URL נכון (מכיל /api/v1) ושמפתח ה-API תקין.';
      } else if (details.includes('<!doctype') || details.includes('<html')) {
        userMsg = 'שגיאת כתובת: השרת החזיר דף HTML במקום מידע. בדוק את כתובת ה-API וה-Collection ID.';
      } else if (data.details) {
        userMsg += ` (${data.details.substring(0, 100)}...)`;
      }
      
      return { 
        events: getMockEvents(), 
        error: userMsg 
      };
    }

    // Normal success flow
    const items: OrigamiRecord[] = data.items || data.data || [];
    return { 
        events: mapOrigamiDataToEvents(items),
        error: undefined
    };

  } catch (error: any) {
    console.error("Fetch failed:", error);
    return { 
        events: getMockEvents(), 
        error: 'שגיאת תקשורת: לא ניתן היה להתחבר לשרת ה-Proxy'
    };
  }
};

const mapOrigamiDataToEvents = (records: OrigamiRecord[]): CalendarEvent[] => {
  return records
    .filter(record => record[FIELD_START] && record[FIELD_END])
    .map((record): CalendarEvent | null => {
      let start = new Date(record[FIELD_START]!);
      let end = new Date(record[FIELD_END]!);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return null;
      }

      return {
        id: record._id || Math.random().toString(36).substr(2, 9),
        title: record['title'] || 'פגישה שוריינה',
        start,
        end,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        originalData: record
      };
    })
    .filter((event): event is CalendarEvent => event !== null);
};

const getMockEvents = (): CalendarEvent[] => {
  const today = new Date();
  const events: CalendarEvent[] = [];
  
  const offsets = [
    { day: 0, hour: 10, duration: 1 },
    { day: 0, hour: 14, duration: 2 },
    { day: 1, hour: 9, duration: 1.5 },
    { day: 2, hour: 11, duration: 1 },
    { day: -1, hour: 16, duration: 1 },
  ];

  offsets.forEach((o, index) => {
    const start = new Date(today);
    start.setDate(today.getDate() + o.day);
    start.setHours(o.hour, 0, 0, 0);
    
    const end = new Date(start);
    end.setHours(start.getHours() + Math.floor(o.duration), (o.duration % 1) * 60);

    events.push({
      id: `mock-${index}`,
      title: 'פגישת ייעוץ',
      start,
      end,
      color: index % 2 === 0 ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
    });
  });

  return events;
};