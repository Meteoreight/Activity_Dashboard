let allActivities = [];
let currentLanguage = 'en'; // Default to English
let originalFileName = 'activities'; // Default filename
let currentFileHandle = null; // Store file handle for File System Access API
let currentView = 'gantt'; // Default view
let currentMode = 'local'; // Default mode: 'local' or 'file'

// --- DOM Element References ---
const fileNameSpan = document.getElementById('file-name');
const useMockDataButton = document.getElementById('use-mock-data');
const openFileAdvancedButton = document.getElementById('open-file-advanced');
const importFromFileButton = document.getElementById('import-from-file');
const siteSelect = document.getElementById('site-select');
const assigneeSelect = document.getElementById('assignee-select');
const productSelect = document.getElementById('product-select');
const mainContent = document.getElementById('main-content');
const placeholderContent = document.getElementById('placeholder-content');
const chartDiv = document.getElementById('chart-div');
const chartLoader = document.getElementById('chart-loader');
const noDataMessage = document.getElementById('no-data-message');

const languageToggle = document.getElementById('language-toggle');
const modeToggle = document.getElementById('mode-toggle');
const ganttTab = document.getElementById('gantt-tab');
const kanbanTab = document.getElementById('kanban-tab');
const ganttView = document.getElementById('gantt-view');
const kanbanView = document.getElementById('kanban-view');

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM loaded, initializing page...');
    await initializePage();
    
    updateLanguage('en');
});

async function initializePage() {
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
        
        // Initialize database first
        try {
            console.log('Initializing database...');
            await initializeDatabase();
            console.log('Database initialized successfully');
        } catch (error) {
            console.warn('Database initialization failed, continuing without database:', error);
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
        importFromFileButton.addEventListener('click', handleImportFromFile);
        
        // Add change event listeners to selectors for auto-drawing
        siteSelect.addEventListener('change', function() {
            if (typeof handleDrawChart === 'function') {
                handleDrawChart();
            }
        });
        assigneeSelect.addEventListener('change', function() {
            if (typeof handleDrawChart === 'function') {
                handleDrawChart();
            }
        });
        productSelect.addEventListener('change', function() {
            if (typeof handleDrawChart === 'function') {
                handleDrawChart();
            }
        });
        
        // Tab switching event listeners
        ganttTab.addEventListener('click', () => {
            if (typeof switchToView === 'function') {
                switchToView('gantt');
            }
        });
        kanbanTab.addEventListener('click', () => {
            if (typeof switchToView === 'function') {
                switchToView('kanban');
            }
        });
        
        // Language toggle event listener
        languageToggle.addEventListener('change', function() {
            const newLanguage = this.checked ? 'ja' : 'en';
            updateLanguage(newLanguage);
        });
        
        // Mode toggle event listener
        modeToggle.addEventListener('change', function() {
            const newMode = this.checked ? 'file' : 'local';
            switchMode(newMode);
        });
        
        // Edit modal event listeners
        document.getElementById('close-modal').addEventListener('click', function() {
            if (typeof closeEditModal === 'function') {
                closeEditModal();
            }
        });
        document.getElementById('cancel-edit').addEventListener('click', function() {
            if (typeof closeEditModal === 'function') {
                closeEditModal();
            }
        });
        document.getElementById('delete-activity').addEventListener('click', function() {
            if (typeof deleteActivity === 'function') {
                deleteActivity();
            }
        });
        document.getElementById('edit-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            if (typeof saveChanges === 'function') {
                await saveChanges();
            }
        });
        
        // Export data button event listener
        document.getElementById('export-data').addEventListener('click', function() {
            if (typeof exportData === 'function') {
                exportData();
            }
        });
        
        // Add activity button event listener
        document.getElementById('add-activity').addEventListener('click', function() {
            if (typeof openAddModal === 'function') {
                openAddModal();
            }
        });
        
        // Add activity modal event listeners
        document.getElementById('close-add-modal').addEventListener('click', function() {
            if (typeof closeAddModal === 'function') {
                closeAddModal();
            }
        });
        document.getElementById('cancel-add').addEventListener('click', function() {
            if (typeof closeAddModal === 'function') {
                closeAddModal();
            }
        });
        document.getElementById('add-form').addEventListener('submit', async function(e) {
            e.preventDefault();
            if (typeof addNewActivity === 'function') {
                await addNewActivity();
            }
        });
        
        // Close modal when clicking outside
        document.getElementById('edit-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                if (typeof closeEditModal === 'function') {
                    closeEditModal();
                }
            }
        });
        
        // Close add modal when clicking outside
        document.getElementById('add-modal').addEventListener('click', function(e) {
            if (e.target === this) {
                if (typeof closeAddModal === 'function') {
                    closeAddModal();
                }
            }
        });
        
        console.log('Event listeners added successfully');
        
        console.log('HTML Gantt chart ready');
        
        // Initialize mode (default to Local DB mode)
        initializeMode();
        
        // Load data from database or default CSV file
        await loadDefaultDataFromDatabase();
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
            if (typeof getLastDirectoryHandle === 'function') {
                const lastDirectoryHandle = await getLastDirectoryHandle();
                if (lastDirectoryHandle) {
                    // Try to use the last used directory
                    pickerOptions.startIn = lastDirectoryHandle;
                } else {
                    // Fall back to documents folder
                    pickerOptions.startIn = 'documents';
                }
            } else {
                // Function not available, use documents as default
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
        if (typeof saveDirectoryInfo === 'function') {
            try {
                await saveDirectoryInfo(fileHandle);
            } catch (e) {
                console.log('Could not save directory info:', e);
            }
        }
        
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
        if (typeof resetUI === 'function') {
            resetUI();
        }
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
                if (typeof translations !== 'undefined' && translations[currentLanguage]) {
                    alert(translations[currentLanguage]['csv-parse-error'] + error.message);
                } else {
                    alert('CSV parsing error: ' + error.message);
                }
                if (typeof resetUI === 'function') {
                    resetUI();
                }
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
            if (typeof translations !== 'undefined' && translations[currentLanguage]) {
                alert(translations[currentLanguage]['file-read-error']);
            } else {
                alert('File reading error');
            }
            if (typeof resetUI === 'function') {
                resetUI();
            }
        };
        reader.readAsText(file);
    }
}

async function parseExcelFileFromHandle(file) {
    if (typeof XLSX === 'undefined') {
        alert('Excel support not available. Please use CSV format.');
        if (typeof resetUI === 'function') {
            resetUI();
        }
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
                if (typeof resetUI === 'function') {
                    resetUI();
                }
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
            if (typeof resetUI === 'function') {
                resetUI();
            }
        }
    };
    
    reader.onerror = function() {
        if (typeof translations !== 'undefined' && translations[currentLanguage]) {
            alert(translations[currentLanguage]['file-read-error']);
        } else {
            alert('File reading error');
        }
        if (typeof resetUI === 'function') {
            resetUI();
        }
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

// --- Mode Management Functions ---
function initializeMode() {
    // Set default mode to Local DB
    currentMode = 'local';
    modeToggle.checked = false; // Local DB = unchecked, File Edit = checked
    updateModeUI();
    updateModeTheme();
}

function switchMode(newMode) {
    if (currentMode === newMode) return;
    
    console.log(`Switching from ${currentMode} mode to ${newMode} mode`);
    
    // Clear current data and reset UI
    resetModeData();
    
    // Update mode
    currentMode = newMode;
    
    // Update UI and theme
    updateModeUI();
    updateModeTheme();
    
    // Handle mode-specific initialization
    if (newMode === 'local') {
        // Switch to Local DB mode
        currentFileHandle = null;
        fileNameSpan.textContent = translations[currentLanguage]['file-name'] || 'No file selected';
        // Load data from database
        loadDefaultDataFromDatabase();
    } else {
        // Switch to File Edit mode
        fileNameSpan.textContent = 'No file selected';
        // Clear database reference for file mode
        // Data will be loaded when user selects a file
    }
}

function updateModeUI() {
    if (currentMode === 'local') {
        // Local DB mode
        openFileAdvancedButton.classList.add('hidden');
        importFromFileButton.classList.remove('hidden');
    } else {
        // File Edit mode
        openFileAdvancedButton.classList.remove('hidden');
        importFromFileButton.classList.add('hidden');
    }
}

function updateModeTheme() {
    const body = document.body;
    
    // Remove all mode classes
    body.classList.remove('mode-local', 'mode-file');
    
    // Add current mode class
    if (currentMode === 'local') {
        body.classList.add('mode-local');
    } else {
        body.classList.add('mode-file');
    }
}

function resetModeData() {
    // Clear current activities
    allActivities = [];
    
    // Reset UI
    mainContent.classList.add('hidden');
    placeholderContent.classList.remove('hidden');
    chartDiv.innerHTML = '';
    siteSelect.innerHTML = '';
    assigneeSelect.innerHTML = '';
    productSelect.innerHTML = '';
    document.getElementById('export-data').classList.add('hidden');
    document.getElementById('add-activity').classList.add('hidden');
}

// --- Import from File for Local DB Mode ---
async function handleImportFromFile() {
    if (currentMode !== 'local') {
        alert('Import from File is only available in Local DB mode');
        return;
    }
    
    // Create file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xlsx,.xls';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', async function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            fileNameSpan.textContent = `Importing ${file.name}...`;
            
            // Parse file based on type
            const fileName = file.name.toLowerCase();
            const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
            
            let data;
            if (isExcel) {
                data = await parseExcelFileForImport(file);
            } else {
                data = await parseCSVFileForImport(file);
            }
            
            if (data && data.length > 0) {
                // Save to IndexedDB
                await saveImportedDataToDatabase(data, file.name);
                
                // Update UI
                fileNameSpan.textContent = `Imported from ${file.name}`;
                
                // Reload data from database
                await loadDefaultDataFromDatabase();
                
                alert(`Successfully imported ${data.length} activities from ${file.name}`);
            } else {
                alert('No valid data found in the file');
                fileNameSpan.textContent = 'No file selected';
            }
        } catch (error) {
            console.error('Error importing file:', error);
            alert('Error importing file: ' + error.message);
            fileNameSpan.textContent = 'Import failed';
        }
        
        // Clean up
        document.body.removeChild(fileInput);
    });
    
    // Trigger file picker
    document.body.appendChild(fileInput);
    fileInput.click();
}

async function parseCSVFileForImport(file) {
    return new Promise((resolve, reject) => {
        if (typeof Papa !== 'undefined') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data);
                },
                error: (error) => {
                    reject(new Error('CSV parsing error: ' + error.message));
                }
            });
        } else {
            // Fallback for file reading
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const csvText = e.target.result;
                    const data = parseCSVFallback(csvText);
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = function() {
                reject(new Error('File reading error'));
            };
            reader.readAsText(file);
        }
    });
}

async function parseExcelFileForImport(file) {
    return new Promise((resolve, reject) => {
        if (typeof XLSX === 'undefined') {
            reject(new Error('Excel support not available. Please use CSV format.'));
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
                    reject(new Error('Excel file must contain at least 2 rows (header + data)'));
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
                
                resolve(convertedData);
            } catch (error) {
                reject(new Error('Excel parsing error: ' + error.message));
            }
        };
        
        reader.onerror = function() {
            reject(new Error('File reading error'));
        };
        
        reader.readAsBinaryString(file);
    });
}

async function saveImportedDataToDatabase(data, filename) {
    try {
        // Get database instance
        const db = window.getDatabase();
        if (!db) {
            throw new Error('Database not available');
        }
        
        // Process data and add unique IDs
        const processedData = data.map((activity, index) => ({
            ...activity,
            _uniqueId: Date.now() + index // Add unique ID for editing
        }));
        
        // Clear existing data and save new data
        await db.clearAllActivities();
        await db.saveAllActivities(processedData);
        
        console.log(`Imported ${processedData.length} activities to database from ${filename}`);
        return true;
    } catch (error) {
        console.error('Error saving imported data to database:', error);
        throw error;
    }
}
