const express = require('express');
const router = express.Router();
const db = require('./database');

// --- Settings ---
router.get('/settings', (req, res) => {
    db.get("SELECT * FROM settings LIMIT 1", (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

router.post('/settings', (req, res) => {
    const { focusDuration, shortBreakDuration, longBreakDuration, dailyGoalHours } = req.body;
    db.run(
        `UPDATE settings SET focusDuration = ?, shortBreakDuration = ?, longBreakDuration = ?, dailyGoalHours = ? WHERE id = (SELECT id FROM settings LIMIT 1)`,
        [focusDuration, shortBreakDuration, longBreakDuration, dailyGoalHours],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Settings updated", changes: this.changes });
        }
    );
});

// --- Tasks ---
router.get('/tasks', (req, res) => {
    db.all("SELECT * FROM tasks ORDER BY createdAt DESC", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        // Convert completed from 0/1 to boolean
        const tasks = rows.map(t => ({ ...t, completed: !!t.completed }));
        res.json(tasks);
    });
});

router.post('/tasks', (req, res) => {
    const { id, title, completed, createdAt } = req.body;
    db.run(
        `INSERT INTO tasks (id, title, completed, createdAt) VALUES (?, ?, ?, ?)`,
        [id, title, completed ? 1 : 0, createdAt],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Task created", id });
        }
    );
});

router.patch('/tasks/:id', (req, res) => {
    const { title, completed } = req.body;

    // Build dynamic query
    let fields = [];
    let values = [];

    if (title !== undefined) {
        fields.push('title = ?');
        values.push(title);
    }

    if (completed !== undefined) {
        fields.push('completed = ?');
        values.push(completed ? 1 : 0);
    }

    if (fields.length === 0) {
        res.status(400).json({ error: "No fields to update" });
        return;
    }

    values.push(req.params.id);

    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;

    db.run(sql, values, function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: "Task updated", changes: this.changes });
    }
    );
});

router.delete('/tasks/:id', (req, res) => {
    db.run(
        `DELETE FROM tasks WHERE id = ?`,
        [req.params.id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Task deleted", changes: this.changes });
        }
    );
});

// --- Sessions ---
router.get('/sessions', (req, res) => {
    db.all("SELECT * FROM sessions ORDER BY completedAt ASC", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

router.post('/sessions', (req, res) => {
    const { id, mode, duration, completedAt } = req.body;
    db.run(
        `INSERT INTO sessions (id, mode, duration, completedAt) VALUES (?, ?, ?, ?)`,
        [id, mode, duration, completedAt],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Session recorded", id });
        }
    );
});

// --- Theme ---
router.get('/theme', (req, res) => {
    db.get("SELECT currentTheme FROM theme LIMIT 1", (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row ? row.currentTheme : 'nature');
    });
});

router.post('/theme', (req, res) => {
    const { theme } = req.body;
    db.run(
        `UPDATE theme SET currentTheme = ? WHERE id = (SELECT id FROM theme LIMIT 1)`,
        [theme],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: "Theme updated", changes: this.changes });
        }
    );
});

module.exports = router;
