import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { generateToken } from '../middlewares/auth.middleware.js';

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existing = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    // Hash password with bcrypt (10 rounds)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert user
    const insertResult = await query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, created_at',
      [email, passwordHash, fullName || email.split('@')[0]]
    );

    const newUser = insertResult.rows[0];

    // Generate JWT (24h validity)
    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name
    });

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        createdAt: newUser.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT (24h)
    const token = generateToken({
      id: user.id,
      email: user.email,
      fullName: user.full_name
    });

    return res.json({
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get currently authenticated user profile
 * GET /api/auth/me
 */
export async function getMe(req, res, next) {
  try {
    const result = await query('SELECT id, email, full_name, created_at FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const user = result.rows[0];
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at
      }
    });
  } catch (err) {
    next(err);
  }
}
