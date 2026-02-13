// types.d.ts
// Type definitions for TFF2026 Festival Program Map Application

// ---- Data Model Types ----

/** A screening series (e.g. "Kotimaiset lyhytelokuvat", "Generation XYZ") */
export interface Series {
  id: string;
  name: string;
  color: string;
}

/** A venue / screening location */
export interface Venue {
  id: string;
  name: string;
  order: number;
}

/** A single screening entry in the program */
export interface Screening {
  id: string;
  title: string;
  seriesId: string;
  venueId: string;
  date: string;            // ISO date string, e.g. "2026-03-09"
  startTime: string;       // "HH:mm" format
  endTime: string;         // "HH:mm" format
  durationMinutes: number;
  url?: string;
  isFree: boolean;
  movies?: MovieEntry[];
  code?: string;           // unique program map code
  notes?: string;
}

/** An individual film within a screening block */
export interface MovieEntry {
  title: string;
  director?: string;
  country?: string;
  year?: number;
  durationMinutes?: number;
}

// ---- Application State Types ----

/** Set of selected screening IDs */
export type SelectionSet = Set<string>;

/** Serializable selection state (for localStorage / JSON export) */
export interface SavedSelections {
  version: number;
  timestamp: string;
  selectedIds: string[];
}

/** Overlap warning between two screenings */
export interface OverlapWarning {
  screeningA: string;  // screening ID
  screeningB: string;  // screening ID
  overlapMinutes: number;
}

/** Represents a single day column in the schedule grid */
export interface DayColumn {
  date: string;          // ISO date string
  label: string;         // display label, e.g. "Ma 9.3."
  dayOfWeek: string;     // e.g. "maanantai"
}

/** A positioned screening box for rendering on the grid */
export interface ScreeningBox {
  screening: Screening;
  top: number;           // px offset from grid top
  height: number;        // px height
  column: number;        // venue column index
  dayIndex: number;      // day column index
  isSelected: boolean;
  hasOverlap: boolean;
  series: Series | undefined;
}

/** Grid configuration constants */
export interface GridConfig {
  startHour: number;
  endHour: number;
  pixelsPerMinute: number;
  columnWidthPx: number;
  headerHeightPx: number;
  timeGutterWidthPx: number;
}

/** Application configuration */
export interface AppConfig {
  maxPaidSelections: number;
  transitionMinutes: number;
  minBreakMinutes: number;
  gridConfig: GridConfig;
}

// ---- Festival Data (top-level JSON structure) ----

export interface FestivalData {
  days: DayColumn[];
  series: Series[];
  venues: Venue[];
  screenings: Screening[];
}

// ---- DOM Helper Types ----

/** Callback for screening click/toggle */
export type ScreeningClickHandler = (screeningId: string) => void;

/** Filter predicate for screenings */
export type ScreeningFilter = (screening: Screening) => boolean;

// ---- Utility Types ----

/** Time range for overlap calculations */
export interface TimeRange {
  startMinuteOfDay: number;
  endMinuteOfDay: number;
  date: string;
  venueId: string;
}

export interface FestivalDataJSON {
	days: {
		date: string;
		label: string;
		weekday: string;
	}[];
	venues: {
		venue_id: string;
		name: string;
		shortName: string;
	}[];
	screenings: {
		screening_id: string;
		series_id: string;
		program_number?: number | null;
		title: string;
		/** @example "2026-03-02T18:00:00" */
		datetime_start: string;
		/** @example "2026-03-02T18:00:00" */
		datetime_end: string;
		duration_minutes: number;
		venue_id: string;
		is_free: boolean;
		ticket_code?: string | null;
		url?: string | null;
	}[];
}
