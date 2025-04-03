document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
    setupDragAndDrop();
});

let projectCount = 1;

function openModal() {
    document.getElementById("modal").style.display = "flex";
    document.getElementById("modal-iframe").src = "modal.html";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("modal-iframe").src = "";
}

function addNewProject() {
    addProjectToDOM(projectCount, "", "");
    projectCount++;
    saveProjects();
}

function addProjectToDOM(id, name, task) {
    const newProjectContainer = document.createElement("div");
    newProjectContainer.classList.add("column");
    newProjectContainer.setAttribute("data-id", id);
    newProjectContainer.setAttribute("draggable", "true");

    newProjectContainer.innerHTML = `
        <div class="task-number">${id}</div>
        <div class="project-title">Projeto ${id}</div>
        <input type="text" class="project-name" placeholder="Nome do projeto..." value="${name}">
        <div class="task-input">
        <textarea placeholder="Escreva sua tarefa..." rows="5">${task}</textarea></div>
        <textarea placeholder="Adicione o arquivo..." rows="5">${task}</textarea></div>
        <button class="attachments-btn"><i class="fa fa-paperclip"></i>+ Anexos</button>
        <button class="add-task" onclick="openModal()">Mais informações...</button>
        <button class="delete-project" onclick="deleteProject(${id})">Excluir</button>
    `;

    document.getElementById("dashboard").appendChild(newProjectContainer);
    newProjectContainer.querySelector(".project-name").addEventListener("input", saveProjects);
    newProjectContainer.querySelector(".task-input textarea").addEventListener("input", saveProjects);
    setupDragAndDrop();
}

function deleteProject(id) {
    document.querySelector(`.column[data-id="${id}"]`).remove();
    saveProjects();
    cleanModalData(id);
    saveProjects();
}

function saveProjects() {
    const projects = [];
    document.querySelectorAll(".column").forEach(column => {
        const id = parseInt(column.getAttribute("data-id"));
        const name = column.querySelector(".project-name").value;
        const task = column.querySelector(".task-input textarea").value;
        projects.push({ id, name, task });
    });
    localStorage.setItem("projects", JSON.stringify(projects));
}

function loadProjects() {
    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    savedProjects.forEach(project => addProjectToDOM(project.id, project.name, project.task));
    projectCount = savedProjects.length ? savedProjects[savedProjects.length - 1].id + 1 : 1;
}

function setupDragAndDrop() {
    const columns = document.querySelectorAll(".column");
    columns.forEach(column => {
        column.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", column.dataset.id);
            column.classList.add("dragging");
        });

        column.addEventListener("dragover", (e) => {
            e.preventDefault();
            const draggingElement = document.querySelector(".dragging");
            const dashboard = document.getElementById("dashboard");
            const afterElement = getDragAfterElement(dashboard, e.clientY);
            if (afterElement == null) {
                dashboard.appendChild(draggingElement);
            } else {
                dashboard.insertBefore(draggingElement, afterElement);
            }
        });

        column.addEventListener("dragend", () => {
            column.classList.remove("dragging");
            saveProjects();
        });
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".column:not(.dragging)")];
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}