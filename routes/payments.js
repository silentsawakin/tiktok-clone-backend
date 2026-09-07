const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { pool } = require('../server');

// Withdraw earnings
router.post('/withdraw', async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    // Get user's Stripe account
    const userResult = await pool.query('SELECT stripe_account_id FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];
    
    // Create transfer
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      destination: user.stripe_account_id
    });
    
    // Update user's balance
    await pool.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [amount, userId]
    );
    
    // Log transaction
    await pool.query(
      'INSERT INTO withdrawals (user_id, amount, stripe_transfer_id, status) VALUES ($1, $2, $3, $4)',
      [userId, amount, transfer.id, 'completed']
    );
    
    res.json({ message: 'Withdrawal processed', transfer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment history
router.get('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM withdrawals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    
    res.json({ withdrawals: result.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;