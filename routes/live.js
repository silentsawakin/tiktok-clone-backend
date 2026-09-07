const express = require('express');
const router = express.Router();
const { pool, io } = require('../server');
const { RtmTokenBuilder, RtcTokenBuilder } = require('agora-token');

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERT = process.env.AGORA_APP_CERT;

// Start live stream
router.post('/start', async (req, res) => {
  try {
    const { userId, title } = req.body;
    
    // Create live room
    const result = await pool.query(
      'INSERT INTO live_rooms (creator_id, title, status) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, 'active']
    );
    
    const liveRoom = result.rows[0];
    
    // Generate Agora token for creator
    const token = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERT,
      liveRoom.id.toString(),
      userId,
      1
    );
    
    res.json({ liveRoom, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// End live stream
router.post('/:liveRoomId/end', async (req, res) => {
  try {
    const { liveRoomId } = req.params;
    
    await pool.query(
      'UPDATE live_rooms SET status = $1 WHERE id = $2',
      ['ended', liveRoomId]
    );
    
    res.json({ message: 'Live stream ended' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get live rooms
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT lr.*, u.username, u.avatar, COUNT(lv.id) as viewers FROM live_rooms lr JOIN users u ON lr.creator_id = u.id LEFT JOIN live_viewers lv ON lr.id = lv.live_room_id WHERE lr.status = $1 GROUP BY lr.id, u.id',
      ['active']
    );
    res.json({ liveRooms: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;