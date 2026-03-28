const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../../middleware/auth.middleware'); // ⬅️ 1. Import the Bouncer

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// ==========================================
// 🛡️ PROTECTED VIP ROUTES
// ==========================================

// GET /api/auth/me
// Only players with a valid JWT Token can enter this route
router.get('/me', protect, (req, res) => { // ⬅️ 2. Put the Bouncer in front of the route
  res.status(200).json({
    message: "🛡️ Bouncer says: Welcome to the VIP Lounge!",
    playerData: req.user // The Bouncer extracted this from the token!
  });
});

module.exports = router;