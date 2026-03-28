// ==========================================
// 💯 THE SCORING ENGINE
// ==========================================

const scoring = {
  // Pass in the array of players at the end of a round
  calculateRound: (players) => {
    players.forEach(player => {
      // 1. Did they predict exactly right?
      if (player.bid === player.tricksWon) {
        // SUCCESS: 10 Bonus Points + 10 points per trick won
        // (Example: Bid 2, Won 2 = 30 points. Bid 0, Won 0 = 10 points)
        const roundScore = 10 + (player.tricksWon * 10);
        player.points = (player.points || 0) + roundScore;
        console.log(`✅ EXACT MATCH! Player ${player.socketId} gets ${roundScore} points.`);
      } else {
        // BUSTED: They won too many or too few tricks.
        // Standard rule: 0 points for the round.
        console.log(`❌ BUSTED! Player ${player.socketId} bid ${player.bid} but won ${player.tricksWon}. 0 points.`);
      }

      // 2. Reset their stats for the next round!
      player.bid = null;
      player.tricksWon = 0;
    });

    // Return the updated player list
    return players;
  }
};

module.exports = scoring;