function switchToView(viewName) {
    currentView = viewName;
    
    // Update tab active states
    ganttTab.classList.remove('tab-active');
    kanbanTab.classList.remove('tab-active');
    
    if (viewName === 'gantt') {
        ganttTab.classList.add('tab-active');
        ganttView.classList.remove('hidden');
        kanbanView.classList.add('hidden');
    } else if (viewName === 'kanban') {
        kanbanTab.classList.add('tab-active');
        ganttView.classList.add('hidden');
        kanbanView.classList.remove('hidden');
    }
    
    // Refresh the current view if data is loaded
    if (allActivities.length > 0) {
        handleDrawChart();
    }
}

function handleDrawChart() {
    if (currentView === 'gantt') {
        drawChart();
    } else if (currentView === 'kanban') {
        drawKanbanBoard();
    }
}

function resetUI() {
    allActivities = [];
    currentFileHandle = null;
    mainContent.classList.add('hidden');
    placeholderContent.classList.remove('hidden');
    setDefaultFilename();
    siteSelect.innerHTML = '';
    assigneeSelect.innerHTML = '';
    chartDiv.innerHTML = '';
    document.getElementById('export-data').classList.add('hidden');
    document.getElementById('add-activity').classList.add('hidden');
}

function populateSiteSelector() {
    const sites = [...new Set(allActivities.map(act => act.Manufacturing_site))];
    siteSelect.innerHTML = ''; // Clear previous options
    
    // Add "All" option
    const allOption = document.createElement('option');
    allOption.value = 'ALL';
    allOption.textContent = translations[currentLanguage]['all-sites'];
    siteSelect.appendChild(allOption);
    
    // Add individual sites
    sites.forEach(site => {
        const option = document.createElement('option');
        option.value = site;
        option.textContent = site;
        siteSelect.appendChild(option);
    });
    
    // Default to "All"
    siteSelect.value = 'ALL';
}

function populateAssigneeSelector() {
    // Handle comma-separated assignees by splitting and flattening
    const assignees = [...new Set(
        allActivities
            .map(act => act.Assignment)
            .filter(assignee => assignee && assignee.trim() !== '')
            .flatMap(assignee => assignee.split(',').map(a => a.trim()))
            .filter(assignee => assignee !== '')
    )];
    assigneeSelect.innerHTML = ''; // Clear previous options
    
    // Add "All" option
    const allOption = document.createElement('option');
    allOption.value = 'ALL';
    allOption.textContent = translations[currentLanguage]['all-assignees'];
    assigneeSelect.appendChild(allOption);
    
    // Add individual assignees
    assignees.sort().forEach(assignee => {
        const option = document.createElement('option');
        option.value = assignee;
        option.textContent = assignee;
        assigneeSelect.appendChild(option);
    });
    
    // Default to "All"
    assigneeSelect.value = 'ALL';
}

function populateProductSelector() {
    const products = [...new Set(allActivities.map(act => act.Product).filter(product => product && product.trim() !== ''))];
    productSelect.innerHTML = ''; // Clear previous options
    
    // Add "All" option
    const allOption = document.createElement('option');
    allOption.value = 'ALL';
    allOption.textContent = translations[currentLanguage]['all-products'];
    productSelect.appendChild(allOption);
    
    // Add individual products
    products.sort().forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        option.textContent = product;
        productSelect.appendChild(option);
    });
    
    // Default to "All"
    productSelect.value = 'ALL';
}

// Populate autocomplete suggestions for form fields
function populateProductSuggestions() {
    const products = [...new Set(allActivities.map(act => act.Product).filter(product => product && product.trim() !== ''))];
    
    // Update edit form suggestions
    const editProductSuggestions = document.getElementById('edit-product-suggestions');
    editProductSuggestions.innerHTML = '';
    products.sort().forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        editProductSuggestions.appendChild(option);
    });
    
    // Update add form suggestions
    const addProductSuggestions = document.getElementById('add-product-suggestions');
    addProductSuggestions.innerHTML = '';
    products.sort().forEach(product => {
        const option = document.createElement('option');
        option.value = product;
        addProductSuggestions.appendChild(option);
    });
}

function populateAssignmentSuggestions() {
    // Handle comma-separated assignments by splitting and flattening
    const assignments = [...new Set(
        allActivities
            .map(act => act.Assignment)
            .filter(assignment => assignment && assignment.trim() !== '')
            .flatMap(assignment => assignment.split(',').map(a => a.trim()))
            .filter(assignment => assignment !== '')
    )];
    
    // Update edit form suggestions
    const editAssignmentSuggestions = document.getElementById('edit-assignment-suggestions');
    editAssignmentSuggestions.innerHTML = '';
    assignments.sort().forEach(assignment => {
        const option = document.createElement('option');
        option.value = assignment;
        editAssignmentSuggestions.appendChild(option);
    });
    
    // Update add form suggestions
    const addAssignmentSuggestions = document.getElementById('add-assignment-suggestions');
    addAssignmentSuggestions.innerHTML = '';
    assignments.sort().forEach(assignment => {
        const option = document.createElement('option');
        option.value = assignment;
        addAssignmentSuggestions.appendChild(option);
    });
}

function populateProcessSuggestions() {
    const processes = [...new Set(allActivities.map(act => act.Process).filter(process => process && process.trim() !== ''))];
    
    // Update edit form suggestions
    const editProcessSuggestions = document.getElementById('edit-process-suggestions');
    editProcessSuggestions.innerHTML = '';
    processes.sort().forEach(process => {
        const option = document.createElement('option');
        option.value = process;
        editProcessSuggestions.appendChild(option);
    });
    
    // Update add form suggestions
    const addProcessSuggestions = document.getElementById('add-process-suggestions');
    addProcessSuggestions.innerHTML = '';
    processes.sort().forEach(process => {
        const option = document.createElement('option');
        option.value = process;
        addProcessSuggestions.appendChild(option);
    });
}

function populateAllSuggestions() {
    populateProductSuggestions();
    populateAssignmentSuggestions();
    populateProcessSuggestions();
}

// Helper function to check if an activity matches the selected assignee
// Handles comma-separated assignees
function activityMatchesAssignee(activity, selectedAssignee) {
    if (selectedAssignee === 'ALL') {
        return true;
    }
    
    const assignment = activity.Assignment || '';
    if (!assignment.trim()) {
        return false;
    }
    
    // Split by comma and check if any assignee matches
    const assignees = assignment.split(',').map(a => a.trim());
    return assignees.includes(selectedAssignee);
}

// Update date display headers for quarterly view
function updateDateHeaders(activities) {
    if (activities.length === 0) return;
    
    // Helper function to get quarter from date
    function getQuarter(date) {
        const month = date.getMonth() + 1;
        return Math.ceil(month / 3);
    }
    
    const dates = activities.map(act => new Date(act.Start_with)).concat(
        activities.map(act => new Date(act.End_with))
    ).filter(date => !isNaN(date.getTime()));
    
    if (dates.length === 0) return;
    
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    const startQuarter = `${minDate.getFullYear()} Q${getQuarter(minDate)}`;
    const endQuarter = `${maxDate.getFullYear()} Q${getQuarter(maxDate)}`;
    
    // Update headers if they exist (they may not exist with new layout)
    const startMonthEl = document.getElementById('start-month');
    const endMonthEl = document.getElementById('end-month');
    const dateHeaderTop = document.getElementById('date-header-top');
    const startMonthBottomEl = document.getElementById('start-month-bottom');
    const endMonthBottomEl = document.getElementById('end-month-bottom');
    const dateHeaderBottom = document.getElementById('date-header-bottom');
    
    if (startMonthEl && endMonthEl && dateHeaderTop) {
        startMonthEl.textContent = startQuarter;
        endMonthEl.textContent = endQuarter;
        dateHeaderTop.classList.remove('hidden');
    }
    
    if (startMonthBottomEl && endMonthBottomEl && dateHeaderBottom) {
        startMonthBottomEl.textContent = startQuarter;
        endMonthBottomEl.textContent = endQuarter;
        dateHeaderBottom.classList.remove('hidden');
    }
}

// Global variable to store current filtered activities for editing
let currentFilteredActivities = [];

// Add double-click listeners to Gantt chart bars
function addDoubleClickListeners() {
    const ganttBars = document.querySelectorAll('.gantt-bar');
    ganttBars.forEach(bar => {
        bar.addEventListener('dblclick', function() {
            const uniqueId = parseInt(this.dataset.uniqueId);
            const activity = allActivities.find(act => act._uniqueId === uniqueId);
            if (activity) {
                openEditModal(activity);
            }
        });
    });
}

// Add double-click listeners to Kanban cards
function addKanbanDoubleClickListeners() {
    const kanbanCards = document.querySelectorAll('.kanban-card');
    kanbanCards.forEach(card => {
        card.addEventListener('dblclick', function() {
            const uniqueId = parseInt(this.dataset.uniqueId);
            const activity = allActivities.find(act => act._uniqueId === uniqueId);
            if (activity) {
                openEditModal(activity);
            }
        });
    });
}

// Open edit modal with activity data
function openEditModal(activity) {
    const modal = document.getElementById('edit-modal');
    
    document.getElementById('edit-index').value = activity._uniqueId;
    document.getElementById('edit-manufacturing-site').value = activity.Manufacturing_site || '';
    document.getElementById('edit-product').value = activity.Product || '';
    document.getElementById('edit-api').value = activity.API || '';
    document.getElementById('edit-assignment').value = activity.Assignment || '';
    document.getElementById('edit-process').value = activity.Process || '';
    document.getElementById('edit-activity').value = activity.Activity || '';
    document.getElementById('edit-start-date').value = activity.Start_with || '';
    document.getElementById('edit-end-date').value = activity.End_with || '';
    document.getElementById('edit-note').value = activity.Note || '';
    
    modal.classList.remove('hidden');
}

// Close edit modal
function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    modal.classList.add('hidden');
}

// Open add modal
function openAddModal() {
    const modal = document.getElementById('add-modal');
    
    // Clear form fields
    document.getElementById('add-manufacturing-site').value = '';
    document.getElementById('add-product').value = '';
    document.getElementById('add-api').value = '';
    document.getElementById('add-assignment').value = '';
    document.getElementById('add-process').value = '';
    document.getElementById('add-activity-input').value = '';
    document.getElementById('add-start-date').value = '';
    document.getElementById('add-end-date').value = '';
    document.getElementById('add-note').value = '';
    
    modal.classList.remove('hidden');
}

// Close add modal
function closeAddModal() {
    const modal = document.getElementById('add-modal');
    modal.classList.add('hidden');
}

// Delete activity
async function deleteActivity() {
    const uniqueId = parseInt(document.getElementById('edit-index').value);
    const activityIndex = allActivities.findIndex(act => act._uniqueId === uniqueId);
    
    if (activityIndex !== -1) {
        if (confirm(translations[currentLanguage]['delete-confirm'] || 'Are you sure you want to delete this activity?')) {
            allActivities.splice(activityIndex, 1);
            closeEditModal();
            
            // Update selectors and redraw
            populateSiteSelector();
            populateAssigneeSelector();
            populateProductSelector();
            populateAllSuggestions();
            handleDrawChart();
            
            // Save based on current mode
            await saveModeSpecificData();
            
        }
    }
}

// Save changes to activity
async function saveChanges() {
    const uniqueId = parseInt(document.getElementById('edit-index').value);
    const activityIndex = allActivities.findIndex(act => act._uniqueId === uniqueId);
    
    if (activityIndex !== -1) {
        // Update activity data
        allActivities[activityIndex].Manufacturing_site = document.getElementById('edit-manufacturing-site').value;
        allActivities[activityIndex].Product = document.getElementById('edit-product').value;
        allActivities[activityIndex].API = document.getElementById('edit-api').value;
        allActivities[activityIndex].Assignment = document.getElementById('edit-assignment').value;
        allActivities[activityIndex].Process = document.getElementById('edit-process').value;
        allActivities[activityIndex].Activity = document.getElementById('edit-activity').value;
        allActivities[activityIndex].Start_with = document.getElementById('edit-start-date').value;
        allActivities[activityIndex].End_with = document.getElementById('edit-end-date').value;
        allActivities[activityIndex].Note = document.getElementById('edit-note').value;
        
        closeEditModal();
        
        // Update selectors and redraw
        populateSiteSelector();
        populateAssigneeSelector();
        populateProductSelector();
        populateAllSuggestions();
        handleDrawChart();
        
        // Save based on current mode
        await saveModeSpecificData();
    }
}

// Add new activity
async function addNewActivity() {
    const newActivity = {
        Manufacturing_site: document.getElementById('add-manufacturing-site').value,
        Product: document.getElementById('add-product').value,
        API: document.getElementById('add-api').value,
        Assignment: document.getElementById('add-assignment').value,
        Process: document.getElementById('add-process').value,
        Activity: document.getElementById('add-activity-input').value,
        Start_with: document.getElementById('add-start-date').value,
        End_with: document.getElementById('add-end-date').value,
        Note: document.getElementById('add-note').value,
        _uniqueId: allActivities.length > 0 ? Math.max(...allActivities.map(a => a._uniqueId)) + 1 : 0
    };
    
    allActivities.push(newActivity);
    closeAddModal();
    
    // Update selectors and redraw
    populateSiteSelector();
    populateAssigneeSelector();
    populateProductSelector();
    populateAllSuggestions();
    handleDrawChart();
    
    // Save based on current mode
    await saveModeSpecificData();
}

// Export data to CSV
function exportData() {
    if (allActivities.length === 0) {
        alert('No data to export');
        return;
    }
    
    const headers = ['Manufacturing_site', 'Product', 'API', 'Assignment', 'Note', 'Process', 'Activity', 'Start_with', 'End_with'];
    const csvContent = [
        headers.join(','),
        ...allActivities.map(activity => 
            headers.map(header => {
                const value = activity[header] || '';
                return value.includes(',') || value.includes('"') ? `"${value.replace(/"/g, '""')}"` : value;
            }).join(',')
        )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${originalFileName}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Format date range for display
function formatDateRange(startDate, endDate) {
    if (!startDate && !endDate) {
        return translations[currentLanguage]['no-dates'] || 'No dates';
    }
    
    if (startDate === endDate) {
        return startDate;
    }
    
    return `${startDate} - ${endDate}`;
}

// Directory handle functions for File System Access API
async function getLastDirectoryHandle() {
    // Placeholder for directory handle retrieval
    return null;
}

async function saveDirectoryInfo(fileHandle) {
    // Placeholder for directory handle saving
}

// --- Mode-specific data saving ---
async function saveModeSpecificData() {
    try {
        if (currentMode === 'local') {
            // Local DB mode - save to IndexedDB
            await saveToDatabase();
        } else if (currentMode === 'file') {
            // File Edit mode - save to file if handle exists
            if (currentFileHandle) {
                await handleSaveToFile();
            }
        }
    } catch (error) {
        console.error('Error saving data:', error);
        // Don't show alert for database saves as they might happen frequently
        if (currentMode === 'file') {
            alert('Error saving to file: ' + error.message);
        }
    }
}

async function saveToDatabase() {
    try {
        const db = window.getDatabase();
        if (!db) {
            console.warn('Database not available for saving');
            return;
        }
        
        // Clear existing data and save current activities
        await db.clearAllActivities();
        
        // Process activities for database storage
        const activitiesForDB = allActivities.map(activity => ({
            ...activity
            // Remove _uniqueId as it's handled by database auto-increment
        }));
        
        await db.saveAllActivities(activitiesForDB);
        console.log(`Saved ${activitiesForDB.length} activities to database`);
    } catch (error) {
        console.error('Error saving to database:', error);
        throw error;
    }
}
