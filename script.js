document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('taskForm');
    const formContainer = document.getElementById('formContainer');
    const formHeader = document.getElementById('formHeader');
    const submitBtn = document.getElementById('submitBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    
    const openTasksContainer = document.getElementById('openTasks');
    const claimedTasksContainer = document.getElementById('claimedTasks');
    
    const statsTitle = document.getElementById('statsTitle');
    const statTotal = document.getElementById('statTotal');
    const statClaimed = document.getElementById('statClaimed');
    const statHours = document.getElementById('statHours');
    const statLabel1 = document.getElementById('statLabel1');
    const statLabel2 = document.getElementById('statLabel2');
    
    const openCountBadge = document.getElementById('openCountBadge');
    const claimedCountBadge = document.getElementById('claimedCountBadge');
    
    const resetBtn = document.getElementById('resetApp');
    const roleSwitcher = document.getElementById('roleSwitcher');
    const toastContainer = document.getElementById('toastContainer');
    const filterCategory = document.getElementById('filterCategory');
    const filterSearch = document.getElementById('filterSearch');

    // State Variables
    let currentRole = 'organizer'; 
    let editingTaskId = null; // Tracks if we are editing an existing task

    // Generate Dynamic Seed Dates so 'Urgent' logic always works for the demo
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

    const formatISODate = (d) => d.toISOString().split('T')[0];

    const seedData = [
        { id: 101, title: "Emergency Food Bank Sort", category: "Logistics", hours: 4, date: formatISODate(tomorrow), time: "09:00", location: "Downtown Mission", spotsTotal: 5, spotsClaimed: 2, claimedByDemo: 0, status: "open" },
        { id: 102, title: "Riverfront Trash Cleanup", category: "Environment", hours: 3, date: formatISODate(nextWeek), time: "10:30", location: "Riverside Park", spotsTotal: 10, spotsClaimed: 0, claimedByDemo: 0, status: "open" },
        { id: 103, title: "Tutor High School Math", category: "Education", hours: 2, date: formatISODate(today), time: "16:00", location: "Community Library", spotsTotal: 1, spotsClaimed: 1, claimedByDemo: 1, status: "claimed" }
    ];

    // Initialize LocalStorage with Data Migration for older prototype versions
    let tasks = JSON.parse(localStorage.getItem('impactTasks'));
    if (!tasks || tasks.length === 0) {
        tasks = seedData;
    } else {
        // Migration: Add spots tracking to old data if it doesn't exist
        tasks = tasks.map(t => ({
            ...t,
            spotsTotal: t.spotsTotal || 1,
            spotsClaimed: t.spotsClaimed !== undefined ? t.spotsClaimed : (t.status === 'claimed' ? 1 : 0),
            claimedByDemo: t.claimedByDemo || 0
        }));
    }
    saveData();

    // --- Helper Functions ---
    function saveData() { localStorage.setItem('impactTasks', JSON.stringify(tasks)); }

    function getCategoryColor(category) {
        const colors = {
            'Environment': 'bg-green-100 text-green-700 border-green-200',
            'Education': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Logistics': 'bg-blue-100 text-blue-700 border-blue-200',
            'Health': 'bg-red-100 text-red-700 border-red-200'
        };
        return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-');
        return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatTime(timeString) {
        if (!timeString) return '';
        const [hour, minute] = timeString.split(':');
        const d = new Date(); d.setHours(hour, minute);
        return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    }

    // Checks if task is within 48 hours
    function checkUrgent(dateStr, timeStr) {
        if (!dateStr || !timeStr) return false;
        const taskDate = new Date(`${dateStr}T${timeStr}`);
        const now = new Date();
        const diffInHours = (taskDate - now) / (1000 * 60 * 60);
        return diffInHours > 0 && diffInHours <= 48;
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-600' : (type === 'error' ? 'bg-red-600' : 'bg-blue-600');
        const icon = type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle');
        
        toast.className = `${bgColor} text-white px-5 py-3 rounded-lg shadow-xl border border-white/20 flex items-center gap-3 transform transition-all duration-300 translate-y-10 opacity-0`;
        toast.innerHTML = `<i class="fa-solid ${icon} text-lg"></i><span class="font-medium text-sm">${message}</span>`;
        toastContainer.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.remove('translate-y-10', 'opacity-0'));
        setTimeout(() => {
            toast.classList.add('opacity-0', 'scale-95');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    function resetFormState() {
        form.reset();
        editingTaskId = null;
        formHeader.innerText = 'Allocate Resource Need';
        submitBtn.innerText = 'Post Need';
        cancelEditBtn.classList.add('hidden');
    }

    // --- Core Render Logic ---
    function renderApp() {
        openTasksContainer.innerHTML = '';
        claimedTasksContainer.innerHTML = '';

        // 1. Contextual Dashboard Stats (Global vs My Impact)
        if (currentRole === 'organizer') {
            statsTitle.innerText = "Global Community Impact";
            statLabel1.innerText = "Total Needs Posted";
            statLabel2.innerText = "Volunteer Spots Filled";
            
            statTotal.innerText = tasks.length;
            statClaimed.innerText = tasks.reduce((sum, t) => sum + t.spotsClaimed, 0);
            statHours.innerText = tasks.reduce((sum, t) => sum + (t.spotsClaimed * parseInt(t.hours)), 0);
        } else {
            statsTitle.innerText = "My Personal Impact";
            statLabel1.innerText = "My Tasks Acted On";
            statLabel2.innerText = "Spots Claimed By Me";
            
            const myTasks = tasks.filter(t => t.claimedByDemo > 0);
            statTotal.innerText = myTasks.length;
            statClaimed.innerText = tasks.reduce((sum, t) => sum + t.claimedByDemo, 0);
            statHours.innerText = tasks.reduce((sum, t) => sum + (t.claimedByDemo * parseInt(t.hours)), 0);
        }

        // 2. Form Visibility
        if (currentRole === 'volunteer') {
            formContainer.classList.add('opacity-40', 'pointer-events-none');
            formContainer.querySelector('h2').innerHTML = 'Allocate Resource Need <br><span class="text-xs text-red-500 font-normal">Disabled: NGO Organizers Only</span>';
            resetFormState();
        } else {
            formContainer.classList.remove('opacity-40', 'pointer-events-none');
            if(!editingTaskId) formContainer.querySelector('h2').innerHTML = 'Allocate Resource Need';
        }

        // 3. Smart Search & Filters
        const activeCategory = filterCategory.value;
        const searchTerm = filterSearch.value.toLowerCase().trim();

        let filteredTasks = tasks.filter(task => {
            const matchesCat = activeCategory === 'all' || task.category === activeCategory;
            const matchesSearch = !searchTerm || 
                                  task.title.toLowerCase().includes(searchTerm) || 
                                  task.location.toLowerCase().includes(searchTerm);
            return matchesCat && matchesSearch;
        });

        // 4. Chronological Sorting (Soonest tasks first)
        filteredTasks.sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        let renderedOpenCount = 0;
        let renderedClaimedCount = 0;

        // 5. Render Tasks
        filteredTasks.forEach(task => {
            const el = document.createElement('div');
            el.className = 'p-5 border border-slate-200 rounded-lg bg-white flex flex-col gap-3 transition-all hover:border-slate-300 hover:shadow-md relative group';
            
            // Edit/Delete Controls for Organizer
            let controlsHTML = '';
            if (currentRole === 'organizer') {
                controlsHTML = `
                    <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="editTask(${task.id})" class="text-slate-400 hover:text-blue-600 transition p-1"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="deleteTask(${task.id})" class="text-slate-400 hover:text-red-600 transition p-1"><i class="fa-solid fa-trash"></i></button>
                    </div>`;
            }

            // Urgent Badge Logic
            const isUrgent = task.status === 'open' && checkUrgent(task.date, task.time);
            const urgentBadge = isUrgent ? `<span class="animate-pulse bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold border border-red-200 uppercase tracking-wider ml-2"><i class="fa-solid fa-fire mr-1"></i>Urgent</span>` : '';

            // Multi-Volunteer Progress Logic
            const spotsLeft = task.spotsTotal - task.spotsClaimed;
            const progressPercent = (task.spotsClaimed / task.spotsTotal) * 100;
            
            let actionArea = '';
            if (task.status === 'open') {
                renderedOpenCount++;
                if (currentRole === 'volunteer') {
                    actionArea = `
                        <div class="flex flex-col gap-2 w-full sm:w-auto">
                            <div class="text-xs font-semibold text-slate-500 text-right">${task.spotsClaimed}/${task.spotsTotal} Spots Filled</div>
                            <button onclick="claimTask(${task.id})" class="text-sm bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md font-medium transition shadow-sm w-full sm:w-auto">
                                Claim Spot
                            </button>
                        </div>`;
                } else {
                    actionArea = `
                        <div class="flex flex-col items-end gap-1">
                            <div class="text-xs font-semibold text-slate-500">${task.spotsClaimed}/${task.spotsTotal} Filled</div>
                            <div class="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div class="h-full bg-blue-500" style="width: ${progressPercent}%"></div>
                            </div>
                        </div>`;
                }
            } else {
                renderedClaimedCount++;
                actionArea = `<span class="text-sm font-medium text-green-600 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg flex items-center gap-2"><i class="fa-solid fa-check-circle"></i> Fully Allocated</span>`;
            }

            el.innerHTML = `
                ${controlsHTML}
                <div class="flex flex-col items-start pr-12">
                    <div class="flex items-center mb-1">
                        <span class="text-[11px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(task.category)} uppercase tracking-wider">${task.category}</span>
                        ${urgentBadge}
                    </div>
                    <h3 class="font-bold text-slate-900 text-lg leading-tight mt-1">${task.title}</h3>
                </div>
                
                <div class="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm text-slate-600 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center text-xs"><i class="fa-regular fa-calendar"></i></div>
                        <span class="font-medium">${formatDate(task.date)}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded bg-purple-100 text-purple-600 flex items-center justify-center text-xs"><i class="fa-regular fa-clock"></i></div>
                        <span>${formatTime(task.time)} <span class="text-xs text-slate-400">(${task.hours}h/person)</span></span>
                    </div>
                    <div class="flex items-center gap-2 sm:col-span-2 mt-1">
                        <div class="w-6 h-6 rounded bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs"><i class="fa-solid fa-map-pin"></i></div>
                        <span class="truncate">${task.location}</span>
                    </div>
                </div>

                <div class="flex justify-between items-end mt-2 pt-3 border-t border-slate-100">
                    <div class="text-xs text-slate-400">ID: #${task.id.toString().slice(-4)}</div>
                    ${actionArea}
                </div>
            `;

            if (task.status === 'open') {
                openTasksContainer.appendChild(el);
            } else {
                claimedTasksContainer.appendChild(el);
            }
        });

        openCountBadge.innerText = renderedOpenCount;
        claimedCountBadge.innerText = renderedClaimedCount;

        // Empty States
        if(openTasksContainer.innerHTML === '') {
            openTasksContainer.innerHTML = `<div class="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200"><i class="fa-solid fa-check-double text-4xl mb-3 opacity-30 text-green-500"></i><p class="text-sm font-medium text-slate-500">All community needs are met right now!</p></div>`;
        }
        if(claimedTasksContainer.innerHTML === '') {
            claimedTasksContainer.innerHTML = `<div class="flex flex-col items-center justify-center h-48 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200"><i class="fa-solid fa-hands-holding text-4xl mb-3 opacity-30 text-blue-500"></i><p class="text-sm font-medium text-slate-500">No resources allocated yet.</p></div>`;
        }
    }

    // --- Global Actions (Attached to window for inline onclick) ---
    
    window.claimTask = function(id) {
        const task = tasks.find(t => t.id === id);
        if (task && task.spotsClaimed < task.spotsTotal) {
            task.spotsClaimed += 1;
            task.claimedByDemo += 1;
            
            if (task.spotsClaimed >= task.spotsTotal) {
                task.status = 'claimed';
                showToast('Final spot claimed! Task Fully Allocated.', 'success');
            } else {
                showToast(`Spot claimed! ${task.spotsTotal - task.spotsClaimed} remaining.`, 'info');
            }
            saveData();
            renderApp();
        }
    }

    window.deleteTask = function(id) {
        if(confirm("Are you sure you want to remove this need?")) {
            tasks = tasks.filter(t => t.id !== id);
            saveData();
            renderApp();
            showToast('Task removed from dashboard.', 'info');
        }
    }

    window.editTask = function(id) {
        const task = tasks.find(t => t.id === id);
        if(!task) return;

        editingTaskId = id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskCategory').value = task.category;
        document.getElementById('taskSpots').value = task.spotsTotal;
        document.getElementById('taskHours').value = task.hours;
        document.getElementById('taskDate').value = task.date;
        document.getElementById('taskTime').value = task.time;
        document.getElementById('taskLocation').value = task.location;

        formHeader.innerText = 'Edit Resource Need';
        submitBtn.innerText = 'Update Need';
        cancelEditBtn.classList.remove('hidden');
        
        // Scroll to form smoothly
        formContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // --- Event Listeners ---

    roleSwitcher.addEventListener('change', (e) => {
        currentRole = e.target.value;
        renderApp();
        showToast(`Switched to ${currentRole === 'organizer' ? 'NGO Organizer' : 'Volunteer'} mode`, 'info');
    });

    filterCategory.addEventListener('change', renderApp);
    filterSearch.addEventListener('input', renderApp);

    cancelEditBtn.addEventListener('click', resetFormState);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const taskData = {
            title: document.getElementById('taskTitle').value,
            category: document.getElementById('taskCategory').value,
            spotsTotal: parseInt(document.getElementById('taskSpots').value),
            hours: parseInt(document.getElementById('taskHours').value),
            date: document.getElementById('taskDate').value,
            time: document.getElementById('taskTime').value,
            location: document.getElementById('taskLocation').value,
        };

        if (editingTaskId) {
            // Update existing
            const index = tasks.findIndex(t => t.id === editingTaskId);
            if(index !== -1) {
                // Ensure claimed spots don't exceed new total
                if(tasks[index].spotsClaimed > taskData.spotsTotal) {
                    return alert("You cannot reduce spots below the amount already claimed by volunteers.");
                }
                tasks[index] = { ...tasks[index], ...taskData };
                
                // Auto-update status if spots changed
                if(tasks[index].spotsClaimed >= tasks[index].spotsTotal) {
                    tasks[index].status = 'claimed';
                } else {
                    tasks[index].status = 'open';
                }
            }
            showToast('Community need updated successfully!');
        } else {
            // Create new
            tasks.push({
                id: Date.now(),
                ...taskData,
                spotsClaimed: 0,
                claimedByDemo: 0,
                status: 'open'
            });
            showToast('New community need posted!');
        }

        saveData();
        renderApp();
        resetFormState();
        filterCategory.value = 'all';
        filterSearch.value = '';
    });

    resetBtn.addEventListener('click', () => {
        if(confirm('WARNING: This will wipe all data and return to the default demo state. Continue?')) {
            localStorage.removeItem('impactTasks');
            location.reload(); // Quickest way to reset script state
        }
    });

    // Set today's date as min
    document.getElementById('taskDate').setAttribute('min', formatISODate(today));

    // Initial Render
    renderApp();
});
