document.addEventListener("DOMContentLoaded", () => {
    setupDragAndDrop();
});

function setupDragAndDrop() {
    const dashboard = document.getElementById("dashboard");
    let draggedItem = null;
    let isOverTarget = false;

    // Inicia o arraste
    dashboard.addEventListener("dragstart", (e) => {
        draggedItem = e.target;
        setTimeout(() => {
            draggedItem.style.opacity = "0.5"; // Deixa o item meio transparente enquanto arrasta
        }, 0);
    });

    // Termina o arraste
    dashboard.addEventListener("dragend", () => {
        setTimeout(() => {
            draggedItem.style.opacity = "1";  // Restaura a opacidade
            draggedItem = null;
        }, 0);
    });

    // Para todos os itens que podem ser arrastados
    dashboard.querySelectorAll(".column").forEach((column) => {
        column.addEventListener("dragover", (e) => {
            e.preventDefault();  // Permite o "drop"
        });

        // Quando o item arrastado entra na área de um outro item
        column.addEventListener("dragenter", (e) => {
            e.preventDefault();
            if (isOverTarget) return; // Evita múltiplos triggers
            column.style.border = "2px dashed #000"; // Destaca a área de drop
            isOverTarget = true;  // Marca que estamos sobre o alvo
        });

        // Quando o item arrastado sai da área de um outro item
        column.addEventListener("dragleave", () => {
            column.style.border = "";  // Remove o destaque
            isOverTarget = false;  // Marca que não estamos mais sobre o alvo
        });

        // Quando o item é solto
        column.addEventListener("drop", (e) => {
            e.preventDefault();
            if (draggedItem !== column) {
                // Troca de lugar dos elementos no DOM
                const allColumns = [...dashboard.querySelectorAll(".column")];
                const draggedIndex = allColumns.indexOf(draggedItem);
                const targetIndex = allColumns.indexOf(column);

                // Reorganiza a posição dos projetos
                if (draggedIndex < targetIndex) {
                    // Insere o item arrastado após o item alvo
                    dashboard.insertBefore(draggedItem, column.nextSibling);
                } else {
                    // Insere o item arrastado antes do item alvo
                    dashboard.insertBefore(draggedItem, column);
                }

                saveProjects(); // Salva a nova ordem no localStorage
            }

            // Limpeza após o drop
            column.style.border = "";
            isOverTarget = false;
        });
    });
}

function saveProjects() {
    const projects = [];
    document.querySelectorAll(".column").forEach((column) => {
        const id = parseInt(column.getAttribute("data-id"));
        const name = column.querySelector(".project-name").value;
        const task = column.querySelector(".task-input textarea").value;
        projects.push({ id, name, task });
    });
    localStorage.setItem("projects", JSON.stringify(projects)); // Salva no localStorage
}

function loadProjects() {
    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    savedProjects.forEach((project) => addProjectToDOM(project.id, project.name, project.task));
    projectCount = savedProjects.length ? savedProjects[savedProjects.length - 1].id + 1 : 1;
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
            <textarea placeholder="Escreva sua tarefa..." rows="5">${task}</textarea>
        </div>
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
}
