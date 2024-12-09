document.addEventListener('DOMContentLoaded', () => {
    // Навигация по основным разделам
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', event => {
            event.preventDefault();
            document.querySelectorAll('nav a').forEach(nav => nav.classList.remove('active'));
            link.classList.add('active');
            const section = event.target.dataset.section;
            if (section) {
                loadSection(section);
            }
        });
    });

    // Переход к диагностике неисправностей
    document.querySelector('#diagnostics-overview').addEventListener('click', event => {
        if (event.target.tagName === 'BUTTON') {
            event.preventDefault();
            const issue = event.target.dataset.issue;
            if (issue) {
                const parentButton = event.target;
                showDialogUnderButton(issue, parentButton);
            }
        }
    });
});

function loadSection(section) {
    const allSections = document.querySelectorAll('main > section');
    allSections.forEach(sec => (sec.style.display = 'none')); // Скрыть все секции

    const targetSection = document.querySelector(`#${section}`);
    if (targetSection) {
        targetSection.style.display = 'block'; // Показать выбранную секцию
    }
}

function showDialogUnderButton(issue, parentButton) {
    // Удаляем существующие диалоговые окна (если такие есть)
    const existingDialog = document.querySelector('.diagnostic-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    // Создаем контейнер для диалогового окна
    const dialogSection = document.createElement('div');
    dialogSection.classList.add('diagnostic-dialog');
    dialogSection.style.marginTop = '10px';
    dialogSection.style.marginRight = '10px';
    dialogSection.style.marginLeft = '10px';
    dialogSection.style.border = '1px solid #ccc';
    dialogSection.style.padding = '15px';
    dialogSection.style.backgroundColor = '#f9f9f9';
    dialogSection.style.borderRadius = '8px';

    // Вставляем диалог под нажатой кнопкой
    parentButton.insertAdjacentElement('afterend', dialogSection);

    const dialogContent = document.createElement('div');
    dialogContent.id = 'dialog-content';
    dialogSection.appendChild(dialogContent);

    // Загружаем данные для указанной проблемы
    fetch('diagnostics.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const issueData = data.find(item => item.name === issue);
            if (issueData) {
                renderDialog(issueData, dialogContent);
            } else {
                dialogContent.innerHTML = '<p>Ошибка: данные не найдены.</p>';
            }
        })
        .catch(err => {
            console.error('Ошибка загрузки данных диагностики:', err);
            dialogContent.innerHTML = '<p>Не удалось загрузить данные диагностики.</p>';
        });
}

function renderDialog(issueData, container) {
    container.innerHTML = `<h2>${issueData.title}</h2>`;
    renderStep(issueData.steps[0], container);
}

function renderStep(step, container) {
    container.innerHTML = ''; // Очистить содержимое

    if (step.type === 'question') {
        const questionElement = document.createElement('p');
        questionElement.textContent = step.text;
        container.appendChild(questionElement);

        step.answers.forEach(answer => {
            const answerButton = document.createElement('button');
            answerButton.textContent = answer.text;
            answerButton.style.marginRight = '10px';
            answerButton.style.marginTop = '5px';
            container.appendChild(answerButton);

            answerButton.addEventListener('click', () => {
                if (answer.next) {
                    renderStep(answer.next, container);
                }
            });
        });
    } else if (step.type === 'final') {
        const finalElement = document.createElement('p');
        finalElement.innerHTML = `<strong>${step.text}</strong>`;
        container.appendChild(finalElement);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetch("maintenance.json")
        .then((response) => response.json())
        .then((data) => renderMaintenanceTable(data))
        .catch((error) => console.error("Ошибка загрузки данных:", error));
});

function renderMaintenanceTable(data) {
    const tableBody = document.querySelector("#maintenance-table tbody");
    const instructionDetails = document.getElementById("instruction-details");
    const instructionTitle = document.getElementById("instruction-title");
    const instructionSteps = document.getElementById("instruction-steps");
    const instructionImages = document.getElementById("instruction-images");

    // Очистить содержимое таблицы
    tableBody.innerHTML = "";

    // Рендер строк
    data.scheduled_maintenance.forEach((item) => {
        const row = document.createElement("tr");

        // Название работы
        const nameCell = document.createElement("td");
        nameCell.textContent = item.name;

        // Периодичность
        const periodicityCell = document.createElement("td");
        periodicityCell.style.whiteSpace = "normal"; // Перенос текста на новую строку
        periodicityCell.textContent = item.periodicity;

        // Кнопка для инструкций
        const instructionCell = document.createElement("td");
        const showInstructionButton = document.createElement("button");
        showInstructionButton.textContent = "Показать инструкцию";
        showInstructionButton.className = "show-instruction";
        showInstructionButton.addEventListener("click", () => {
            showInstruction(item);
        });
        instructionCell.appendChild(showInstructionButton);

        row.appendChild(nameCell);
        row.appendChild(periodicityCell);
        row.appendChild(instructionCell);

        tableBody.appendChild(row);
    });

    // Функция отображения инструкции
    function showInstruction(item) {
        // Показать инструкцию ниже таблицы
        instructionDetails.style.display = "block";
        instructionTitle.textContent = item.name;

        // Очистить предыдущие данные
        instructionSteps.innerHTML = "";
        instructionImages.innerHTML = "";

        // Добавить шаги инструкции
        item.instruction.steps.forEach((step) => {
            const stepElement = document.createElement("li");
            stepElement.textContent = step;
            instructionSteps.appendChild(stepElement);
        });

        // Добавить изображения (если есть)
        if (item.instruction.images.length > 0) {
            item.instruction.images.forEach((image) => {
                const imgElement = document.createElement("img");
                imgElement.src = image;
                imgElement.alt = "Instruction Image";
                imgElement.style.maxWidth = "100%";
                imgElement.style.margin = "10px 0";
                instructionImages.appendChild(imgElement);
            });
        }
    }
}