# 🎀 Homemade.

> **Cook with love, eat with joy.**

[![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**Homemade.** is a full-stack platform for discovering and booking intimate cooking classes. Built for speed, simplicity, and great food, it features a custom REST API, a Vanilla JS frontend, and a persistent SQLite database.

---

## 🌟 Key Features

* **⚡ Dynamic Filtering:** Real-time search, category filtering, and multi-criteria sorting (Date, Duration, Name).
* **📅 Event Management:** Automated logic to separate "Upcoming" and "Past" classes.
* **🎫 Smart Booking:** Integrated registration system with capacity tracking and unique QR-style confirmation codes.
* **👤 User Persistence:** Account creation and login with automated form pre-filling for a seamless UX.
* **🔐 Admin Suite:** Protected dashboard for CRUD operations on events and real-time attendee tracking.
* **🌓 Dark Mode:** Theme-aware UI that persists across browser sessions using `localStorage`.
* **📱 Responsive Architecture:** Mobile-first design strategy with dedicated breakpoints for mobile, tablet, and desktop.

---

## 🛠 Technical Architecture

### Project Structure

```text
📂 Homemade.
├── 📂 frontend/          # Client-side logic & UI
│   ├── 📂 css/           # Modular stylesheets (Mobile-first)
│   ├── api.js            # Centralized Fetch API wrapper
│   ├── app.js            # Functional UI components
│   └── main.js           # State management & Event listeners
├── db.js                 # Database schema & Connection
├── server.js             # Express API & Middleware
├── seed.js               # Database hydration script
└── database.sqlite       # Local data storage (Auto-created)
```

## 🚀 Installation & Setup

1. **Clone & Install**
   ```bash
   git clone [https://github.com/Mia-Avalishvili/Homemade..git](https://github.com/Mia-Avalishvili/Homemade..git)
   cd Homemade.
   npm install
   ```

2. **Initialize Database**
   ```node seed.js```

3. **Launch**
   ```npm start```

   Visit: ```http://localhost:3000```


## 🔌 API Preview

### 📅 Events API
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/events` | `GET` | Fetch events (Supports search, category, sort) |
| `/api/events/:id` | `GET` | Get single event details |
| `/api/events/:id/register` | `POST` | Process booking & update capacity |


---


### 👤 Users API

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/users/signup` | `POST` | Create account with duplicate prevention |
| `/api/users/login` | `POST` | Authenticate user and retrieve profile |


---<img width="1680" height="928" alt="Screenshot 2026-03-31 at 6 06 33 AM" src="https://github.com/user-attachments/assets/ef50895d-5e1a-4b7c-b5bb-ad15a1b375d5" />

## 📸 Class Categories

| ☀️ Breakfast Workshops | 🍰 Dessert Classes |
| :---: | :---: |
| ![breakfast](https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&h=250&q=80) | ![dessert](https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&h=250&q=80) |
| **🥂 Mixology & Drinks** | **🍝 Main Courses** |
| ![drinks](https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=400&h=250&q=80) | ![pasta](https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=400&h=250&q=80) |

---


## 🧠 Lessons Learned

* **State Management:** Implementing a "Single Source of Truth" in Vanilla JS without external frameworks, ensuring the UI stays in sync with user actions.
* **Relational Logic:** Building a booking system that handles complex database relationships between events and attendees while preventing over-capacity.
* **Modular CSS:** Organizing styles into separate files (`reset.css`, `tablet.css`, `phone.css`) to follow a maintainable, mobile-first design pattern.

---

## 🛡 Security & Notes

* **Admin Access:** The default admin password is `admin`. **Warning:** Please update this before deploying to a live environment!
* **Persistence:** User login states and theme preferences (Dark Mode) are managed via `localStorage`.
* **Image Assets:** High-resolution imagery is provided by the Unsplash API. An active internet connection is required for photos to display correctly.

---

*Made with 🎀 by Mia Avalishvili.*
   
