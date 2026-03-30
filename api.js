// ─────────────────────────────────────────────
// api.js — all communication with the backend
// ─────────────────────────────────────────────

const API_BASE = "http://localhost:3000/api/events";

export async function fetchEvents({ search = "", category = "All", sort = "default" } = {}) {
  const params = new URLSearchParams();
  if (search.trim())      params.append("search",   search.trim());
  if (category !== "All") params.append("category", category);
  if (sort !== "default") params.append("sort",     sort);

  const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load events");
  return res.json();
}

export async function createEvent(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

export async function updateEvent(id, payload) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

export async function deleteEvent(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
}

export async function registerForEvent(id, payload) {
  const res = await fetch(`${API_BASE}/${id}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, error: data.error || data.message };
  return data;
}

export async function fetchAttendees(id) {
  const res = await fetch(`${API_BASE}/${id}/attendees`);
  if (!res.ok) throw new Error("Failed to load attendees");
  return res.json();
}
