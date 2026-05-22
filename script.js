const input = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("taskList");

addBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text === "") return;

    createTask(text);
    input.value = "";
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
    });

    deleteBtn.addEventListener("click", () => {
        li.remove();
    });

    li.appendChild(span);
    li.appendChild(deleteBtn);

    list.appendChild(li);
}