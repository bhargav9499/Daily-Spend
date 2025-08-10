import express from "express";
import cors from "cors";
import morgan from "morgan";
import { pool, testConnection } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// helpers
const pad = (n) => String(n).padStart(2, "0");
const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);

// health
app.get("/", async (_req, res) => {
  try {
    await testConnection();
    res.send("DailySpend API OK");
  } catch (e) {
    res.status(500).send("DB connection error: " + e.message);
  }
});

// CATEGORIES
// Create category
app.post("/api/categories", async (req, res) => {
  try {
    const { name, type } = req.body || {};
    if (!name || !["SPEND", "INCOME"].includes(type)) {
      return res.status(400).json({ error: "name & valid type required" });
    }
    const [r] = await pool.query(
      "INSERT INTO categories (name,type) VALUES (?,?)",
      [name.trim(), type]
    );
    const [rows] = await pool.query("SELECT * FROM categories WHERE id=?", [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "category already exists" });
    res.status(500).json({ error: e.message });
  }
});

// List categories (optional type filter)
app.get("/api/categories", async (req, res) => {
  try {
    const { type } = req.query;
    if (type && !["SPEND", "INCOME"].includes(type)) {
      return res.status(400).json({ error: "invalid type" });
    }
    const sql = type
      ? "SELECT * FROM categories WHERE type=? ORDER BY name"
      : "SELECT * FROM categories ORDER BY type,name";
    const [rows] = await pool.query(sql, type ? [type] : []);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update category
app.put("/api/categories/:id", async (req, res) => {
  try {
    const id = +req.params.id;
    const { name, type } = req.body || {};
    if (!id || !name || !["SPEND", "INCOME"].includes(type)) {
      return res.status(400).json({ error: "id, name, type required" });
    }
    const [r] = await pool.query("UPDATE categories SET name=?, type=? WHERE id=?", [
      name.trim(),
      type,
      id,
    ]);
    if (!r.affectedRows) return res.status(404).json({ error: "not found" });
    const [rows] = await pool.query("SELECT * FROM categories WHERE id=?", [id]);
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete category (blocked if used by transactions)
app.delete("/api/categories/:id", async (req, res) => {
  try {
    const id = +req.params.id;
    const [used] = await pool.query("SELECT 1 FROM transactions WHERE category_id=? LIMIT 1", [id]);
    if (used.length) return res.status(409).json({ error: "category in use" });
    const [r] = await pool.query("DELETE FROM categories WHERE id=?", [id]);
    if (!r.affectedRows) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// TRANSACTIONS
// Create transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const { type, category_id, amount, txn_date, method, note } = req.body || {};
    if (!["SPEND", "INCOME"].includes(type)) return res.status(400).json({ error: "invalid type" });
    if (!category_id || amount == null || Number(amount) < 0)
      return res.status(400).json({ error: "category_id & amount>=0 required" });
    if (!isDate(txn_date)) return res.status(400).json({ error: "txn_date must be YYYY-MM-DD" });

    const [cats] = await pool.query("SELECT id,type FROM categories WHERE id=?", [category_id]);
    if (!cats.length) return res.status(400).json({ error: "unknown category" });
    if (cats[0].type !== type) return res.status(400).json({ error: "category type mismatch" });

    const [r] = await pool.query(
      "INSERT INTO transactions (type,category_id,amount,method,note,txn_date) VALUES (?,?,?,?,?,?)",
      [type, category_id, Number(amount), method || null, note || null, txn_date]
    );
    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name
         FROM transactions t JOIN categories c ON c.id=t.category_id
        WHERE t.id=?`,
      [r.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Update transaction
app.put("/api/transactions/:id", async (req, res) => {
  try {
    const id = +req.params.id;
    const { type, category_id, amount, txn_date, method, note } = req.body || {};
    if (!id) return res.status(400).json({ error: "invalid id" });
    if (!["SPEND", "INCOME"].includes(type)) return res.status(400).json({ error: "invalid type" });
    if (!category_id || amount == null || Number(amount) < 0)
      return res.status(400).json({ error: "category_id & amount>=0 required" });
    if (!isDate(txn_date)) return res.status(400).json({ error: "txn_date must be YYYY-MM-DD" });

    const [cats] = await pool.query("SELECT id,type FROM categories WHERE id=?", [category_id]);
    if (!cats.length) return res.status(400).json({ error: "unknown category" });
    if (cats[0].type !== type) return res.status(400).json({ error: "category type mismatch" });

    const [r] = await pool.query(
      `UPDATE transactions
          SET type=?, category_id=?, amount=?, method=?, note=?, txn_date=?
        WHERE id=?`,
      [type, category_id, Number(amount), method || null, note || null, txn_date, id]
    );
    if (!r.affectedRows) return res.status(404).json({ error: "not found" });

    const [rows] = await pool.query(
      `SELECT t.*, c.name AS category_name
         FROM transactions t JOIN categories c ON c.id=t.category_id
        WHERE t.id=?`,
      [id]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Delete transaction
app.delete("/api/transactions/:id", async (req, res) => {
  try {
    const [r] = await pool.query("DELETE FROM transactions WHERE id=?", [+req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: "not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List transactions (month/year, optional type/category)
app.get("/api/transactions", async (req, res) => {
  try {
    const { year, month, type, category_id } = req.query;
    if (!year || !month) return res.status(400).json({ error: "year & month required" });

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const last = new Date(y, m, 0).getDate();
    const start = `${y}-${pad(m)}-01`;
    const end = `${y}-${pad(m)}-${pad(last)}`;

    let sql =
      `SELECT t.*, c.name AS category_name
         FROM transactions t JOIN categories c ON c.id=t.category_id
        WHERE t.txn_date BETWEEN ? AND ?`;
    const params = [start, end];

    if (type) {
      if (!["SPEND", "INCOME"].includes(type)) return res.status(400).json({ error: "invalid type" });
      sql += " AND t.type=?";
      params.push(type);
    }
    if (category_id) {
      sql += " AND t.category_id=?";
      params.push(+category_id);
    }
    sql += " ORDER BY t.txn_date DESC, t.id DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// start
const PORT = process.env.PORT || 4000;

// Only start the HTTP server when NOT running tests
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
}

// Make the Express app importable by Jest
export default app;