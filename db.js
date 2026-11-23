const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./finance.db');

// Sample data that gets added the first time the database is created
const sampleTransactions = [
  ['Paycheck', 1200.00, 'income', 'salary', '2026-11-01'],
  ['Rent', 650.00, 'expense', 'rent', '2026-11-01'],
  ['Groceries', 54.32, 'expense', 'food', '2026-11-03'],
  ['Gas', 38.75, 'expense', 'transport', '2026-11-05'],
  ['Spotify', 11.99, 'expense', 'entertainment', '2026-11-06'],
  ['Chick-fil-A', 12.48, 'expense', 'food', '2026-11-08'],
  ['Tutoring', 80.00, 'income', 'side-gig', '2026-11-10'],
  ['Phone bill', 45.00, 'expense', 'bills', '2026-11-12'],
  ['New headphones', 89.99, 'expense', 'shopping', '2026-11-14'],
  ['Groceries', 41.10, 'expense', 'food', '2026-11-16'],
];

// serialize() makes these run one after another, in order
db.serialize(() => {
  // 1. Make the table (does nothing if it already exists)
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT    NOT NULL,
      amount      REAL    NOT NULL,
      type        TEXT    NOT NULL CHECK (type IN ('income', 'expense')),
      category    TEXT    NOT NULL,
      date        TEXT    NOT NULL DEFAULT (date('now', 'localtime'))
    )
  `);

  // 2. If the table is empty, add the sample data
  db.get('SELECT COUNT(*) AS count FROM transactions', [], (err, row) => {
    if (err) return console.error(err.message);
    if (row.count > 0) return;

    const insert = db.prepare(
      'INSERT INTO transactions (description, amount, type, category, date) VALUES (?, ?, ?, ?, ?)'
    );
    sampleTransactions.forEach((t) => insert.run(t));
    insert.finalize();
    console.log('Added sample transactions to the database');
  });
});

module.exports = db;
