import express from 'express';
import pool from '../database.ts';

const router = express.Router();

// Get all schemes
router.get('/', async (req: any, res: any) => {
  try {
    const [schemes]: any = await pool.query('SELECT * FROM schemes ORDER BY created_at DESC');
    const parsedSchemes = schemes.map((s: any) => ({
      ...s,
      documents_required: typeof s.documents_required === 'string' ? JSON.parse(s.documents_required) : s.documents_required
    }));
    res.json(parsedSchemes);

  } catch (error) {
    console.error('Error fetching schemes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a new scheme
router.post('/', async (req: any, res: any) => {
  const { name, description, category, eligibility, benefits } = req.body;
  try {
    const [result]: any = await pool.query(
      'INSERT INTO schemes (name, description, category, eligibility, benefits) VALUES (?, ?, ?, ?, ?)',
      [name, description, category, eligibility, benefits]
    );
    res.status(201).json({ id: result.insertId, name, description, category, eligibility, benefits });
  } catch (error) {
    console.error('Error adding scheme:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get saved schemes for a user
router.get('/saved/:userId', async (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const [saved]: any = await pool.query(
      `SELECT s.* FROM schemes s 
       JOIN user_saved_schemes uss ON s.id = uss.scheme_id 
       WHERE uss.user_id = ?`, 
      [userId]
    );
    const parsedSaved = saved.map((s: any) => ({
      ...s,
      documents_required: typeof s.documents_required === 'string' ? JSON.parse(s.documents_required) : s.documents_required
    }));
    res.json(parsedSaved);

  } catch (error) {
    console.error('Error fetching saved schemes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save a scheme for a user
router.post('/save', async (req: any, res: any) => {
  const { userId, schemeId } = req.body;
  try {
    await pool.query(
      'INSERT IGNORE INTO user_saved_schemes (user_id, scheme_id) VALUES (?, ?)',
      [userId, schemeId]
    );
    res.status(201).json({ message: 'Scheme saved successfully' });
  } catch (error) {
    console.error('Error saving scheme:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Unsave a scheme for a user
router.post('/unsave', async (req: any, res: any) => {
  const { userId, schemeId } = req.body;
  try {
    await pool.query(
      'DELETE FROM user_saved_schemes WHERE user_id = ? AND scheme_id = ?',
      [userId, schemeId]
    );
    res.json({ message: 'Scheme unsaved successfully' });
  } catch (error) {
    console.error('Error unsaving scheme:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;

