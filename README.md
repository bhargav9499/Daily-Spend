# DailySpend — Local Development Guide

A minimal full‑stack app to track daily spending. Frontend is **Angular 18 + TypeScript + Bootstrap**, backend is **Node.js (Express) + MySQL**. This README covers **local setup only** (no server/cloud steps).

---

## ✨ Features
- Manage **Categories** (SPEND / INCOME).
- Add, edit, delete **Transactions**.
- Responsive UI with Bootstrap.
- REST API with validation.
- Example **unit tests** for backend (Jest + Supertest) and frontend (Karma/Jasmine).

---

## 🧱 Tech Stack
- **Frontend:** Angular 18, TypeScript, Bootstrap 5, RxJS
- **Backend:** Node.js 20+, Express, mysql2, CORS, Morgan
- **Database:** MySQL or MariaDB
- **Tooling:** Jest + Supertest, Karma + Jasmine, Postman (optional), DBeaver (DB GUI)

---

## 📁 Repo Layout
```
DailySpend/
├── backend/
│   ├── src/
│   │   ├── db.js
│   │   └── server.js
│   ├── __tests__/            # backend tests
│   ├── jest.config.cjs
│   ├── package.json
│   └── .env                  # local env (not committed)
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── pages/
    │   │   │   └── categories/
    │   │   │       ├── categories.component.ts
    │   │   │       ├── categories.component.html
    │   │   │       ├── categories.component.scss
    │   │   │       └── categories.component.spec.ts   # example component test
    │   │   ├── services/
    │   │   │   ├── api.service.ts
    │   │   │   └── api.service.spec.ts                # example service test
    │   │   └── models.ts
    │   ├── environments/
    │   │   ├── environment.ts
    │   │   └── environment.development.ts
    ├── angular.json
    └── package.json
```

---

## ✅ Prerequisites
- **Node.js** ≥ 18 (20+ recommended) and **npm**
- **MySQL** (or **MariaDB**) running locally
- **DBeaver** (optional, to browse the DB)

---

## 🛢️ Database — Create Schema
Create a database and tables locally (you can run this in DBeaver or `mysql` CLI):
```sql
CREATE DATABASE IF NOT EXISTS dailyspend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE dailyspend;

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  type ENUM('SPEND','INCOME') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('SPEND','INCOME') NOT NULL,
  category_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method VARCHAR(50) NULL,
  note VARCHAR(255) NULL,
  txn_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_txn_cat FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

> **Tip:** In DBeaver, create a new connection → MySQL → host `localhost`, port `3306`, pick your user, then open the SQL editor and run the script above.

---

## 🔐 Backend — Environment
Create `backend/.env` (values shown are examples):
```dotenv
DB_HOST=localhost
DB_PORT=3306
DB_USER=dailyspend
DB_PASS=dailyspend123
DB_NAME=dailyspend
PORT=4000
```

Make sure the DB user exists (or use an existing user). Example to create a user with privileges:
```sql
CREATE USER 'dailyspend'@'%' IDENTIFIED BY 'dailyspend123';
GRANT ALL PRIVILEGES ON dailyspend.* TO 'dailyspend'@'%';
FLUSH PRIVILEGES;
```

---

## ▶️ Run Locally

### 1) Backend
```bash
cd backend
npm ci          # install deps
npm run dev     # start API on http://localhost:4000
```
Useful endpoints:
- `GET  /api/categories`
- `POST /api/categories`            `{ name, type }`
- `PUT  /api/categories/:id`        `{ name, type }`
- `DELETE /api/categories/:id`
- `GET  /api/transactions?year=2025&month=08&type=SPEND&category_id=1`
- `POST /api/transactions`          `{ type, category_id, amount, txn_date, method?, note? }`
- `PUT  /api/transactions/:id`      `{ ...same fields }`
- `DELETE /api/transactions/:id`

### 2) Frontend
Update the API base URL if needed: `frontend/src/environments/environment*.ts`
```ts
export const environment = {
  apiBase: 'http://localhost:4000'
};
```
Then run:
```bash
cd frontend
npm ci
npm start     # http://localhost:4200
```

---

## 🧪 Run Tests

### Backend (Jest + Supertest)
```bash
cd backend
npm test
```
What it does:
- Spins up the Express app in test mode.
- Calls the API with Supertest.
- Asserts on JSON responses / status codes.

### Frontend (Karma + Jasmine)
```bash
cd frontend
npm test
```
What it does:
- Runs Angular unit tests headlessly in Chrome.
- Example specs for `ApiService` and `CategoriesComponent`.

---

## 📬 Postman (optional)
You can import a Postman collection with sample requests that match the endpoints above.  
(If you create one, export it to `/postman/DailySpend.postman_collection.json` and share it.)

---

## 🧰 NPM Scripts (high‑level)
**Backend**
```json
{
  "dev": "nodemon src/server.js",
  "start": "node src/server.js",
  "test": "cross-env NODE_ENV=test jest -c jest.config.cjs --runInBand --detectOpenHandles"
}
```
**Frontend**
```json
{
  "start": "ng serve",
  "build": "ng build --configuration=production",
  "test": "ng test --watch=false --browsers=ChromeHeadless"
}
```

---

## 🧭 Troubleshooting

- **ER_ACCESS_DENIED_ERROR** – Check DB credentials in `backend/.env` and ensure the user has privileges.
- **API CORS issues** – The backend enables CORS by default; ensure `apiBase` is correct in Angular environment files.
- **Port in use** – Change `PORT` in `backend/.env` or stop the process that’s using it.
- **Angular build memory** – Close other apps; Node 18+ recommended.

---

## ✅ Done
You now have DailySpend running locally with a MySQL database, an Angular UI, and backend/frontend unit tests. Push your changes to GitHub and capture screenshots (UI, tests passing, DBeaver schema) for documentation.
