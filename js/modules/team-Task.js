export default async function fetchAndRenderTasks() {
    try {
        const response = await fetch('../data/data1.json');
        const data = await response.json();
        const tasks = data.tasks || [];
        const employees = data.employees || [];

        console.log('Tasks loaded:', tasks.length);
        console.log('Employees loaded:', employees.length);

        updateDashboardStats(tasks);

        renderTasksTable(tasks, employees);

    } catch (err) {
        console.error("Error loading tasks:", err);
        showError("Error loading tasks: " + err.message);
    }
}

function updateDashboardStats(tasks) {
    document.querySelectorAll('.card-box h3')[3].textContent = "0";
    const assignedCount = tasks.length;
    const extensionsCount = tasks.filter(t => t.status === "Extension Req.").length;
    const overdueCount = tasks.filter(t => t.status === "Overdue").length;
    const inProgressCount = tasks.filter(t => t.status === "In Progress").length;
    const completedCount = tasks.filter(t => t.status === "Completed").length;

    const cards = document.querySelectorAll('.card-box h3');
    
    if (cards.length >= 3) {
        cards[0].textContent = assignedCount;
        cards[1].textContent = extensionsCount;
        cards[2].textContent = overdueCount;
        cards[3].textContent = completedCount;
    }

    console.log('Stats updated:', {
        total: assignedCount,
        extensions: extensionsCount,
        overdue: overdueCount,
        inProgress: inProgressCount,
        completed: completedCount
    });
}

function renderTasksTable(tasks, employees) {
    const tbody = document.querySelector(".task-table table tbody");
    
    if (!tbody) {
        console.error('Table tbody not found');
        return;
    }
    
    tbody.innerHTML = "";

    if (tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No tasks found</td></tr>';
        return;
    }

    tasks.forEach(task => {

        let assignedNames = "";
        if (Array.isArray(task.assignees) && task.assignees.length > 0) {
            assignedNames = task.assignees
                .map(id => {
                    const emp = employees.find(e => e.id === id);
                    return emp ? emp.name : "Unknown";
                })
                .join(", ");
        }

        let statusClass = "bg-secondary";
        if (task.status === "In Progress") statusClass = "bg-success";
        else if (task.status === "Extension Req.") statusClass = "bg-warning text-dark";
        else if (task.status === "Overdue") statusClass = "bg-danger";
        else if (task.status === "Completed") statusClass = "bg-primary";
        else if (task.status === "To Do") statusClass = "bg-info";

        let actionBtn = `<button class="btn btn-sm btn-secondary" onclick="handleAction('${task.id}', 'follow-up')">Follow Up</button>`;
        if (task.status === "In Progress") {
            actionBtn = `<button class="btn btn-sm btn-primary" onclick="handleAction('${task.id}', 'reassign')">Reassign</button>`;
        } else if (task.status === "Extension Req.") {
            actionBtn = `<button class="btn btn-sm btn-success" onclick="handleAction('${task.id}', 'approve')">Approve</button>`;
        }

        const deadline = new Date(task.deadline).toLocaleDateString();

        const tr = document.createElement("tr");
        tr.setAttribute("data-task-id", task.id);
        tr.innerHTML = `
            <td>
                <div>
                    <strong>${task.title}</strong>
                    <br>
                    <small class="text-muted">${task.description}</small>
                    <br>
                    <span class="badge bg-light text-dark">${task.priority}</span>
                </div>
            </td>
            <td>${assignedNames}</td>
            <td>${deadline}</td>
            <td><span class="badge ${statusClass}">${task.status}</span></td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelector('.btn-danger').addEventListener('click', () => {
    const tbody = document.querySelector('.task-table table tbody');
    if (!tbody) return;

    let toDoCount = 0, overdueCount = 0, extensionCount = 0, completedCount = 0, inProgressCount = 0;
    Array.from(tbody.querySelectorAll('tr')).forEach(row => {
        const statusCell = row.querySelector('td:nth-child(4) .badge');
        const status = statusCell ? statusCell.textContent.trim() : "";
        if (status === "To Do") toDoCount++;
        if (status === "Overdue") overdueCount++;
        if (status === "Extension Req.") extensionCount++;
        if (status === "Completed") completedCount++;
        if (status === "In Progress") inProgressCount++;
    });

    const cards = document.querySelectorAll('.card-box h3');
    if (cards.length >= 4) {
        cards[1].textContent = parseInt(cards[1].textContent, 10) + extensionCount + toDoCount;
        cards[2].textContent = parseInt(cards[2].textContent, 10) + overdueCount + inProgressCount;
        cards[3].textContent = parseInt(cards[3].textContent, 10) + completedCount;
    }

    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No tasks found</td></tr>';
});
}



function handleAction(taskId, action) {
    console.log(`Action ${action} triggered for task ${taskId}`);

    const row = document.querySelector(`tr[data-task-id="${taskId}"]`);
    
    


    const statusCell = row.querySelector('td:nth-child(4) .badge');
    const status = statusCell ? statusCell.textContent.trim() : "";

    if (action === "follow-up") {
        
        if (status === "To Do") {
            const extensionCard = document.querySelectorAll('.card-box h3')[1];
            if (extensionCard) {
                let current = parseInt(extensionCard.textContent, 10) || 0;
                extensionCard.textContent = current + 1;
            }
        }
        row.remove();
    }

    if (action === "reassign") {
        row.remove();
        const overdueCard = document.querySelectorAll('.card-box h3')[2];
        if (overdueCard) {
            let current = parseInt(overdueCard.textContent, 10) || 0;
            overdueCard.textContent = current + 1;
        }
    }
}


function showError(message) {
    const tbody = document.querySelector(".task-table table tbody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">${message}</td></tr>`;
    }
}

// document.querySelector(".logout").addEventListener("click", () => {
//   localStorage.removeItem("loggedInUser");

//   window.location.replace("login.html");
// });



document.addEventListener("DOMContentLoaded", fetchAndRenderTasks);

window.handleAction = handleAction;
