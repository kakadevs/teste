document.addEventListener("DOMContentLoaded", () => {
    loadProjects();
});

let projectCount = 1;

function openModal(id) {
    document.getElementById(`modal-${id}`).style.display = "flex";
}

function closeModal(id) {
    document.getElementById(`modal-${id}`).style.display = "none";
    saveModalData(id); // Salvar os dados de cada modal individualmente
}

function addNewProject() {
    addProjectToDOM(projectCount, "", "", "", "Média", "");
    projectCount++;
    saveProjects();
}

function addProjectToDOM(id, name, task, modalInfo, priority, deadline) {
    const newProjectContainer = document.createElement("div");
    newProjectContainer.classList.add("column");
    newProjectContainer.setAttribute("data-id", id);

    newProjectContainer.innerHTML = `
        <div class="task-number">${id}</div>
        <div class="project-title">Projeto ${id}</div>
        <input type="text" class="project-name" placeholder="Nome do projeto..." value="${name}">
        <div class="task-input">
            <textarea placeholder="Escreva sua tarefa..." rows="5">${task}</textarea>
        </div>
        <button class="add-task" onclick="openModal(${id})">Mais informações...</button>
        <button class="delete-project" onclick="deleteProject(${id})">Excluir</button>
        
        <!-- Modal exclusivo para cada projeto -->
        <div class="modal" id="modal-${id}" style="display: none;">
            <div class="modal-content">
                <span class="close" onclick="closeModal(${id})">&times;</span>
                <h2>Informações do Projeto ${id}</h2>
                <textarea id="modal-text-${id}" rows="5" placeholder="Detalhes adicionais...">${modalInfo}</textarea>
                <label>Prioridade:</label>
                <select id="priority-select-${id}">
                    <option value="Alta" ${priority === "Alta" ? "selected" : ""}>Alta</option>
                    <option value="Muito Alta" ${priority === "Muito Alta" ? "selected" : ""}>Muito Alta</option>
                    <option value="Média" ${priority === "Média" ? "selected" : ""}>Média</option>
                    <option value="Baixa" ${priority === "Baixa" ? "selected" : ""}>Baixa</option>
                </select>
                <label>Data Limite:</label>
                <input type="date" id="deadline-${id}" value="${deadline}">
                <button onclick="saveModalData(${id})">Salvar</button>
            </div>
        </div>
    `;

    document.getElementById("dashboard").appendChild(newProjectContainer);
    newProjectContainer.querySelector(".project-name").addEventListener("input", saveProjects);
    newProjectContainer.querySelector(".task-input textarea").addEventListener("input", saveProjects);
}

function saveModalData(id) {
    let savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const projectIndex = savedProjects.findIndex(p => p.id == id);

    if (projectIndex !== -1) {
        // Salvando os dados do modal
        savedProjects[projectIndex].modalInfo = document.getElementById(`modal-text-${id}`).value;
        savedProjects[projectIndex].priority = document.getElementById(`priority-select-${id}`).value;
        savedProjects[projectIndex].deadline = document.getElementById(`deadline-${id}`).value;
        localStorage.setItem("projects", JSON.stringify(savedProjects));
    }
}

function deleteProject(id) {
    document.querySelector(`.column[data-id="${id}"]`).remove();
    saveProjects();
}

function saveProjects() {
    const projects = [];
    document.querySelectorAll(".column").forEach(column => {
        const id = parseInt(column.getAttribute("data-id"));
        const name = column.querySelector(".project-name").value;
        const task = column.querySelector(".task-input textarea").value;
        const modalInfo = document.getElementById(`modal-text-${id}`)?.value || "";
        const priority = document.getElementById(`priority-select-${id}`)?.value || "Média";
        const deadline = document.getElementById(`deadline-${id}`)?.value || "";
        projects.push({ id, name, task, modalInfo, priority, deadline });
    });
    localStorage.setItem("projects", JSON.stringify(projects));
}

function loadProjects() {
    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    savedProjects.forEach(project => addProjectToDOM(project.id, project.name, project.task, project.modalInfo, project.priority, project.deadline));
    projectCount = savedProjects.length ? savedProjects[savedProjects.length - 1].id + 1 : 1;
}
