const mockCSVData = `Manufacturing_site,Product,API,Assignment,Note,Process,Activity,Start_with,End_with
CMO1,ProductA,API-001,User1,Note 1,Process-A,APQR,2025-06-01,2025-06-01
CMO1,ProductB,API-002,User2,Note 2,Process-B,BRM,2025-06-02,2025-06-05
CMO2,ProductC,API-003,User3,Note 3,Process-C,Inspection,2025-06-03,2025-06-07
CMO2,ProductD,API-004,User4,Note 4,Process-D,PV,2025-06-08,2025-06-15
CMO3,ProductE,API-005,User1,Note 5,Process-A,APQR,2025-06-10,2025-06-10
CMO3,ProductF,API-006,User2,Note 6,Process-B,BRM,2025-06-12,2025-06-14
CMO1,ProductI,API-009,User1,Note 9,Process-A,APQR,2025-07-01,2025-07-01
CMO1,ProductJ,API-010,User2,Note 10,Process-B,BRM,2025-07-02,2025-07-03
CMO2,ProductK,API-011,User3,Note 11,Process-C,Inspection,2025-07-04,2025-07-08
CMO2,ProductL,API-012,User4,Note 12,Process-D,PV,2025-07-05,2025-07-12
CMO3,ProductM,API-013,User1,Note 13,Process-A,APQR,2025-07-10,2025-07-10
CMO3,ProductN,API-014,User2,Note 14,Process-B,BRM,2025-07-15,2025-07-17
`;

function processData(data) {
    console.log('Processing data:', data.length, 'rows');
    if (data.length > 0 && 'Manufacturing_site' in data[0]) {
        console.log('Data headers:', Object.keys(data[0]));
        console.log('First row:', data[0]);
        // Add unique IDs to each activity for reliable identification
        allActivities = data.map((activity, index) => ({
            ...activity,
            _uniqueId: index
        }));
        populateSiteSelector();
        populateAssigneeSelector();
        populateProductSelector();
        populateAllSuggestions();
        mainContent.classList.remove('hidden');
        placeholderContent.classList.add('hidden');
        document.getElementById('export-data').classList.remove('hidden');
        document.getElementById('add-activity').classList.remove('hidden');
        console.log('UI updated, auto-drawing chart');
        // Auto-draw the chart
        handleDrawChart();
    } else {
        console.error('Invalid CSV format. Headers:', data.length > 0 ? Object.keys(data[0]) : 'No data');
        alert(translations[currentLanguage]['invalid-csv-format']);
        resetUI();
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        fileNameSpan.textContent = file.name;
        // Store original filename without extension
        originalFileName = file.name.replace(/\.[^/.]+$/, '');
        
        const fileName = file.name.toLowerCase();
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
        
        if (isExcel) {
            // Handle Excel files
            parseExcelFile(file);
        } else {
            // Handle CSV files
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
    }
}

function handleUseMockData() {
    fileNameSpan.textContent = 'sample_data.csv';
    originalFileName = 'sample_data';
    console.log('Using mock data...');
    
    if (typeof Papa !== 'undefined') {
        Papa.parse(mockCSVData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                processData(results.data);
            }
        });
    } else {
        console.log('Papa not available, using fallback CSV parser');
        // Fallback CSV parser
        const data = parseCSVFallback(mockCSVData);
        processData(data);
    }
}

// Excel file parser function
function parseExcelFile(file) {
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

// Fallback CSV parser function
function parseCSVFallback(csvText) {
    console.log('Using fallback CSV parser');
    const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
        console.error('No data in CSV');
        return [];
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    console.log('CSV Headers:', headers);
    
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        
        headers.forEach((header, index) => {
            row[header] = values[index] ? values[index].trim() : '';
        });
        
        // Only add non-empty rows
        if (Object.values(row).some(value => value !== '')) {
            data.push(row);
        }
    }
    
    console.log('Fallback CSV parser result:', data.length, 'rows');
    console.log('First row sample:', data[0]);
    return data;
}
