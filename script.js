document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('taskForm');
    const openTasksContainer = document.getElementById('openTasks');
    const claimedTasksContainer = document.getElementById('claimedTasks');
    const statTotal = document.getElementById('statTotal');
    const statClaimed = document.getElementById('statClaimed');
    const statHours = document.getElementById('statHours');
    const resetBtn = document.getElementById('resetApp');

    // Seed Data (To make the app look good for judges immediately)
    const seedData = [
        { id: 101, title: "Sort supplies at Food Bank", category: "Logistics", hours: 4, status: "open" },
        { id: 102, title: "Riverfront Trash Cleanup", category: "Environment", hours: 3, status: "open" },
        { id: 103, title: "Tutor High School Math", category: "Education", hours: 2, status: "claimed" }
    ];

    // Load state from local storage or use seed data
    let tasks = JSON.parse(localStorage.getItem('impactTasks'));
    if (!tasks || tasks.length === 0) {
        tasks = seedData;
        saveData();
    }

    function saveData() {
        localStorage.setItem('impactTasks', JSON.stringify(tasks));
    }

    function getCategoryColor(category) {
        const colors = {
            'Environment': 'bg-green-100 text-green-700',
            'Education': 'bg-yellow-100 text-yellow-700',
            'Logistics': 'bg-blue-100 text-blue-700',
            'Health': 'bg-red-100 text-red-700'
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    }

    function renderApp() {
        // Reset containers
        openTasksContainer.innerHTML = '';
        claimedTasksContainer.innerHTML = '';

        let totalTasks = tasks.length;
        let claimedCount = 0;
        let totalHours = 0;

        tasks.forEach(task => {
            // Calculate stats
            if (task.status === 'claimed') {
                claimedCount++;
                totalHours += parseInt(task.hours);
            }

            // Create HTML element
            const el = document.createElement('div');
            el.className = 'p-4 border border-slate-200 rounded-lg bg-slate-50 flex flex-col gap-3 transition-all hover:border-slate-300';
            
            let actionButton = task.status === 'open' 
                ? `<button onclick="claimTask(${task.id})" class="text-sm bg-white border border-slate-300 hover:border-primary hover:text-primary px-3 py-1.5 rounded-md font-medium transition">Claim Task</button>`
                : `<span class="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1"><i class="fa-solid fa-check"></i> Allocated</span>`;

            el.innerHTML = `
                <div class="flex justify-between items-start">
                    <h3 class="font-semibold text-slate-800 leading-tight">${task.title}</h3>
                    <span class="text-xs font-bold px-2 py-1 rounded-full ${getCategoryColor(task.category)}">${task.category}</span>
                </div>
                <div class="flex justify-between items-center mt-auto pt-2 border-t border-slate-200">
                    <span class="text-sm text-slate-500 font-medium"><i class="fa-regular fa-clock mr-1"></i>${task.hours} hrs</span>
                    ${actionButton}
                </div>
            `;

            if (task.status === 'open') {
                openTasksContainer.appendChild(el);
            } else {
                claimedTasksContainer.appendChild(el);
            }
        });

        // Show empty states if needed
        if(openTasksContainer.innerHTML === '') openTasksContainer.innerHTML = '<p class="text-slate-400 text-sm text-center mt-4">No open needs.</p>';
        if(claimedTasksContainer.innerHTML === '') claimedTasksContainer.innerHTML = '<p class="text-slate-400 text-sm text-center mt-4">No resources allocated yet.</p>';

        // Update Stats UI
        statTotal.innerText = totalTasks;
        statClaimed.innerText = claimedCount;
        statHours.innerText = totalHours;
    }

    // Global function for the inline onclick handler
    window.claimTask = function(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.status = 'claimed';
            saveData();
            renderApp();
        }
    }

    // Handle Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newTask = {
            id: Date.now(),
            title: document.getElementById('taskTitle').value,
            category: document.getElementById('taskCategory').value,
            hours: parseInt(document.getElementById('taskHours').value),
            status: 'open'
        };

        tasks.unshift(newTask); // Add to beginning of array
        saveData();
        renderApp();
        form.reset();
    });

    // Handle Reset
    resetBtn.addEventListener('click', () => {
        if(confirm('Clear all tasks and start fresh?')) {
            tasks = [];
            saveData();
            renderApp();
        }
    });

    // Initial Render
    renderApp();
});