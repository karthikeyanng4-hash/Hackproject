import express from 'express';
import pool from '../database.ts';

const router = express.Router();

// Get chat history for a user
router.get('/:userId', async (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const [chats]: any = await pool.query(
      'SELECT * FROM chats WHERE user_id = ? ORDER BY timestamp ASC',
      [userId]
    );
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save a new chat message
router.post('/', async (req: any, res: any) => {
  const { userId, message, sender } = req.body;
  try {
    const [result]: any = await pool.query(
      'INSERT INTO chats (user_id, message, sender) VALUES (?, ?, ?)',
      [userId, message, sender]
    );
    res.status(201).json({ id: result.insertId, userId, message, sender });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a message
router.put('/message/:chatId', async (req: any, res: any) => {
  const { chatId } = req.params;
  const { message } = req.body;
  try {
    await pool.query('UPDATE chats SET message = ? WHERE id = ?', [message, chatId]);
    res.json({ message: 'Message updated' });
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a single message
router.delete('/message/:chatId', async (req: any, res: any) => {
  const { chatId } = req.params;
  try {
    await pool.query('DELETE FROM chats WHERE id = ?', [chatId]);
    res.json({ message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Restart Chat (Clear all messages for a user)
router.delete('/user/:userId', async (req: any, res: any) => {
  const { userId } = req.params;
  try {
    await pool.query('DELETE FROM chats WHERE user_id = ?', [userId]);
    res.json({ message: 'Chat restarted' });
  } catch (error) {
    console.error('Error restarting chat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
