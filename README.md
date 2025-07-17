# Activity Dashboard

This is a web-based task tracker designed to visualize activities. It supports two operation modes: Local Database mode for persistent browser storage and File Edit mode for direct file manipulation.

[日本語版はこちら (View in Japanese)](README_JP.md)

## Operation Modes

This application supports two distinct operation modes:

### 🗄️ Local DB Mode
- **Data Storage:** Browser's IndexedDB for persistent storage
- **Auto-Save:** All changes automatically saved
- **Offline Support:** Works completely offline once loaded
- **Data Persistence:** Data survives browser restarts and updates
- **File Operations:** Import CSV/Excel files into database

### 📁 File Edit Mode (Default)
- **Direct File Access:** Edit CSV files directly using File System Access API
- **Real-time Sync:** Changes saved directly to the original file
- **File System Integration:** Works with files on your computer
- **Browser Support:** Requires modern browsers with File System Access API support
- **Advanced Operations:** Open, edit, and save files without manual export

You can switch between modes using the toggle button in the top toolbar.

## Features

*   **Dual Operation Modes:** Choose between Local Database and File Edit modes
*   **Gantt Chart View:** Visualizes tasks and their durations on a timeline
*   **Kanban Board View:** Organizes tasks by assignee
*   **Data Import/Export:** Support for CSV and Excel files
*   **In-browser Editing:** Add, edit, and delete activities directly in the browser
*   **Auto-persistence:** Changes automatically saved based on selected mode
*   **Multi-language Support:** Switch between English and Japanese

## How to Use

Simply open the `index.html` file in a modern web browser.

## Data Storage

The data storage behavior depends on your selected operation mode:

### 🗄️ Local DB Mode

In this mode, all activity data is stored in your browser's **IndexedDB database**:

- **Location**: Browser's internal database (managed automatically)
- **Format**: Binary database format (not accessible as regular files)
- **Scope**: Data is specific to each browser and domain
- **Persistence**: Data persists between browser sessions and computer restarts

**✅ Data is safe during:**
- Normal browser use (closing/reopening)
- Computer restarts
- Browser updates
- Regular application usage

**⚠️ Data may be lost if:**
- Browser history/site data is manually cleared
- Browser is completely uninstalled
- Disk storage becomes critically full
- Using private/incognito mode (data not saved)

### 📁 File Edit Mode

In this mode, data is stored directly in CSV files on your computer:

- **Location**: Your computer's file system
- **Format**: Standard CSV files (editable with any text editor)
- **Scope**: Files are portable across devices and applications
- **Persistence**: Standard file system persistence

**✅ Data is safe during:**
- Browser restarts and updates
- Moving files between computers
- Using any CSV-compatible application
- Standard file system backups

**⚠️ Data may be lost if:**
- Files are manually deleted
- Hard drive failure without backup
- File corruption

### Data Management Recommendations

**For Local DB Mode:**
1. **Regular Exports**: Use the "Export Data" button to create CSV backups monthly
2. **Multiple Browsers**: Use the app in different browsers for redundancy
3. **Cloud Backup**: Save exported CSV files to cloud storage

**For File Edit Mode:**
1. **File Backups**: Include CSV files in your regular backup routine
2. **Version Control**: Consider using Git or similar tools for change tracking
3. **Cloud Sync**: Store files in cloud-synced folders (Google Drive, Dropbox, OneDrive)

### Accessing Your Data

**Local DB Mode:**
- **View in Browser**: Developer Tools (F12) → Application → IndexedDB → TaskTrackerDB
- **Export**: Use the "Export Data" button to create CSV files
- **Import**: Load CSV files to restore or add data

**File Edit Mode:**
- **Direct Access**: Files are standard CSV format on your computer
- **Edit Externally**: Use Excel, Google Sheets, or any text editor
- **Integration**: Works with existing file management workflows

## File Structure

The project is organized into separate files for HTML, CSS, and JavaScript to improve maintainability.

```
/
├── index.html              # The main HTML file for the application.
├── css/
│   └── style.css           # Contains all the custom styles for the application.
├── js/
│   ├── main.js             # Main application logic, event listener initialization.
│   ├── database.js         # IndexedDB wrapper and local data persistence layer.
│   ├── data.js             # Handles data parsing (CSV/Excel), mock data, and database integration.
│   ├── ui.js               # Manages UI updates, selectors, and modals.
│   ├── gantt.js            # Logic for rendering the Gantt chart view.
│   ├── kanban.js           # Logic for rendering the Kanban board view.
│   └── i18n.js             # Contains translation strings and language switching logic.
├── data/
│   └── data.csv            # Default sample data (loaded automatically on first use).
├── base.html               # The original single-file version of the application (for reference).
├── README.md               # This file.
└── README_JP.md            # Japanese version of README.
```
