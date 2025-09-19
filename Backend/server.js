const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const connectToDB = require('./Database/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

connectToDB();

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(cors({
  origin: "https://frabjous-pony-eb7a38.netlify.app", // your frontend domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Import models (pre-load to avoid dynamic imports)
const Message = require('./Model/message');
const Conversation = require('./Model/conversation');

// Import routes
app.use('/api/auth', require('./routes/Auth-route'));
app.use('/api/users', require('./routes/user'));
app.use('/api/conversations', require('./routes/conversations'));
app.use('/api/messages', require('./routes/message'));

// Initialize Socket.IO
const io = new Server(server, {
  cors: { origin: "*" }
});

// Socket.IO Middleware: authenticate using JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: decoded.userId, username: decoded.username };
    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO Event Handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username} (${socket.id})`);

  // Join a conversation room
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(conversationId);
  });

  // Leave a conversation room
  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(conversationId);
  });

  // Typing indicator
  socket.on('typing', ({ conversationId }) => {
    socket.to(conversationId).emit('typing', { userId: socket.user.id });
  });

  socket.on('stop_typing', ({ conversationId }) => {
    socket.to(conversationId).emit('stop_typing', { userId: socket.user.id });
  });

  // Send message
  socket.on('send_message', async ({ conversationId, text, attachmentsMeta }) => {
    try {
      // Save message in DB
      const message = await Message.create({
        conversationId,
        senderId: socket.user.id,
        text,
        attachmentsMeta,
        readBy: [socket.user.id]
      });

      // Update lastMessage & updatedAt in conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text || 'Attachment',
        updatedAt: new Date()
      });

      // Emit message to all participants in room
      io.to(conversationId).emit('receive_message', message);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  });

  // Mark messages as read
  socket.on('message_read', async ({ conversationId }) => {
    try {
      await Message.updateMany(
        { conversationId, readBy: { $ne: socket.user.id } },
        { $push: { readBy: socket.user.id } }
      );
      io.to(conversationId).emit('read_receipt', { userId: socket.user.id });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.username} (${socket.id})`);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));