const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'zenfocus-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Hash password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

// Auth middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.userId = decoded.userId;
    next();
};

// Optional auth middleware (doesn't fail if no token, just sets userId if available)
const optionalAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);
        if (decoded) {
            req.userId = decoded.userId;
        }
    }
    next();
};

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword,
    authMiddleware,
    optionalAuthMiddleware,
    JWT_SECRET
};

