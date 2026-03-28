const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  playedAt: { type: Date, default: Date.now },
  
  // Array of the 10 players who joined the table
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // The ultimate winner of the round
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // A snapshot of everyone's Bids and Points for historical lookup
  finalScores: { type: Object, required: true } 
});

module.exports = mongoose.model('Game', gameSchema);