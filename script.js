const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");
const totalEl = document.getElementById("totalTasks");
const pendingEl = document.getElementById("pendingTasks");
const completedEl = document.getElementById("completedTasks");
const allBtn = document.getElementById("allBtn");
const pendingBtn = document.getElementById("pendingBtn");
const completedBtn = document.getElementById("completedBtn");

addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text === "") return;

    input.value = "";
    createTask(text);
});

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        addBtn.click();
    }
});

function createTask(text, completed = false) {
    const li = document.createElement("li");
    const span = document.createElement("span");

    span.textContent = text;

    if (completed) {
        li.classList.add("completed");
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
    deleteBtn.classList.add("delete-btn");

    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<i data-lucide="pencil"></i>';
    editBtn.classList.add("edit-btn");

    const cancelBtn = document.createElement("button");
    cancelBtn.innerHTML = '<i data-lucide="x"></i>';
    cancelBtn.classList.add("cancel-btn");
    cancelBtn.classList.add("hidden");

    function resetEditMode() {
        editBtn.innerHTML = '<i data-lucide="pencil"></i>';
        editBtn.classList.remove("save-mode");
        cancelBtn.classList.add("hidden");
        lucide.createIcons();
    }

    const actions = document.createElement("div");
    actions.classList.add("actions");

    span.addEventListener("click", () => {
        li.classList.toggle("completed");
        saveTasks();
        updateStats();
    });

    deleteBtn.addEventListener("click", () => {
        li.remove();
        saveTasks();
        updateStats();
    });

    editBtn.addEventListener("click", () => {
        if (editBtn.classList.contains("save-mode")) {
            const editInput = li.querySelector("input");
            span.textContent = editInput.value.trim() || "Tarea vacía";

            li.replaceChild(span, editInput);

            resetEditMode();
            saveTasks();
            return;
        }

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = span.textContent;

    li.replaceChild(editInput, span);

    editBtn.innerHTML = '<i data-lucide="save"></i>';
    lucide.createIcons();
    editBtn.classList.add("save-mode");
    cancelBtn.classList.remove("hidden");
    editInput.focus();

    editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            span.textContent = editInput.value.trim() || "Tarea vacia";

            li.replaceChild(span, editInput);

            resetEditMode();
            saveTasks();
        }
    });
});

    cancelBtn.addEventListener("click", () => {
        const editInput = li.querySelector("input");
        if (!editInput) return;

        li.replaceChild(span, editInput);
        resetEditMode();
    });

    actions.appendChild(editBtn);
    actions.appendChild(cancelBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(actions);

    list.appendChild(li);
    lucide.createIcons();
    saveTasks();
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

function loadTasks() {
    const tasks =
        JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(task => {
        createTask(task.text, task.completed);
    });
}

loadTasks();
updateStats();

allBtn.addEventListener("click", () => {
    document.querySelectorAll("#taskList li").forEach(li => {
        li.style.display = "flex";
    });
});

pendingBtn.addEventListener("click", () => {
    document.querySelectorAll("#taskList li").forEach(li => {
        li.style.display =
            li.classList.contains("completed")
                ? "none"
                : "flex";
    });
});

completedBtn.addEventListener("click", () => {
    document.querySelectorAll("#taskList li").forEach(li => {
        li.style.display =
            li.classList.contains("completed")
                ? "flex"
                : "none";
    });
});

function saveTasks() {
    const tasks = [];

    document.querySelectorAll("#taskList li").forEach(li => {
        tasks.push({
            text: li.querySelector("span").textContent,
            completed: li.classList.contains("completed")
        });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}
