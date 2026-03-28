require('dotenv').config();
const express = require('express');
const http = require('http'); // ⬅️ Added for Socket.io support
const cors = require('cors'); // ⬅️ Added to allow frontend connections

// 🔌 1. Import Services
const redisService = require('./services/redis.service');
const connectDB = require('./services/mongo.service'); 
const { initializeSocket } = require('./engine/socket')

// 🏗️ 2. Initialize App & Server
const app = express();
const server = http.createServer(app); // ⚡ We listen on 'server', not 'app'
const PORT = process.env.PORT || 5000;

// 🛡️ 3. Middleware (CRITICAL)
app.use(cors()); // Allows your React/Frontend to talk to the Backend
app.use(express.json()); // Allows the server to read { "email": "..." } from requests

// 🗄️ 4. Boot Databases
connectDB();

// 🚪 5. Routes
// This connects the Register/Login logic we just wrote
app.use('/api/auth', require('./api/routes/auth.routes'));

app.get('/health', (req, res) => {
  res.json({ status: "🟢 Casino Server is Healthy", time: new Date() });
});

// ⚡ 6. Redis Test (Keeping your logic)
const runRedisTest = async () => {
  try {
    const dummyRoomId = "TEST_ROOM_101";
    const mockData = { status: "LOBBY", players: 10, game: "Judgement" };
    await redisService.setGameState(dummyRoomId, mockData);
    const result = await redisService.getGameState(dummyRoomId);
    console.log("✅ REDIS VERIFIED:", result);
  } catch (err) {
    console.error("❌ Redis Test Failed:", err.message);
  }
};
setTimeout(runRedisTest, 1000);

initializeSocket(server);

// 🚀 7. Ignition
server.listen(PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Casino Server live on port ${PORT}`);
  console.log(`=================================`);
});