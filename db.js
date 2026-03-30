const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let db;

async function initDB() {
  db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  // Events table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL,
      date        TEXT    NOT NULL,
      time        TEXT    NOT NULL,
      location    TEXT    NOT NULL,
      category    TEXT    NOT NULL,
      capacity    INTEGER NOT NULL,
      time_to_cook INTEGER DEFAULT 20,
      image_url   TEXT,
      createdAt   TEXT    DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Registrations table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS registrations (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId   INTEGER NOT NULL,
      fullName  TEXT    NOT NULL,
      email     TEXT    NOT NULL,
      phone     TEXT    NOT NULL,
      createdAt TEXT    DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  console.log("SQLite database connected ✅");
  return db;
}

function getDB() {
  if (!db) throw new Error("Database not initialized");
  return db;
}

module.exports = { initDB, getDB };