import express from 'express';
import pool from '../database.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Signup
router.post('/signup', async (req: any, res: any) => {
  const { name, email, password, gender, dob, maritalStatus, mobile, aadhaar, state, district, areaType, occupation, income, education } = req.body;

  try {
    // Check if user exists
    const [existing]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result]: any = await pool.query(
      `INSERT INTO users (name, email, password, gender, dob, maritalStatus, mobile, aadhaar, state, district, areaType, occupation, income, education) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, gender, dob, maritalStatus, mobile, aadhaar, state, district, areaType, occupation, income, education]
    );

    const userId = result.insertId;
    const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

    res.status(201).json({ 
      token, 
      user: { id: userId, name, email, gender, dob, maritalStatus, mobile, aadhaar, state, district, areaType, occupation, income, education } 
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const [users]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });

    delete user.password;
    res.json({ token, user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
