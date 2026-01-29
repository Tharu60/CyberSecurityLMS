import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'lms_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection and initialize database
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database');

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        government_id VARCHAR(100) UNIQUE NOT NULL,
        role ENUM('student', 'instructor', 'admin') NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS stages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        stage_number INT NOT NULL,
        total_questions INT NOT NULL,
        passing_score INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        stage_id INT NOT NULL,
        question_text TEXT NOT NULL,
        option_a TEXT NOT NULL,
        option_b TEXT NOT NULL,
        option_c TEXT NOT NULL,
        option_d TEXT NOT NULL,
        correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT PRIMARY KEY AUTO_INCREMENT,
        stage_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        description TEXT,
        order_number INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        current_stage INT DEFAULT 0,
        initial_assessment_completed TINYINT(1) DEFAULT 0,
        initial_assessment_score INT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS stage_results (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        stage_id INT NOT NULL,
        score INT NOT NULL,
        total_questions INT NOT NULL,
        passed TINYINT(1) NOT NULL,
        attempt_number INT DEFAULT 1,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (stage_id) REFERENCES stages(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS video_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        video_id INT NOT NULL,
        completed TINYINT(1) DEFAULT 0,
        last_watched_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        certificate_code VARCHAR(255) UNIQUE NOT NULL,
        issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS GOV_OFFICERS (
        id INT PRIMARY KEY AUTO_INCREMENT,
        GOV_NIC_NO VARCHAR(20) UNIQUE NOT NULL,
        Full_Name VARCHAR(255) NOT NULL,
        Contact_Number VARCHAR(20) NOT NULL,
        Email VARCHAR(255) UNIQUE NOT NULL,
        GOV_Institute VARCHAR(255) NOT NULL,
        Date_Of_Join DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert sample data for GOV_OFFICERS if table is empty
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM GOV_OFFICERS');
    if (rows[0].count === 0) {
      await connection.query(`
        INSERT INTO GOV_OFFICERS (GOV_NIC_NO, Full_Name, Contact_Number, Email, GOV_Institute, Date_Of_Join) VALUES
        ('PMAS/25634', 'Kamal Perera', '0771234567', 'kamal.perera@gov.lk', 'Ministry of Defence', '2020-03-15'),
        ('DEFN/18742', 'Nimal Silva', '0762345678', 'nimal.silva@gov.lk', 'Sri Lanka Police', '2019-07-22'),
        ('SLAF/30125', 'Sunil Fernando', '0753456789', 'sunil.fernando@gov.lk', 'Sri Lanka Air Force', '2021-01-10'),
        ('NAVY/42589', 'Ruwan Jayawardena', '0714567890', 'ruwan.jayawardena@gov.lk', 'Sri Lanka Navy', '2018-11-05'),
        ('ARMY/55321', 'Chaminda Bandara', '0725678901', 'chaminda.bandara@gov.lk', 'Sri Lanka Army', '2022-06-18'),
        ('SLPD/67894', 'Priya Kumari', '0776789012', 'priya.kumari@gov.lk', 'Sri Lanka Police Department', '2020-09-30'),
        ('MOFA/78456', 'Lakshmi Wickramasinghe', '0767890123', 'lakshmi.wickramasinghe@gov.lk', 'Ministry of Foreign Affairs', '2017-04-12'),
        ('ICTA/89012', 'Ashan Rathnayake', '0758901234', 'ashan.rathnayake@gov.lk', 'ICTA Sri Lanka', '2023-02-28'),
        ('CERT/91234', 'Dinesh Gunawardena', '0719012345', 'dinesh.gunawardena@gov.lk', 'Sri Lanka CERT', '2021-08-14'),
        ('TRCL/10567', 'Malini Samaraweera', '0720123456', 'malini.samaraweera@gov.lk', 'Telecommunications Regulatory Commission', '2019-12-01')
      `);
      console.log('Sample GOV_OFFICERS data inserted');
    }

    console.log('Database tables initialized');
    connection.release();
  } catch (error) {
    console.error('Error initializing database:', error.message);
    throw error;
  }
}

// Initialize on startup
initializeDatabase().catch(console.error);

export default pool;
