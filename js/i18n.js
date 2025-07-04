const translations = {
    en: {
        'header-title': 'Activity Dashboard',
        'header-description': 'Open CSV or Excel files to visualize and edit activities in a Gantt chart and Kanban board format.',
        'file-name': 'No file selected',
        'use-sample-data-btn': 'Use Sample Data',
        'select-site-label': 'Site:',
        'select-site-label-full': 'Site:',
        'select-assignee-label': 'Assignee:',
        'select-assignee-label-full': 'Assignee:',
        'select-product-label': 'Product:',
        'select-product-label-full': 'Product:',
        'loading-text': 'Loading chart...',
        'no-data-text': 'No activities to display for the selected filters.',
        'placeholder-text': 'To display data, please open a CSV/Excel file or use sample data.',
        'csv-format-title': 'File Format Guide',
        'csv-format-desc': 'Please open a CSV or Excel file with the following headers:',
        'date-format-note': 'Date format should be `YYYY-MM-DD`.',
        'activity-header': 'Activity',
        'period-display': 'Period Display (Quarterly)',
        'all-sites': 'All Manufacturing Sites',
        'all-assignees': 'All Assignees',
        'all-products': 'All Products',
        'invalid-csv-format': 'Invalid CSV format. Please check the headers.',
        'csv-parse-error': 'Error parsing CSV: ',
        'file-read-error': 'Error reading file',
        'chart-creation-error': 'Error creating chart: ',
        'assignee-label': 'Assignee:',
        'gantt-tab-text': 'Gantt Chart',
        'kanban-tab-text': 'Kanban Board',
        'kanban-loading-text': 'Loading kanban board...',
        'kanban-no-data-text': 'No activities to display for the selected filters.',
        'task-singular': 'task',
        'task-plural': 'tasks',
        'unassigned': 'Unassigned',
        'no-dates': 'No dates',
        'edit-modal-title': 'Edit Activity',
        'edit-site-label': 'Manufacturing Site',
        'edit-product-label': 'Product',
        'edit-api-label': 'API',
        'edit-assignment-label': 'Assignment',
        'edit-process-label': 'Process',
        'edit-activity-label': 'Activity',
        'edit-start-date-label': 'Start Date',
        'edit-end-date-label': 'End Date',
        'edit-note-label': 'Note',
        'export-data-btn': 'Export Data',
        'export-data-btn-short': 'Export',
        'cancel-edit-btn': 'Cancel',
        'save-edit-btn': 'Save Changes',
        'delete-activity-btn': 'Delete Activity',
        'open-file-advanced-btn': 'Open and Edit File',
        'add-activity-btn': 'Add Activity',
        'add-activity-btn-short': 'Add',
        'add-modal-title': 'Add New Activity',
        'add-site-label': 'Manufacturing Site',
        'add-product-label': 'Product',
        'add-api-label': 'API',
        'add-assignment-label': 'Assignment',
        'add-process-label': 'Process',
        'add-activity-label': 'Activity',
        'add-start-date-label': 'Start Date',
        'add-end-date-label': 'End Date',
        'add-note-label': 'Note',
        'cancel-add-btn': 'Cancel',
        'save-add-btn': 'Add Activity',
        'delete-confirm': 'Are you sure you want to delete this activity?',
        'mode-label-local': 'Local DB',
        'mode-label-file': 'File Edit',
        'import-from-file-btn': 'Import from File'
    },
    ja: {
        'header-title': 'アクティビティダッシュボード',
        'header-description': 'CSVまたはExcelファイルを開いて、アクティビティをガントチャートとカンバンボードで可視化・編集します。',
        'file-name': 'ファイルが選択されていません',
        'use-sample-data-btn': 'サンプルデータを使用',
        'select-site-label': '製造所:',
        'select-site-label-full': '製造所:',
        'select-assignee-label': '担当者:',
        'select-assignee-label-full': '担当者:',
        'select-product-label': '製品:',
        'select-product-label-full': '製品:',
        'loading-text': 'チャートを読み込み中...',
        'no-data-text': '選択されたフィルターには表示するアクティビティがありません。',
        'placeholder-text': 'データを表示するには、CSV/Excelファイルを開くか、サンプルデータを使用してください。',
        'csv-format-title': 'ファイルフォーマットガイド',
        'csv-format-desc': '以下のヘッダーを持つCSVまたはExcelファイルを開いてください:',
        'date-format-note': '日付のフォーマットは `YYYY-MM-DD` です。',
        'activity-header': 'アクティビティ',
        'period-display': '期間表示（四半期）',
        'all-sites': '全ての製造所',
        'all-assignees': '全ての担当者',
        'all-products': '全ての製品',
        'invalid-csv-format': '無効なCSVフォーマットです。ヘッダーを確認してください。',
        'csv-parse-error': 'CSVのパース中にエラーが発生しました: ',
        'file-read-error': 'ファイルの読み込み中にエラーが発生しました',
        'chart-creation-error': 'チャートの作成中にエラーが発生しました: ',
        'assignee-label': '担当:',
        'gantt-tab-text': 'ガントチャート',
        'kanban-tab-text': 'カンバンボード',
        'kanban-loading-text': 'カンバンボードを読み込み中...',
        'kanban-no-data-text': '選択されたフィルターには表示するアクティビティがありません。',
        'task-singular': 'タスク',
        'task-plural': 'タスク',
        'unassigned': '未割り当て',
        'no-dates': '日付なし',
        'edit-modal-title': 'アクティビティを編集',
        'edit-site-label': '製造所',
        'edit-product-label': '製品',
        'edit-api-label': 'API',
        'edit-assignment-label': '担当者',
        'edit-process-label': 'プロセス',
        'edit-activity-label': 'アクティビティ',
        'edit-start-date-label': '開始日',
        'edit-end-date-label': '終了日',
        'edit-note-label': 'ノート',
        'export-data-btn': 'データをエクスポート',
        'export-data-btn-short': 'エクスポート',
        'cancel-edit-btn': 'キャンセル',
        'save-edit-btn': '変更を保存',
        'delete-activity-btn': 'アクティビティを削除',
        'open-file-advanced-btn': 'ファイルを開いて編集',
        'add-activity-btn': 'アクティビティを追加',
        'add-activity-btn-short': '追加',
        'add-modal-title': '新しいアクティビティを追加',
        'add-site-label': '製造所',
        'add-product-label': '製品',
        'add-api-label': 'API',
        'add-assignment-label': '担当者',
        'add-process-label': 'プロセス',
        'add-activity-label': 'アクティビティ',
        'add-start-date-label': '開始日',
        'add-end-date-label': '終了日',
        'add-note-label': 'ノート',
        'cancel-add-btn': 'キャンセル',
        'save-add-btn': 'アクティビティを追加',
        'delete-confirm': 'このアクティビティを削除してもよろしいですか？',
        'mode-label-local': 'ローカルDB',
        'mode-label-file': 'ファイル編集',
        'import-from-file-btn': 'ファイルからインポート'
    }
};

function updateLanguage(lang) {
    currentLanguage = lang;
    const translation = translations[lang];
    
    // Update all translatable elements
    Object.keys(translation).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.textContent = translation[key];
        }
    });
    
    // Update HTML lang attribute and page title
    document.documentElement.lang = lang === 'en' ? 'en' : 'ja';
    document.title = translation['header-title'];
    
    // Update file name if it's the default text
    const fileNameElement = document.getElementById('file-name');
    if (fileNameElement && (fileNameElement.textContent === 'No file selected' || fileNameElement.textContent === 'ファイルが選択されていません')) {
        fileNameElement.textContent = translation['file-name'];
    }
    
    // Re-populate selectors if data is loaded
    if (allActivities.length > 0) {
        populateSiteSelector();
        populateAssigneeSelector();
        populateProductSelector();
        populateAllSuggestions();
        // Refresh current view to apply language changes
        if (currentView === 'kanban') {
            drawKanbanBoard();
        }
    }
}
