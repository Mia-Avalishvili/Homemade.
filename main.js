// ─────────────────────────────────────────────
// main.js — everything in one file
// state · render · events · utils · storage
// ─────────────────────────────────────────────

import { fetchEvents, fetchAttendees, registerForEvent,
         createEvent, updateEvent, deleteEvent } from "./api.js";
import { App } from "./app.js";

// ══════════════════════════════════════════════
// STATE
// ══════════════════════════════════════════════
const state = {
  events:         [],
  attendeeCounts: {},
  filter:         "All",
  timeFilter:     "all",   // "all" | "upcoming" | "past"
  search:         "",
  sort:           "default",
  loading:        false,
  error:          "",
  activeEventId:  null,
};

function setState(patch) {
  Object.assign(state, patch);
}

// ══════════════════════════════════════════════
// STORAGE (localStorage helpers)
// ══════════════════════════════════════════════
const LS = {
  saved:  "hm_saved",
  theme:  "hm_theme",
  search: "hm_search",
};

function getSaved()          { return JSON.parse(localStorage.getItem(LS.saved)  || "[]"); }
function setSaved(ids)       { localStorage.setItem(LS.saved,  JSON.stringify(ids)); }
function getTheme()          { return localStorage.getItem(LS.theme)  || "light"; }
function saveTheme(t)        { localStorage.setItem(LS.theme,  t); }
function getLastSearch()     { return localStorage.getItem(LS.search) || ""; }
function saveLastSearch(v)   { localStorage.setItem(LS.search, v); }

function toggleSaved(id) {
  const saved = getSaved();
  const idx   = saved.indexOf(id);
  if (idx === -1) saved.push(id);
  else            saved.splice(idx, 1);
  setSaved(saved);
  return saved.includes(id);
}

// ══════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════
let toastTimer;

function showToast(msg, type = "") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.className = `toast ${type}`;
  document.getElementById("toastIcon").textContent = type === "success" ? "✓" : type === "error" ? "✕" : "ℹ";
  document.getElementById("toastMsg").textContent  = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
}

function formatDate(d) {
  if (!d) return "";
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function updateResultsCount(n) {
  const el = document.getElementById("resultsCount");
  if (el) el.textContent = `Showing ${n} recipe${n !== 1 ? "s" : ""}`;
}

// ── QR-style confirmation code ✅ ─────────────
function generateConfirmCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "HM-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += "-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code; // e.g. HM-A3KP-9MX2
}

// ══════════════════════════════════════════════
// RENDER
// ══════════════════════════════════════════════
function getVisibleEvents() {
  const today = new Date().toISOString().split("T")[0];
  let list = [...state.events];

  if (state.timeFilter === "upcoming") list = list.filter(e => e.date >= today);
  if (state.timeFilter === "past")     list = list.filter(e => e.date <  today);

  if (state.sort === "time")      list.sort((a, b) => (a.time_to_cook||99) - (b.time_to_cook||99));
  if (state.sort === "capacity")  list.sort((a, b) => b.capacity - a.capacity);
  if (state.sort === "date-asc")  list.sort((a, b) => a.date.localeCompare(b.date));
  if (state.sort === "date-desc") list.sort((a, b) => b.date.localeCompare(a.date));

  return list;
}

function render() {
  const visibleEvents = getVisibleEvents();
  document.querySelector("#app").innerHTML = App({
    visibleEvents,
    attendeeCounts: state.attendeeCounts,
    filter:    state.filter,
    timeFilter: state.timeFilter,
    search:    state.search,
    sort:      state.sort,
    loading:   state.loading,
    error:     state.error,
    savedIds:  getSaved(),
  });
}

// ══════════════════════════════════════════════
// LOAD EVENTS (main data function)
// ══════════════════════════════════════════════
export async function loadEvents(fetchFromBackend = true) {
  try {
    setState({ loading: true, error: "" });
    render();
    attachEvents();

    if (fetchFromBackend) {
      const events = await fetchEvents({
        search:   state.search,
        category: state.filter,
        sort:     state.sort,
      });
      setState({ events });
      saveLastSearch(state.search);

      // Load attendee counts for all events (for badges)
      const counts = {};
      await Promise.all(events.map(async (ev) => {
        try {
          const att = await fetchAttendees(ev.id);
          counts[ev.id] = att.length;
        } catch { counts[ev.id] = 0; }
      }));
      setState({ attendeeCounts: counts });
    }
  } catch (error) {
    setState({ error: error.message });
  } finally {
    setState({ loading: false });
    render();
    attachEvents();
    updateResultsCount(getVisibleEvents().length);
  }
}

export function resetFilters() {
  setState({ filter: "All", search: "", sort: "default", timeFilter: "all" });
  saveLastSearch("");
  loadEvents();
}

// ══════════════════════════════════════════════
// ATTACH EVENTS (all DOM listeners)
// ══════════════════════════════════════════════
function attachEvents() {
  attachNavbar();
  attachTheme();
  attachControls();
  attachTimeFilter();
  attachAdminToggle();
  attachAdminLoginBtn();
  attachAdminForm();
  attachRegistrationForm();
  attachSavedLink();
  attachEscKey();
}

// ── Navbar ─────────────────────────────────
function attachNavbar() {
  const burger   = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  if (burger) {
    burger.onclick = () => navLinks.classList.toggle("open");
  }
  window.onscroll = () => {
    document.getElementById("navbar")?.classList.toggle("scrolled", scrollY > 10);
  };
}

// ── Theme ───────────────────────────────────
function attachTheme() {
  if (getTheme() === "dark") applyTheme(true);
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    applyTheme(document.documentElement.getAttribute("data-theme") !== "dark");
  });
}

function applyTheme(isDark) {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  const sun  = document.querySelector(".icon-sun");
  const moon = document.querySelector(".icon-moon");
  if (sun)  sun.style.display  = isDark ? "none" : "";
  if (moon) moon.style.display = isDark ? ""     : "none";
  saveTheme(isDark ? "dark" : "light");
}

// ── Search / Filter / Sort ──────────────────
function attachControls() {
  document.getElementById("categoryTabs")?.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    setState({ filter: tab.dataset.category });
    loadEvents();
  });

  document.getElementById("searchInput")?.addEventListener("input", (e) => {
    setState({ search: e.target.value });
    loadEvents();
  });

  document.getElementById("sortSelect")?.addEventListener("change", (e) => {
    setState({ sort: e.target.value });
    loadEvents(false);
  });
}

// ── Upcoming / Past ─────────────────────────
function attachTimeFilter() {
  document.querySelectorAll(".time-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      setState({ timeFilter: btn.dataset.time });
      loadEvents(false);
    });
  });
}

// ── Admin ────────────────────────────────────
const ADMIN_PASS = "admin";

function attachAdminToggle() {
  document.getElementById("adminToggle")?.addEventListener("click", openAdminLogin);
  document.getElementById("heroAdminBtn")?.addEventListener("click", openAdminLogin);
}

function attachAdminLoginBtn() {
  document.getElementById("adminLoginBtn")?.addEventListener("click", checkAdminLogin);
  document.getElementById("adminPassword")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAdminLogin();
  });
}

function openAdminLogin() {
  const pw  = document.getElementById("adminPassword");
  const err = document.getElementById("adminPasswordError");
  if (pw)  pw.value = "";
  if (err) err.textContent = "";
  openModal("adminLoginModal");
  setTimeout(() => pw?.focus(), 100);
}

function checkAdminLogin() {
  const pw = document.getElementById("adminPassword")?.value;
  if (pw === ADMIN_PASS) {
    closeModal("adminLoginModal");
    openAdminPanel();
  } else {
    document.getElementById("adminPasswordError").textContent = "Incorrect password.";
    document.getElementById("adminPassword").value = "";
  }
}

function openAdminPanel() {
  document.getElementById("adminPanel").style.display = "block";
  document.body.style.overflow = "hidden";
  renderAdminList();
  populateAttendeeSelect();
}

function renderAdminList() {
  const list = document.getElementById("adminEventsList");
  if (!list) return;
  if (!state.events.length) {
    list.innerHTML = `<p style="color:var(--text-3);font-size:13px">No events yet.</p>`;
    return;
  }
  list.innerHTML = state.events.map(e => `
    <div class="admin-event-row">
      <img class="admin-event-img" src="${e.image_url || ""}" alt="${e.title}"
           onerror="this.src='https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=100&q=60'">
      <div class="admin-event-info">
        <strong>${e.title}</strong>
        <span>${e.category} · ${formatDate(e.date)} · ${e.capacity} spots</span>
      </div>
      <div class="admin-event-actions">
        <button class="btn-edit" data-edit-id="${e.id}">Edit</button>
        <button class="btn-del"  data-del-id="${e.id}">Delete</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll("[data-edit-id]").forEach(btn => {
    btn.onclick = () => fillEditForm(Number(btn.dataset.editId));
  });
  list.querySelectorAll("[data-del-id]").forEach(btn => {
    btn.onclick = () => handleDelete(Number(btn.dataset.delId));
  });
}

async function handleDelete(id) {
  if (!confirm("Delete this recipe?")) return;
  try {
    await deleteEvent(id);
    setState({ events: state.events.filter(e => e.id !== id) });
    renderAdminList();
    loadEvents(false);
    populateAttendeeSelect();
    showToast("Recipe deleted", "success");
  } catch (err) { showToast(err.message, "error"); }
}

function fillEditForm(id) {
  const ev = state.events.find(e => e.id === id);
  if (!ev) return;
  document.getElementById("editEventId").value   = id;
  document.getElementById("adminTitle").value    = ev.title;
  document.getElementById("adminDesc").value     = ev.description;
  document.getElementById("adminCategory").value = ev.category;
  document.getElementById("adminDate").value     = ev.date;
  document.getElementById("adminTime").value     = ev.time;
  document.getElementById("adminLocation").value = ev.location;
  document.getElementById("adminCapacity").value = ev.capacity;
  document.getElementById("adminCookTime").value = ev.time_to_cook || "";
  document.getElementById("adminImage").value    = ev.image_url || "";
  document.getElementById("adminSubmitBtn").textContent    = "Update Recipe";
  document.getElementById("adminCancelEdit").style.display = "block";
  switchAdminTab("add", document.getElementById("tabAdd"));
}

function cancelAdminEdit() {
  document.getElementById("adminForm")?.reset();
  document.getElementById("editEventId").value = "";
  document.getElementById("adminSubmitBtn").textContent    = "Add Recipe";
  document.getElementById("adminCancelEdit").style.display = "none";
}

function attachAdminForm() {
  document.getElementById("adminForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const editId = document.getElementById("editEventId").value;
    const isEdit = !!editId;

    const payload = {
      title:        document.getElementById("adminTitle").value.trim(),
      description:  document.getElementById("adminDesc").value.trim(),
      category:     document.getElementById("adminCategory").value,
      date:         document.getElementById("adminDate").value,
      time:         document.getElementById("adminTime").value,
      location:     document.getElementById("adminLocation").value.trim(),
      capacity:     parseInt(document.getElementById("adminCapacity").value, 10),
      time_to_cook: parseInt(document.getElementById("adminCookTime").value, 10) || 20,
      image_url:    document.getElementById("adminImage").value.trim() ||
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
    };

    if (!payload.title || !payload.date || !payload.capacity) {
      showToast("Fill in all required fields", "error"); return;
    }

    try {
      if (isEdit) {
        const updated = await updateEvent(Number(editId), payload);
        setState({ events: state.events.map(e => e.id === Number(editId) ? updated : e) });
        showToast("Recipe updated!", "success");
      } else {
        const created = await createEvent(payload);
        setState({ events: [created, ...state.events] });
        showToast("Recipe added! 🎉", "success");
      }
      cancelAdminEdit();
      renderAdminList();
      loadEvents(false);
      populateAttendeeSelect();
    } catch (err) { showToast(err.message, "error"); }
  });
}

function populateAttendeeSelect() {
  const sel = document.getElementById("attendeeEventSelect");
  if (!sel) return;
  sel.innerHTML = `<option value="">-- Choose a recipe --</option>` +
    state.events.map(e => `<option value="${e.id}">${e.title}</option>`).join("");
}

async function loadAttendees(eventId) {
  const container = document.getElementById("attendeesList");
  if (!container || !eventId) return;
  try {
    const attendees = await fetchAttendees(Number(eventId));
    container.innerHTML = attendees.length
      ? `<p style="font-size:12px;color:var(--text-3);margin:12px 0 8px">
           ${attendees.length} attendee${attendees.length !== 1 ? "s" : ""}
         </p>
         ${attendees.map(a => `
           <div class="attendee-row">
             <div class="attendee-avatar">${(a.fullName||"?")[0].toUpperCase()}</div>
             <div class="attendee-info">
               <strong>${a.fullName}</strong>
               <span>${a.email} · ${a.phone}</span>
             </div>
           </div>
         `).join("")}`
      : `<p style="color:var(--text-3);font-size:13px;padding-top:12px">No registrations yet.</p>`;
  } catch (err) {
    container.innerHTML = `<p style="color:var(--rose-dk);font-size:13px">${err.message}</p>`;
  }
}

function switchAdminTab(name, btn) {
  document.querySelectorAll(".admin-tab").forEach(t => t.classList.remove("active"));
  if (btn) btn.classList.add("active");
  document.querySelectorAll(".admin-section").forEach(s => s.style.display = "none");
  document.getElementById(`admin${name.charAt(0).toUpperCase() + name.slice(1)}`).style.display = "block";
  if (name === "events") renderAdminList();
}

// ── Recipe detail modal ─────────────────────
export async function openRecipeModal(id) {
  const event = state.events.find(e => e.id === id);
  if (!event) return;
  setState({ activeEventId: id });

  let taken = state.attendeeCounts[id] || 0;
  try {
    const att = await fetchAttendees(id);
    taken = att.length;
    setState({ attendeeCounts: { ...state.attendeeCounts, [id]: taken } });
  } catch {}

  const free   = event.capacity - taken;
  const isFull = free <= 0;
  const pct    = Math.min((taken / event.capacity) * 100, 100);

  document.getElementById("recipeModalImg").src              = event.image_url || "";
  document.getElementById("recipeModalImg").alt              = event.title;
  document.getElementById("recipeModalTitle").textContent    = event.title;
  document.getElementById("recipeModalDesc").textContent     = event.description;
  document.getElementById("recipeModalBadge").textContent    = event.category;
  document.getElementById("recipeModalBadge").className      = `rmodal-badge badge-${event.category}`;
  document.getElementById("recipeModalTime").textContent     = `${event.time_to_cook || 20} min cook time`;
  document.getElementById("recipeModalCapacity").textContent = `${free} of ${event.capacity} spots left`;
  document.getElementById("recipeModalDate").textContent     = `${formatDate(event.date)} at ${event.time}`;
  document.getElementById("recipeModalLocation").textContent = event.location;
  document.getElementById("spotsText").textContent           = `${free} / ${event.capacity} free`;

  const fill = document.getElementById("capacityFill");
  fill.style.width = pct + "%";
  fill.className   = "capacity-fill" + (pct >= 100 ? " full" : pct >= 70 ? " warn" : "");

  const btn = document.getElementById("rmodalRegBtn");
  if (isFull) {
    btn.textContent = "Class is Full 😔";
    btn.disabled = true;
    btn.style.opacity = ".5";
  } else {
    btn.textContent = "Reserve My Spot 🎀";
    btn.disabled = false;
    btn.style.opacity = "";
    btn.onclick = () => { closeModal("recipeModal"); openRegModal(id, event.title); };
  }
  openModal("recipeModal");
}

// ── Registration modal ──────────────────────
function openRegModal(id, title) {
  setState({ activeEventId: id });
  document.getElementById("modalTitle").textContent    = `Reserve: ${title}`;
  document.getElementById("modalSubtitle").textContent = "You're one step away from joining this class!";
  document.getElementById("responseMsg").textContent   = "";
  document.getElementById("qrConfirm").style.display   = "none";
  clearFieldErrors();
  openModal("regModal");
}

function attachRegistrationForm() {
  document.getElementById("registrationForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id    = state.activeEventId;
    if (!id) return;
    const name  = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    clearFieldErrors();
    let valid = true;
    if (!name)                { showFieldError("nameError",  "Enter your full name.");    valid = false; }
    if (!isValidEmail(email)) { showFieldError("emailError", "Enter a valid email.");     valid = false; }
    if (!phone)               { showFieldError("phoneError", "Enter your phone number."); valid = false; }
    if (!valid) return;

    try {
      await registerForEvent(id, { fullName: name, email, phone });
      onRegSuccess(name);
    } catch (err) {
      onRegError(err.error || err.message || "Registration failed");
    }
  });
}

function onRegSuccess(name) {
  // Generate QR-style confirmation code ✅
  const code = generateConfirmCode();

  const msgEl = document.getElementById("responseMsg");
  msgEl.style.color = "var(--sage-dk)";
  msgEl.textContent = "🎀 Successfully registered! See you in class.";

  // Show QR confirmation block
  const qrEl = document.getElementById("qrConfirm");
  qrEl.style.display = "block";
  document.getElementById("qrCode").textContent = code;
  document.getElementById("qrName").textContent = name;

  // Draw QR-style dot grid (decorative, seeded from code)
  const grid = document.getElementById("qrGrid");
  const seed = code.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  let s = seed;
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  const cells = Array.from({ length: 121 }, (_, i) => {
    // always-on corners for QR look
    const row = Math.floor(i / 11), col = i % 11;
    const corner = (row < 3 && col < 3) || (row < 3 && col > 7) || (row > 7 && col < 3);
    return corner ? "on" : rand() > 0.5 ? "on" : "off";
  });
  grid.innerHTML = cells.map(c => `<div class="qr-cell ${c}"></div>`).join("");

  // Hide form fields
  document.getElementById("registrationForm").style.display = "none";

  showToast("Reservation confirmed! 🎀", "success");
  setTimeout(() => {
    closeModal("regModal");
    document.getElementById("registrationForm").style.display = "";
    loadEvents();
  }, 5000);
}

function onRegError(errorMsg) {
  const msgEl = document.getElementById("responseMsg");
  msgEl.style.color = "var(--rose-dk)";
  if (errorMsg === "Event is full") {
    msgEl.textContent = "😔 Sorry, this class is now full.";
    showToast("This class is full", "error");
  } else if (errorMsg === "Duplicate Email") {
    msgEl.textContent = "⚠️ This email is already registered for this class.";
    showToast("Email already registered", "error");
  } else {
    msgEl.textContent = `❌ ${errorMsg}`;
  }
}

// ── Saved ────────────────────────────────────
function attachSavedLink() {
  document.getElementById("myRecipesLink")?.addEventListener("click", (e) => {
    e.preventDefault();
    openSavedModal();
  });
}

function openSavedModal() {
  const savedIds = getSaved();
  const list     = document.getElementById("savedList");
  const saved    = state.events.filter(e => savedIds.includes(e.id));
  list.innerHTML = saved.length
    ? saved.map(e => `
        <div class="saved-recipe-row" onclick="window.__openRecipeModal(${e.id}); window.__closeModal('savedModal')" style="cursor:pointer">
          <img class="saved-recipe-img" src="${e.image_url}" alt="${e.title}"
               onerror="this.src='https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=100&q=60'">
          <div class="saved-recipe-info">
            <strong>${e.title}</strong>
            <span>${e.category} · ${e.time_to_cook || 20} min</span>
          </div>
        </div>
      `).join("")
    : `<div class="saved-empty"><p>💝 No saved recipes yet.</p></div>`;
  openModal("savedModal");
}

// ── Modal helpers ────────────────────────────
function openModal(id)  {
  document.getElementById(id)?.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
  if (!document.querySelector(".modal.open")) document.body.style.overflow = "";
}

function attachEscKey() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    document.querySelectorAll(".modal.open").forEach(m => m.classList.remove("open"));
    const ap = document.getElementById("adminPanel");
    if (ap?.style.display !== "none") ap.style.display = "none";
    document.body.style.overflow = "";
  });
}

function showFieldError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearFieldErrors() {
  ["nameError","emailError","phoneError"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
}

// ── Expose on window (for inline onclick in HTML templates) ──
window.__openRecipeModal = openRecipeModal;
window.__closeModal      = closeModal;
window.__closeAdminPanel = () => { document.getElementById("adminPanel").style.display = "none"; document.body.style.overflow = ""; };
window.__switchAdminTab  = switchAdminTab;
window.__loadAttendees   = loadAttendees;
window.__cancelAdminEdit = cancelAdminEdit;
window.__resetFilters    = resetFilters;
window.__loadEvents      = loadEvents;
window.__toggleSave      = (id) => {
  const isSaved = toggleSaved(id);
  const btn = document.getElementById(`heart-${id}`);
  if (btn) { btn.classList.toggle("saved", isSaved); btn.textContent = isSaved ? "♥" : "♡"; }
  showToast(isSaved ? "Recipe saved! ♥" : "Removed from saved", isSaved ? "success" : "");
};

// ══════════════════════════════════════════════
// BOOT
// ══════════════════════════════════════════════
render();
attachEvents();

const lastSearch = getLastSearch();
if (lastSearch) {
  setState({ search: lastSearch });
  const input = document.getElementById("searchInput");
  if (input) input.value = lastSearch;
}

loadEvents();
