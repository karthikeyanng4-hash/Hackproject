import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../database.ts';

const router = express.Router();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userName = req.body.userName || 'unknown';
    const userDir = path.join(process.cwd(), 'uploads', userName);
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Upload document
router.post('/upload', upload.single('document'), async (req: any, res: any) => {
  const { userId, documentType } = req.body;
  const filePath = req.file ? req.file.path : null;

  if (!filePath) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const [result]: any = await pool.query(
      'INSERT INTO documents (user_id, document_type, file_path) VALUES (?, ?, ?)',
      [userId, documentType, filePath]
    );
    res.status(201).json({ id: result.insertId, userId, documentType, filePath });
  } catch (error) {
    console.error('Error saving document path:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user documents (with auto-sync check)
router.get('/documents/:userId', async (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const [docs]: any = await pool.query('SELECT * FROM documents WHERE user_id = ?', [userId]);
    
    // Auto-sync: Filter out docs whose files are missing from disk
    const validDocs = [];
    for (const doc of docs) {
      if (doc.file_path && fs.existsSync(doc.file_path)) {
        validDocs.push(doc);
      } else {
        // Automatically remove from database if file not found in local folder
        console.log(`Auto-removing missing file record from DB: ${doc.file_path}`);
        await pool.query('DELETE FROM documents WHERE id = ?', [doc.id]);
      }
    }
    
    res.json(validDocs);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete document
router.delete('/documents/:docId', async (req: any, res: any) => {
  const { docId } = req.params;
  console.log(`Attempting to delete document ID: ${docId}`);
  try {
    // 1. Get file path first
    const [docs]: any = await pool.query('SELECT file_path FROM documents WHERE id = ?', [docId]);
    if (docs.length === 0) {
      // If doc not in DB, it's already "deleted" from our perspective
      return res.json({ message: 'Document already removed' });
    }

    const filePath = docs[0].file_path;

    // 2. Delete from database
    await pool.query('DELETE FROM documents WHERE id = ?', [docId]);
    console.log(`Deleted record ${docId} from database`);

    // 3. Delete physical file if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted physical file: ${filePath}`);
      } catch (err) {
        console.error(`Error deleting physical file: ${filePath}`, err);
        // We still return 200/success because the DB record is gone, 
        // which matches the user's "neat" goal for the UI.
      }
    } else {
      console.log(`Physical file already missing: ${filePath}`);
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user personal details from DB
router.get('/:userId', async (req: any, res: any) => {
    const { userId } = req.params;
    try {
      const [users]: any = await pool.query('SELECT name, email, gender, dob, maritalStatus, mobile, aadhaar, state, district, areaType, occupation, income, education FROM users WHERE id = ?', [userId]);
      if (users.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(users[0]);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

export default router;
