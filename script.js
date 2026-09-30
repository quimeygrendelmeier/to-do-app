const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");
const allCountEl = document.getElementById("allCount");
const pendingCountEl = document.getElementById("pendingCount");
const pendingTotalEl = document.getElementById("pendingTotal");
const completedCountEl = document.getElementById("completedCount");
const completedTotalEl = document.getElementById("completedTotal");
const allBtn = document.getElementById("allBtn");
const pendingBtn = document.getElementById("pendingBtn");
const completedBtn = document.getElementById("completedBtn");

const themeToggle = document.getElementById("themeToggle");

const filterBtns = { all: allBtn, pending: pendingBtn, completed: completedBtn };
let currentFilter = "all";
let draggedItem = null;
let draggedContainer = null;
let pendingDelete = null;

/* ---------- Theme ---------- */

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

/* ---------- Drag & drop reorder ---------- */

function getDragAfterElement(container, y) {
    const items = [...container.children].filter(el => !el.classList.contains("dragging"));

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
    if (!draggedItem || !draggedContainer) return;
    const afterElement = getDragAfterElement(draggedContainer, e.clientY);

    if (afterElement == null) {
        draggedContainer.appendChild(draggedItem);
    } else {
        draggedContainer.insertBefore(draggedItem, afterElement);
    }
}

function onPointerUp() {
    if (draggedItem) {
        draggedItem.classList.remove("dragging");
        draggedItem = null;
        draggedContainer = null;
        saveTasks();
    }
    document.removeEventListener("pointermove", onPointerMove);
}

/* ---------- Toast (undo delete) ---------- */

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

function deleteWithUndo(el, container, message, onAfterChange) {
    const nextSibling = el.nextSibling;
    el.remove();
    if (onAfterChange) onAfterChange();
    saveTasks();
    updateStats();
    applyFilter();

    showToast(message, () => {
        if (nextSibling) {
            container.insertBefore(el, nextSibling);
        } else {
            container.appendChild(el);
        }
        if (onAfterChange) onAfterChange();
        saveTasks();
        updateStats();
        applyFilter();
        lucide.createIcons();
    });
}

function deleteTaskWithUndo(li) {
    deleteWithUndo(li, list, "Tarea eliminada", null);
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

function createTask(text, completed = false, completedAt = null, subtasks = []) {
    const li = document.createElement("li");
    const taskRow = document.createElement("div");
    taskRow.classList.add("task-row");

    const span = document.createElement("span");
    const taskText = document.createElement("span");
    taskText.classList.add("task-text");
    taskText.textContent = text;

    const progressBadge = document.createElement("span");
    progressBadge.classList.add("subtask-progress");
    progressBadge.style.display = "none";

    span.appendChild(taskText);
    span.appendChild(progressBadge);

    if (completed) {
        li.classList.add("completed");
        li.dataset.completedAt = completedAt || Date.now();
    }

    const grip = document.createElement("button");
    grip.classList.add("drag-handle");
    grip.setAttribute("aria-label", "Reordenar tarea");
    grip.innerHTML = '<i data-lucide="grip-vertical"></i>';

    grip.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        draggedItem = li;
        draggedContainer = list;
        li.classList.add("dragging");
        document.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerup", onPointerUp, { once: true });
    });

    const check = document.createElement("button");
    check.classList.add("check");
    check.setAttribute("aria-label", "Marcar como completada");
    check.innerHTML = '<i data-lucide="check"></i>';

    const subtasksBtn = document.createElement("button");
    subtasksBtn.classList.add("subtasks-btn");
    subtasksBtn.setAttribute("aria-label", "Ver sub-tareas");
    subtasksBtn.innerHTML = '<i data-lucide="list-plus"></i>';

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

    /* ---------- Subtareas ---------- */

    const subtaskList = document.createElement("ul");
    subtaskList.classList.add("subtask-list", "collapsed");

    function renderSubtaskProgress() {
        const items = [...subtaskList.querySelectorAll(".subtask-item")];
        if (items.length === 0) {
            progressBadge.textContent = "";
            progressBadge.style.display = "none";
            subtaskList.classList.add("collapsed");
            subtasksBtn.classList.remove("has-open");
            return;
        }
        const done = items.filter(item => item.classList.contains("completed")).length;
        progressBadge.textContent = `(${done}/${items.length})`;
        progressBadge.style.display = "inline";
    }

    function updateParentFromSubtasks() {
        const items = [...subtaskList.querySelectorAll(".subtask-item")];
        if (items.length === 0) return;

        const allDone = items.every(item => item.classList.contains("completed"));
        const isParentCompleted = li.classList.contains("completed");

        if (allDone && !isParentCompleted) {
            li.classList.add("completed");
            li.dataset.completedAt = Date.now();
        } else if (!allDone && isParentCompleted) {
            li.classList.remove("completed");
            delete li.dataset.completedAt;
        }
    }

    function createSubtaskItem(subText, subCompleted) {
        const item = document.createElement("li");
        item.classList.add("subtask-item");
        if (subCompleted) item.classList.add("completed");

        const subGrip = document.createElement("button");
        subGrip.classList.add("subtask-drag-handle");
        subGrip.setAttribute("aria-label", "Reordenar sub-tarea");
        subGrip.innerHTML = '<i data-lucide="grip-vertical"></i>';

        subGrip.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            draggedItem = item;
            draggedContainer = subtaskList;
            item.classList.add("dragging");
            document.addEventListener("pointermove", onPointerMove);
            document.addEventListener("pointerup", onPointerUp, { once: true });
        });

        const subCheck = document.createElement("button");
        subCheck.classList.add("subtask-check");
        subCheck.setAttribute("aria-label", "Marcar sub-tarea como completada");
        subCheck.innerHTML = '<i data-lucide="check"></i>';

        const subText_ = document.createElement("span");
        subText_.classList.add("subtask-text");
        subText_.textContent = subText;

        const subEditBtn = document.createElement("button");
        subEditBtn.innerHTML = '<i data-lucide="pencil"></i>';
        subEditBtn.classList.add("subtask-edit-btn");
        subEditBtn.setAttribute("aria-label", "Editar sub-tarea");

        const subCancelBtn = document.createElement("button");
        subCancelBtn.innerHTML = '<i data-lucide="x"></i>';
        subCancelBtn.classList.add("subtask-cancel-btn", "hidden");
        subCancelBtn.setAttribute("aria-label", "Cancelar edición");

        const subDeleteBtn = document.createElement("button");
        subDeleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';
        subDeleteBtn.classList.add("subtask-delete-btn");
        subDeleteBtn.setAttribute("aria-label", "Borrar sub-tarea");

        function resetSubEditMode() {
            subEditBtn.innerHTML = '<i data-lucide="pencil"></i>';
            subEditBtn.classList.remove("save-mode");
            subCancelBtn.classList.add("hidden");
            lucide.createIcons();
        }

        function toggleSubtask() {
            item.classList.toggle("completed");
            renderSubtaskProgress();
            updateParentFromSubtasks();
            saveTasks();
            updateStats();
            applyFilter();
        }

        subCheck.addEventListener("click", toggleSubtask);
        subText_.addEventListener("click", toggleSubtask);

        subEditBtn.addEventListener("click", () => {
            if (subEditBtn.classList.contains("save-mode")) {
                const editInput = item.querySelector("input");
                subText_.textContent = editInput.value.trim() || "Sub-tarea vacía";

                item.replaceChild(subText_, editInput);

                resetSubEditMode();
                saveTasks();
                return;
            }

            const editInput = document.createElement("input");
            editInput.type = "text";
            editInput.classList.add("subtask-input");
            editInput.value = subText_.textContent;

            item.replaceChild(editInput, subText_);

            subEditBtn.innerHTML = '<i data-lucide="save"></i>';
            lucide.createIcons();
            subEditBtn.classList.add("save-mode");
            subCancelBtn.classList.remove("hidden");
            editInput.focus();

            editInput.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    subText_.textContent = editInput.value.trim() || "Sub-tarea vacía";

                    item.replaceChild(subText_, editInput);

                    resetSubEditMode();
                    saveTasks();
                }
            });
        });

        subCancelBtn.addEventListener("click", () => {
            const editInput = item.querySelector("input");
            if (!editInput) return;

            item.replaceChild(subText_, editInput);
            resetSubEditMode();
        });

        subDeleteBtn.addEventListener("click", () => {
            deleteWithUndo(item, subtaskList, "Sub-tarea eliminada", () => {
                renderSubtaskProgress();
                updateParentFromSubtasks();
            });
        });

        const subActions = document.createElement("div");
        subActions.classList.add("subtask-actions");
        subActions.appendChild(subEditBtn);
        subActions.appendChild(subCancelBtn);
        subActions.appendChild(subDeleteBtn);

        item.appendChild(subGrip);
        item.appendChild(subCheck);
        item.appendChild(subText_);
        item.appendChild(subActions);

        return item;
    }

    const addRow = document.createElement("li");
    addRow.classList.add("subtask-add-row");
    const subInput = document.createElement("input");
    subInput.type = "text";
    subInput.classList.add("subtask-input");
    subInput.placeholder = "Agregar sub-tarea...";
    addRow.appendChild(subInput);

    subInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            const val = subInput.value.trim();
            if (val === "") return;

            subtaskList.insertBefore(createSubtaskItem(val, false), addRow);
            subInput.value = "";
            renderSubtaskProgress();
            updateParentFromSubtasks();
            saveTasks();
            updateStats();
            applyFilter();
            lucide.createIcons();
        }
    });

    subtasks.forEach(sub => {
        subtaskList.appendChild(createSubtaskItem(sub.text, sub.completed));
    });
    subtaskList.appendChild(addRow);
    renderSubtaskProgress();

    subtasksBtn.addEventListener("click", () => {
        subtaskList.classList.toggle("collapsed");
        const isOpen = !subtaskList.classList.contains("collapsed");
        subtasksBtn.classList.toggle("has-open", isOpen);
        if (isOpen) subInput.focus();
    });

    /* ---------- Completar tarea (con cascada a subtareas) ---------- */

    function toggleComplete() {
        const willComplete = !li.classList.contains("completed");
        li.classList.toggle("completed", willComplete);

        if (willComplete) {
            li.dataset.completedAt = Date.now();
        } else {
            delete li.dataset.completedAt;
        }

        subtaskList.querySelectorAll(".subtask-item").forEach(item => {
            item.classList.toggle("completed", willComplete);
        });
        renderSubtaskProgress();

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
            const editInput = taskRow.querySelector("input");
            taskText.textContent = editInput.value.trim() || "Tarea vacía";

            taskRow.replaceChild(span, editInput);

            resetEditMode();
            saveTasks();
            return;
        }

        const editInput = document.createElement("input");
        editInput.type = "text";
        editInput.classList.add("task-input");
        editInput.value = taskText.textContent;

        taskRow.replaceChild(editInput, span);

        editBtn.innerHTML = '<i data-lucide="save"></i>';
        lucide.createIcons();
        editBtn.classList.add("save-mode");
        cancelBtn.classList.remove("hidden");
        editInput.focus();

        editInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                taskText.textContent = editInput.value.trim() || "Tarea vacía";

                taskRow.replaceChild(span, editInput);

                resetEditMode();
                saveTasks();
            }
        });
    });

    cancelBtn.addEventListener("click", () => {
        const editInput = taskRow.querySelector("input");
        if (!editInput) return;

        taskRow.replaceChild(span, editInput);
        resetEditMode();
    });

    actions.appendChild(subtasksBtn);
    actions.appendChild(editBtn);
    actions.appendChild(cancelBtn);
    actions.appendChild(deleteBtn);

    taskRow.appendChild(grip);
    taskRow.appendChild(check);
    taskRow.appendChild(span);
    taskRow.appendChild(actions);

    li.appendChild(taskRow);
    li.appendChild(subtaskList);

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
    const items = [...list.children];
    const total = items.length;
    const completed = items.filter(li => li.classList.contains("completed")).length;
    const pending = total - completed;

    animateNumber(allCountEl, total);
    animateNumber(pendingCountEl, pending);
    animateNumber(pendingTotalEl, total);
    animateNumber(completedCountEl, completed);
    animateNumber(completedTotalEl, total);
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
    list.classList.toggle("completed-view", currentFilter === "completed");

    const items = [...list.children];

    if (currentFilter === "completed") {
        const completedItems = items
            .filter(li => li.classList.contains("completed"))
            .sort((a, b) => {
                const aTime = parseInt(a.dataset.completedAt, 10) || 0;
                const bTime = parseInt(b.dataset.completedAt, 10) || 0;
                return aTime - bTime; // la primera que completaste, primera en la lista
            });

        completedItems.forEach((li, index) => {
            li.style.order = index;
        });
    } else {
        items.forEach(li => {
            li.style.order = "";
        });
    }

    items.forEach(li => {
        const isCompleted = li.classList.contains("completed");
        let show = true;
        if (currentFilter === "pending") show = !isCompleted;
        if (currentFilter === "completed") show = isCompleted;
        li.style.display = show ? "block" : "none";
    });
}

allBtn.addEventListener("click", () => setActiveFilter("all"));
pendingBtn.addEventListener("click", () => setActiveFilter("pending"));
completedBtn.addEventListener("click", () => setActiveFilter("completed"));

function loadTasks() {
    const tasks =
        JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(task => {
        createTask(task.text, task.completed, task.completedAt, task.subtasks || []);
    });

    updateStats();
    applyFilter();
}

function saveTasks() {
    const tasks = [];

    [...list.children].forEach(li => {
        const subtasks = [...li.querySelectorAll(".subtask-item")].map(item => ({
            text: item.querySelector(".subtask-text").textContent,
            completed: item.classList.contains("completed")
        }));

        tasks.push({
            text: li.querySelector(".task-text").textContent,
            completed: li.classList.contains("completed"),
            completedAt: li.dataset.completedAt
                ? parseInt(li.dataset.completedAt, 10)
                : null,
            subtasks
        });
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));
}

initTheme();
loadTasks();
updateStats();