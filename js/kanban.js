function drawKanbanBoard() {
    console.log('drawKanbanBoard called');
    if (allActivities.length === 0) {
        console.log('No activities found');
        return;
    }
    
    const kanbanLoader = document.getElementById('kanban-loader');
    const kanbanContainer = document.getElementById('kanban-container');
    const kanbanNoDataMessage = document.getElementById('kanban-no-data-message');
    
    kanbanLoader.classList.remove('hidden');
    kanbanContainer.classList.add('hidden');
    kanbanNoDataMessage.classList.add('hidden');

    const selectedSite = siteSelect.value;
    const selectedAssignee = assigneeSelect.value;
    const selectedProduct = productSelect.value;
    console.log('Selected site:', selectedSite);
    console.log('Selected assignee:', selectedAssignee);
    console.log('Selected product:', selectedProduct);

    let filteredActivities = allActivities;
    
    // Filter by site
    if (selectedSite !== 'ALL') {
        filteredActivities = filteredActivities.filter(act => act.Manufacturing_site === selectedSite);
        console.log('Filtered activities by site', selectedSite, ':', filteredActivities.length);
    }
    
    // Filter by assignee (supports comma-separated values)
    if (selectedAssignee !== 'ALL') {
        filteredActivities = filteredActivities.filter(act => activityMatchesAssignee(act, selectedAssignee));
        console.log('Filtered activities by assignee', selectedAssignee, ':', filteredActivities.length);
    }
    
    // Filter by product
    if (selectedProduct !== 'ALL') {
        filteredActivities = filteredActivities.filter(act => act.Product === selectedProduct);
        console.log('Filtered activities by product', selectedProduct, ':', filteredActivities.length);
    }
    
    console.log('Final filtered activities:', filteredActivities.length);

    if(filteredActivities.length === 0) {
        console.log('No activities for selected filters');
        kanbanNoDataMessage.classList.remove('hidden');
        kanbanLoader.classList.add('hidden');
        return;
    }

    // Create consistent color mapping for all manufacturing sites
    const allSites = [...new Set(allActivities.map(act => act.Manufacturing_site))].sort();
    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
        '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
    ];
    
    const siteColorMap = {};
    allSites.forEach((site, index) => {
        siteColorMap[site] = colors[index % colors.length];
    });

    try {
        // Store the current filtered activities for editing
        currentFilteredActivities = filteredActivities;
        
        // Group activities by assignee
        const groupedByAssignee = groupActivitiesByAssignee(filteredActivities);
        
        // Create Kanban board HTML
        const kanbanHTML = createKanbanBoard(groupedByAssignee, siteColorMap);
        kanbanContainer.innerHTML = kanbanHTML;
        
        kanbanLoader.classList.add('hidden');
        kanbanContainer.classList.remove('hidden');
        
        // Add double-click listeners to the kanban cards
        addKanbanDoubleClickListeners();
        
    } catch (error) {
        console.error('Error creating kanban board:', error);
        kanbanLoader.classList.add('hidden');
        alert(translations[currentLanguage]['chart-creation-error'] + error.message);
    }
}

function groupActivitiesByAssignee(activities) {
    const grouped = {};
    
    activities.forEach(activity => {
        const assignment = activity.Assignment || '';
        
        if (!assignment.trim()) {
            // Unassigned activity
            const unassignedKey = translations[currentLanguage]['unassigned'];
            if (!grouped[unassignedKey]) {
                grouped[unassignedKey] = [];
            }
            grouped[unassignedKey].push(activity);
        } else {
            // Split comma-separated assignees and add activity to each assignee's group
            const assignees = assignment.split(',').map(a => a.trim()).filter(a => a !== '');
            assignees.forEach(assignee => {
                if (!grouped[assignee]) {
                    grouped[assignee] = [];
                }
                grouped[assignee].push(activity);
            });
        }
    });
    
    return grouped;
}

function createKanbanBoard(groupedActivities, siteColorMap) {
    let html = '';
    
    const assignees = Object.keys(groupedActivities).sort();
    
    assignees.forEach(assignee => {
        const activities = groupedActivities[assignee];
        const taskCount = activities.length;
        
        const taskText = taskCount === 1 ? translations[currentLanguage]['task-singular'] : translations[currentLanguage]['task-plural'];
        
        html += `
            <div class="kanban-column">
                <div class="kanban-header">
                    <div>
                        <div style="font-size: 1.1rem; color: #1f2937;">${assignee}</div>
                        <div style="font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem;">${taskCount} ${taskText}</div>
                    </div>
                </div>
                <div class="kanban-cards">
        `;
        
        activities.forEach((activity, index) => {
            const siteColor = siteColorMap[activity.Manufacturing_site] || '#6B7280';
            const startDate = activity.Start_with;
            const endDate = activity.End_with;
            
            html += `
                <div class="kanban-card" data-unique-id="${activity._uniqueId}" style="cursor: pointer;" title="Double-click to edit">
                    <div class="kanban-card-title">${activity.Product} - ${activity.Activity}</div>
                    <div class="kanban-card-meta">
                        <div style="display: flex; align-items: center; margin-bottom: 0.25rem;">
                            <div style="width: 12px; height: 12px; background: ${siteColor}; border-radius: 2px; margin-right: 0.5rem;"></div>
                            <span>${activity.Manufacturing_site}</span>
                        </div>
                        <div>API: ${activity.API || 'N/A'}</div>
                        <div>Process: ${activity.Process || 'N/A'}</div>
                        ${activity.Note ? `<div>Note: ${activity.Note}</div>` : ''}
                    </div>
                    <div class="kanban-card-dates">
                        ${formatDateRange(startDate, endDate)}
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    return html;
}
