import db from '../config/database.js';
import crypto from 'crypto';

// Generate certificate for user
export const generateCertificate = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user has completed all stages
    const completionCheck = await new Promise((resolve, reject) => {
      db.get(
        `SELECT
          COUNT(DISTINCT sr.stage_id) as completed_stages
         FROM stage_results sr
         JOIN stages s ON sr.stage_id = s.id
         WHERE sr.user_id = ? AND sr.passed = 1 AND s.stage_number BETWEEN 1 AND 5`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    // User must complete all 5 stages (1-4 + Final)
    if (completionCheck.completed_stages < 5) {
      return res.status(400).json({
        message: 'Complete all stages including the final exam to earn a certificate',
        completed: completionCheck.completed_stages,
        required: 5
      });
    }

    // Check if certificate already exists
    const existing = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM certificates WHERE user_id = ?',
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (existing) {
      return res.json({
        message: 'Certificate already issued',
        certificate: existing
      });
    }

    // Generate unique certificate code
    const certificateCode = crypto.randomBytes(8).toString('hex').toUpperCase();

    // Create certificate
    const certificate = await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO certificates (user_id, certificate_code) VALUES (?, ?)',
        [userId, certificateCode],
        function(err) {
          if (err) {
            reject(err);
          } else {
            db.get(
              'SELECT * FROM certificates WHERE id = ?',
              [this.lastID],
              (err2, row) => {
                if (err2) reject(err2);
                else resolve(row);
              }
            );
          }
        }
      );
    });

    res.status(201).json({
      message: 'Certificate generated successfully!',
      certificate
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Error generating certificate', error: error.message });
  }
};

// Get user's certificate
export const getUserCertificate = async (req, res) => {
  try {
    const userId = req.user.id;

    const certificate = await new Promise((resolve, reject) => {
      db.get(
        `SELECT c.*, u.name as user_name, u.email
         FROM certificates c
         JOIN users u ON c.user_id = u.id
         WHERE c.user_id = ?`,
        [userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!certificate) {
      return res.status(404).json({ message: 'No certificate found' });
    }

    res.json({ certificate });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ message: 'Error fetching certificate', error: error.message });
  }
};

// Verify certificate by code (public)
export const verifyCertificate = async (req, res) => {
  try {
    const { code } = req.params;

    const certificate = await new Promise((resolve, reject) => {
      db.get(
        `SELECT c.*, u.name as user_name
         FROM certificates c
         JOIN users u ON c.user_id = u.id
         WHERE c.certificate_code = ?`,
        [code],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found'
      });
    }

    res.json({
      valid: true,
      certificate: {
        code: certificate.certificate_code,
        userName: certificate.user_name,
        issuedAt: certificate.issued_at
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Error verifying certificate', error: error.message });
  }
};

export default { generateCertificate, getUserCertificate, verifyCertificate };
