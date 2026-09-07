const express = require('express');
const router = express.Router();
const multer = require('multer');
const { pool } = require('../server');
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

const upload = multer({ storage: multer.memoryStorage() });

// Upload video
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { description, userId } = req.body;
    
    // Upload to S3
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: `videos/${Date.now()}.mp4`,
      Body: req.file.buffer
    };
    
    const s3Result = await s3.upload(params).promise();
    
    // Save to database
    const result = await pool.query(
      'INSERT INTO videos (user_id, title, video_url, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, req.file.originalname, s3Result.Location, description]
    );
    
    res.json({ message: 'Video uploaded', video: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get videos (feed)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT v.*, u.username, u.avatar FROM videos v JOIN users u ON v.user_id = u.id ORDER BY v.created_at DESC LIMIT 50'
    );
    res.json({ videos: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like video
router.post('/:videoId/like', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { userId } = req.body;
    
    await pool.query(
      'INSERT INTO likes (video_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [videoId, userId]
    );
    
    const likeCount = await pool.query(
      'SELECT COUNT(*) FROM likes WHERE video_id = $1',
      [videoId]
    );
    
    res.json({ likes: likeCount.rows[0].count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;