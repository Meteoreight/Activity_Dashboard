let allActivities = [];
let currentLanguage = 'en'; // Default to English
let originalFileName = 'activities'; // Default filename
let currentFileHandle = null; // Store file handle for File System Access API
let currentView = 'gantt'; // Default view

// --- DOM Element References ---
const fileNameSpan = document.getElementById('file-name');
const useMockDataButton = document.getElementById('use-mock-data');
const openFileAdvancedButton = document.getElementById('open-file-advanced');
const siteSelect = document.getElementById('site-select');
const assigneeSelect = document.getElementById('assignee-select');
const productSelect = document.getElementById('product-select');
const mainContent = document.getElementById('main-content');
const placeholderContent = document.getElementById('placeholder-content');
const chartDiv = document.getElementById('chart-div');
const chartLoader = document.getElementById('chart-loader');
const noDataMessage = document.getElementById('no-data-message');

const languageToggle = document.getElementById('language-toggle');
const ganttTab = document.getElementById('gantt-tab');
const kanbanTab = document.getElementById('kanban-tab');
const ganttView = document.getElementById('gantt-view');
const kanbanView = document.getElementById('kanban-view');

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing page...');
    initializePage();
    
    updateLanguage('en');
});

function initializePage() {
    console.log('Initializing page...');
    try {
        // Check if all required elements exist
        const requiredElements = [
            fileNameSpan, useMockDataButton, openFileAdvancedButton,
            siteSelect, assigneeSelect, productSelect, mainContent, placeholderContent, 
            chartDiv, chartLoader, noDataMessage
        ];
        
        const missingElements = requiredElements.filter(el => !el);
        if (missingElements.length > 0) {
            console.error('Missing DOM elements:', missingElements);
            return;
        }
        
        // Check if Papa is available
        if (typeof Papa === 'undefined') {
            console.warn('Papa (PapaParse) is not loaded, using fallback parser');
        } else {
            console.log('PapaParse is ready');
        }
        
        // --- Event Listeners ---
        useMockDataButton.addEventListener('click', handleUseMockData);
        openFileAdvancedButton.addEventListener('click', handleOpenFileAdvanced);
        
        // Add change event listeners to selectors for auto-drawing
        siteSelect.addEventListener('change', handleDrawChart);
        assigneeSelect.addEventListener('change', handleDrawChart);
        productSelect.addEventListener('change', handleDrawChart);
        
        // Tab switching event listeners
        ganttTab.addEventListener('click', () => switchToView('gantt'));
        kanbanTab.addEventListener('click', () => switchToView('kanban'));
        
        // Language toggle event listener
        languageToggle.addEventListener('change', function() {
            const newLanguage = this.checked ? 'ja' : 'en';
            updateLanguage(newLanguage);
        });
        
        // Edit modal event listeners
        document.getElementById('close-modal').addEventListener('click', closeEditModal);
        document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
        document.getElementById('delete-activity').addEventListener('click', deleteActivity);
        document.getElementById('edit-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveChanges();
        });
        
        // Export data button event listener
        document.getElementById('export-data').addEventListener('click', exportData);
        
        // Add activity button event listener
        document.getElementById('add-activity').addEventListener('click', openAddModal);
        
        // Add activity modal event listeners
        document.getElementById('close-add-modal').addEventListener('click', closeAddModal);
        document.getElementById('cancel-add').addEventListener('click', closeAddModal);
        document.getElementById('add-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            await addNewActivity();
        });
        
        // Close modal when clicking outside
        document.getElementById('edit-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeEditModal();
            }
        });
        
        // Close add modal when clicking outside
        document.getElementById('add-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeAddModal();
            }
        });
        
        console.log('Event listeners added successfully');
        
        console.log('HTML Gantt chart ready');
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

async function handleOpenFileAdvanced() {
    // Check if File System Access API is supported
    if (!window.showOpenFilePicker) {
        alert('File System Access API is not supported in this browser. Please use the "Open File (Read Only)" button instead.');
        return;
    }
    
    try {
        const fileTypeOptions = [
            {
                description: 'CSV and Excel files',
                accept: {
                    'text/csv': ['.csv'],
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
                    'application/vnd.ms-excel': ['.xls']
                }
            }
        ];
        
        // Try to get last used directory handle from localStorage
        let pickerOptions = {
            types: fileTypeOptions,
            multiple: false
        };
        
        try {
            const lastDirectoryHandle = await getLastDirectoryHandle();
            if (lastDirectoryHandle) {
                // Try to use the last used directory
                pickerOptions.startIn = lastDirectoryHandle;
            } else {
                // Fall back to documents folder
                pickerOptions.startIn = 'documents';
            }
        } catch (e) {
            console.log('Could not retrieve last directory, using documents as default');
            pickerOptions.startIn = 'documents';
        }
        
        // Open file picker
        const [fileHandle] = await window.showOpenFilePicker(pickerOptions);
        
        // Store the file handle for later saving
        currentFileHandle = fileHandle;
        
        // Save directory information for next time
        await saveDirectoryInfo(fileHandle);
        
        // Get the file
        const file = await fileHandle.getFile();
        
        // Update UI with file name
        fileNameSpan.textContent = file.name + ' (Edit Mode)';
        originalFileName = file.name.replace(/\.[^/.]+$/, '');
        
        // Process the file same as regular upload
        const fileName = file.name.toLowerCase();
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
        
        if (isExcel) {
            parseExcelFileFromHandle(file);
        } else {
            parseCSVFileFromHandle(file);
        }
        
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Error opening file:', error);
            alert('Error opening file: ' + error.message);
        }
        resetUI();
    }
}

async function parseCSVFileFromHandle(file) {
    if (typeof Papa !== 'undefined') {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                processData(results.data);
            },
            error: (error) => {
                alert(translations[currentLanguage]['csv-parse-error'] + error.message);
                resetUI();
            }
        });
    } else {
        // Fallback for file reading
        const reader = new FileReader();
        reader.onload = function(e) {
            const csvText = e.target.result;
            const data = parseCSVFallback(csvText);
            processData(data);
        };
        reader.onerror = function() {
            alert(translations[currentLanguage]['file-read-error']);
            resetUI();
        };
        reader.readAsText(file);
    }
}

async function parseExcelFileFromHandle(file) {
    if (typeof XLSX === 'undefined') {
        alert('Excel support not available. Please use CSV format.');
        resetUI();
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            
            // Get the first worksheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            
            // Convert to JSON with headers
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) {
                alert('Excel file must contain at least 2 rows (header + data)');
                resetUI();
                return;
            }
            
            // Convert to object format like CSV parser
            const headers = jsonData[0];
            const dataRows = jsonData.slice(1);
            
            const convertedData = dataRows.map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    obj[header] = row[index] || '';
                });
                return obj;
            }).filter(row => {
                // Filter out empty rows
                return Object.values(row).some(value => value !== '' && value !== null && value !== undefined);
            });
            
            processData(convertedData);
        } catch (error) {
            console.error('Excel parsing error:', error);
            alert('Error parsing Excel file: ' + error.message);
            resetUI();
        }
    };
    
    reader.onerror = function() {
        alert(translations[currentLanguage]['file-read-error']);
        resetUI();
    };
    
    reader.readAsBinaryString(file);
}

async function handleSaveToFile() {
    if (!currentFileHandle) {
        alert('No file handle available. Please open a file using "Open and Edit File" first.');
        return;
    }
    
    if (allActivities.length === 0) {
        alert('No data to save');
        return;
    }
    
    try {
        // Create CSV content (excluding internal _uniqueId field)
        const headers = ['Manufacturing_site', 'Product', 'API', 'Assignment', 'Note', 'Process', 'Activity', 'Start_with', 'End_with'];
        const csvContent = [
            headers.join(','),
            ...allActivities.map(activity => 
                headers.map(header => {
                    const value = activity[header] || '';
                    // Escape commas and quotes in values
                    return value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
                }).join(',')
            )
        ].join('\n');
        
        // Create a writable stream
        const writable = await currentFileHandle.createWritable();
        
        // Write the CSV content
        await writable.write(csvContent);
        
        // Close the file
        await writable.close();
        
        alert('File saved successfully!');
        
    } catch (error) {
        console.error('Error saving file:', error);
        alert('Error saving file: ' + error.message);
    }
}
