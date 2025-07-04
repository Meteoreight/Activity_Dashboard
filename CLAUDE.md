# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a web-based Task Tracker application for manufacturing activity dashboard. It's a client-side application that displays manufacturing site activities in both Gantt chart and Kanban board formats, with support for CSV/Excel import and multilingual interface (English/Japanese).

## How to Run

Simply open `index.html` in a modern web browser. No build process or server required. The application will automatically load default data from `./data/data.csv` on startup.

## Architecture

The application follows a modular JavaScript architecture:

- **main.js**: Core application logic, event listeners, and initialization
- **database.js**: IndexedDB wrapper and local data persistence layer
- **data.js**: Data parsing (CSV/Excel), mock data management, and database integration
- **ui.js**: UI state management, selectors, and helper functions
- **gantt.js**: Gantt chart rendering logic with HTML/CSS-based implementation
- **kanban.js**: Kanban board rendering logic
- **i18n.js**: Internationalization support (English/Japanese)

## Key Features

- **Local Database**: IndexedDB-based persistent storage for offline data management
- **Auto-Load**: Automatically loads data from local database or default CSV on startup
- **Data Persistence**: All changes automatically saved to browser's local database
- **File Support**: CSV and Excel (.xlsx/.xls) import via PapaParse and SheetJS
- **Dual View**: Gantt chart and Kanban board visualization
- **Data Editing**: In-browser activity editing with modal dialogs (double-click to edit)
- **Filtering**: By manufacturing site, assignee, and product
- **Export**: CSV export functionality from database or memory
- **Language Support**: English/Japanese toggle
- **File System Access**: Advanced file editing mode using File System Access API

## Data Structure

Expected CSV/Excel format:
```
Manufacturing_site, Product, API, Assignment, Note, Process, Activity, Start_with, End_with
```

- Dates should be in YYYY-MM-DD format
- Assignment field supports comma-separated values for multiple assignees
- All activities get a unique `_uniqueId` field added internally for editing operations

## UI Components

- **Gantt Chart**: HTML/CSS-based quarterly timeline with color-coded bars
- **Kanban Board**: Grouped by assignee with activity cards
- **Modal Dialogs**: Edit and add activity forms with autocomplete suggestions
- **Language Toggle**: Switch between English and Japanese
- **Responsive Design**: Uses Tailwind CSS for styling

## Technical Details

- **Dependencies**: PapaParse (CSV), SheetJS (Excel), Tailwind CSS
- **Database**: IndexedDB for local data persistence with automatic schema management
- **Storage Architecture**: 
  - IndexedDB for activity data with optimized indexes
  - localStorage for File System Access API directory handles
- **Browser Features**: File System Access API for advanced file operations
- **Color Coding**: Consistent color mapping for manufacturing sites across views
- **Error Handling**: Comprehensive validation and user feedback

## Database Schema

The application uses IndexedDB with the following structure:

- **Database Name**: TaskTrackerDB
- **Version**: 1
- **Object Store**: activities (with auto-incrementing primary key)
- **Indexes**: 
  - manufacturing_site, assignee, product (for filtering)
  - activity, start_date, end_date (for timeline operations)
  - created_at, updated_at (for data management)

## Data Flow

1. **Initial Load**: Check IndexedDB → Load from database or fallback to default CSV
2. **Data Import**: Parse CSV/Excel → Save to database → Update UI
3. **Editing**: Modify data in memory → Auto-save to database
4. **Export**: Retrieve from database → Generate CSV/Excel

## Development Notes

- No build process required - pure client-side application
- Uses modern JavaScript features (ES6+, async/await)
- Responsive design with mobile-first approach
- Accessibility considerations with proper ARIA labels and keyboard navigation
- Performance optimized for large datasets with efficient filtering