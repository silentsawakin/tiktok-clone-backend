const express = require('express');
const router = express.Router();
const { pool } = require('../server');

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT id, username, email, avatar, bio, followers FROM users WHERE id = $1',
      [userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Follow user
router.post('/:userId/follow', async (req, res) => {
  try {
    const { userId } = req.params;
    const { followerId } = req.body;
    
    await pool.query(
      'INSERT INTO followers (user_id, follower_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, followerId]
    );
    
    res.json({ message: 'Followed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Unfollow user
router.post('/:userId/unfollow', async (req, res) => {
  try {
    const { userId } = req.params;
    const { followerId } = req.body;
    
    await pool.query(
      'DELETE FROM followers WHERE user_id = $1 AND follower_id = $2',
      [userId, followerId]
    );
    
    res.json({ message: 'Unfollowed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;