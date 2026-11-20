/* Policy Window Monitor — reviewers' back end. Reads window.PWM_BACKEND[<ISO>] from data/<iso>.js. */
(function () {
  "use strict";
  const ALL = window.PWM_BACKEND || {};
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const REPO = "https://github.com/camansil/back-end";
  const REVIEW_PAGES = { CL: "https://claude.ai/artifact/RWMPPYMYwcmQ9hfegbZtPh" };
  const VIEWS = [["review", "Review signals"], ["sources", "Source log"], ["run", "This run"]];
  const CORE_TYPES = ["Written press and online news", "Opinion pieces and columns", "Radio and TV news", "Political interviews, talk shows and podcasts", "Opinion polls and poll aggregators"];
  const accClass = (a) => /paywall|subscription/i.test(a) ? "closed" : (/^open/i.test(a) ? "open" : "");
  const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  let iso = "CL";
  try { const s = localStorage.getItem("pwm-be-country"); if (s && ALL[s]) iso = s; } catch (e) { /* storage unavailable */ }
  let D, LOG, LATEST, REVIEW, LEVEL;

  function load(code) {
    iso = ALL[code] ? code : "CL";
    try { localStorage.setItem("pwm-be-country", iso); } catch (e) { /* ignore */ }
    D = ALL[iso];
    LOG = (D.sourceLog || []).map((e) => Object.assign({}, e, { _re: (e.match || "").split("|").filter(Boolean).map((m) => new RegExp("(^|[^\\p{L}\\p{N}])" + reEsc(m.trim()) + "($|[^\\p{L}\\p{N}])", "iu")) }));
    LATEST = (D.weeks || [])[(D.weeks || []).length - 1] || null;
    REVIEW = LATEST ? (D.reviews || []).find((r) => r.week === LATEST.id) : null;
    LEVEL = D.levels || ["No signal", "Weak signal", "Signal", "Strong signal"];
    $("#country-select").value = iso;
    document.title = "Back end — Policy Window Monitor — " + D.meta.country;
    renderBanner(); renderReview(); renderSources(); renderAddSource(); renderRun();
  }
  const itemMatches = (e, i) => e._re.some((r) => r.test(i.source) || r.test(i.actor || ""));
  const lvPill = (v) => v == null ? `<span class="lv">–</span>` : `<span class="lv l${v}" title="${esc(LEVEL[v])}">${v}</span>`;

  function renderBanner() {
    $("#run-banner").innerHTML = `<span class="pill">${esc(D.meta.country)}</span>` +
      (LATEST ? `<span>Latest week: ${esc(LATEST.id)} (${esc(LATEST.label)})</span><span>Review: <b>${esc(REVIEW ? REVIEW.status : "—")}</b></span><span>${(D.items || []).length} coded items · ${(D.topics || []).length} topics</span>`
        : `<span>No weekly run yet. ${esc(D.meta.status || "")}</span>`) +
      `<span>${LOG.length} sources in the log</span>`;
  }

  /* ---------- review ---------- */
  function renderReview() {
    const host = $("#review-body");
    const page = REVIEW_PAGES[iso];
    const reqs = (D.run && D.run.requests) || [];
    const audit = (D.run && D.run.audit && D.run.audit.forReviewer) || [];
    if (!REVIEW) {
      host.innerHTML = `<article class="panel"><h2>No signals to review yet</h2><p>${esc(D.meta.country)} has no weekly run yet. Before the first run, check and complete the source log (<a href="#sources">Source log</a>). A Signal Review page for ${esc(D.meta.country)} is created with the first run.</p></article>`;
      return;
    }
    const sigs = REVIEW.signals || [], checks = REVIEW.conceptSignals || [];
    const dec = (x) => (x.review && x.review.decision) || "pending";
    const tally = (arr) => arr.reduce((a, x) => { a[dec(x)] = (a[dec(x)] || 0) + 1; return a; }, {});
    const ts = tally(sigs), tc = tally(checks);
    const tname = (id) => { const t = (D.topics || []).find((x) => x.id === id); return t ? t.short : "Cross-cutting"; };
    host.innerHTML = `
      ${page ? `<article class="panel callout"><h2>Review on the Signal Review page</h2><p>Approve, change or reject each concept check and stream level, and leave typed or spoken comments, on the <a href="${esc(page)}" target="_blank" rel="noopener"><b>${esc(D.meta.country)} Signal Review page</b></a>. The next weekly run reads your decisions and comments from there. This tab is a summary.</p></article>` : ""}
      <div class="review-tally"><span>Week <b>${esc(REVIEW.week)}</b> (${esc(REVIEW.label)})</span><span>Status <b>${esc(REVIEW.status)}</b></span>
        <span>Stream levels: <b>${ts.approve || 0}</b> approved · <b>${ts.change || 0}</b> changed · <b>${ts.reject || 0}</b> rejected · <b>${ts.pending || 0}</b> pending</span>
        <span>Concept checks: <b>${tc.approve || 0}</b> approved · <b>${tc.change || 0}</b> changed · <b>${tc.pending || 0}</b> pending</span></div>
      ${reqs.length ? `<article class="panel todo"><h2>To do for a person this week: ${reqs.length} item${reqs.length === 1 ? "" : "s"} to obtain</h2>
        <p class="panel-sub">Audio, video or paywalled items the run could not read. Get the transcript, notes or full text and paste it on the Signal Review page under the source (or in the week's notes); the next run codes it.</p>
        <ol class="todo-list">${reqs.map((r) => `<li><b>${esc(r.item)}</b><br><span class="note">${esc(r.need)}</span> <span class="tag">${esc(r.source)}</span></li>`).join("")}</ol></article>` : ""}
      ${audit.length ? `<article class="panel"><h2>Questions from the second check</h2><ul>${audit.map((a) => `<li>${esc(a)}</li>`).join("")}</ul></article>` : ""}
      <article class="panel"><h2>Stream levels this week</h2>
        <div class="items-scroll"><table class="items"><thead><tr><th>Topic</th><th>Stream</th><th>Before</th><th>Proposed</th><th>Decision</th><th>Final</th><th>Note</th></tr></thead><tbody>
        ${sigs.map((s) => `<tr><td>${esc(tname(s.topic))}</td><td>${esc(s.stream)}</td><td>${lvPill(s.prev)}</td><td>${lvPill(s.proposed)}</td><td><span class="dec ${dec(s)}">${esc(dec(s))}</span></td><td>${lvPill(s.review ? s.review.final : null)}</td><td>${esc(s.review ? s.review.note : "")}</td></tr>`).join("")}
        </tbody></table></div></article>`;
  }

  /* ---------- source log ---------- */
  let srcType = "", srcDay = "";
  function renderSources() {
    $("#h-sources").textContent = D.meta.country + " source log";
    const types = [...new Set(LOG.map((e) => e.source_type))];
    const items = D.items || [];
    const latestItems = LATEST ? items.filter((i) => i.week === LATEST.id) : [];
    const counts = new Map(LOG.map((e) => [e.id, items.filter((i) => e._re.length && itemMatches(e, i)).length]));
    const wk = new Map(LOG.map((e) => [e.id, latestItems.filter((i) => e._re.length && itemMatches(e, i)).length]));
    const cov = D.coverage || {};
    const chip = (k, l, n, on) => `<button type="button" class="fchip ${on ? "is-on" : ""}" data-k="${esc(k)}">${esc(l)} <span class="count">${n}</span></button>`;
    $("#source-type-filter").innerHTML = chip("", "All types", LOG.length, !srcType) + types.map((t) => chip(t, t, LOG.filter((e) => e.source_type === t).length, srcType === t)).join("");
    $("#source-day-filter").innerHTML = [["", "Both runs"], ["Thursday", "Thursday run"], ["Friday", "Friday run"]].map(([k, l]) => chip(k, l, k ? LOG.filter((e) => e.run_day === k).length : LOG.length, srcDay === k)).join("");
    $$("#source-type-filter .fchip").forEach((b) => b.addEventListener("click", () => { srcType = b.dataset.k; renderSources(); }));
    $$("#source-day-filter .fchip").forEach((b) => b.addEventListener("click", () => { srcDay = b.dataset.k; renderSources(); }));
    const rows = LOG.filter((e) => (!srcType || e.source_type === srcType) && (!srcDay || e.run_day === srcDay));
    const W = LATEST ? LATEST.id : "Latest week";
    $("#source-log").innerHTML = `<thead><tr><th>Source</th><th>Type</th><th>Run</th><th>Access</th><th>How the monitor reads it</th><th>Added by</th><th>${esc(W)}: scanned · coded</th><th>All weeks: coded</th><th>Notes</th></tr></thead><tbody>` +
      rows.map((e) => `<tr><td>${e.url ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.name)}</a>` : esc(e.name)}<br><span class="note">${esc(e.id)} · ${esc(e.owner)} · ${esc(e.format)}</span></td><td>${esc(e.source_type)}</td><td>${esc(e.run_day || "")}</td><td><span class="acc ${accClass(e.access)}">${esc(e.access)}</span></td><td>${esc(e.how_read)}</td><td>${esc(e.added_by)}</td>` +
        `<td class="num${LATEST && CORE_TYPES.includes(e.source_type) && e._re.length && !wk.get(e.id) ? " gapcell" : ""}">${cov[e.id] != null ? cov[e.id].scanned : (LATEST ? "?" : "—")} · ${e._re.length && LATEST ? wk.get(e.id) : "—"}</td><td class="num">${e._re.length && LATEST ? counts.get(e.id) : "—"}</td><td>${esc(e.notes)}</td></tr>`).join("") + `</tbody>`;
    if (LATEST) {
      const core = LOG.filter((e) => CORE_TYPES.includes(e.source_type) && e._re.length);
      const zero = core.filter((e) => !wk.get(e.id));
      $("#source-gap").textContent = `${LATEST.id}: ${zero.length} of ${core.length} news, opinion, TV, talk-show, podcast and poll sources produced no coded item (shaded).`;
    } else $("#source-gap").textContent = "No run yet: the counts appear after the first weekly run.";
  }
  function renderAddSource() {
    const file = `sources/${iso.toLowerCase()}.csv`;
    const edit = `${REPO}/edit/main/${file}`;
    const types = [...new Set(LOG.map((e) => e.source_type))];
    const prefix = {}, maxN = {};
    LOG.forEach((e) => { const m = /^([A-Z]+-[A-Z])(\d+)$/.exec(e.id); if (m) { prefix[e.source_type] = prefix[e.source_type] || m[1]; maxN[m[1]] = Math.max(maxN[m[1]] || 0, +m[2]); } });
    const f = (id, label, ph) => `<label>${label}<input id="as-${id}" type="text" placeholder="${esc(ph || "")}"></label>`;
    $("#add-source").innerHTML = `<h2>Add a source</h2>
      <p class="panel-sub">All three ways end in the same file, <code>${esc(file)}</code> in the back-end repository, which the weekly runs read on Thursday and Friday:</p>
      <ol class="ways"><li>Fill in this form, copy the row and paste it at the end of the log on GitHub (<a href="${edit}" target="_blank" rel="noopener">open the log for editing</a>), then commit.</li><li>Edit the log on GitHub directly.</li><li>Tell Claude in chat, or leave a note under any source on the Signal Review page.</li></ol>
      <div class="add-grid">
        ${f("name", "Name", "e.g. CIPER")}
        <label>Source type<select id="as-type">${types.map((t) => `<option>${esc(t)}</option>`).join("")}</select></label>
        ${f("owner", "Owner or publisher")}
        ${f("format", "Format", "Text, Audio, Video, Data")}
        ${f("url", "URL", "https://")}
        ${f("access", "Access", "Open, metered, paywall")}
        ${f("how", "How to read it", "Headlines weekly; full text for matches")}
        ${f("match", "Names it appears under (separate with |)", "CIPER|Ciper Chile")}
        ${f("by", "Added by", "Your name")}
        ${f("notes", "Notes")}
        <label>Run<select id="as-day"><option>Friday</option><option>Thursday</option></select></label>
      </div>
      <div class="add-actions"><button type="button" class="btn" id="as-make">Make the row</button><a class="btn" href="${edit}" target="_blank" rel="noopener">Open the log on GitHub</a></div>
      <textarea class="review-out" id="as-out" readonly hidden aria-label="New row for the source log"></textarea>`;
    $("#as-make").addEventListener("click", () => {
      const v = (k) => ($("#as-" + k).value || "").trim();
      if (!v("name")) { $("#as-name").focus(); return; }
      const ty = v("type"), pre = prefix[ty] || iso + "-X";
      const id = pre + String((maxN[pre] || 0) + 1).padStart(2, "0");
      const q = (x) => (/[",\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x);
      const row = [id, v("name"), ty, v("owner"), v("format"), v("url"), v("access"), v("how"), v("match") || v("name"), v("by"), new Date().toISOString().slice(0, 10), v("notes"), v("day")].map(q).join(",");
      const out = $("#as-out"); out.hidden = false; out.value = row; out.select();
      if (navigator.clipboard) navigator.clipboard.writeText(row).catch(() => {});
    });
  }

  /* ---------- this run ---------- */
  function renderRun() {
    const host = $("#run-body");
    const m = D.method || {};
    if (!LATEST) { host.innerHTML = `<article class="panel"><h2>No run yet</h2><p>${esc(D.meta.country)}: ${esc(D.meta.status || "")}</p><p>Steps before the first run: the country reviewer checks the proposed sources, adds the political talk shows and podcasts that set the week's frame, and fills the calendar of moments (budget, legislative sessions, elections, anniversaries).</p></article>`; return; }
    const li = (a) => (a || []).map((x) => `<li>${esc(x)}</li>`).join("");
    const frame = (D.run && D.run.frame) || [];
    const comp = (D.run && D.run.completeness) || [];
    host.innerHTML = `
      <p class="lead">${esc(m.protocol || "")} applied to ${esc(D.meta.country)} for ${esc(m.period || "")}. ${esc(m.volume || "")}</p>
      ${frame.length ? `<article class="panel"><h2>The week's frame (${esc(LATEST.id)})</h2><ul class="frame-list">${frame.map((f) => `<li><b>${esc(f.theme)}</b> ${esc(f.said)}<br><span class="note">${esc((f.sources || []).join("; "))} · ${esc(f.use || "")}</span></li>`).join("")}</ul></article>` : ""}
      <div class="method-grid">
        <article class="panel"><h2>Steps in this run</h2><ol>${li(m.steps)}</ol></article>
        <article class="panel"><h2>Limitations of this run</h2><ul>${li(m.limitations)}</ul></article>
        <article class="panel"><h2>Validation</h2><ul>${li(m.validation)}</ul><h3 style="margin-top:14px">Next</h3><ul>${li(m.nextVersion)}</ul></article>
        ${comp.length ? `<article class="panel"><h2>Completeness check</h2><ul>${comp.map((c) => `<li>${esc(c.story)} <span class="note">${esc(c.status)}</span></li>`).join("")}</ul></article>` : ""}
        ${(D.discovery || []).length ? `<article class="panel"><h2>Discovery net</h2><ul>${D.discovery.map((d) => `<li><b>${esc(d.week)}</b> ${esc(d.text)}</li>`).join("")}</ul></article>` : ""}
      </div>`;
  }

  /* ---------- routing ---------- */
  function route() {
    const h = location.hash.slice(1);
    const v = VIEWS.some(([k]) => k === h) ? h : "review";
    $$(".view").forEach((s) => (s.hidden = s.id !== "view-" + v));
    $$(".tabs a").forEach((a) => { const on = a.dataset.view === v; a.classList.toggle("is-on", on); a.setAttribute("aria-current", on ? "page" : "false"); });
  }
  window.addEventListener("hashchange", route);
  const sel = $("#country-select");
  sel.innerHTML = Object.keys(ALL).map((k) => `<option value="${k}">${esc(ALL[k].meta.country)}</option>`).join("");
  sel.addEventListener("change", () => load(sel.value));
  load(iso);
  route();
})();
