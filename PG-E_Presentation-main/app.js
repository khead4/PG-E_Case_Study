const slides = Array.from(document.querySelectorAll(".slide"));
const slideNav = document.getElementById("slideNav");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
const slideCount = document.getElementById("slideCount");
const progressBar = document.getElementById("progressBar");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalCopy = document.getElementById("modalCopy");
const modalLaunch = document.getElementById("modalLaunch");
const previewPane = document.getElementById("previewPane");
const livePane = document.getElementById("livePane");
const tabs = Array.from(document.querySelectorAll(".tab"));
const wireframeCarousels = Array.from(document.querySelectorAll("[data-wireframe-carousel]"));

let activeIndex = 0;
let lastModalTrigger = null;

function pad(value) {
  return String(value).padStart(2, "0");
}

function slideViewScale(index) {
  const slideNumber = index + 1;
  if (slideNumber === 1) return "50";
  if (slideNumber === 12) return "25";
  return "33";
}

slides.forEach((slide, index) => {
  slide.dataset.viewScale = slideViewScale(index);
});

function buildNav() {
  slideNav.innerHTML = slides.map((slide, index) => `
    <button class="nav-item ${index === activeIndex ? "active" : ""}" type="button" data-slide="${index}" ${index === activeIndex ? 'aria-current="page"' : ""}>
      <span>${pad(index + 1)}</span>
      <strong>${slide.dataset.title || `Slide ${index + 1}`}</strong>
    </button>
  `).join("");
}

function updateSlide(index) {
  activeIndex = Math.max(0, Math.min(slides.length - 1, index));
  const viewScale = slideViewScale(activeIndex);
  document.documentElement.dataset.deckViewScale = viewScale;
  document.body.dataset.deckViewScale = viewScale;
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === activeIndex);
  });
  Array.from(document.querySelectorAll(".nav-item")).forEach((item, itemIndex) => {
    item.classList.toggle("active", itemIndex === activeIndex);
    if (itemIndex === activeIndex) {
      item.setAttribute("aria-current", "page");
    } else {
      item.removeAttribute("aria-current");
    }
  });
  slideCount.textContent = `${pad(activeIndex + 1)} / ${pad(slides.length)}`;
  progressBar.style.width = `${((activeIndex + 1) / slides.length) * 100}%`;
  prevSlide.disabled = activeIndex === 0;
  nextSlide.disabled = activeIndex === slides.length - 1;
  const url = new URL(window.location.href);
  url.searchParams.set("slide", String(activeIndex + 1));
  window.history.replaceState({}, "", url);
}

function setTab(tabName) {
  tabs.forEach(tab => tab.classList.toggle("active", tab.dataset.tab === tabName));
  document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
  document.getElementById(`${tabName}Pane`)?.classList.add("active");
}

function openModal(trigger) {
  lastModalTrigger = trigger;
  const title = trigger.dataset.title || "Preview";
  const copy = trigger.dataset.copy || "";
  const src = trigger.dataset.src || "";
  const img = trigger.dataset.img || "";

  modalTitle.textContent = title;
  modalCopy.textContent = copy;
  modalLaunch.href = src || "#";
  modalLaunch.style.display = src ? "inline-flex" : "none";

  if (img) {
    previewPane.innerHTML = `<img src="${img}" alt="${title} preview">`;
  } else {
    previewPane.innerHTML = `<div class="fallback-preview"><div><strong>${title}</strong><p>${copy || "Open the live tab for this source."}</p></div></div>`;
  }

  if (src) {
    livePane.innerHTML = `<iframe src="${src}" title="${title} live view" loading="lazy"></iframe>`;
  } else {
    livePane.innerHTML = `<div class="fallback-preview">No live source is attached to this view.</div>`;
  }

  setTab("preview");
  modal.hidden = false;
  modal.querySelector(".close-button")?.focus();
}

function closeModal() {
  modal.hidden = true;
  livePane.innerHTML = "";
  lastModalTrigger?.focus();
}

function trapModalFocus(event) {
  if (modal.hidden || event.key !== "Tab") return;
  const focusable = Array.from(modal.querySelectorAll("a[href], button:not([disabled]), iframe, [tabindex]:not([tabindex='-1'])"))
    .filter(element => element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function initialSlideIndex() {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = Number(params.get("slide"));
  if (Number.isFinite(fromQuery) && fromQuery > 0) return fromQuery - 1;
  const fromHash = Number(window.location.hash.replace("#", ""));
  if (Number.isFinite(fromHash) && fromHash > 0) return fromHash - 1;
  return 0;
}

function updateWireframeCarousel(carousel, index) {
  const screens = Array.from(carousel.querySelectorAll(".wireframe-screen"));
  if (!screens.length) return;
  const activeWireframe = Math.max(0, Math.min(screens.length - 1, index));
  carousel.dataset.activeWireframe = String(activeWireframe);
  screens.forEach((screen, screenIndex) => {
    const isActive = screenIndex === activeWireframe;
    screen.classList.toggle("active", isActive);
    screen.setAttribute("aria-hidden", String(!isActive));
  });
  const title = carousel.querySelector("[data-wireframe-title]");
  const count = carousel.querySelector("[data-wireframe-count]");
  if (title) title.textContent = screens[activeWireframe].dataset.wireframeName || `Wireframe ${activeWireframe + 1}`;
  if (count) count.textContent = `${pad(activeWireframe + 1)} / ${pad(screens.length)}`;
}


function setImportant(element, property, value) {
  if (!element) return;
  element.style.setProperty(property, value, "important");
}

function applyFitPass() {
  setImportant(document.documentElement, "height", "100vh");
  setImportant(document.documentElement, "max-height", "100vh");
  setImportant(document.body, "height", "100vh");
  setImportant(document.body, "max-height", "100vh");
  setImportant(document.body, "overflow", "hidden");
  setImportant(document.querySelector(".deck-shell"), "height", "100vh");
  setImportant(document.querySelector(".deck-shell"), "max-height", "100vh");
  setImportant(document.querySelector(".deck-shell"), "overflow", "hidden");
  setImportant(document.querySelector(".stage"), "height", "100vh");
  setImportant(document.querySelector(".stage"), "max-height", "100vh");
  setImportant(document.querySelector(".stage"), "overflow", "hidden");
  setImportant(document.querySelector(".deck-rail"), "height", "100vh");
  setImportant(document.querySelector(".deck-rail"), "max-height", "100vh");
  slides.forEach(slide => {
    setImportant(slide, "padding", "24px 32px 108px");
    setImportant(slide, "overflow-y", "auto");
    setImportant(slide, "overflow-x", "hidden");
    setImportant(slide, "scroll-padding-bottom", "140px");
    if (slide.lastElementChild) setImportant(slide.lastElementChild, "margin-bottom", "72px");

    if (!slide.classList.contains("cover-slide")) {
      slide.querySelectorAll("h2").forEach(el => {
        setImportant(el, "font-size", "22px");
        setImportant(el, "line-height", "1.13");
      });
    }

    slide.querySelectorAll(".eyebrow").forEach(el => {
      setImportant(el, "font-size", "10px");
      setImportant(el, "line-height", "1.2");
      setImportant(el, "margin-bottom", "4px");
    });

    slide.querySelectorAll(".lead, .frame-note").forEach(el => {
      setImportant(el, "font-size", "12px");
      setImportant(el, "line-height", "1.42");
    });

    slide.querySelectorAll("article, .executive-summary, .project-frame, .takeaway, .survey-card, .source-grid a").forEach(el => {
      setImportant(el, "padding", "12px 14px");
      setImportant(el, "min-height", "0");
      setImportant(el, "box-sizing", "border-box");
    });

    slide.querySelectorAll("article > strong, article > h3, .executive-summary strong, .project-frame strong, .takeaway strong, .survey-card strong, .source-grid strong").forEach(el => {
      setImportant(el, "font-size", "13.5px");
      setImportant(el, "line-height", "1.22");
      setImportant(el, "margin-bottom", "4px");
    });

    slide.querySelectorAll("article p, article li, .project-frame p, .takeaway p, .survey-card p, .source-grid p, .source-grid a").forEach(el => {
      setImportant(el, "font-size", "11.25px");
      setImportant(el, "line-height", "1.38");
      setImportant(el, "overflow-wrap", "break-word");
    });

    slide.querySelectorAll("article > span:first-child, article > small:first-child, .executive-summary span, .project-frame span, .takeaway span, .survey-card span, .source-grid span, .metric-row span, .problem-stack span").forEach(el => {
      setImportant(el, "font-size", "9px");
      setImportant(el, "line-height", "1.2");
      setImportant(el, "letter-spacing", ".055em");
      setImportant(el, "margin-bottom", "4px");
    });

    slide.querySelectorAll('[role="cell"], [role="columnheader"], td, th').forEach(el => {
      setImportant(el, "font-size", "10.5px");
      setImportant(el, "line-height", "1.3");
      setImportant(el, "padding", "6px 7px");
    });
  });

  const cover = document.querySelector('.cover-slide');
  if (cover) {
    setImportant(cover, "padding", "22px 30px 110px");
    cover.querySelectorAll('.cover-copy h1').forEach(el => setImportant(el, "font-size", "32px"));
    cover.querySelectorAll('.cover-copy .lead').forEach(el => setImportant(el, "font-size", "11.5px"));
    cover.querySelectorAll('.cover-meta article').forEach(el => setImportant(el, "padding", "8px 11px"));
    cover.querySelectorAll('.cover-meta strong').forEach(el => setImportant(el, "font-size", "11.5px"));
    cover.querySelectorAll('.cover-meta span').forEach(el => setImportant(el, "font-size", "9px"));
  }

  const project = document.querySelector('.slide[data-title="Project Context"]');
  if (project) {
    const grid = project.querySelector('.slide-grid.two-col');
    setImportant(grid, "flex", "0 0 auto");
    setImportant(grid, "min-height", "0");
    setImportant(grid, "gap", "12px");
    setImportant(grid, "grid-template-columns", "minmax(0, .92fr) minmax(0, 1.08fr)");
    const map = project.querySelector('.coverage-map');
    setImportant(map, "margin-top", "0");
    setImportant(map, "min-height", "260px");
    setImportant(map, "height", "auto");
    project.querySelectorAll('.coverage-core').forEach(el => {
      setImportant(el, "font-size", "15px");
      setImportant(el, "padding", "16px");
    });
    project.querySelectorAll('.coverage-map span').forEach(el => {
      setImportant(el, "font-size", "10.5px");
      setImportant(el, "padding", "10px 12px");
    });
    project.querySelectorAll('.problem-stack article').forEach(el => setImportant(el, "padding", "9px 11px"));
    project.querySelectorAll('.problem-stack article strong, .executive-summary strong, .metric-row strong').forEach(el => {
      setImportant(el, "font-size", "12.5px");
      setImportant(el, "line-height", "1.23");
    });
    project.querySelectorAll('.problem-stack article p, .metric-row span').forEach(el => {
      setImportant(el, "font-size", "10.5px");
      setImportant(el, "line-height", "1.34");
    });
    setImportant(grid, "height", "450px");
    setImportant(grid, "max-height", "450px");
    setImportant(grid, "overflow", "hidden");
    const summary = project.querySelector('.executive-summary');
    setImportant(summary, "display", "block");
    setImportant(summary, "padding", "10px 14px");
    setImportant(summary, "height", "82px");
    setImportant(summary, "min-height", "82px");
    setImportant(summary, "overflow", "hidden");
    summary?.querySelectorAll('strong').forEach(el => {
      setImportant(el, "font-size", "11.5px");
      setImportant(el, "line-height", "1.25");
      setImportant(el, "display", "block");
    });
    const metrics = project.querySelector('.metric-row');
    setImportant(metrics, "grid-template-columns", "repeat(3, minmax(0, 1fr))");
    setImportant(metrics, "height", "56px");
    setImportant(metrics, "min-height", "56px");
    setImportant(metrics, "overflow", "hidden");
    project.querySelectorAll('.metric-row article').forEach(el => {
      setImportant(el, "padding", "9px 11px");
      setImportant(el, "height", "56px");
      setImportant(el, "overflow", "hidden");
    });
  }

  const roadmap = document.querySelector('.slide[data-title="Roadmap"]');
  if (roadmap) {
    const roadmapGrid = roadmap.querySelector('.roadmap-grid');
    const backlogGrid = roadmap.querySelector('.backlog-grid');
    setImportant(roadmapGrid, "grid-template-columns", "repeat(4, minmax(0, 1fr))");
    setImportant(roadmapGrid, "grid-template-rows", "auto");
    setImportant(roadmapGrid, "height", "145px");
    setImportant(roadmapGrid, "min-height", "145px");
    setImportant(roadmapGrid, "margin", "0");
    setImportant(backlogGrid, "grid-template-columns", "repeat(4, minmax(0, 1fr))");
    setImportant(backlogGrid, "height", "132px");
    setImportant(backlogGrid, "min-height", "132px");
    setImportant(backlogGrid, "margin", "0");
    roadmap.querySelectorAll('.roadmap-grid article, .backlog-grid article').forEach(el => {
      setImportant(el, "overflow", "visible");
      setImportant(el, "padding", "11px 13px");
    });
    roadmap.querySelectorAll('.roadmap-grid article').forEach(el => {
      setImportant(el, "height", "145px");
      setImportant(el, "min-height", "145px");
    });
    roadmap.querySelectorAll('.backlog-grid article').forEach(el => {
      setImportant(el, "height", "132px");
      setImportant(el, "min-height", "132px");
    });
    roadmap.querySelectorAll('.roadmap-grid article p, .backlog-grid article p').forEach(el => {
      setImportant(el, "font-size", "10.75px");
      setImportant(el, "line-height", "1.35");
    });
  }

  document.querySelectorAll('.wireframe-slide .wireframe-screen, .wireframe-slide .wf-page, .wireframe-slide .wf-panel, .wireframe-slide .wf-card-grid, .wireframe-slide .wf-list, .wireframe-slide .wf-note-box').forEach(el => {
    setImportant(el, "font-size", "10.5px");
    setImportant(el, "line-height", "1.3");
  });

  document.querySelectorAll('.wireframe-slide .wf-panel p, .wireframe-slide .wf-list li, .wireframe-slide .wf-note-box, .wireframe-slide .wf-status-row b, .wireframe-slide .wf-route-grid button').forEach(el => {
    setImportant(el, "font-size", "10px");
    setImportant(el, "line-height", "1.28");
  });
}

applyFitPass();
buildNav();
updateSlide(initialSlideIndex());
const initialWireframe = Number(new URLSearchParams(window.location.search).get("wireframe"));
wireframeCarousels.forEach(carousel => {
  const requestedWireframe = Number.isFinite(initialWireframe) && initialWireframe > 0 ? initialWireframe - 1 : 0;
  updateWireframeCarousel(carousel, requestedWireframe);
});

slideNav.addEventListener("click", event => {
  const button = event.target.closest("[data-slide]");
  if (button) updateSlide(Number(button.dataset.slide));
});

prevSlide.addEventListener("click", () => updateSlide(activeIndex - 1));
nextSlide.addEventListener("click", () => updateSlide(activeIndex + 1));

document.addEventListener("keydown", event => {
  if (!modal.hidden && event.key === "Escape") {
    closeModal();
    return;
  }
  trapModalFocus(event);
  if (!modal.hidden) return;
  if (event.key === "ArrowRight" || event.key === "PageDown") updateSlide(activeIndex + 1);
  if (event.key === "ArrowLeft" || event.key === "PageUp") updateSlide(activeIndex - 1);
  if (event.key === "Home") updateSlide(0);
  if (event.key === "End") updateSlide(slides.length - 1);
});

document.querySelectorAll("[data-open-modal]").forEach(trigger => {
  trigger.addEventListener("click", () => openModal(trigger));
  if (!trigger.matches("button, a, input, select, textarea")) {
    trigger.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(trigger);
      }
    });
  }
});

document.querySelectorAll("[data-close-modal]").forEach(button => {
  button.addEventListener("click", closeModal);
});

tabs.forEach(tab => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

wireframeCarousels.forEach(carousel => {
  carousel.querySelector("[data-wireframe-prev]")?.addEventListener("click", () => {
    const screens = carousel.querySelectorAll(".wireframe-screen");
    const current = Number(carousel.dataset.activeWireframe || "0");
    updateWireframeCarousel(carousel, (current - 1 + screens.length) % screens.length);
  });
  carousel.querySelector("[data-wireframe-next]")?.addEventListener("click", () => {
    const screens = carousel.querySelectorAll(".wireframe-screen");
    const current = Number(carousel.dataset.activeWireframe || "0");
    updateWireframeCarousel(carousel, (current + 1) % screens.length);
  });
});
