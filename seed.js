// ─────────────────────────────────────────────
// seed.js — run once to fill DB with 21 recipes
// Usage: node seed.js
// ─────────────────────────────────────────────

const { initDB } = require("./db");

const RECIPES = [
  { title: "Honey Pancakes",      category: "Breakfast",   date: "2025-08-15", time: "09:00", location: "Kitchen Studio A", capacity: 8,  time_to_cook: 15, description: "Fluffy buttermilk stack drizzled with raw wildflower honey and topped with macerated summer berries.", image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80" },
  { title: "Avocado Toast",       category: "Breakfast",   date: "2025-08-16", time: "10:00", location: "Kitchen Studio B", capacity: 6,  time_to_cook: 10, description: "Thick-cut sourdough with smashed avocado, poached egg, chili flakes and microgreens.", image_url: "https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?auto=format&fit=crop&w=800&q=80" },
  { title: "Pink Smoothie Bowl",  category: "Breakfast",   date: "2025-08-17", time: "09:30", location: "Kitchen Studio A", capacity: 10, time_to_cook: 8,  description: "Dragon fruit and frozen raspberry base crowned with granola, coconut flakes and edible flowers.", image_url: "https://images.unsplash.com/photo-1494597564530-811f0a97ac3d?auto=format&fit=crop&w=800&q=80" },
  { title: "Eggs Benedict",       category: "Breakfast",   date: "2025-08-18", time: "10:30", location: "Kitchen Studio C", capacity: 4,  time_to_cook: 20, description: "Perfectly poached eggs on toasted English muffins with smoked salmon and silky hollandaise.", image_url: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80" },
  { title: "Blueberry Waffles",   category: "Breakfast",   date: "2025-08-19", time: "09:00", location: "Kitchen Studio B", capacity: 8,  time_to_cook: 15, description: "Crispy golden waffles bursting with wild blueberries, served with warm berry compote and cream.", image_url: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=800&q=80" },
  { title: "Yogurt Parfait",      category: "Breakfast",   date: "2025-08-20", time: "08:30", location: "Kitchen Studio A", capacity: 12, time_to_cook: 5,  description: "Layers of thick Greek yogurt, house-made granola, seasonal jam and a drizzle of Manuka honey.", image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80" },
  { title: "Pasta Carbonara",     category: "Main Course", date: "2025-08-21", time: "13:00", location: "Kitchen Studio C", capacity: 6,  time_to_cook: 20, description: "Authentic Roman carbonara — guanciale, Pecorino Romano, egg yolks and a generous crack of black pepper.", image_url: "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80" },
  { title: "Rose Petal Pasta",    category: "Main Course", date: "2025-08-22", time: "14:00", location: "Kitchen Studio B", capacity: 4,  time_to_cook: 25, description: "Romantic linguine in a blush cream sauce kissed with dried rose petals, parmesan and pistachio.", image_url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=800&q=80" },
  { title: "Mushroom Risotto",    category: "Main Course", date: "2025-08-23", time: "13:30", location: "Kitchen Studio A", capacity: 6,  time_to_cook: 35, description: "Silky arborio rice with wild mushrooms, aged parmesan and a finishing drizzle of white truffle oil.", image_url: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80" },
  { title: "Grilled Salmon",      category: "Main Course", date: "2025-08-24", time: "13:00", location: "Kitchen Studio C", capacity: 5,  time_to_cook: 20, description: "Pan-seared salmon fillet with lemon beurre blanc, charred asparagus and dill oil.", image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80" },
  { title: "Chicken Alfredo",     category: "Main Course", date: "2025-08-25", time: "12:30", location: "Kitchen Studio B", capacity: 8,  time_to_cook: 25, description: "Tender grilled chicken breast tossed with fettuccine in a rich, velvety parmesan cream sauce.", image_url: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80" },
  { title: "Pink Velvet Macarons",category: "Dessert",     date: "2025-08-26", time: "15:00", location: "Pastry Studio",    capacity: 8,  time_to_cook: 60, description: "Delicate rose-water shells sandwiching a white chocolate and raspberry ganache — Paris in every bite.", image_url: "https://images.unsplash.com/photo-1569864358642-9d1619702663?auto=format&fit=crop&w=800&q=80" },
  { title: "Strawberry Shortcake",category: "Dessert",     date: "2025-08-27", time: "15:30", location: "Pastry Studio",    capacity: 6,  time_to_cook: 30, description: "Tender vanilla sponge layered with fresh macerated strawberries and lightly whipped cream.", image_url: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80" },
  { title: "Chocolate Soufflé",   category: "Dessert",     date: "2025-08-28", time: "16:00", location: "Pastry Studio",    capacity: 4,  time_to_cook: 30, description: "Impossibly light dark chocolate soufflé with a molten centre, served with vanilla crème anglaise.", image_url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80" },
  { title: "Lemon Tart",          category: "Dessert",     date: "2025-08-29", time: "15:00", location: "Pastry Studio",    capacity: 8,  time_to_cook: 45, description: "Vibrant citrus curd in a buttery pâte sucrée shell, finished with torched Italian meringue.", image_url: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=800&q=80" },
  { title: "Classic Tiramisu",    category: "Dessert",     date: "2025-08-30", time: "16:30", location: "Pastry Studio",    capacity: 10, time_to_cook: 30, description: "Espresso-soaked ladyfingers blanketed in mascarpone cream and dusted with premium cocoa powder.", image_url: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80" },
  { title: "Lavender Panna Cotta",category: "Dessert",     date: "2025-08-31", time: "15:00", location: "Pastry Studio",    capacity: 6,  time_to_cook: 20, description: "Silky Italian cream dessert infused with Provençal lavender, served with honey and fresh berries.", image_url: "https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=800&q=80" },
  { title: "Ceremonial Matcha",   category: "Drink",       date: "2025-09-01", time: "11:00", location: "Bar Studio",       capacity: 10, time_to_cook: 5,  description: "Premium Japanese ceremonial-grade matcha whisked to a vibrant frothy latte with oat milk.", image_url: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=80" },
  { title: "Caramel Macchiato",   category: "Drink",       date: "2025-09-02", time: "10:00", location: "Bar Studio",       capacity: 8,  time_to_cook: 5,  description: "Sweet vanilla syrup, velvety cold foam, and a bold slow-drip espresso pour — total indulgence.", image_url: "https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=800&q=80" },
  { title: "Rose Lemonade",       category: "Drink",       date: "2025-09-03", time: "11:30", location: "Bar Studio",       capacity: 12, time_to_cook: 10, description: "Fresh-squeezed lemon juice with rosewater syrup and a hibiscus float for that gorgeous pink hue.", image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80" },
  { title: "Peach Iced Tea",      category: "Drink",       date: "2025-09-04", time: "12:00", location: "Bar Studio",       capacity: 10, time_to_cook: 10, description: "Sun-brewed Darjeeling with ripe peach nectar, fresh mint and a wedge of lemon.", image_url: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&w=800&q=80" },
];

async function seed() {
  const db = await initDB();

  // Check if already seeded
  const { count } = await db.get("SELECT COUNT(*) as count FROM events");
  if (count > 0) {
    console.log(`Database already has ${count} events. Skipping seed.`);
    process.exit(0);
  }

  for (const recipe of RECIPES) {
    await db.run(
      `INSERT INTO events (title, description, date, time, location, category, capacity, time_to_cook, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [recipe.title, recipe.description, recipe.date, recipe.time,
       recipe.location, recipe.category, recipe.capacity,
       recipe.time_to_cook, recipe.image_url]
    );
  }

  console.log(`✅ Seeded ${RECIPES.length} recipes into the database!`);
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
