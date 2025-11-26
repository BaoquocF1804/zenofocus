const express = require('express');
const router = express.Router();
const db = require('./database');
const { generateToken, hashPassword, comparePassword, authMiddleware } = require('./auth');

// Generate UUID
const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

// ==================== AUTH ROUTES ====================

// Register
router.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        db.get("SELECT id FROM users WHERE email = ?", [email.toLowerCase()], async (err, existingUser) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (existingUser) {
                return res.status(400).json({ error: 'Email already registered' });
            }

            const hashedPassword = await hashPassword(password);
            const userId = generateUUID();
            const createdAt = Date.now();

            db.run(
                "INSERT INTO users (id, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?)",
                [userId, email.toLowerCase(), hashedPassword, name || '', createdAt],
                function(err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    // Create default settings for user
                    db.run(
                        "INSERT INTO settings (user_id, focusDuration, shortBreakDuration, longBreakDuration, dailyGoalHours) VALUES (?, 25, 5, 15, 4)",
                        [userId]
                    );

                    // Create default theme for user
                    db.run(
                        "INSERT INTO theme (user_id, currentTheme) VALUES (?, 'nature')",
                        [userId]
                    );

                    const token = generateToken(userId);

                    res.status(201).json({
                        message: 'User registered successfully',
                        user: { id: userId, email: email.toLowerCase(), name: name || '' },
                        token
                    });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()], async (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user.id);

        res.json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, name: user.name },
            token
        });
    });
});

// Get current user
router.get('/auth/me', authMiddleware, (req, res) => {
    db.get("SELECT id, email, name, createdAt FROM users WHERE id = ?", [req.userId], (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    });
});

// ==================== SETTINGS ROUTES ====================

router.get('/settings', authMiddleware, (req, res) => {
    db.get("SELECT focusDuration, shortBreakDuration, longBreakDuration, dailyGoalHours FROM settings WHERE user_id = ?", [req.userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        
        // Return defaults if no settings found
        if (!row) {
            return res.json({
                focusDuration: 25,
                shortBreakDuration: 5,
                longBreakDuration: 15,
                dailyGoalHours: 4
            });
        }
        
        res.json(row);
    });
});

router.post('/settings', authMiddleware, (req, res) => {
    const { focusDuration, shortBreakDuration, longBreakDuration, dailyGoalHours } = req.body;
    
    // Check if settings exist for user
    db.get("SELECT id FROM settings WHERE user_id = ?", [req.userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            // Update existing
            db.run(
                `UPDATE settings SET focusDuration = ?, shortBreakDuration = ?, longBreakDuration = ?, dailyGoalHours = ? WHERE user_id = ?`,
                [focusDuration, shortBreakDuration, longBreakDuration, dailyGoalHours, req.userId],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: "Settings updated", changes: this.changes });
                }
            );
        } else {
            // Insert new
            db.run(
                `INSERT INTO settings (user_id, focusDuration, shortBreakDuration, longBreakDuration, dailyGoalHours) VALUES (?, ?, ?, ?, ?)`,
                [req.userId, focusDuration, shortBreakDuration, longBreakDuration, dailyGoalHours],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: "Settings created" });
                }
            );
        }
    });
});

// ==================== TASKS ROUTES ====================

router.get('/tasks', authMiddleware, (req, res) => {
    db.all("SELECT id, title, completed, createdAt FROM tasks WHERE user_id = ? ORDER BY createdAt DESC", [req.userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const tasks = rows.map(t => ({ ...t, completed: !!t.completed }));
        res.json(tasks);
    });
});

router.post('/tasks', authMiddleware, (req, res) => {
    const { id, title, completed, createdAt } = req.body;
    db.run(
        `INSERT INTO tasks (id, user_id, title, completed, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [id, req.userId, title, completed ? 1 : 0, createdAt],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Task created", id });
        }
    );
});

router.patch('/tasks/:id', authMiddleware, (req, res) => {
    const { title, completed } = req.body;

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
        return res.status(400).json({ error: "No fields to update" });
    }

    values.push(req.params.id);
    values.push(req.userId);

    const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;

    db.run(sql, values, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Task updated", changes: this.changes });
    });
});

router.delete('/tasks/:id', authMiddleware, (req, res) => {
    db.run(
        `DELETE FROM tasks WHERE id = ? AND user_id = ?`,
        [req.params.id, req.userId],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Task deleted", changes: this.changes });
        }
    );
});

// ==================== SESSIONS ROUTES ====================

router.get('/sessions', authMiddleware, (req, res) => {
    db.all("SELECT id, mode, duration, completedAt FROM sessions WHERE user_id = ? ORDER BY completedAt ASC", [req.userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

router.post('/sessions', authMiddleware, (req, res) => {
    const { id, mode, duration, completedAt } = req.body;
    db.run(
        `INSERT INTO sessions (id, user_id, mode, duration, completedAt) VALUES (?, ?, ?, ?, ?)`,
        [id, req.userId, mode, duration, completedAt],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Session recorded", id });
        }
    );
});

// ==================== THEME ROUTES ====================

router.get('/theme', authMiddleware, (req, res) => {
    db.get("SELECT currentTheme FROM theme WHERE user_id = ?", [req.userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row ? row.currentTheme : 'nature');
    });
});

router.post('/theme', authMiddleware, (req, res) => {
    const { theme } = req.body;
    
    db.get("SELECT id FROM theme WHERE user_id = ?", [req.userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            db.run(
                `UPDATE theme SET currentTheme = ? WHERE user_id = ?`,
                [theme, req.userId],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: "Theme updated", changes: this.changes });
                }
            );
        } else {
            db.run(
                `INSERT INTO theme (user_id, currentTheme) VALUES (?, ?)`,
                [req.userId, theme],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    res.json({ message: "Theme created" });
                }
            );
        }
    });
});

module.exports = router;
