// ─────────────────────────────────────────────
// app.js — ALL HTML components in one file
// Navbar · Hero · Controls · RecipeCard
// RecipeGrid · RecipeModal · RegModal · AdminPanel
// ─────────────────────────────────────────────

const CATEGORIES = ["All", "Breakfast", "Main Course", "Dessert", "Drink"];

// ── Navbar ─────────────────────────────────
function Navbar() {
  return `
    <nav class="navbar" id="navbar">
      <a href="#" class="logo">Homemade<span>.</span></a>

      <button class="hamburger" id="hamburger" aria-label="Open menu">
        <span></span><span></span><span></span>
      </button>

      <div class="nav-links" id="navLinks">
        <a href="#" class="nav-link active">Explore</a>
        <a href="#" class="nav-link" id="myRecipesLink">Saved</a>
        <div class="nav-actions">
          <button class="icon-btn" id="themeToggle" title="Toggle theme">
            <svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            <svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          </button>
          <button class="icon-btn admin-btn" id="adminToggle" title="Admin panel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </button>
          <button class="profile-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Account
          </button>
        </div>
      </div>
    </nav>
  `;
}

// ── Hero ────────────────────────────────────
function Hero({ count }) {
  return `
    <div class="hero-bg"></div>
    <div class="hero-content">
      <span class="hero-eyebrow">✦ Artisan Recipe Classes ✦</span>
      <h1>Cook with <em>love,</em><br>eat with <em>joy.</em></h1>
      <p>Join intimate cooking classes where every recipe is a story — crafted with seasonal ingredients, shared with heart.</p>
      <div class="hero-actions">
        <button class="btn-primary" onclick="document.getElementById('controls').scrollIntoView({behavior:'smooth'})">
          Explore Classes
        </button>
        <button class="btn-ghost" id="heroAdminBtn">Host a Class</button>
      </div>
    </div>
    <div class="hero-stat">
      <span class="stat-num">${count}</span>
      <span class="stat-label">Recipes</span>
    </div>
  `;
}

// ── Controls ─────────────────────────────────
function Controls({ filter, timeFilter, search, sort }) {
  return `
    <div class="controls-row">
      <div class="category-tabs" id="categoryTabs">
        ${CATEGORIES.map(cat => `
          <button class="tab ${filter === cat ? "active" : ""}" data-category="${cat}">
            ${cat === "All" ? "All" :
              cat === "Breakfast"   ? "☀️ Breakfast"  :
              cat === "Main Course" ? "🍽 Main"        :
              cat === "Dessert"     ? "🍰 Dessert"     : "🥂 Drink"}
          </button>
        `).join("")}
      </div>
      <div class="controls-right">
        <div class="time-filter-tabs">
          <button class="time-tab ${timeFilter==="all"      ? "active":""}" data-time="all">All</button>
          <button class="time-tab ${timeFilter==="upcoming" ? "active":""}" data-time="upcoming">Upcoming</button>
          <button class="time-tab ${timeFilter==="past"     ? "active":""}" data-time="past">Past</button>
        </div>
        <div class="search-box">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" id="searchInput" placeholder="Search recipes..." value="${search}">
        </div>
        <select id="sortSelect" class="sort-select">
          <option value="default"   ${sort==="default"  ?"selected":""}>Sort: Default</option>
          <option value="date-asc"  ${sort==="date-asc" ?"selected":""}>Date ↑</option>
          <option value="date-desc" ${sort==="date-desc"?"selected":""}>Date ↓</option>
          <option value="time"      ${sort==="time"     ?"selected":""}>Cook time</option>
          <option value="capacity"  ${sort==="capacity" ?"selected":""}>Capacity</option>
        </select>
      </div>
    </div>
    <div class="results-bar"><span id="resultsCount"></span></div>
  `;
}

// ── RecipeCard ──────────────────────────────
function RecipeCard(event, index, attendeeCounts, savedIds) {
  const isSaved    = savedIds.includes(event.id);
  const featured   = index === 0 ? "featured" : "";
  const delay      = Math.min(index * 0.06, 0.5);
  const taken      = attendeeCounts[event.id] || 0;
  const free       = event.capacity - taken;
  const isFull     = free <= 0;
  const today      = new Date().toISOString().split("T")[0];
  const isPast     = event.date < today;

  return `
    <div class="card ${featured}" onclick="window.__openRecipeModal(${event.id})" style="animation-delay:${delay}s">
      <div class="card-badge badge-${event.category}">${event.category}</div>
      <div class="${isPast ? "time-label past" : "time-label upcoming"}">${isPast ? "Past" : "Upcoming"}</div>
      <div class="card-img-wrap">
        <img src="${event.image_url || "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"}"
             alt="${event.title}" loading="lazy"
             onerror="this.src='https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=60'">
        <button class="heart-btn ${isSaved ? "saved" : ""}" id="heart-${event.id}"
                onclick="event.stopPropagation(); window.__toggleSave(${event.id})"
                aria-label="${isSaved ? "Unsave" : "Save"} recipe">
          ${isSaved ? "♥" : "♡"}
        </button>
      </div>
      <div class="card-content">
        <h3>${event.title}</h3>
        <p>${event.description}</p>
        <div class="card-footer">
          <span>⏱ ${event.time_to_cook || 20} min</span>
          <span>📍 ${event.location}</span>
          <span class="card-spots-badge ${isFull ? "full" : ""}">
            ${isFull ? "Full 🔴" : `${taken}/${event.capacity} joined`}
          </span>
        </div>
      </div>
    </div>
  `;
}

// ── RecipeGrid ──────────────────────────────
function RecipeGrid({ events, loading, error, attendeeCounts, savedIds }) {
  if (loading) return `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading delicious recipes…</p>
    </div>`;

  if (error) return `
    <div class="empty-state">
      <p class="empty-emoji">⚠️</p>
      <h3>Could not connect to server</h3>
      <p>${error}</p>
      <button class="btn-primary" onclick="window.__loadEvents()">Try again</button>
    </div>`;

  if (!events.length) return `
    <div class="empty-state">
      <p class="empty-emoji">🥣</p>
      <h3>No recipes found</h3>
      <p>Try a different search or category.</p>
      <button class="btn-primary" onclick="window.__resetFilters()">Show all recipes</button>
    </div>`;

  return `
    <div id="recipe-grid" class="grid">
      ${events.map((ev, i) => RecipeCard(ev, i, attendeeCounts, savedIds)).join("")}
    </div>`;
}

// ── RecipeModal ─────────────────────────────
function RecipeModal() {
  return `
    <div id="recipeModal" class="modal" role="dialog" aria-modal="true">
      <div class="modal-overlay" onclick="window.__closeModal('recipeModal')"></div>
      <div class="modal-content recipe-modal-content">
        <button class="modal-close" onclick="window.__closeModal('recipeModal')">&times;</button>
        <div class="rmodal-img-wrap">
          <img id="recipeModalImg" src="" alt="">
          <div class="rmodal-badge" id="recipeModalBadge"></div>
        </div>
        <div class="rmodal-body">
          <h2 id="recipeModalTitle"></h2>
          <p id="recipeModalDesc" class="rmodal-desc"></p>
          <div class="rmodal-meta">
            <div class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              <span id="recipeModalTime"></span>
            </div>
            <div class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              <span id="recipeModalCapacity"></span>
            </div>
            <div class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span id="recipeModalDate"></span>
            </div>
            <div class="meta-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span id="recipeModalLocation"></span>
            </div>
          </div>
          <div class="capacity-wrap">
            <div class="capacity-label">
              <span>Available spots</span>
              <span id="spotsText"></span>
            </div>
            <div class="capacity-bar"><div class="capacity-fill" id="capacityFill"></div></div>
          </div>
          <button class="btn-primary btn-full" id="rmodalRegBtn">Reserve My Spot 🎀</button>
        </div>
      </div>
    </div>`;
}

// ── RegModal (with QR confirmation block) ✅ ─
function RegModal() {
  return `
    <div id="regModal" class="modal" role="dialog" aria-modal="true">
      <div class="modal-overlay" onclick="window.__closeModal('regModal')"></div>
      <div class="modal-content reg-modal-content">
        <button class="modal-close" onclick="window.__closeModal('regModal')">&times;</button>
        <div class="reg-icon">🎀</div>
        <h2 id="modalTitle">Reserve Your Spot</h2>
        <p id="modalSubtitle" class="modal-subtitle"></p>

        <form id="registrationForm" novalidate>
          <div class="input-group">
            <label for="fullName">Full Name</label>
            <input type="text" id="fullName" placeholder="Your full name" required>
            <span class="field-err" id="nameError"></span>
          </div>
          <div class="input-group">
            <label for="email">Email</label>
            <input type="email" id="email" placeholder="your@email.com" required>
            <span class="field-err" id="emailError"></span>
          </div>
          <div class="input-group">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" placeholder="555-XX-XX-XX" required>
            <span class="field-err" id="phoneError"></span>
          </div>
          <button type="submit" class="btn-primary btn-full">Reserve My Spot 🎀</button>
        </form>

        <p id="responseMsg" class="response-msg"></p>

        <!-- QR-style confirmation (shown after success) ✅ -->
        <div id="qrConfirm" class="qr-confirm" style="display:none">
          <div class="qr-box">
            <div class="qr-grid" id="qrGrid"></div>
          </div>
          <p class="qr-code" id="qrCode"></p>
          <p class="qr-label">Hi <strong id="qrName"></strong>, your spot is confirmed!</p>
          <p class="qr-hint">Screenshot this code — bring it to your class 🎀</p>
        </div>
      </div>
    </div>`;
}

// ── AdminPanel ──────────────────────────────
function AdminPanel() {
  return `
    <div id="adminLoginModal" class="modal" role="dialog">
      <div class="modal-overlay" onclick="window.__closeModal('adminLoginModal')"></div>
      <div class="modal-content admin-login-content">
        <button class="modal-close" onclick="window.__closeModal('adminLoginModal')">&times;</button>
        <div class="admin-login-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h2>Admin Access</h2>
        <p class="modal-subtitle">Enter your password to manage recipes.</p>
        <div class="input-group">
          <label for="adminPassword">Password</label>
          <input type="password" id="adminPassword" placeholder="Enter admin password">
          <span class="field-err" id="adminPasswordError"></span>
        </div>
        <button class="btn-primary btn-full" id="adminLoginBtn">Enter Admin Panel</button>
        <p class="admin-hint">Demo password: <code>admin</code></p>
      </div>
    </div>

    <div id="adminPanel" class="admin-panel" style="display:none">
      <div class="admin-overlay" onclick="window.__closeAdminPanel()"></div>
      <div class="admin-drawer">
        <div class="admin-drawer-header">
          <h2>Admin Panel</h2>
          <button class="modal-close" onclick="window.__closeAdminPanel()">&times;</button>
        </div>
        <div class="admin-tabs">
          <button class="admin-tab active" id="tabEvents"    onclick="window.__switchAdminTab('events',    this)">Events</button>
          <button class="admin-tab"        id="tabAdd"       onclick="window.__switchAdminTab('add',       this)">Add New</button>
          <button class="admin-tab"        id="tabAttendees" onclick="window.__switchAdminTab('attendees', this)">Attendees</button>
        </div>
        <div id="adminEvents" class="admin-section active"><div id="adminEventsList"></div></div>
        <div id="adminAdd" class="admin-section" style="display:none">
          <form id="adminForm">
            <input type="hidden" id="editEventId">
            <div class="input-group"><label>Title</label><input type="text" id="adminTitle" placeholder="Recipe title" required></div>
            <div class="input-group"><label>Description</label><textarea id="adminDesc" rows="3" placeholder="Short description" required></textarea></div>
            <div class="input-group">
              <label>Category</label>
              <select id="adminCategory"><option>Breakfast</option><option>Main Course</option><option>Dessert</option><option>Drink</option></select>
            </div>
            <div class="input-row">
              <div class="input-group"><label>Date</label><input type="date" id="adminDate" required></div>
              <div class="input-group"><label>Time</label><input type="time" id="adminTime" required></div>
            </div>
            <div class="input-group"><label>Location</label><input type="text" id="adminLocation" placeholder="Kitchen Studio A"></div>
            <div class="input-row">
              <div class="input-group"><label>Capacity</label><input type="number" id="adminCapacity" min="1" max="50" placeholder="8" required></div>
              <div class="input-group"><label>Cook Time (min)</label><input type="number" id="adminCookTime" min="1" placeholder="30"></div>
            </div>
            <div class="input-group"><label>Image URL</label><input type="url" id="adminImage" placeholder="https://images.unsplash.com/..."></div>
            <button type="submit" class="btn-primary btn-full" id="adminSubmitBtn">Add Recipe</button>
            <button type="button" class="btn-ghost btn-full" id="adminCancelEdit" style="display:none;margin-top:8px" onclick="window.__cancelAdminEdit()">Cancel</button>
          </form>
        </div>
        <div id="adminAttendees" class="admin-section" style="display:none">
          <div class="input-group">
            <label>Select Recipe</label>
            <select id="attendeeEventSelect" onchange="window.__loadAttendees(this.value)">
              <option value="">-- Choose a recipe --</option>
            </select>
          </div>
          <div id="attendeesList"></div>
        </div>
      </div>
    </div>

    <div id="savedModal" class="modal" role="dialog">
      <div class="modal-overlay" onclick="window.__closeModal('savedModal')"></div>
      <div class="modal-content saved-modal-content">
        <button class="modal-close" onclick="window.__closeModal('savedModal')">&times;</button>
        <h2>Saved Recipes</h2>
        <div id="savedList"></div>
      </div>
    </div>

    <div id="toast" class="toast" role="alert" aria-live="polite">
      <span id="toastIcon"></span>
      <span id="toastMsg"></span>
    </div>`;
}

// ── Root App ────────────────────────────────
export function App({ visibleEvents, attendeeCounts, filter, timeFilter, search, sort, loading, error, savedIds }) {
  return `
    ${Navbar()}
    <header class="hero">${Hero({ count: visibleEvents.length })}</header>
    <section class="controls container" id="controls">${Controls({ filter, timeFilter, search, sort })}</section>
    <main class="container" id="mainContent">
      ${RecipeGrid({ events: visibleEvents, loading, error, attendeeCounts, savedIds })}
    </main>
    ${RecipeModal()}
    ${RegModal()}
    ${AdminPanel()}
  `;
}
