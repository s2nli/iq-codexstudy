/* StudyIQ explorer: Batch -> Subjects -> Lectures / PDFs -> Player.
   Uses the site's theme variables, content comes from /api/studyiq (server-side token). */
(function () {
  const API = "/api/studyiq?courseId=";
  const PLAYER_BASE = "https://utkarsh-player.netlify.app/player?url=";

  const css = `
  .sq-root{position:fixed;inset:0;z-index:2000;display:none;flex-direction:column;background:var(--bg);color:var(--text);font-family:inherit}
  .sq-root.open{display:flex}
  .sq-top{display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--line);background:var(--panel-solid);flex:0 0 auto}
  .sq-btn{width:40px;height:40px;flex:0 0 40px;display:grid;place-items:center;border:1px solid var(--line);border-radius:12px;background:var(--panel-soft);color:var(--text);cursor:pointer}
  .sq-btn:hover{border-color:var(--brand)}
  .sq-btn svg{width:18px;height:18px}
  .sq-titles{min-width:0;flex:1}
  .sq-crumb{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sq-title{font-size:16px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .sq-body{flex:1;overflow-y:auto;padding:18px 16px 40px;-webkit-overflow-scrolling:touch}
  .sq-wrap{max-width:760px;margin:0 auto}
  .sq-head{padding:18px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--panel);margin-bottom:18px}
  .sq-pill{display:inline-block;font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 10px;border-radius:999px;color:var(--brand-bright);border:1px solid var(--line-strong);margin-right:6px}
  .sq-head h1{font-size:20px;line-height:1.3;margin:10px 0 0}
  .sq-label{display:flex;justify-content:space-between;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 4px 10px}
  .sq-row{display:flex;align-items:center;gap:14px;width:100%;text-align:left;padding:14px;margin-bottom:10px;border:1px solid var(--line);border-radius:var(--radius-md);background:var(--panel);color:var(--text);cursor:pointer;font:inherit}
  .sq-row:hover{border-color:var(--brand);background:var(--panel-soft)}
  .sq-ico{width:44px;height:44px;flex:0 0 44px;display:grid;place-items:center;border-radius:12px;background:var(--panel-soft);border:1px solid var(--line);color:var(--brand-bright)}
  .sq-ico.pdf{color:var(--danger)}
  .sq-ico svg{width:20px;height:20px}
  .sq-name{flex:1;min-width:0;font-size:14px;font-weight:600;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;word-break:break-word}
  .sq-name small{display:block;font-weight:400;color:var(--muted);font-size:11px;margin-top:2px}
  .sq-chev{color:var(--muted);flex:0 0 auto}
  .sq-tabs{display:flex;gap:6px;padding:5px;border:1px solid var(--line);border-radius:14px;background:var(--panel-soft);margin-bottom:16px}
  .sq-tab{flex:1;padding:10px;border:0;border-radius:10px;background:transparent;color:var(--muted);font:inherit;font-weight:700;font-size:13px;cursor:pointer}
  .sq-tab.active{background:var(--brand);color:#fff}
  .sq-state{text-align:center;padding:60px 16px;color:var(--muted)}
  .sq-spin{width:34px;height:34px;margin:0 auto 14px;border:3px solid var(--line-strong);border-top-color:var(--brand);border-radius:50%;animation:sqspin .8s linear infinite}
  @keyframes sqspin{to{transform:rotate(360deg)}}
  .sq-retry{margin-top:14px;padding:10px 18px;border:1px solid var(--brand);border-radius:12px;background:transparent;color:var(--brand-bright);font:inherit;font-weight:700;cursor:pointer}
  .sq-player{position:relative;width:100%;aspect-ratio:16/9;background:#000;border-radius:var(--radius-md);overflow:hidden;border:1px solid var(--line)}
  .sq-player iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  .sq-ptitle{font-size:16px;font-weight:700;margin:14px 2px 6px;line-height:1.4}
  .sq-note{font-size:12px;color:var(--muted);margin:0 2px 14px}
  .sq-link{display:inline-block;padding:10px 16px;border:1px solid var(--line-strong);border-radius:12px;color:var(--text);text-decoration:none;font-weight:600;font-size:13px}
  `;
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  const I = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
    chev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>'
  };

  const esc = (v) => (typeof escapeHtml === "function" ? escapeHtml(v) : String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[c])));
  const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : "");

  const root = document.createElement("div");
  root.className = "sq-root";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.innerHTML = `
    <div class="sq-top">
      <button class="sq-btn" type="button" id="sqBack" aria-label="Back">${I.back}</button>
      <div class="sq-titles"><div class="sq-crumb" id="sqCrumb"></div><div class="sq-title" id="sqTitle"></div></div>
      <button class="sq-btn" type="button" id="sqClose" aria-label="Close">${I.close}</button>
    </div>
    <div class="sq-body" id="sqBody"></div>`;
  document.body.appendChild(root);
  const bodyEl = root.querySelector("#sqBody");
  const crumbEl = root.querySelector("#sqCrumb");
  const titleEl = root.querySelector("#sqTitle");

  let batch = null;
  let stack = []; // views: {type:'subjects'} | {type:'items', subject} | {type:'player', item}
  let content = null; // {title, items}
  let loadToken = 0;
  let tab = "video";
  const cache = new Map();

  function normalize(raw) {
    let items = [];
    if (Array.isArray(raw.data)) items = raw.data;
    else if (Array.isArray(raw.courseContent)) items = raw.courseContent;
    else if (Array.isArray(raw.lectures)) items = raw.lectures;
    return { title: raw.courseTitle || raw.title || "", items };
  }

  async function load(courseId) {
    if (cache.has(courseId)) return cache.get(courseId);
    const res = await fetch(API + encodeURIComponent(courseId), { cache: "no-store" });
    let json = null;
    try { json = await res.json(); } catch (e) { /* not JSON, e.g. API not deployed */ }
    if (!json || !json.success) {
      const err = new Error((json && json.error) || "Content unavailable");
      err.status = res.status;
      throw err;
    }
    const data = normalize(json.data || {});
    cache.set(courseId, data);
    return data;
  }

  function stateHtml(inner) { return `<div class="sq-wrap"><div class="sq-state">${inner}</div></div>`; }

  function setHeader(crumb, title) {
    crumbEl.textContent = crumb;
    titleEl.textContent = title;
  }

  function subjectsOf(items) {
    const map = new Map();
    items.forEach((it) => {
      const key = it.parentTitle || "General";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: "base" }));
  }

  function render() {
    const view = stack[stack.length - 1];
    const batchName = batch.name || "Course";
    if (view.type === "subjects") return renderSubjects(batchName);
    if (view.type === "items") return renderItems(batchName, view.subject);
    if (view.type === "player") return renderPlayer(batchName, view);
  }

  function renderSubjects(batchName) {
    setHeader("StudyIQ", batchName);
    if (view_loading) { bodyEl.innerHTML = stateHtml('<div class="sq-spin"></div>Loading subjects…'); return; }
    if (view_error) {
      bodyEl.innerHTML = stateHtml(`<div>${esc(view_error)}</div><button class="sq-retry" type="button" id="sqRetry">Retry</button>`);
      bodyEl.querySelector("#sqRetry").addEventListener("click", () => start(batch));
      return;
    }
    const subjects = subjectsOf(content.items);
    bodyEl.innerHTML = `<div class="sq-wrap">
      <div class="sq-head"><span class="sq-pill">StudyIQ</span><span class="sq-pill">ID ${esc(batch._id)}</span><h1>${esc(content.title || batchName)}</h1></div>
      <div class="sq-label"><span>Available subjects</span><span>${subjects.length} folders</span></div>
      ${subjects.length ? subjects.map(([name, n], i) => `<button class="sq-row" type="button" data-i="${i}"><span class="sq-ico">${I.folder}</span><span class="sq-name">${esc(name)}<small>${n} item${n === 1 ? "" : "s"}</small></span><span class="sq-chev">${I.chev}</span></button>`).join("") : '<div class="sq-state">No content found for this batch yet.</div>'}
    </div>`;
    bodyEl.querySelectorAll(".sq-row").forEach((btn) => btn.addEventListener("click", () => {
      stack.push({ type: "items", subject: subjects[Number(btn.dataset.i)][0] });
      tab = "video";
      render();
    }));
    bodyEl.scrollTop = 0;
  }

  function renderItems(batchName, subject) {
    setHeader(batchName, subject);
    const inFolder = content.items.filter((it) => (it.parentTitle || "General") === subject);
    const videos = inFolder.filter((it) => safeUrl(it.videoUrl || it.video_url));
    const pdfs = inFolder.filter((it) => safeUrl(it.textUploadUrl || it.pdfUrl));
    const list = tab === "video" ? videos : pdfs;
    bodyEl.innerHTML = `<div class="sq-wrap">
      <div class="sq-tabs">
        <button class="sq-tab${tab === "video" ? " active" : ""}" type="button" data-tab="video">Videos (${videos.length})</button>
        <button class="sq-tab${tab === "pdf" ? " active" : ""}" type="button" data-tab="pdf">PDFs (${pdfs.length})</button>
      </div>
      ${list.length ? list.map((it, i) => {
        const name = it.name || it.title || "Untitled";
        return tab === "video"
          ? `<button class="sq-row" type="button" data-i="${i}"><span class="sq-ico">${I.play}</span><span class="sq-name">${esc(name)}<small>Lecture</small></span><span class="sq-chev">${I.chev}</span></button>`
          : `<a class="sq-row" href="${esc(safeUrl(it.textUploadUrl || it.pdfUrl))}" target="_blank" rel="noopener noreferrer" style="text-decoration:none"><span class="sq-ico pdf">${I.pdf}</span><span class="sq-name">${esc(name)}<small>Notes (PDF)</small></span><span class="sq-chev">${I.chev}</span></a>`;
      }).join("") : '<div class="sq-state">Nothing in this category yet.</div>'}
    </div>`;
    bodyEl.querySelectorAll(".sq-tab").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.tab; render(); }));
    if (tab === "video") {
      bodyEl.querySelectorAll(".sq-row").forEach((btn) => btn.addEventListener("click", () => {
        const it = videos[Number(btn.dataset.i)];
        stack.push({ type: "player", item: it, subject });
        render();
      }));
    }
  }

  function renderPlayer(batchName, view) {
    const it = view.item;
    const name = it.name || it.title || "Lecture";
    const url = safeUrl(it.videoUrl || it.video_url);
    setHeader(view.subject, name);
    bodyEl.innerHTML = `<div class="sq-wrap">
      <div class="sq-player"><iframe src="${esc(PLAYER_BASE + encodeURIComponent(url))}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="no-referrer"></iframe></div>
      <div class="sq-ptitle">${esc(name)}</div>
      <p class="sq-note">If the video does not start, open it directly.</p>
      <a class="sq-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Open video link</a>
    </div>`;
  }

  let view_loading = false;
  let view_error = "";

  async function start(b) {
    batch = b;
    const token = ++loadToken;
    stack = [{ type: "subjects" }];
    content = null;
    view_loading = true;
    view_error = "";
    render();
    try {
      const data = await load(String(b._id || b.batch_id));
      if (token !== loadToken) return;
      content = data;
    } catch (e) {
      if (token !== loadToken) return;
      view_error = e.status === 404 || /token/i.test(e.message)
        ? "This batch's content could not be loaded right now. The StudyIQ token may be missing or expired."
        : "Could not reach the content server. Check your connection and retry.";
    }
    view_loading = false;
    if (stack.length) render();
  }

  function open(b) {
    root.classList.add("open");
    document.body.classList.add("modal-open");
    history.pushState({ sq: 1 }, "");
    start(b);
  }

  function hide() {
    loadToken++;
    root.classList.remove("open");
    bodyEl.innerHTML = "";
    stack = [];
    if (!document.querySelector(".overlay.visible")) document.body.classList.remove("modal-open");
  }

  // One history entry is kept while open: back goes up one level, then closes.
  window.addEventListener("popstate", () => {
    if (!root.classList.contains("open")) return;
    if (stack.length > 1) {
      stack.pop();
      history.pushState({ sq: 1 }, "");
      render();
    } else {
      hide();
    }
  });
  root.querySelector("#sqBack").addEventListener("click", () => history.back());
  root.querySelector("#sqClose").addEventListener("click", () => {
    stack = [stack[0] || { type: "subjects" }];
    history.back();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("open")) history.back();
  });

  window.StudyIQ = { open };
})();
