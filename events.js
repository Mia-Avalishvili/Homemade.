const express = require("express");
const { getDB } = require("../db");

const router = express.Router();

// ─────────────────────────────────────────────
// GET /api/events
// All events — supports ?search=, ?category=, ?sort=date-asc|date-desc
// ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const { search, category, sort } = req.query;

    let sql = "SELECT * FROM events WHERE 1=1";
    const params = [];

    if (search) {
      sql += " AND title LIKE ?";
      params.push(`%${search}%`);
    }

    if (category && category !== "All") {
      sql += " AND category = ?";
      params.push(category);
    }

    if (sort === "date-asc")  sql += " ORDER BY date ASC";
    else if (sort === "date-desc") sql += " ORDER BY date DESC";
    else sql += " ORDER BY id DESC";

    const events = await db.all(sql, params);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/events/:id
// Single event
// ─────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const event = await db.get("SELECT * FROM events WHERE id = ?", [id]);

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event", error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/events
// Create new event (admin)
// ─────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const { title, description, date, time, location, category, capacity, time_to_cook, image_url } = req.body;

    if (!title || !description || !date || !time || !location || !category || !capacity) {
      return res.status(400).json({ message: "title, description, date, time, location, category and capacity are required" });
    }

    const result = await db.run(
      `INSERT INTO events (title, description, date, time, location, category, capacity, time_to_cook, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, date, time, location, category, capacity, time_to_cook || 20, image_url || null]
    );

    const newEvent = await db.get("SELECT * FROM events WHERE id = ?", [result.lastID]);
    res.status(201).json(newEvent);
  } catch (error) {
    res.status(500).json({ message: "Failed to create event", error: error.message });
  }
});

// ─────────────────────────────────────────────
// PUT /api/events/:id
// Update event (admin)
// ─────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const existing = await db.get("SELECT * FROM events WHERE id = ?", [id]);

    if (!existing) return res.status(404).json({ message: "Event not found" });

    const { title, description, date, time, location, category, capacity, time_to_cook, image_url } = req.body;

    await db.run(
      `UPDATE events
       SET title=?, description=?, date=?, time=?, location=?, category=?, capacity=?, time_to_cook=?, image_url=?
       WHERE id=?`,
      [
        title       ?? existing.title,
        description ?? existing.description,
        date        ?? existing.date,
        time        ?? existing.time,
        location    ?? existing.location,
        category    ?? existing.category,
        capacity    ?? existing.capacity,
        time_to_cook ?? existing.time_to_cook,
        image_url   ?? existing.image_url,
        id,
      ]
    );

    const updated = await db.get("SELECT * FROM events WHERE id = ?", [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event", error: error.message });
  }
});

// ─────────────────────────────────────────────
// DELETE /api/events/:id
// Delete event (admin)
// ─────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = Number(req.params.id);
    const existing = await db.get("SELECT * FROM events WHERE id = ?", [id]);

    if (!existing) return res.status(404).json({ message: "Event not found" });

    await db.run("DELETE FROM events WHERE id = ?", [id]);
    res.json({ message: "Event deleted successfully", deletedEvent: existing });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error: error.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/events/:id/register
// Register for an event
// ─────────────────────────────────────────────
router.post("/:id/register", async (req, res) => {
  try {
    const db = getDB();
    const eventId = Number(req.params.id);
    const { fullName, email, phone } = req.body;

    if (!fullName || !email || !phone) {
      return res.status(400).json({ message: "fullName, email and phone are required" });
    }

    // Check event exists
    const event = await db.get("SELECT * FROM events WHERE id = ?", [eventId]);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Check capacity
    const { count } = await db.get(
      "SELECT COUNT(*) as count FROM registrations WHERE eventId = ?",
      [eventId]
    );
    if (count >= event.capacity) {
      return res.status(400).json({ error: "Event is full" });
    }

    // Check duplicate email
    const duplicate = await db.get(
      "SELECT id FROM registrations WHERE eventId = ? AND email = ?",
      [eventId, email.toLowerCase()]
    );
    if (duplicate) {
      return res.status(400).json({ error: "Duplicate Email" });
    }

    const result = await db.run(
      `INSERT INTO registrations (eventId, fullName, email, phone) VALUES (?, ?, ?, ?)`,
      [eventId, fullName, email.toLowerCase(), phone]
    );

    const newReg = await db.get("SELECT * FROM registrations WHERE id = ?", [result.lastID]);
    res.status(201).json(newReg);
  } catch (error) {
    res.status(500).json({ message: "Failed to register", error: error.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/events/:id/attendees
// Get all attendees for an event (admin)
// ─────────────────────────────────────────────
router.get("/:id/attendees", async (req, res) => {
  try {
    const db = getDB();
    const eventId = Number(req.params.id);

    const event = await db.get("SELECT * FROM events WHERE id = ?", [eventId]);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const attendees = await db.all(
      "SELECT * FROM registrations WHERE eventId = ? ORDER BY createdAt DESC",
      [eventId]
    );

    res.json(attendees);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch attendees", error: error.message });
  }
});

module.exports = router;