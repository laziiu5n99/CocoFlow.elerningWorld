const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setTopbarShadow() {
  const topbar = qs("#topbar");
  if (!topbar) return;
  const scrolled = window.scrollY > 6;
  topbar.classList.toggle("is-scrolled", scrolled);
}

function toast(message) {
  const el = qs("#toast");
  if (!el) return;
  el.textContent = message;
  el.classList.add("is-show");
  window.clearTimeout(toast._t);
  toast._t = window.setTimeout(() => el.classList.remove("is-show"), 1400);
}

function openOverlayFromCard(card) {
  const overlay = qs("#overlay");
  const content = qs("#overlayContent");
  const popover = qs(".popover", card);
  if (!overlay || !content || !popover) return;

  content.innerHTML = popover.innerHTML;
  overlay.classList.remove("is-closing");
  overlay.classList.add("is-open");
  overlay.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";
}

function closeOverlay() {
  const overlay = qs("#overlay");
  if (!overlay) return;
  if (!overlay.classList.contains("is-open")) return;

  overlay.classList.add("is-closing");
  overlay.setAttribute("aria-hidden", "true");
  window.clearTimeout(closeOverlay._t);
  closeOverlay._t = window.setTimeout(() => {
    overlay.classList.remove("is-open");
    overlay.classList.remove("is-closing");
    document.body.style.overflow = "";
  }, 170);
}

function bindOverlay() {
  const overlay = qs("#overlay");
  if (!overlay) return;

  overlay.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.close === "true") closeOverlay();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeOverlay();
  });
}

function bindSearch() {
  const input = qs("#searchInput");
  const btn = qs("#searchButton");
  if (!input || !btn) return;

  const run = () => {
    const q = input.value.trim();
    toast(q ? `Search: ${q}` : "Search: (empty)");
  };

  btn.addEventListener("click", run);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") run();
  });
}

function bindCourseCards() {
  const items = qsa(".course-card, .vitem, .acard, .rcard");
  const tip = qs("#courseTooltip");
  const tipInner = qs("#courseTooltipInner");
  if (!tip || !tipInner) return;

  const state = { current: null, hideT: null, overTip: false };

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  const positionTip = (anchor) => {
    const r = anchor.getBoundingClientRect();
    const gap = 14;

    // Ensure tooltip has a measurable size.
    const tw = tip.offsetWidth || 520;
    const th = tip.offsetHeight || 320;

    let left = r.right + gap;
    // If no space on the right, place on the left.
    if (left + tw > window.innerWidth - 12) left = r.left - gap - tw;

    const top = clamp(r.top, 12, window.innerHeight - th - 12);
    left = clamp(left, 12, window.innerWidth - tw - 12);

    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
  };

  const openTip = (el) => {
    const pop = qs(".popover", el);
    if (!pop) return;
    state.current = el;
    tipInner.innerHTML = pop.innerHTML;
    tip.classList.add("is-open");
    tip.setAttribute("aria-hidden", "false");
    // Position after content injection.
    positionTip(el);
  };

  const closeTip = () => {
    tip.classList.remove("is-open");
    tip.setAttribute("aria-hidden", "true");
    state.current = null;
  };

  const armHide = () => {
    window.clearTimeout(state.hideT);
    state.hideT = window.setTimeout(() => {
      if (!state.overTip) closeTip();
    }, 120);
  };

  tip.addEventListener("mouseenter", () => {
    state.overTip = true;
    window.clearTimeout(state.hideT);
  });
  tip.addEventListener("mouseleave", () => {
    state.overTip = false;
    armHide();
  });

  window.addEventListener(
    "scroll",
    () => {
      if (!state.current) return;
      positionTip(state.current);
    },
    { passive: true }
  );
  window.addEventListener(
    "resize",
    () => {
      if (!state.current) return;
      positionTip(state.current);
    },
    { passive: true }
  );

  for (const el of items) {
    // Hover-only trigger (no click).
    el.addEventListener("mouseenter", () => {
      window.clearTimeout(state.hideT);
      openTip(el);
    });
    el.addEventListener("mouseleave", () => {
      armHide();
    });
  }
}

function initAllCoursesPage() {
  const grid = qs("#allCoursesGrid");
  const likeGrid = qs("#likeGrid");
  const recentGrid = qs("#recentGrid");
  if (!grid || !likeGrid || !recentGrid) return;

  const meta = qs("#allCoursesMeta");
  const filtersEl = qs("#filters");

  const topicSel = qs("#filterTopic");
  const lengthSel = qs("#filterLength");
  const langSel = qs("#filterLang");
  const levelSel = qs("#filterLevel");
  const sortSel = qs("#sortBy");

  const qInput = qs("#searchInput");
  const qBtn = qs("#searchButton");

  const likeMore = qs("#likeMore");
  const recentMore = qs("#recentMore");

  const showMoreBtn = qs("#allShowMore");
  const showAllBtn = qs("#allShowAll");

  const seedCourses = [
    {
      id: "c1",
      name: "Deep Learning Fundamentals",
      topic: "AI",
      hours: 9,
      level: "Beginner",
      language: "English",
      desc: "Build intuition for neural networks and training loops.",
      bullets: ["Core concepts + intuition", "Training and evaluation", "Regularization basics"],
      more: "You will build a mental model of backprop, common pitfalls, and practical training habits.",
      tags: ["9h", "Beginner", "AI"],
    },
    {
      id: "c2",
      name: "ChatGPT Prompt Engineering",
      topic: "AI",
      hours: 7,
      level: "Intro",
      language: "English",
      desc: "Write reliable prompts for study and work.",
      bullets: ["Reusable prompt templates", "Guardrails and checks", "Formatting outputs"],
      more: "Focus on prompt patterns, critique loops, and structured outputs you can reuse.",
      tags: ["7h", "Intro", "GenAI"],
    },
    {
      id: "c3",
      name: "Machine Learning Essentials",
      topic: "Data",
      hours: 12,
      level: "Intermediate",
      language: "English",
      desc: "Hands-on scikit-learn workflows from data to metrics.",
      bullets: ["Feature engineering essentials", "Model selection & metrics", "Clustering workflows"],
      more: "Includes practical patterns for validation, leakage avoidance, and iteration.",
      tags: ["12h", "Intermediate", "ML"],
    },
    {
      id: "c4",
      name: "Practical SQL for Reporting",
      topic: "SQL",
      hours: 6,
      level: "Beginner",
      language: "English",
      desc: "Write clean SQL for dashboards and weekly reporting.",
      bullets: ["Readable joins & CTEs", "Window functions", "Metric tables"],
      more: "Practice common reporting patterns and maintainable query structure.",
      tags: ["6h", "Beginner", "SQL"],
    },
    {
      id: "c5",
      name: "Build Modern UI with CSS",
      topic: "Web",
      hours: 5,
      level: "Intro",
      language: "English",
      desc: "Polished UI patterns with grid, spacing and accessibility.",
      bullets: ["Grid & flex patterns", "Design tokens", "Accessible states"],
      more: "Learn reusable layout patterns and interactive states that feel premium.",
      tags: ["5h", "Intro", "CSS"],
    },
    {
      id: "c6",
      name: "Foundations of Data Visualization",
      topic: "Data",
      hours: 4,
      level: "Beginner",
      language: "English",
      desc: "Choose the right chart and tell clear stories with data.",
      bullets: ["Chart selection", "Visual hierarchy", "Avoid misleading charts"],
      more: "A practical guide to making charts that communicate effectively.",
      tags: ["4h", "Beginner", "Viz"],
    },
    {
      id: "c7",
      name: "Project Management Foundations",
      topic: "Career",
      hours: 6,
      level: "Intro",
      language: "English",
      desc: "Plan scope, timelines, and communication for real projects.",
      bullets: ["Scope and milestones", "Risk and trade-offs", "Stakeholder updates"],
      more: "Learn lightweight PM habits that keep projects moving.",
      tags: ["6h", "Intro", "PM"],
    },
    {
      id: "c8",
      name: "Digital Marketing Essentials",
      topic: "Marketing",
      hours: 8,
      level: "Beginner",
      language: "English",
      desc: "Campaign basics, SEO fundamentals, and performance metrics.",
      bullets: ["SEO starter toolkit", "Campaign planning", "Measure what matters"],
      more: "Build a simple marketing workflow and learn to read results.",
      tags: ["8h", "Beginner", "Marketing"],
    },
  ];

  // Simulate a large catalog (e.g., 399 courses) for layout/testing.
  const TARGET_TOTAL = 399;
  const topics = ["AI", "Data", "SQL", "Web", "Career", "Marketing", "Design", "Product"];
  const levels = ["Beginner", "Intro", "Intermediate"];
  const hoursPool = [3, 4, 5, 6, 7, 8, 9, 10, 12, 14];

  const courses = Array.from({ length: TARGET_TOTAL }, (_, i) => {
    const s = seedCourses[i % seedCourses.length];
    const n = i + 1;
    const topic = topics[i % topics.length];
    const level = levels[i % levels.length];
    const hours = hoursPool[i % hoursPool.length];
    return {
      ...s,
      id: `c${n}`,
      name: `${s.name} · ${topic} ${n}`,
      topic,
      hours,
      level,
      language: "English",
      desc: s.desc,
      bullets: s.bullets,
      more: s.more,
      tags: [`${hours}h`, level, topic],
    };
  });

  const recommendations = [
    {
      id: "r1",
      name: "AI for Productivity at Work",
      desc: "Templates and safe workflows for daily tasks.",
      popover: {
        title: "Course info",
        tags: ["Templates", "Best practices"],
        facts: ["Level: Beginner", "Time: 3 hours", "Language: English"],
        desc: "Use AI to draft emails, summarize meetings, and plan—without sacrificing quality.",
        bullets: ["Prompt patterns you can reuse", "Quality checks", "Privacy-aware habits"],
      },
    },
    {
      id: "r2",
      name: "Python for Data Analysis",
      desc: "Pandas patterns for real analysis work.",
      popover: {
        title: "Course info",
        tags: ["Pandas", "Projects"],
        facts: ["Level: Beginner", "Time: 10 hours", "Language: English"],
        desc: "Analyze datasets with clean, repeatable workflows in Python.",
        bullets: ["Pandas essentials", "Cleaning + joins", "Plots and summaries"],
      },
    },
    {
      id: "r3",
      name: "UI/UX Design Basics",
      desc: "Typography, layout, and design systems.",
      popover: {
        title: "Course info",
        tags: ["UI", "Design systems"],
        facts: ["Level: Beginner", "Time: 5 hours", "Language: English"],
        desc: "Design clear interfaces and consistent components.",
        bullets: ["Visual hierarchy", "Spacing + type", "Component thinking"],
      },
    },
    {
      id: "r4",
      name: "Communication Skills for Teams",
      desc: "Structure messages and handle Q&A.",
      popover: {
        title: "Course info",
        tags: ["Career", "Communication"],
        facts: ["Level: Beginner", "Time: 4 hours", "Language: English"],
        desc: "Present clearly and collaborate better with written and spoken communication.",
        bullets: ["Story structure", "Clear writing", "Confident Q&A"],
      },
    },
  ];

  const recentlyViewed = [
    {
      id: "v1",
      name: "Practical SQL for Reporting",
      desc: "Queries, joins, and reporting-ready tables.",
      popover: {
        title: "Course info",
        tags: ["Querying", "Real datasets"],
        facts: ["Level: Beginner", "Time: 6 hours", "Language: English"],
        desc: "Build clean SQL for dashboards and weekly reporting patterns.",
        bullets: ["Readable joins + CTEs", "Window functions", "Metrics tables"],
      },
    },
    {
      id: "v2",
      name: "Build Modern UI with CSS",
      desc: "Responsive layouts and accessible states.",
      popover: {
        title: "Course info",
        tags: ["UI", "Responsive"],
        facts: ["Level: Intro", "Time: 5 hours", "Language: English"],
        desc: "Polished UI patterns with grid, spacing, and accessibility-friendly states.",
        bullets: ["Grid + flex patterns", "Design tokens", "Accessible focus states"],
      },
    },
  ];

  const uniq = (arr) => Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b));

  const getLengthBucket = (hours) => {
    if (hours <= 4) return "short";
    if (hours <= 8) return "medium";
    return "long";
  };

  const renderPopoverHtml = ({ title, tags, facts, desc, bullets }) => `
    <div class="popover" role="note" aria-label="Course details">
      <div class="popover__title">${title}</div>
      <div class="popover__tags">
        ${tags.map((t, i) => `<span class="tag ${i === 0 ? "tag--primary" : ""}">${t}</span>`).join("")}
      </div>
      <div class="popover__facts">${facts.map((f) => `<span>${f}</span>`).join("")}</div>
      <div class="popover__desc">${desc}</div>
      <ul class="popover__list">${bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      <button class="btn" type="button">View course</button>
    </div>
  `;

  const renderAllCard = (c) => `
    <article class="acard" data-id="${c.id}" data-topic="${c.topic}" data-lang="${c.language}" data-level="${c.level}" data-hours="${c.hours}" aria-label="Course: ${c.name}">
      <div class="acard__cover" role="img" aria-label="Course cover placeholder"></div>
      <div class="acard__body">
        <h3 class="acard__name">${c.name}</h3>
        <p class="acard__desc">${c.desc}</p>
        <ul class="acard__bullets">
          ${c.bullets.map((b) => `<li>${b}</li>`).join("")}
        </ul>
      </div>
      <div class="acard__footer">
        <div class="acard__meta">
          ${c.tags.map((t) => `<span class="apill">${t}</span>`).join("")}
        </div>
        <button class="aexpand" type="button" aria-label="Expand course details" aria-expanded="false">
          <svg viewBox="0 0 24 24" class="icon icon--muted" aria-hidden="true">
            <path d="M6.3 9.5a1 1 0 0 1 1.4 0l4.3 4.3l4.3-4.3a1 1 0 1 1 1.4 1.4l-5 5a1 1 0 0 1-1.4 0l-5-5a1 1 0 0 1 0-1.4Z" />
          </svg>
        </button>
      </div>
      <div class="acard__more">${c.more}</div>

      ${renderPopoverHtml({
        title: "Course info",
        tags: [c.topic, c.level],
        facts: [`Level: ${c.level}`, `Time: ${c.hours} hours`, `Language: ${c.language}`],
        desc: c.desc,
        bullets: c.bullets,
      })}
    </article>
  `;

  const renderSmallCard = (c) => `
    <article class="rcard" data-id="${c.id}" aria-label="Course: ${c.name}">
      <h3 class="rcard__name">${c.name}</h3>
      <p class="rcard__desc">${c.desc}</p>
      ${renderPopoverHtml(c.popover)}
    </article>
  `;

  const setOptions = (sel, values) => {
    if (!sel) return;
    const existing = new Set(Array.from(sel.options).map((o) => o.value));
    for (const v of values) {
      if (existing.has(v)) continue;
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      sel.appendChild(opt);
    }
  };

  setOptions(topicSel, uniq(courses.map((c) => c.topic)));

  let likeCount = 0;
  let recentCount = 0;
  let visibleCount = 16;

  const renderLike = (n = 4) => {
    const next = recommendations.slice(likeCount, likeCount + n);
    likeCount += next.length;
    likeGrid.insertAdjacentHTML("beforeend", next.map(renderSmallCard).join(""));
  };

  const renderRecent = (n = 4) => {
    const next = recentlyViewed.slice(recentCount, recentCount + n);
    recentCount += next.length;
    recentGrid.insertAdjacentHTML("beforeend", next.map(renderSmallCard).join(""));
  };

  const apply = () => {
    const q = (qInput?.value || "").trim().toLowerCase();
    const topic = topicSel?.value || "";
    const len = lengthSel?.value || "";
    const lang = langSel?.value || "";
    const level = levelSel?.value || "";
    const sort = sortSel?.value || "relevance";

    let list = courses.slice();

    if (q) {
      list = list.filter((c) => `${c.name} ${c.desc} ${c.topic} ${c.level}`.toLowerCase().includes(q));
    }
    if (topic) list = list.filter((c) => c.topic === topic);
    if (lang) list = list.filter((c) => c.language === lang);
    if (level) list = list.filter((c) => c.level === level);
    if (len) list = list.filter((c) => getLengthBucket(c.hours) === len);

    if (sort === "durationAsc") list.sort((a, b) => a.hours - b.hours);
    if (sort === "durationDesc") list.sort((a, b) => b.hours - a.hours);

    const shown = list.slice(0, visibleCount);
    grid.innerHTML = shown.map(renderAllCard).join("");

    if (meta) meta.textContent = `Showing ${shown.length} of ${list.length} courses (catalog: ${TARGET_TOTAL}).`;

    if (showMoreBtn) showMoreBtn.disabled = shown.length >= list.length;

    // Bind expand buttons (re-rendered list).
    for (const card of qsa(".acard", grid)) {
      const btn = qs(".aexpand", card);
      if (!btn) continue;
      btn.addEventListener("click", () => {
        const isOpen = card.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    // Rebind hover tooltip targets.
    bindCourseCards();
  };

  // Filters are always visible on this page.
  if (filtersEl) {
    filtersEl.classList.add("is-open");
    filtersEl.setAttribute("aria-hidden", "false");
  }

  for (const el of [topicSel, lengthSel, langSel, levelSel, sortSel]) {
    if (!el) continue;
    el.addEventListener("change", apply);
  }

  const runSearch = () => apply();
  qBtn?.addEventListener("click", runSearch);
  qInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });

  showMoreBtn?.addEventListener("click", () => {
    visibleCount += 16;
    apply();
  });
  showAllBtn?.addEventListener("click", () => {
    visibleCount = TARGET_TOTAL;
    apply();
  });

  likeMore?.addEventListener("click", () => {
    renderLike(4);
    bindCourseCards();
  });
  recentMore?.addEventListener("click", () => {
    renderRecent(4);
    bindCourseCards();
  });

  // Initial render
  apply();
  renderLike(4);
  renderRecent(4);
  bindCourseCards();
}

function bindRows() {
  const rows = qsa("[data-row]");

  const update = (viewport, leftBtn, rightBtn) => {
    const max = viewport.scrollWidth - viewport.clientWidth;
    const x = viewport.scrollLeft;
    const atStart = x <= 1;
    const atEnd = x >= max - 1;
    leftBtn.disabled = atStart;
    rightBtn.disabled = atEnd || max <= 0;
  };

  for (const row of rows) {
    const viewport = qs("[data-row-viewport]", row);
    const leftBtn = qs('[data-row-nav="-1"]', row);
    const rightBtn = qs('[data-row-nav="1"]', row);
    if (!viewport || !leftBtn || !rightBtn) continue;

    const page = (dir) => {
      const delta = Math.max(260, Math.floor(viewport.clientWidth * 0.92));
      viewport.scrollBy({ left: delta * dir, behavior: "smooth" });
    };

    leftBtn.addEventListener("click", () => page(-1));
    rightBtn.addEventListener("click", () => page(1));

    // Wheel → horizontal scroll, like Netflix rows.
    viewport.addEventListener(
      "wheel",
      (e) => {
        if (!(e instanceof WheelEvent)) return;
        const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        if (isHorizontal) return;
        if (viewport.scrollWidth <= viewport.clientWidth) return;
        viewport.scrollLeft += e.deltaY;
        e.preventDefault();
      },
      { passive: false }
    );

    viewport.addEventListener("scroll", () => update(viewport, leftBtn, rightBtn), { passive: true });
    window.addEventListener("resize", () => update(viewport, leftBtn, rightBtn), { passive: true });

    // initial state
    update(viewport, leftBtn, rightBtn);
  }
}

function bindHorizontalWheel() {
  const rows = qsa(".chips__row");
  for (const row of rows) {
    row.addEventListener(
      "wheel",
      (e) => {
        if (!(e instanceof WheelEvent)) return;
        const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        if (isHorizontal) return;
        if (row.scrollWidth <= row.clientWidth) return;
        row.scrollLeft += e.deltaY;
        e.preventDefault();
      },
      { passive: false }
    );
  }
}

function bindMarqueeWheel() {
  const marquees = qsa(".marquee");
  for (const m of marquees) {
    m.addEventListener(
      "wheel",
      (e) => {
        if (!(e instanceof WheelEvent)) return;
        const track = qs(".marquee__track", m);
        if (!track) return;
        // pause animation while user scrolls horizontally
        track.style.animationPlayState = "paused";
        m.scrollLeft += e.deltaY;
        e.preventDefault();
        window.clearTimeout(m._t);
        m._t = window.setTimeout(() => (track.style.animationPlayState = ""), 600);
      },
      { passive: false }
    );
  }
}

function bindChips() {
  const chips = qsa(".chip");
  for (const chip of chips) {
    chip.addEventListener("click", () => toast(`Tag: ${chip.textContent || ""}`));
  }
}

function initAdCarousel() {
  const adImage = qs("#adImage");
  const adArrowLeft = qs(".ad-arrow-left");
  const adArrowRight = qs(".ad-arrow-right");
  const adDots = qsa(".ad-dot");

  if (!adImage || !adArrowLeft || !adArrowRight || adDots.length === 0) return;

  const adImages = [
    'imgs/ad banner1.png',
    'imgs/adbanner (1).png',
    'imgs/adbanner (2).png',
    'imgs/adbanner (3).png'
  ];

  let currentIndex = 0;
  let intervalId;

  function updateImage() {
    adImage.src = adImages[currentIndex];
    adImage.alt = `Ad Banner ${currentIndex + 1}`;
    updateIndicators();
  }

  function updateIndicators() {
    adDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === currentIndex);
    });
  }

  function nextAd() {
    currentIndex = (currentIndex + 1) % adImages.length;
    updateImage();
  }

  function prevAd() {
    currentIndex = (currentIndex - 1 + adImages.length) % adImages.length;
    updateImage();
  }

  function goToAd(index) {
    currentIndex = index;
    updateImage();
  }

  function startAutoPlay() {
    intervalId = setInterval(nextAd, 3000);
  }

  function stopAutoPlay() {
    clearInterval(intervalId);
  }

  // 事件监听器
  adArrowLeft.addEventListener('click', () => {
    stopAutoPlay();
    prevAd();
    startAutoPlay();
  });

  adArrowRight.addEventListener('click', () => {
    stopAutoPlay();
    nextAd();
    startAutoPlay();
  });

  adDots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      stopAutoPlay();
      goToAd(index);
      startAutoPlay();
    });
  });

  // 初始化
  updateImage();
  startAutoPlay();
}

function simulateLoading() {
  window.setTimeout(() => document.body.classList.add("is-loaded"), 550);
}

function main() {
  setTopbarShadow();
  window.addEventListener("scroll", setTopbarShadow, { passive: true });

  bindOverlay();
  bindSearch();
  bindCourseCards();
  initAllCoursesPage();
  bindRows();
  bindHorizontalWheel();
  bindMarqueeWheel();
  bindChips();
  initAdCarousel();
  simulateLoading();
}

document.addEventListener("DOMContentLoaded", main);
