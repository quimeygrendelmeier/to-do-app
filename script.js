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
    deleteBtn.classList.add("delete-btn");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Editar";
    editBtn.classList.add("edit-btn");

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancelar";
    cancelBtn.classList.add("cancel-btn");
    cancelBtn.classList.add("hidden");

    const actions = document.createElement("div");
    actions.classList.add("actions");

    span.addEventListener("click", () => {
        li.classList.toggle("completed");
        updateStats();
    });

    deleteBtn.addEventListener("click", () => {
        li.remove();
        updateStats();
    });

    editBtn.addEventListener("click", () => {
    if (editBtn.textContent === "Guardar") {
        const editInput = li.querySelector("input");
        span.textContent =
            editInput.value.trim() || "Tarea vacía";

        li.replaceChild(span, editInput);

        editBtn.textContent = "Editar";
        editBtn.style.background = "#667eea";
        cancelBtn.classList.add("hidden");
        return;
    }

    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = span.textContent;

    li.replaceChild(editInput, span);

    editBtn.textContent = "Guardar";
    editBtn.classList.add("save-mode");
    cancelBtn.classList.remove("hidden");
    editInput.focus();

    editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            span.textContent =
                editInput.value.trim() || "Tarea vacia";

            li.replaceChild(span, editInput);
            editBtn.textContent = "Editar";
            editBtn.classList.remove("save-mode");
            cancelBtn.classList.add("hidden");
        }
    });
});

cancelBtn.addEventListener("click", () => {
    const editInput = li.querySelector("input");
    if (!editInput) return;

    li.replaceChild(span, editInput);
    editBtn.textContent = "Editar";
    editBtn.classList.remove("save-mode");
    cancelBtn.classList.add("hidden");
});

    actions.appendChild(editBtn);
    actions.appendChild(cancelBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(actions);

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