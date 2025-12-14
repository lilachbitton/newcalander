import { CalendarEvent, OrigamiRecord } from '../types';

const FIELD_START = 'fld_1544';
const FIELD_END = 'fld_1545';

export const fetchOrigamiSlots = async (baseUrl: string, collectionId: string, apiKey: string): Promise<{ events: CalendarEvent[], error?: string }> => {
  // Normalize URL: remove trailing slash and ensure /api/v1
  let cleanBaseUrl = baseUrl.trim().replace(/\/$/, '');
  
  // Construct the correct Search API URL
  const targetUrl = `${cleanBaseUrl}/space/${collectionId}/search`;

  try {
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        targetUrl: targetUrl,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: {
          limit: 1000 // Get all events
        }
      })
    });

    const data = await response.json();

    if (data.error) {
       console.error("Proxy Error Response:", data);
       return { events: [], error: data.details || data.error };
    }
    
    // Check for Origami API specific errors inside a 200 OK
    if (data.message && !data.items && !data.data) {
        return { events: [], error: `שגיאת אוריגמי: ${data.message}` };
    }

    const items: OrigamiRecord[] = data.items || data.data || [];
    
    // Map to events
    const events = mapOrigamiDataToEvents(items);
    return { events, error: undefined };

  } catch (error: any) {
    console.error("Fetch failed:", error);
    return { 
        events: [], 
        error: 'שגיאת תקשורת עם השרת'
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
        title: record['title'] || 'פגישה', // You might need to adjust the title field name
        start,
        end,
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        originalData: record
      };
    })
    .filter((event): event is CalendarEvent => event !== null);
};