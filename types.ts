// Represents the view mode of the calendar
export type ViewMode = 'day' | 'week' | 'month';

// Represents a processed event ready for the calendar UI
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  originalData?: any;
}

// Represents the raw data structure coming from Origami (Generic wrapper)
export interface OrigamiResponse {
  [key: string]: any;
  items?: OrigamiRecord[];
  data?: OrigamiRecord[];
}

// Represents a single record from Origami based on user description
export interface OrigamiRecord {
  _id: string;
  [key: string]: any;
  // Dynamic fields
  fld_1544?: string; // Start Time
  fld_1545?: string; // End Time
}
