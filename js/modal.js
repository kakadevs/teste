document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
    setupDragAndDrop();
    setupModalSystem();
    setupFileUpload();
});

let projectCount = 1;

function setupFileUpload() {
    document.getElementById("file-upload").addEventListener("change", function(event) {
        const projectId = document.getElementById("modal")?.getAttribute("data-project-id");
        if (!projectId) return;

        const fileListContainer = document.getElementById("file-list");
        Array.from(event.target.files).forEach(file => {
            addFileWithPreview(file, fileListContainer);
        });
        saveModalData(projectId);
    });
}

function addFileWithPreview(file, container) {
    const listItem = document.createElement("li");
    listItem.className = "file-item";
    listItem.dataset.fileName = file.name;

    const fileURL = URL.createObjectURL(file);

    const fileName = document.createElement("span");
    fileName.className = "file-name";
    fileName.textContent = file.name;
    fileName.addEventListener("click", () => window.open(fileURL, '_blank'));

    const removeButton = document.createElement("span");
    removeButton.className = "remove-file";
    removeButton.textContent = "Remover";
    removeButton.addEventListener("click", () => {
        container.removeChild(listItem);
        URL.revokeObjectURL(fileURL);
        const projectId = document.getElementById("modal")?.getAttribute("data-project-id");
        if (projectId) saveModalData(projectId);
    });

    listItem.appendChild(fileName);
    listItem.appendChild(removeButton);
    container.appendChild(listItem);
}

function openModal(projectId) {
    const modal = document.getElementById("modal");
    modal.style.display = "flex";
    modal.setAttribute("data-project-id", projectId);
    loadModalContent(projectId);

    const projectTitle = document.querySelector(`.column[data-id="${projectId}"] .project-title`);
    const modalTitle = document.getElementById("modal-title");
    if (modalTitle && projectTitle) {
        modalTitle.textContent = `Detalhes: ${projectTitle.textContent}`;
    }
}

function closeModal() {
    const modal = document.getElementById("modal");
    if (!modal) return;

    const projectId = modal.getAttribute("data-project-id");
    if (projectId) {
        saveModalData(projectId);
    }

    const fileUpload = document.getElementById("file-upload");
    if (fileUpload) fileUpload.value = '';

    modal.style.display = "none";
    modal.removeAttribute("data-project-id");
}

function saveModalData(projectId) {
    const modal = document.getElementById("modal");
    if (!modal) return;
    
    const data = {
        description: document.querySelector(".description-box textarea")?.value || "",
        comment: document.querySelector(".comment-box textarea")?.value || "",
        priority: document.getElementById("priority-select")?.value || "1",
        deadline: document.getElementById("deadline")?.value || "",
        files: [...document.querySelectorAll("#file-list li")].map(li => li.dataset.fileName)
    };
    
    localStorage.setItem(`modalData_${projectId}`, JSON.stringify(data));
}

function loadModalContent(projectId) {
    const savedData = JSON.parse(localStorage.getItem(`modalData_${projectId}`)) || {};

    setValue(".description-box textarea", savedData.description);
    setValue(".comment-box textarea", savedData.comment);
    setValue("#priority-select", savedData.priority);
    setValue("#deadline", savedData.deadline);

    const fileList = document.getElementById("file-list");
    if (fileList) {
        fileList.innerHTML = "";
        if (Array.isArray(savedData.files)) {
            savedData.files.forEach(file => addFileToList(file));
        }
    }
}

function setValue(selector, value) {
    const element = document.querySelector(selector);
    if (element) element.value = value || "";
}

function setupModalSystem() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-task')) {
            const project = e.target.closest('.column');
            if (project?.hasAttribute('data-id')) {
                openModal(project.getAttribute('data-id'));
            }
        }
    });

    const closeBtn = document.querySelector(".modal-close");
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }
}

function addFileToList(fileName) {
    const fileList = document.getElementById("file-list");
    if (!fileList) return;

    const item = document.createElement("li");
    item.className = "file-item";
    item.dataset.fileName = fileName;

    const nameSpan = document.createElement("span");
    nameSpan.className = "file-name";
    nameSpan.textContent = fileName;

    const removeBtn = document.createElement("span");
    removeBtn.className = "remove-file";
    removeBtn.textContent = "Remover";
    removeBtn.onclick = () => {
        fileList.removeChild(item);
        const projectId = document.getElementById("modal")?.dataset.projectId;
        if (projectId) saveModalData(projectId);
    };

    item.append(nameSpan, removeBtn);
    fileList.appendChild(item);
}

function cleanProjectModalData(projectId) {
    localStorage.removeItem(`modalData_${projectId}`);
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
    cleanProjectModalData(id);
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