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
    fileNameSpan.textContent = translations[currentLanguage]['file-name'];
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
