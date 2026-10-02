/*
  PORTAFOLIO ESTUDIANTIL
  ----------------------------------------------------------
  Para cambiar los datos, edita únicamente el objeto PORTFOLIO.
  Cada actividad admite hasta 10 tareas.
  Si una actividad solo tiene 8, deja las tareas 9 y 10 con
  image: "".
*/

const PORTFOLIO = {
  student: "Jhordan Camayo Rodriguez",
  career: "Ingeniería de Sistemas",
  course: "Portafolio Académico 2026",
  maxTasksPerActivity: 10,

  weeks: [
    {
      number: 1,
      title: "Semana 01",
      subtitle: "Inicio y fundamentos",
      activities: [
        {
          number: 1,
          title: "Actividad 01",
          description: "Evidencias de la primera actividad.",
          taskCount: 8,
          tasks: makeTasks(1, 1, 8)
        },
        {
          number: 2,
          title: "Actividad 02",
          description: "Evidencias de la segunda actividad.",
          taskCount: 10,
          tasks: makeTasks(1, 2, 10)
        }
      ]
    },
    {
      number: 2,
      title: "Semana 02",
      subtitle: "Desarrollo de contenidos",
      activities: [
        { number: 1, title: "Actividad 01", description: "Evidencias de la actividad.", taskCount: 10, tasks: makeTasks(2, 1, 10) },
        { number: 2, title: "Actividad 02", description: "Evidencias de la actividad.", taskCount: 10, tasks: makeTasks(2, 2, 10) }
      ]
    },
    {
      number: 3,
      title: "Semana 03",
      subtitle: "Aplicación y práctica",
      activities: [
        { number: 1, title: "Actividad 01", description: "Evidencias de la actividad.", taskCount: 10, tasks: makeTasks(3, 1, 10) },
        { number: 2, title: "Actividad 02", description: "Evidencias de la actividad.", taskCount: 10, tasks: makeTasks(3, 2, 10) }
      ]
    },
    {
      number: 4,
      title: "Semana 04",
      subtitle: "Cierre y evidencias",
      activities: [
        { number: 1, title: "Actividad 01", description: "Evidencias de la actividad.", taskCount: 10, tasks: makeTasks(4, 1, 10) },
        { number: 2, title: "Actividad 02", description: "Evidencias de la actividad.", taskCount: 10, tasks: makeTasks(4, 2, 10) }
      ]
    }
  ]
};

// Genera las tareas de una actividad.
// IMPORTANTE: no necesitas escribir .png/.jpg.
// El sistema buscará automáticamente PNG, JPG, JPEG o WEBP.
function makeTasks(week, activity, count = 10) {
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    title: `Tarea ${String(i + 1).padStart(2, "0")}`,
    basePath: `imagenes/semana${week}/actividad${activity}/tarea${i + 1}`
  }));
}

const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];

// Comprueba qué extensión existe y devuelve la primera que encuentre.
function resolveImage(basePath) {
  return new Promise(resolve => {
    if (!basePath) return resolve("");
    let index = 0;
    const tryNext = () => {
      if (index >= IMAGE_EXTENSIONS.length) return resolve("");
      const ext = IMAGE_EXTENSIONS[index++];
      const src = `${basePath}.${ext}`;
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = tryNext;
      img.src = src;
    };
    tryNext();
  });
}

async function resolveAllImages() {
  for (const week of PORTFOLIO.weeks) {
    for (const activity of week.activities) {
      for (const task of activity.tasks) {
        task.image = await resolveImage(task.basePath);
      }
    }
  }
}

const state = { week: 1, activity: 1 };

const weekTabs = document.getElementById("weekTabs");
const weekPanels = document.getElementById("weekPanels");
const totalTasksEl = document.getElementById("totalTasks");
const progressText = document.getElementById("progressText");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function render() {
  await resolveAllImages();
  renderWeekTabs();
  renderWeekPanels();
  updateStats();
  activateWeek(state.week, false);
}

function renderWeekTabs() {
  weekTabs.innerHTML = PORTFOLIO.weeks.map(week => {
    const count = week.activities.reduce((sum, activity) =>
      sum + activity.tasks.filter(task => task.image).length, 0);
    return `
      <button class="week-tab ${week.number === state.week ? "active" : ""}"
        data-week="${week.number}" role="tab" aria-selected="${week.number === state.week}">
        <small>SEMANA ${String(week.number).padStart(2, "0")}</small>
        <strong>${escapeHtml(week.title)}</strong>
        <span class="count">${count} tareas</span>
      </button>`;
  }).join("");

  weekTabs.querySelectorAll(".week-tab").forEach(btn => {
    btn.addEventListener("click", () => activateWeek(Number(btn.dataset.week)));
  });
}

function renderWeekPanels() {
  weekPanels.innerHTML = PORTFOLIO.weeks.map(week => `
    <section class="week-panel ${week.number === state.week ? "active" : ""}"
      id="week-panel-${week.number}" role="tabpanel">
      <div class="week-title">
        <div>
          <div class="section-tag">SEMANA ${String(week.number).padStart(2, "0")}</div>
          <h3>${escapeHtml(week.title)}</h3>
          <p>${escapeHtml(week.subtitle)}</p>
        </div>
      </div>

      <div class="activity-tabs" role="tablist">
        ${week.activities.map(activity => `
          <button class="activity-tab ${activity.number === state.activity ? "active" : ""}"
            data-week="${week.number}" data-activity="${activity.number}">
            ${escapeHtml(activity.title)}
          </button>`).join("")}
      </div>

      ${week.activities.map(activity => `
        <div class="activity-panel ${activity.number === state.activity ? "active" : ""}"
          id="activity-${week.number}-${activity.number}">
          <div class="activity-head">
            <div>
              <h4>${escapeHtml(activity.title)}</h4>
              <span>${escapeHtml(activity.description)}</span>
            </div>
            <span class="activity-counter">${activity.tasks.filter(t => t.image).length} / ${activity.taskCount ?? activity.tasks.length} evidencias</span>
          </div>
          <div class="task-grid">
            ${activity.tasks.map(task => taskCard(week, activity, task)).join("")}
          </div>
        </div>`).join("")}
    </section>
  `).join("");

  weekPanels.querySelectorAll(".activity-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const weekNumber = Number(btn.dataset.week);
      const activityNumber = Number(btn.dataset.activity);

      // La pestaña de actividad NO cambia de semana ni vuelve a Actividad 01.
      state.week = weekNumber;
      state.activity = activityNumber;

      document.querySelectorAll(".week-tab").forEach(tab => {
        const active = Number(tab.dataset.week) === weekNumber;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", active);
      });

      document.querySelectorAll(".week-panel").forEach(panel => {
        panel.classList.toggle("active", panel.id === `week-panel-${weekNumber}`);
      });

      renderActivity(weekNumber, activityNumber);
    });
  });

  weekPanels.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => openModal(btn.dataset.week, btn.dataset.activity, btn.dataset.task));
  });

  weekPanels.querySelectorAll(".download-mini").forEach(btn => {
    btn.addEventListener("click", event => {
      event.stopPropagation();
    });
  });
}

function taskCard(week, activity, task) {
  const image = task.image;
  return `
    <article class="task-card">
      <div class="task-thumb">
        <span class="number">${String(task.number).padStart(2, "0")}</span>
        ${image
          ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(task.title)}"
              onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';">
             <div class="no-image" style="display:none"><div><b>Imagen no encontrada</b>Agrega ${escapeHtml(image.split("/").pop())}</div></div>`
          : `<div class="no-image"><div><b>Espacio disponible</b>Agrega la evidencia aquí</div></div>`}
      </div>
      <div class="task-info">
        <strong>${escapeHtml(task.title)}</strong>
        <small>Semana ${week.number} · Actividad ${activity.number}</small>
        <div class="task-actions">
          <button class="view-btn" data-week="${week.number}" data-activity="${activity.number}" data-task="${task.number}">Ver tarea</button>
          ${image ? `<a class="download-mini" href="${escapeHtml(image)}" download title="Descargar">↓</a>` : ""}
        </div>
      </div>
    </article>`;
}

function activateWeek(number, scroll = false) {
  state.week = number;
  state.activity = 1;

  document.querySelectorAll(".week-tab").forEach(btn => {
    const active = Number(btn.dataset.week) === number;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", active);
  });

  document.querySelectorAll(".week-panel").forEach(panel => {
    panel.classList.toggle("active", panel.id === `week-panel-${number}`);
  });

  // Al cambiar de semana comenzamos siempre en Actividad 01.
  renderActivity(number, 1);

  if (scroll) {
    document.getElementById("semanas").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderActivity(weekNumber, activityNumber) {
  const panel = document.getElementById(`week-panel-${weekNumber}`);
  if (!panel) return;

  panel.querySelectorAll(".activity-tab").forEach(btn => {
    btn.classList.toggle("active", Number(btn.dataset.activity) === activityNumber);
  });
  panel.querySelectorAll(".activity-panel").forEach(activity => {
    activity.classList.toggle("active", activity.id === `activity-${weekNumber}-${activityNumber}`);
  });
}

function updateStats() {
  const total = PORTFOLIO.weeks.reduce((sum, week) =>
    sum + week.activities.reduce((aSum, activity) =>
      aSum + activity.tasks.filter(task => task.image).length, 0), 0);
  totalTasksEl.textContent = String(total).padStart(2, "0");
  const capacity = PORTFOLIO.weeks.reduce((sum, week) =>
    sum + week.activities.reduce((aSum, activity) => aSum + (activity.taskCount ?? activity.tasks.length), 0), 0);
  progressText.textContent = `${total} / ${capacity} tareas`;
}

function openModal(weekNumber, activityNumber, taskNumber) {
  const week = PORTFOLIO.weeks.find(w => w.number === Number(weekNumber));
  const activity = week.activities.find(a => a.number === Number(activityNumber));
  const task = activity.tasks.find(t => t.number === Number(taskNumber));

  const modal = document.getElementById("taskModal");
  const image = document.getElementById("modalImage");
  const fallback = document.getElementById("imageFallback");
  const download = document.getElementById("downloadBtn");

  document.getElementById("modalKicker").textContent =
    `SEMANA ${week.number} · ACTIVIDAD ${activity.number}`;
  document.getElementById("modalTitle").textContent = task.title;
  document.getElementById("modalPath").textContent = task.image || "Sin imagen asignada";

  image.src = task.image || "";
  image.alt = `${task.title} - Semana ${week.number}, Actividad ${activity.number}`;
  fallback.style.display = "none";
  image.style.display = task.image ? "block" : "none";

  if (task.image) {
    download.href = task.image;
    download.setAttribute("download", task.image.split("/").pop());
    download.style.display = "inline-flex";
    image.onerror = () => {
      image.style.display = "none";
      fallback.style.display = "block";
    };
  } else {
    download.style.display = "none";
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modal = document.getElementById("taskModal");
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-close-modal]").forEach(el => {
  el.addEventListener("click", closeModal);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

document.getElementById("scrollToWeeks").addEventListener("click", () => {
  document.getElementById("semanas").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("heroStart").addEventListener("click", () => {
  document.getElementById("semanas").scrollIntoView({ behavior: "smooth" });
});
document.getElementById("ctaStart").addEventListener("click", () => {
  document.getElementById("semanas").scrollIntoView({ behavior: "smooth" });
});

render();
