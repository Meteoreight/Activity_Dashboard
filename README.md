# Activity Dashboard

This is a web-based task tracker designed to visualize activities. It allows users to upload CSV or Excel files to see tasks in a Gantt chart or a Kanban board format.

[日本語版はこちら (View in Japanese)](README_JP.md)

## Features

*   **Local Database Storage:** All data is automatically saved to your browser's local database (IndexedDB) for persistent storage.
*   **Gantt Chart View:** Visualizes tasks and their durations on a timeline.
*   **Kanban Board View:** Organizes tasks by assignee.
*   **Data Import:** Supports importing data from CSV and Excel files.
*   **In-browser Editing:** Add, edit, and delete activities directly in the browser.
*   **Data Export:** Export the current data back to a CSV file.
*   **Auto-persistence:** All changes are automatically saved and restored on page reload.
*   **Multi-language Support:** Switch between English and Japanese.

## How to Use

Simply open the `index.html` file in a modern web browser.

## Data Storage

### Where is data stored?

All activity data is stored in your browser's **IndexedDB database**, not as files on your computer. This means:

- **Location**: Browser's internal database (managed automatically)
- **Format**: Binary database format (not accessible as regular files)
- **Scope**: Data is specific to each browser and domain
- **Persistence**: Data persists between browser sessions and computer restarts

### Data Safety

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

### Backup Recommendations

For important data, we recommend:

1. **Regular Exports**: Use the "Export Data" button to create CSV backups monthly
2. **Multiple Browsers**: Use the app in different browsers (Chrome, Firefox, Edge) for redundancy
3. **Cloud Backup**: Save exported CSV files to cloud storage (Google Drive, Dropbox, etc.)

### Accessing Your Data

- **View in Browser**: Use Developer Tools (F12) → Application → IndexedDB → TaskTrackerDB
- **Export**: Use the app's "Export Data" button to create CSV files
- **Import**: Load CSV files back into the app to restore data

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
