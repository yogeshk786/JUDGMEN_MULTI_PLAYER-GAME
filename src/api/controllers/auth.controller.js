const User = require('../../models/User'); // Imports your Mongoose Model
const bcrypt = require('bcryptjs');        // For encrypting passwords
const jwt = require('jsonwebtoken');       // For generating the VIP Pass

const authController = {
  
  // ==========================================
  // 📝 1. REGISTER A NEW PLAYER
  // ==========================================
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Check if player already exists in the MongoDB Vault
      const existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({ message: 'Username or Email already in use!' });
      }

      // 🛡️ SDE 2 Security: Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create the new player profile
      const newUser = new User({
        username,
        email,
        passwordHash: hashedPassword
      });

      await newUser.save();

      res.status(201).json({ 
        message: '🟢 Player registered successfully!',
        user: { id: newUser._id, username: newUser.username }
      });

    } catch (error) {
      console.error('🔴 Registration Error:', error.message);
      res.status(500).json({ message: 'Server error during registration' });
    }
  },

  // ==========================================
  // 🔐 2. LOGIN AN EXISTING PLAYER
  // ==========================================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find the player in Atlas
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials!' });
      }

      // Check if the password matches the hashed version in the database
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials!' });
      }

      // 🎟️ Generate the VIP Pass (JWT)
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET || 'fallback_secret_key_if_missing', 
        { expiresIn: '24h' }
      );
      res.status(200).json({
        message: '🟢 Login successful!',
        token,
        user: { 
          id: user._id, 
          username: user.username, 
          eloRating: user.eloRating,
          totalGamesPlayed: user.totalGamesPlayed,
          totalWins: user.totalWins
        }
      });
      
    } catch (error) {
      console.error('🔴 Login Error:', error.message);
      res.status(500).json({ message: 'Server error during login' });
    }
  }
};

// ⚡ EXPORT THE CONTROLLER SO THE ROUTER CAN USE IT
module.exports = authController;