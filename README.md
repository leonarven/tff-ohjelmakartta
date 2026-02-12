# TFF2026 Festival Schedule Planner

## Overview

This is an interactive web application designed to help attendees of the Tampere Film Festival 2026 (TFF2026) plan their festival experience. The application displays all short film screenings in a visual grid format, allowing users to select screenings they wish to attend and build a personalized festival schedule.

## Purpose

The Tampere Film Festival features dozens of short film screenings spread across multiple venues and several days. Planning which screenings to attend can be challenging due to:

- Overlapping screening times across different venues
- Limited budget for paid screenings (festival pass allows 10 paid screenings)
- Same film programs being shown at multiple times (repeat screenings)
- Need to account for travel time between venues and meal breaks

This application solves these problems by providing a clear visual overview of all screenings and helping users track their selections while avoiding conflicts.

## Key Features

### Visual Schedule Grid
- Screenings are displayed in a day-by-day grid format
- Each day shows only the venues that have screenings on that day
- Columns represent different cinema venues
- Rows represent time slots (hourly from 9:00 to 23:00)
- Each screening appears as a colored box positioned according to its start time and duration

### Color Coding
- Different film series are displayed in different colors for easy identification
- Free screenings have a green border
- Selected screenings are highlighted with a yellow border
- Conflicting screenings (time overlaps) are marked with a red border

### Screening Information
Each screening box displays:
- Film/program title
- Screening code (ticket code)
- Start time
- Duration in minutes

### Selection Management
- Click any screening to select/deselect it
- Selected screenings appear in a summary list at the bottom
- The application tracks:
  - Total number of selected screenings
  - Number of paid screenings (with warning when exceeding 10)
  - Time conflicts between selected screenings

### Data Persistence
- Selections are automatically saved to browser's localStorage
- Selections persist between browser sessions
- Users can export selections to a JSON file for backup
- Users can import previously exported selections

## User Workflow

1. **Browse the schedule**: Scroll through each day's grid to see available screenings
2. **Identify interesting screenings**: Use color coding to find specific film series
3. **Select screenings**: Click on screenings to add them to your plan
4. **Check for conflicts**: The application warns if selected screenings overlap in time
5. **Monitor paid screening count**: Keep track of the 10-screening limit
6. **Review selections**: Use the summary list at the bottom to see all selected screenings in chronological order
7. **Export your plan**: Save your selections as a JSON file for safekeeping

## Data Format

The application expects festival data in a specific JSON format containing:
- **venues**: List of cinema venues with IDs and names
- **series_definitions**: Definitions of film series (categories) with their names and types
- **screenings**: Array of all screening events with:
  - Unique screening ID
  - Series ID (which film series it belongs to)
  - Title
  - Start and end times
  - Duration
  - Venue information
  - Whether it's free or paid
  - Optional ticket code and notes

## User Preferences Accommodated

This application was designed with specific user requirements:
- All screening details are visible at all times (no tooltips or hover-required information)
- Desktop-only design (no mobile optimization needed)
- Single language interface (Finnish)
- No filtering needed (source data is pre-filtered)
- Simple export/import via JSON files instead of complex sharing features

## Limitations

- The application is designed for desktop use and may not display correctly on mobile devices
- Screening data must be provided in the expected JSON format
- The 10-screening limit is a soft warning only; the application does not prevent selecting more
- Time conflict detection does not account for travel time between venues (15 minutes recommended)