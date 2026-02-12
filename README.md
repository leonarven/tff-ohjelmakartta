# TFF2026 Festival Schedule Planner

## Overview

This is an interactive web application designed to help attendees of the Tampere Film Festival 2026 (TFF2026) plan their festival experience. The application displays all short film screenings in a visual grid format. Users tag screenings with predefined tags (e.g. #selected, #interested, #notinterested) and build a personalized festival schedule by marking screenings as "tagged as #selected".

## Purpose

The Tampere Film Festival features dozens of short film screenings spread across multiple venues and several days. Planning which screenings to attend can be challenging due to:

- Overlapping screening times across different venues
- Limited budget for paid screenings (festival pass allows 10 paid screenings)
- Same film programs being shown at multiple times (repeat screenings)
- Need to account for travel time between venues and meal breaks

This application solves these problems by providing a clear visual overview of all screenings and helping users track tagged screenings (e.g. #selected) while avoiding conflicts.

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
- Screenings tagged #selected are highlighted with a yellow border
- Conflicting screenings (time overlaps) are marked with a red border

### Screening Information
Each screening box displays:
- Film/program title
- Screening code (ticket code)
- Start time
- Duration in minutes

### Tagging (Tags)
- Screenings can be tagged using a predefined list: **#selected**, **#interested**, **#notinterested**
- Click a screening to toggle the **#selected** tag (add/remove from your plan)
- Use the "⋯" tag menu on each screening box to add or remove any tag
- Tag chips on each box show current tags; click a chip to remove that tag
- "Tagged as #selected" replaces the previous "selection" action: the summary list and stats are based on screenings that have the #selected tag
- The application tracks:
  - Total number of screenings tagged #selected
  - Number of paid screenings among those (with warning when exceeding 10)
  - Time conflicts between screenings tagged #selected

### Data Persistence
- Tags are automatically saved to browser's localStorage (`tff2026_screening_tags`)
- Tags persist between browser sessions
- Users can export tags to a JSON file for backup (format includes `screeningTags` and optional `selections` for compatibility)
- Users can import previously exported tag data; old export files with `selections` only are migrated to tags (#selected)

## User Workflow

1. **Browse the schedule**: Scroll through each day's grid to see available screenings
2. **Identify interesting screenings**: Use color coding to find specific film series
3. **Tag screenings**: Click screenings to tag as #selected (your plan); use the tag menu (⋯) to add #interested or #notinterested
4. **Check for conflicts**: The application warns if screenings tagged #selected overlap in time
5. **Monitor paid screening count**: Keep track of the 10-screening limit among #selected screenings
6. **Review tagged screenings**: Use the summary list at the bottom to see all "tagged as #selected" screenings in chronological order
7. **Export your plan**: Save your tags as a JSON file for safekeeping

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
- The 10-screening limit is a soft warning only; the application does not prevent tagging more than 10 paid screenings as #selected
- Time conflict detection does not account for travel time between venues (15 minutes recommended)