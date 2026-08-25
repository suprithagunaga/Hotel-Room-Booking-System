# Hotel Room Booking System

A full-stack hotel room booking system built using **React.js, Node.js, Express.js, PostgreSQL, MongoDB, and Redis**.

The system allows users to book rooms for specific date ranges while preventing overlapping bookings, including during concurrent booking requests.

## ✨ Features

* User registration and JWT login
* Book rooms with check-in/check-out dates
* View room bookings
* Prevent overlapping bookings
* PostgreSQL transactions with row-level locking
* Redis caching and rate limiting
* MongoDB activity/audit logs
* Input validation and error handling

## 🛠️ Tech Stack

* **Frontend:** React.js
* **Backend:** Node.js + Express.js
* **Primary Database:** PostgreSQL
* **Secondary Database:** MongoDB
* **Cache:** Redis
* **Authentication:** JWT + bcrypt

## 🏗️ Architecture

```text
React.js
   ↓
Node.js + Express.js
   ↓
 ┌───────────┬───────────┐
 ↓           ↓           ↓
Redis    PostgreSQL   MongoDB
Cache    Bookings     Logs
         & Users
```

## 🔐 Concurrency Handling

Booking requests are processed inside a **PostgreSQL transaction**.

The selected room row is locked using row-level locking before checking availability. This ensures that when two users try to book the same room for overlapping dates, only one request succeeds.

```text
Request → Transaction → Lock Room
                    ↓
              Check Overlap
                ↓       ↓
              Free    Already Booked
               ↓           ↓
             Book       409 Conflict
```

Checkout and the next guest's check-in can occur on the same date.

## 🔌 Main APIs

| Method | Endpoint                  | Purpose            |
| ------ | ------------------------- | ------------------ |
| POST   | `/api/auth/register`      | Register           |
| POST   | `/api/auth/login`         | Login              |
| GET    | `/api/rooms`              | View rooms         |
| POST   | `/api/bookings`           | Create booking     |
| GET    | `/api/rooms/:id/bookings` | View room bookings |

## ⚙️ Setup

```bash
git clone <YOUR_GITHUB_REPO>
cd hotel-room-booking
npm install
```

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=your_postgresql_url
MONGO_URI=your_mongodb_url
REDIS_URL=your_redis_url
JWT_SECRET=your_secret
```

Start the backend:

```bash
npm run dev
```

Start the React frontend:

```bash
npm start
```

## 🧪 Concurrency Test

Example:

```text
Guest A → Room 101 → 10th–12th → ✅ Confirmed
Guest B → Room 101 → 10th–12th → ❌ Rejected
```

Only one overlapping booking is created.

## 📁 Project Structure

```text
hotel-room-booking/
├── client/
├── server/
├── database/
├── .env.example
└── README.md
```

## 👩‍💻 Author

**Supritha**
4MW23CS167
Computer Science & Engineering
SMVITM
