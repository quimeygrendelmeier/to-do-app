const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");
const allCountEl = document.getElementById("allCount");
const pendingCountEl = document.getElementById("pendingCount");
const completedCountEl = document.getElementById("completedCount");
const allBtn = document.getElementById("allBtn");
const pendingBtn = document.getElementById("pendingBtn");
const completedBtn = document.getElementById("completedBtn");

const themeToggle = document.getElementById("themeToggle");

const filterBtns = { all: allBtn, pending: pendingBtn, completed: completedBtn };
let currentFilter = "all";
let draggedItem = null;
let pendingDelete = null;

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (themeToggle) {
        themeToggle.innerHTML = theme === "dark"
            ? '<i data-lucide="sun"></i>'
            : '<i data-lucide="moon"></i>';
        lucide.createIcons();
    }
    localStorage.setItem("theme", theme);
}

function initTheme() {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(saved || (prefersDark ? "dark" : "light"));
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        setTheme(current === "dark" ? "light" : "dark");
    });
}

function getDragAfterElement(container, y) {
    const items = [...container.querySelectorAll("li:not(.dragging)")];

    return items.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function onPointerMove(e) {
    if (!draggedItem) return;
    const afterElement = getDragAfterElement(list, e.clientY);

    if (afterElement == null) {
        list.appendChild(draggedItem);
    } else {
        list.insertBefore(draggedItem, afterElement);
    }
}

function onPointerUp() {
    if (draggedItem) {
        draggedItem.classList.remove("dragging");
        draggedItem = null;
        saveTasks();
    }
    document.removeEventListener("pointermove", onPointerMove);
}

const toast = document.createElement("div");
toast.className = "toast";
toast.innerHTML = '<span class="toast-message"></span><button class="toast-undo">Deshacer</button>';
document.body.appendChild(toast);

const toastMessage = toast.querySelector(".toast-message");
const toastUndoBtn = toast.querySelector(".toast-undo");
let toastTimeoutId = null;

function showToast(message, onUndo) {
    if (pendingDelete) {
        clearTimeout(toastTimeoutId);
        pendingDelete = null;
    }

    toastMessage.textContent = message;
    toast.classList.add("visible");

    toastUndoBtn.onclick = () => {
        clearTimeout(toastTimeoutId);
        toast.classList.remove("visible");
        pendingDelete = null;
        onUndo();
    };

    pendingDelete = true;
    toastTimeoutId = setTimeout(() => {
        toast.classList.remove("visible");
        pendingDelete = null;
    }, 4000);
}

function deleteTaskWithUndo(li) {
    const nextSibling = li.nextSibling;
    li.remove();
    saveTasks();
    updateStats();

    showToast("Tarea eliminada", () => {
        if (nextSibling) {
            list.insertBefore(li, nextSibling);
        } else {
            list.appendChild(li);
        }
        saveTasks();
        updateStats();
        applyFilter();
        lucide.createIcons();
    });
}

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

    const grip = document.createElement("button");
    grip.classList.add("drag-handle");
    grip.setAttribute("aria-label", "Reordenar tarea");
    grip.innerHTML = '<i data-lucide="grip-vertical"></i>';

    grip.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        draggedItem = li;
        li.classList.add("dragging");
        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp, { once: true });
    });

    const check = document.createElement("button");
    check.classList.add("check");
    check.setAttribute("aria-label", "Marcar como completada");
    check.innerHTML = '<i data-lucide="check"></i>';

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
    deleteBtn.classList.add("delete-btn");
    deleteBtn.setAttribute("aria-label", "Borrar tarea");

    const editBtn = document.createElement("button");
    editBtn.innerHTML = '<i data-lucide="pencil"></i>';
    editBtn.classList.add("edit-btn");
    editBtn.setAttribute("aria-label", "Editar tarea");

    const cancelBtn = document.createElement("button");
    cancelBtn.innerHTML = '<i data-lucide="x"></i>';
    cancelBtn.classList.add("cancel-btn");
    cancelBtn.classList.add("hidden");
    cancelBtn.setAttribute("aria-label", "Cancelar edición");

    function resetEditMode() {
        editBtn.innerHTML = '<i data-lucide="pencil"></i>';
        editBtn.classList.remove("save-mode");
        cancelBtn.classList.add("hidden");
        lucide.createIcons();
    }

    function toggleComplete() {
        li.classList.toggle("completed");
        saveTasks();
        updateStats();
        applyFilter();
    }

    const actions = document.createElement("div");
    actions.classList.add("actions");

    check.addEventListener("click", toggleComplete);
    span.addEventListener("click", toggleComplete);

    deleteBtn.addEventListener("click", () => {
        deleteTaskWithUndo(li);
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
                span.textContent = editInput.value.trim() || "Tarea vacía";

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

    li.appendChild(grip);
    li.appendChild(check);
    li.appendChild(span);
    li.appendChild(actions);

    list.appendChild(li);
    lucide.createIcons();
    saveTasks();
    updateStats();
    applyFilter();
}

const prefersReducedMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function bump(el) {
    if (prefersReducedMotion) return;
    el.classList.remove("bump");
    void el.offsetWidth; // reinicia la animación si ya estaba corriendo
    el.classList.add("bump");
}

function animateNumber(el, target) {
    const start = parseInt(el.textContent, 10) || 0;
    if (start === target) return;

    if (prefersReducedMotion) {
        el.textContent = target;
        return;
    }

    bump(el);
    const duration = 350;
    const startTime = performance.now();

    function tick(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + (target - start) * eased);

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            el.textContent = target;
        }
    }
    requestAnimationFrame(tick);
}

function updateStats() {
    const total = document.querySelectorAll("#taskList li").length;
    const completed = document.querySelectorAll("#taskList li.completed").length;
    const pending = total - completed;

    animateNumber(allCountEl, total);
    animateNumber(pendingCountEl, pending);
    animateNumber(completedCountEl, completed);
}

function setActiveFilter(name) {
    currentFilter = name;
    Object.entries(filterBtns).forEach(([key, btn]) => {
        const isActive = key === name;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive);
    });
    applyFilter();
}

function applyFilter() {
    list.classList.toggle("filtering", currentFilter !== "all");

    document.querySelectorAll("#taskList li").forEach(li => {
        const isCompleted = li.classList.contains("completed");
        let show = true;
        if (currentFilter === "pending") show = !isCompleted;
        if (currentFilter === "completed") show = isCompleted;
        li.style.display = show ? "flex" : "none";
    });
}

allBtn.addEventListener("click", () => setActiveFilter("all"));
pendingBtn.addEventListener("click", () => setActiveFilter("pending"));
completedBtn.addEventListener("click", () => setActiveFilter("completed"));

function loadTasks() {
    const tasks =
        JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(task => {
        createTask(task.text, task.completed);
    });

    updateStats();
    applyFilter();
}

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

initTheme();
loadTasks();
updateStats();