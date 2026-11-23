const express = require('express');
const app = express();
const port = 3000;
const db = require('./db');
app.use(express.json());

// Checks the request body. Returns an error message, or null if everything is there.
function validate(body) {
    const { description, amount, type, category } = body;
    if (!description) return 'We need a description';
    if (!amount) return 'We need a amount';
    if (!type) return 'We need a type';
    if (!category) return 'We need a category';
    return null;
}

// GET all transactions
app.get('/api/transactions', (req, res) => {
    db.all('SELECT * FROM transactions ORDER BY date, id', [], (err, rows) => {
        if (err) return res.status(500).send({ message: err.message });
        res.status(200).send(rows);
    });
});

// GET one transaction by id
app.get('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).send({ message: err.message });
        // db.get gives back undefined when nothing matched
        if (!row) return res.status(404).send({ message: 'transaction not found' });
        res.status(200).send(row);
    });
});

// POST a new transaction
app.post('/api/transactions', (req, res) => {
    const error = validate(req.body);
    if (error) return res.status(400).send({ message: error });

    const { description, amount, type, category } = req.body;
    const sql = 'INSERT INTO transactions (description, amount, type, category) VALUES (?, ?, ?, ?)';

    // Must be `function`, not an arrow, so `this.lastID` works
    db.run(sql, [description, amount, type, category], function (err) {
        if (err) return res.status(500).send({ message: err.message });

        // Look up the new row so the response includes its id and date
        db.get('SELECT * FROM transactions WHERE id = ?', [this.lastID], (err, row) => {
            if (err) return res.status(500).send({ message: err.message });
            res.status(201).send(row);
        });
    });
});

// PUT (update) a transaction
app.put('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const error = validate(req.body);
    if (error) return res.status(400).send({ message: error });

    const { description, amount, type, category } = req.body;
    const sql = 'UPDATE transactions SET description = ?, amount = ?, type = ?, category = ? WHERE id = ?';

    db.run(sql, [description, amount, type, category, id], function (err) {
        if (err) return res.status(500).send({ message: err.message });
        // this.changes = how many rows were updated. 0 means that id doesn't exist.
        if (this.changes === 0) return res.status(404).send({ message: 'transaction not found' });

        db.get('SELECT * FROM transactions WHERE id = ?', [id], (err, row) => {
            if (err) return res.status(500).send({ message: err.message });
            res.status(200).send(row);
        });
    });
});

// DELETE a transaction
app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM transactions WHERE id = ?', [id], function (err) {
        if (err) return res.status(500).send({ message: err.message });
        if (this.changes === 0) return res.status(404).send({ message: 'transaction not found' });
        res.status(200).send({ message: 'transaction deleted' });
    });
});

app.listen(
    port,
    () => console.log(`app is live at http://localhost:${port}`)
);
