import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'gov_assist',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const initDB = async () => {
  const connection = await pool.getConnection();
  try {
    // Drop tables if we need to refactor types (Hackathon development mode)
    // Safety: only drop if we see INT where we need VARCHAR
    const [columns]: any = await connection.query("SHOW COLUMNS FROM schemes LIKE 'id'");
    if (columns.length > 0 && columns[0].Type.includes('int')) {
      console.log('Detected old INT id schema, dropping tables for refactor...');
      await connection.query('DROP TABLE IF EXISTS user_saved_schemes');
      await connection.query('DROP TABLE IF EXISTS schemes');
    }

    // Create Users table

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        gender VARCHAR(50),
        dob DATE,
        maritalStatus VARCHAR(50),
        mobile VARCHAR(20),
        aadhaar VARCHAR(20),
        state VARCHAR(100),
        district VARCHAR(100),
        areaType ENUM('Urban', 'Rural'),
        occupation VARCHAR(100),
        income INT,
        education VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Chats table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        message TEXT NOT NULL,
        sender ENUM('user', 'bot') NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create Schemes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schemes (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        eligibility TEXT,
        benefits TEXT,
        minimum_age INT,
        maximum_age INT,
        income_limit INT,
        occupation VARCHAR(100),
        education_required VARCHAR(100),
        documents_required TEXT,
        application_link VARCHAR(500),
        state_availability VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);


    // Create Personal Details / Documents table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        document_type VARCHAR(100),
        file_path VARCHAR(500),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create User Saved Schemes table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_saved_schemes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        scheme_id VARCHAR(50),
        saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_scheme (user_id, scheme_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (scheme_id) REFERENCES schemes(id) ON DELETE CASCADE
      )
    `);

    // Seed Schemes if empty
    const [rows]: any = await connection.query('SELECT COUNT(*) as count FROM schemes');
    if (rows[0].count === 0) {
      console.log('Seeding schemes from JSON...');
      const schemesData = JSON.parse(await import('fs').then(fs => fs.readFileSync('./src/data/schemes.json', 'utf8')));
      for (const scheme of schemesData) {
        await connection.query(
          `INSERT INTO schemes (id, name, description, category, minimum_age, maximum_age, income_limit, occupation, education_required, documents_required, application_link, state_availability) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            scheme.id, 
            scheme.name, 
            scheme.description, 
            scheme.category, 
            scheme.minimum_age, 
            scheme.maximum_age, 
            scheme.income_limit, 
            scheme.occupation, 
            scheme.education_required, 
            JSON.stringify(scheme.documents_required), 
            scheme.application_link, 
            scheme.state_availability
          ]
        );
      }
      console.log(`Seeded ${schemesData.length} schemes`);
    }

    console.log('Database tables initialized successfully');

  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    connection.release();
  }
};

export default pool;
