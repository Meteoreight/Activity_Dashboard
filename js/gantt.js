function createHTMLGanttChart(activities, siteColorMap, selectedSite, selectedAssignee) {
    if (activities.length === 0) return '';

    // Sort activities by manufacturing site, then by product, then by activity name
    activities = [...activities].sort((a, b) => {
        // First sort by manufacturing site
        if (a.Manufacturing_site !== b.Manufacturing_site) {
            return a.Manufacturing_site.localeCompare(b.Manufacturing_site);
        }
        // Then by product
        if (a.Product !== b.Product) {
            return a.Product.localeCompare(b.Product);
        }
        // Finally by activity name
        return a.Activity.localeCompare(b.Activity);
    });

    // Helper function to get quarter from date
    function getQuarter(date) {
        const month = date.getMonth() + 1; // getMonth() returns 0-11
        return Math.ceil(month / 3);
    }

    // Helper function to format quarter
    function formatQuarter(year, quarter) {
        return `${year} Q${quarter}`;
    }

    // Get date range
    const dates = activities.map(act => new Date(act.Start_with)).concat(
        activities.map(act => new Date(act.End_with))
    ).filter(date => !isNaN(date.getTime()));

    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Calculate quarter range
    const startYear = minDate.getFullYear();
    const startQuarter = getQuarter(minDate);
    const endYear = maxDate.getFullYear();
    const endQuarter = getQuarter(maxDate);

    // Calculate total quarters
    const totalQuarters = (endYear - startYear) * 4 + (endQuarter - startQuarter) + 1;
    const quarterWidth = 250; // Fixed width per quarter for better visibility
    const rightMargin = 100; // Right margin to ensure last activity is fully visible
    const chartWidth = totalQuarters * quarterWidth + rightMargin;

    let html = `
        <div style="display: flex; font-family: Inter, sans-serif; position: relative; overflow: hidden;">
            <!-- Fixed header column -->
            <div style="width: 350px; background: white; position: sticky; left: 0; z-index: 10; border-right: 2px solid #e2e8f0; overflow: hidden;">
                <!-- Header -->
                <div style="background: #f1f5f9; padding: 15px 10px; border-bottom: 2px solid #e2e8f0; font-weight: 600; color: #475569; height: 50px; box-sizing: border-box;">
                    ${translations[currentLanguage]['activity-header']}
                </div>
                <!-- Activity names -->
    `;

    activities.forEach((act, index) => {
        let taskName = '';
        if (selectedSite === 'ALL' && selectedAssignee === 'ALL') {
            taskName = `${act.Manufacturing_site} - ${act.Product} - ${act.Activity}`;
        } else if (selectedSite === 'ALL') {
            taskName = `${act.Manufacturing_site} - ${act.Product} - ${act.Activity}`;
        } else if (selectedAssignee === 'ALL') {
            taskName = `${act.Product} - ${act.Activity}`;
        } else {
            taskName = `${act.Product} - ${act.Activity}`;
        }

        const siteColor = siteColorMap[act.Manufacturing_site] || '#6B7280';
        const siteName = selectedSite === 'ALL' ? act.Manufacturing_site : '';
        const assignee = act.Assignment || '';

        html += `
            <div style="padding: 12px 10px; border-bottom: 1px solid #f1f5f9; font-size: 14px; height: 44px; box-sizing: border-box; display: flex; align-items: center;" title="${taskName}${assignee ? ' - ' + translations[currentLanguage]['assignee-label'] + ' ' + assignee : ''}">
                <div style="
                    overflow: hidden; 
                    text-overflow: ellipsis;
                    ${siteName ? `background: ${siteColor}; color: white; padding: 2px 6px; border-radius: 3px; margin-right: 8px; font-size: 11px; font-weight: 600;` : ''}
                ">
                    ${siteName ? siteName : ''}
                </div>
                <div style="overflow: hidden; text-overflow: ellipsis; color: #374151; flex: 1; display: flex; flex-direction: column;">
                    <div style="font-weight: 500;">
                        ${selectedSite === 'ALL' 
                            ? `${act.Product} - ${act.Activity}`
                            : `${act.Product} - ${act.Activity}`
                        }
                    </div>
                    ${(selectedAssignee === 'ALL' && assignee) ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px;">${translations[currentLanguage]['assignee-label']} ${assignee}</div>` : ''}
                </div>
            </div>
        `;
    });

    html += `
                <!-- Bottom spacer -->
                <div style="background: #f1f5f9; padding: 10px; border-top: 2px solid #e2e8f0; font-size: 12px; color: #64748b; height: 40px; box-sizing: border-box;">
                    ${translations[currentLanguage]['period-display']}
                </div>
            </div>
            
            <!-- Scrollable chart area -->
            <div class="gantt-scroll" style="flex: 1; overflow-x: auto; overflow-y: hidden; height: auto;">
                <div style="width: ${chartWidth}px;">
                    <!-- Quarter headers -->
                    <div style="display: flex; background: #f1f5f9; padding: 15px 0; border-bottom: 2px solid #e2e8f0; height: 50px; box-sizing: border-box;">
    `;

    // Generate quarter headers
    for (let year = startYear; year <= endYear; year++) {
        const qStart = year === startYear ? startQuarter : 1;
        const qEnd = year === endYear ? endQuarter : 4;

        for (let q = qStart; q <= qEnd; q++) {
            const quarterStr = formatQuarter(year, q);
            html += `<div style="width: ${quarterWidth}px; text-align: center; font-size: 14px; font-weight: 600; color: #374151; border-left: 1px solid #e2e8f0;">${quarterStr}</div>`;
        }
    }

    html += `
                    </div>
                    
                    <!-- Chart bars -->
                    <div style="position: relative;">
    `;

    activities.forEach((act, index) => {
        const startDate = new Date(act.Start_with);
        const endDate = new Date(act.End_with);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;

        // Calculate position and width in quarters
        const startQuarterOffset = (startDate.getFullYear() - startYear) * 4 +
            (getQuarter(startDate) - startQuarter);
        const endQuarterOffset = (endDate.getFullYear() - startYear) * 4 +
            (getQuarter(endDate) - startQuarter);
        const quarterSpan = endQuarterOffset - startQuarterOffset + 1;

        // Fine-tune position within quarter
        const startQ = getQuarter(startDate);
        const endQ = getQuarter(endDate);
        const startMonthInQ = (startDate.getMonth() % 3) + 1; // 1, 2, or 3
        const endMonthInQ = (endDate.getMonth() % 3) + 1;

        const startRatio = (startMonthInQ - 1) / 3 + (startDate.getDate() - 1) / (3 * 30); // Approximate
        const endRatio = (endMonthInQ - 1) / 3 + endDate.getDate() / (3 * 30);

        const leftOffset = startQuarterOffset * quarterWidth + (startRatio * quarterWidth);
        const barWidth = Math.max(20, (quarterSpan - 1) * quarterWidth + (endRatio * quarterWidth) - (startRatio * quarterWidth));

        const barColor = siteColorMap[act.Manufacturing_site] || '#6B7280';

        html += `
            <div style="position: absolute; top: ${index * 44}px; left: ${leftOffset}px; width: ${barWidth}px; height: 44px; padding: 10px 0; box-sizing: border-box;">
                <div class="gantt-bar" 
                     data-unique-id="${act._uniqueId}"
                     style="
                    width: 100%;
                    height: 24px;
                    background: ${barColor};
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 11px;
                    font-weight: 500;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    cursor: pointer;
                    min-width: 20px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    transition: transform 0.1s ease, box-shadow 0.1s ease;
                " title="${act.Manufacturing_site}: ${act.Activity} (${act.Start_with} - ${act.End_with})\nDouble-click to edit">
                    ${barWidth > 50 ? act.Activity : ''}
                </div>
            </div>
        `;
    });

    html += `
                    </div>
                    
                    <!-- Bottom quarter headers -->
                    <div style="display: flex; background: #f1f5f9; padding: 10px 0; border-top: 2px solid #e2e8f0; margin-top: ${activities.length * 44}px; height: 40px; box-sizing: border-box;">
    `;

    // Generate bottom quarter headers
    for (let year = startYear; year <= endYear; year++) {
        const qStart = year === startYear ? startQuarter : 1;
        const qEnd = year === endYear ? endQuarter : 4;

        for (let q = qStart; q <= qEnd; q++) {
            const quarterStr = formatQuarter(year, q);
            html += `<div style="width: ${quarterWidth}px; text-align: center; font-size: 12px; color: #64748b; border-left: 1px solid #e2e8f0;">${quarterStr}</div>`;
        }
    }

    html += `
                    </div>
                </div>
            </div>
        </div>
    `;

    return html;
}

function drawChart() {
    console.log('drawChart called');
    if (allActivities.length === 0) {
        console.log('No activities found');
        return;
    }

    chartLoader.classList.remove('hidden');
    chartDiv.classList.add('hidden');
    noDataMessage.classList.add('hidden');
    document.getElementById('date-header-top').classList.add('hidden');
    document.getElementById('date-header-bottom').classList.add('hidden');

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

    if (filteredActivities.length === 0) {
        console.log('No activities for selected filters');
        noDataMessage.classList.remove('hidden');
        chartLoader.classList.add('hidden');
        return;
    }

    // Create consistent color mapping for all manufacturing sites
    const allSites = [...new Set(allActivities.map(act => act.Manufacturing_site))].sort(); // Sort for consistency
    const colors = [
        '#3B82F6', // Blue
        '#EF4444', // Red  
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#8B5CF6', // Violet
        '#06B6D4', // Cyan
        '#F97316', // Orange
        '#84CC16', // Lime
        '#EC4899', // Pink
        '#6B7280' // Gray
    ];

    const siteColorMap = {};
    allSites.forEach((site, index) => {
        siteColorMap[site] = colors[index % colors.length];
    });

    // Filter out invalid dates
    const validActivities = filteredActivities.filter(act => {
        const startDate = new Date(act.Start_with);
        const endDate = new Date(act.End_with);
        return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime());
    });

    try {
        // Store the current filtered activities for editing
        currentFilteredActivities = validActivities;

        // Create simple HTML-based Gantt chart
        const ganttHTML = createHTMLGanttChart(validActivities, siteColorMap, selectedSite, selectedAssignee);
        const chartContainer = document.getElementById('chart-div');
        chartContainer.innerHTML = ganttHTML;

        chartLoader.classList.add('hidden');
        chartDiv.classList.remove('hidden');

        // Add double-click listeners to the bars
        addDoubleClickListeners();

    } catch (error) {
        console.error('Error creating chart:', error);
        chartLoader.classList.add('hidden');
        alert(translations[currentLanguage]['chart-creation-error'] + error.message);
    }
}