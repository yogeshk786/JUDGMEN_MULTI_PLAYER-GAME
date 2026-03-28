const { Server } = require('socket.io');
const redisService = require('../services/redis.service');
const dealer = require('./dealer'); // ⬅️ 1. Bring the Virtual Dealer to the floor!
const adjudicator = require('./adjudicator');

let io;

const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
  });

  io.on('connection', (socket) => {
    console.log(`🟢 [SOCKET CONNECTED] Player walked in. ID: ${socket.id}`);

    // --- EXISTING JOIN GAME EVENT ---
    socket.on('join_game', async (roomId) => { 
      socket.join(roomId);
      let tableState = await redisService.getGameState(roomId);

      if (!tableState) {
        tableState = { game: "Judgement", status: "WAITING_FOR_PLAYERS", players: [] };
      }

      // Prevent adding the same player twice if they click join again
      const playerExists = tableState.players.find(p => p.socketId === socket.id);
      if (!playerExists) {
        tableState.players.push({ socketId: socket.id, ready: false });
      }

      await redisService.setGameState(roomId, tableState);
      io.to(roomId).emit('table_update', tableState);
    });

    // ==========================================
    // 🚀 NEW: START GAME & DEAL CARDS EVENT
    // ==========================================
    socket.on('start_game', async (roomId) => {
      console.log(`🃏 Starting game at Table: ${roomId}...`);
      
      // 1. Grab the current table state from Upstash
      let tableState = await redisService.getGameState(roomId);
      
      if (!tableState || tableState.players.length === 0) return;

      // 2. Wake up the Dealer! (Let's deal 5 cards to each player for Round 1)
      const cardsPerPlayer = 5; 
      const dealResult = dealer.dealCards(tableState.players, cardsPerPlayer);

      // 3. Update the game state with the new cards and Trump suit
      tableState.status = "PLAYING";
      tableState.hands = dealResult.hands;
      tableState.trumpCard = dealResult.trumpCard;

      // 4. Save the live game into Upstash Redis!
      await redisService.setGameState(roomId, tableState);
      console.log(`💾 Cards dealt and saved to Upstash for ${roomId}! Trump is ${tableState.trumpCard.value}${tableState.trumpCard.suit}`);

      // 5. Broadcast the cards to the players!
      // (SDE 2 Note: For a real production game, we would only emit a player's specific hand to their specific socket ID to prevent cheating. But for building the engine, sending it to the room is perfect!)
      io.to(roomId).emit('game_started', tableState);
    });

    socket.on('place_bid', async (payload) => {
      // The payload will be a JSON object: { roomId: "ROOM_101", bid: 2 }
      const { roomId, bid } = payload;
      
      let tableState = await redisService.getGameState(roomId);
      if (!tableState || tableState.status !== "PLAYING") return;

      // Find the specific player who is making the bid
      const playerIndex = tableState.players.findIndex(p => p.socketId === socket.id);
      
      if (playerIndex !== -1) {
        // Record their bid in the game state
        tableState.players[playerIndex].bid = bid;
        console.log(`🗣️ Player ${socket.id} bid ${bid} tricks at table ${roomId}!`);

        // Save the updated state to Upstash Redis
        await redisService.setGameState(roomId, tableState);

        // Tell everyone else at the table what this player just bid!
        io.to(roomId).emit('bid_placed', {
          socketId: socket.id,
          bid: bid,
          tableState: tableState
        });
      }
    });

    socket.on('play_card', async (payload) => {
      // Payload example: { roomId: "ROOM_101", card: { suit: "♠", value: "A" } }
      const { roomId, card } = payload;
      
      let tableState = await redisService.getGameState(roomId);
      if (!tableState || tableState.status !== "PLAYING") return;

      // 1. If this is the first card played this round, create the empty center pile (the Trick)
      if (!tableState.currentTrick) {
        tableState.currentTrick = [];
      }

      // 2. Look at the player's hand
      const playerHand = tableState.hands[socket.id];
      if (!playerHand) return; // Player doesn't have any cards!

      // 3. Check if the player actually has the card they are trying to play (Anti-Cheat!)
      const cardIndex = playerHand.findIndex(c => c.suit === card.suit && c.value === card.value);
      
      if (cardIndex !== -1) {
        // Remove the card from their hand
        playerHand.splice(cardIndex, 1);
        
        // Throw the card into the center of the table
        tableState.currentTrick.push({
          socketId: socket.id,
          card: card
        });

        console.log(`🃏 Player ${socket.id} played the ${card.value} of ${card.suit}!`);

        // Save the updated table to Upstash Redis
        await redisService.setGameState(roomId, tableState);

        // Tell everyone at the table what card was just played
        io.to(roomId).emit('card_played', {
          socketId: socket.id,
          card: card,
          currentTrick: tableState.currentTrick
        });
      } else {
        console.log(`⚠️ CHEAT ALERT: Player ${socket.id} tried to play a card they don't own!`);
      }
    });
      
    
    
    socket.on('disconnect', () => {
      console.log(`🔴 [SOCKET DISCONNECTED] Player left. ID: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io has not been initialized yet!');
  return io;
};

module.exports = { initializeSocket, getIO };