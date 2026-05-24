const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");
const totalEl = document.getElementById("totalTasks");
const pendingEl = document.getElementById("pendingTasks");
const completedEl = document.getElementById("completedTasks");


addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text === "") return;

    input.value = "";
    createTask(text);
});

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
    addBtn.click();
    }
});

function createTask(text) {
    const li = document.createElement("li");
    
    const span = document.createElement("span");
    span.textContent = text;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";

    span.addEventListener("click", () => {
        li.classList.toggle("completed");
        updateStats();
    });

    deleteBtn.addEventListener("click", () => {
        li.remove();
        updateStats();
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
    updateStats();
}

function updateStats() {
    const total = document.querySelectorAll("#taskList li").length;
    const completed = document.querySelectorAll("#taskList li.completed").length;
    const pending = total - completed;

    totalEl.textContent = `Total de tareas: ${total}`;
    pendingEl.textContent = `Tareas pendientes: ${pending}`;
    completedEl.textContent = `Tareas completadas: ${completed}`;
}

updateStats();