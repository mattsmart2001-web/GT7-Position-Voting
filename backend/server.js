const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Vote storage
let voteData = {
  pollActive: false,
  votes: {}, // { position: { count: 0, voters: [{username, avatar, timestamp}] } }
  totalVotes: 0,
  voterMap: {} // { username: position } to track who voted for what
};

// Initialize positions 1-16
for (let i = 1; i <= 16; i++) {
  voteData.votes[i] = { count: 0, voters: [] };
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send current vote data to newly connected client
  socket.emit('voteUpdate', voteData);

  // Handle vote from Streamerbot or direct client
  socket.on('vote', (data) => {
    const { username, position, avatar } = data;

    if (!voteData.pollActive) {
      socket.emit('error', { message: 'Poll is not active' });
      return;
    }

    // Validate position
    const pos = parseInt(position);
    if (isNaN(pos) || pos < 1 || pos > 16) {
      socket.emit('error', { message: 'Invalid position. Choose 1-16' });
      return;
    }

    // Check if user already voted
    if (voteData.voterMap[username]) {
      const oldPosition = voteData.voterMap[username];
      // Remove old vote
      voteData.votes[oldPosition].voters = voteData.votes[oldPosition].voters.filter(
        v => v.username !== username
      );
      voteData.votes[oldPosition].count--;
      voteData.totalVotes--;
    }

    // Add new vote
    const voter = {
      username,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
      timestamp: Date.now()
    };

    voteData.votes[pos].voters.push(voter);
    voteData.votes[pos].count++;
    voteData.voterMap[username] = pos;
    voteData.totalVotes++;

    // Broadcast update to all clients
    io.emit('voteUpdate', voteData);

    console.log(`Vote recorded: ${username} voted for position ${pos}`);
  });

  // Admin controls
  socket.on('startPoll', () => {
    voteData.pollActive = true;
    io.emit('pollStatusChange', { active: true });
    console.log('Poll started');
  });

  socket.on('stopPoll', () => {
    voteData.pollActive = false;
    io.emit('pollStatusChange', { active: false });
    console.log('Poll stopped');
  });

  socket.on('resetPoll', () => {
    // Reset all votes
    for (let i = 1; i <= 16; i++) {
      voteData.votes[i] = { count: 0, voters: [] };
    }
    voteData.totalVotes = 0;
    voteData.voterMap = {};
    voteData.pollActive = false;

    io.emit('voteUpdate', voteData);
    io.emit('pollStatusChange', { active: false });
    console.log('Poll reset');
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST API endpoints
app.get('/api/votes', (req, res) => {
  res.json(voteData);
});

app.post('/api/vote', (req, res) => {
  const { username, position, avatar } = req.body;

  if (!voteData.pollActive) {
    return res.status(400).json({ error: 'Poll is not active' });
  }

  const pos = parseInt(position);
  if (isNaN(pos) || pos < 1 || pos > 16) {
    return res.status(400).json({ error: 'Invalid position. Choose 1-16' });
  }

  // Process vote (same logic as socket)
  if (voteData.voterMap[username]) {
    const oldPosition = voteData.voterMap[username];
    voteData.votes[oldPosition].voters = voteData.votes[oldPosition].voters.filter(
      v => v.username !== username
    );
    voteData.votes[oldPosition].count--;
    voteData.totalVotes--;
  }

  const voter = {
    username,
    avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`,
    timestamp: Date.now()
  };

  voteData.votes[pos].voters.push(voter);
  voteData.votes[pos].count++;
  voteData.voterMap[username] = pos;
  voteData.totalVotes++;

  io.emit('voteUpdate', voteData);

  res.json({ success: true, voteData });
});

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/overlay', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/overlay.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🏁 GT7 Position Voting Server running on port ${PORT}`);
  console.log(`📊 Overlay: http://localhost:${PORT}/overlay`);
  console.log(`⚙️  Admin: http://localhost:${PORT}/admin`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});
