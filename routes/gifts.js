const express = require('express');
const router = express.Router();
const { pool, io } = require('../server');

// Send gift
router.post('/send', async (req, res) => {
  try {
    const { fromUserId, toUserId, giftId, amount } = req.body;
    
    // Create gift transaction
    const result = await pool.query(
      'INSERT INTO gifts (from_user_id, to_user_id, gift_id, amount) VALUES ($1, $2, $3, $4) RETURNING *',
      [fromUserId, toUserId, giftId, amount]
    );
    
    // Update creator's balance
    await pool.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [amount * 0.5, toUserId] // Creator gets 50% of gift value
    );
    
    // Notify via WebSocket
    io.to(`live-${toUserId}`).emit('gift-received', result.rows[0]);
    
    res.json({ message: 'Gift sent', gift: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get gift history
router.get('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT g.*, u.username FROM gifts g JOIN users u ON g.from_user_id = u.id WHERE g.to_user_id = $1 ORDER BY g.created_at DESC LIMIT 50',
      [userId]
    );
    
    res.json({ gifts: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;