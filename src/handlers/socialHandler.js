odule.exports = (io, socket) => {
  socket.on('send_emote', ({ roomId, userId, emoteId }) => {
    // SDE 2 Detail: We use 'volatile.emit'
    // This tells Socket.io: "Send this if the network is clear, 
    // but drop it if it's lagging. Don't queue it."
    socket.to(roomId).volatile.emit('receive_emote', { userId, emoteId });
  });

  socket.on('send_chat', ({ roomId, userId, message }) => {
    // Standard emit for chat so messages don't get lost
    socket.to(roomId).emit('receive_chat', { userId, message, timestamp: Date.now() });
  });
};