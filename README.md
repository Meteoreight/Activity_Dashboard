# Manufacturing Activity Dashboard

This is a web-based task tracker designed to visualize manufacturing site activities. It allows users to upload CSV or Excel files to see tasks in a Gantt chart or a Kanban board format.

[日本語版はこちら (View in Japanese)](README_JP.md)

## Features

*   **Gantt Chart View:** Visualizes tasks and their durations on a timeline.
*   **Kanban Board View:** Organizes tasks by assignee.
*   **Data Import:** Supports importing data from CSV and Excel files.
*   **In-browser Editing:** Add, edit, and delete activities directly in the browser.
*   **Data Export:** Export the current data back to a CSV file.
*   **Multi-language Support:** Switch between English and Japanese.

## How to Use

Simply open the `index.html` file in a modern web browser.

## File Structure

The project is organized into separate files for HTML, CSS, and JavaScript to improve maintainability.

```
/
├── index.html              # The main HTML file for the application.
├── css/
│   └── style.css           # Contains all the custom styles for the application.
├── js/
│   ├── main.js             # Main application logic, event listener initialization.
│   ├── data.js             # Handles data parsing (CSV/Excel) and mock data.
│   ├── ui.js               # Manages UI updates, selectors, and modals.
│   ├── gantt.js            # Logic for rendering the Gantt chart view.
│   ├── kanban.js           # Logic for rendering the Kanban board view.
│   └── i18n.js             # Contains translation strings and language switching logic.
├── base.html               # The original single-file version of the application (for reference).
└── README.md               # This file.
```
