const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Room management for real multi-device arguments
const rooms = new Map();

wss.on('connection', (ws) => {
  let userRoom = null;
  let userRole = null; // 'alpha' or 'beta'

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join': {
          userRoom = data.room || 'main';
          userRole = data.role || (rooms.get(userRoom)?.size === 1 ? 'beta' : 'alpha');
          
          if (!rooms.has(userRoom)) {
            rooms.set(userRoom, new Set());
          }
          rooms.get(userRoom).add(ws);
          
          ws.send(JSON.stringify({
            type: 'assigned_role',
            role: userRole,
            room: userRoom,
            peers: rooms.get(userRoom).size
          }));
          
          // Broadcast peer count to room
          broadcastToRoom(userRoom, {
            type: 'room_state',
            peers: rooms.get(userRoom).size
          }, ws);
          break;
        }

        case 'speech_stream':
        case 'speech_interrupt':
        case 'speech_commit':
        case 'audio_level':
        case 'mind_shift':
        case 'heat_update': {
          // Broadcast to all other peers in the room
          if (userRoom) {
            broadcastToRoom(userRoom, data, ws);
          }
          break;
        }
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    if (userRoom && rooms.has(userRoom)) {
      rooms.get(userRoom).delete(ws);
      if (rooms.get(userRoom).size === 0) {
        rooms.delete(userRoom);
      } else {
        broadcastToRoom(userRoom, {
          type: 'room_state',
          peers: rooms.get(userRoom).size
        });
      }
    }
  });
});

function broadcastToRoom(room, message, senderWs = null) {
  if (!rooms.has(room)) return;
  const raw = JSON.stringify(message);
  for (const client of rooms.get(room)) {
    if (client !== senderWs && client.readyState === 1) { // 1 = OPEN
      client.send(raw);
    }
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'TAKRAAR Duplex Argument Engine',
    uptime: process.uptime(),
    activeRooms: rooms.size
  });
});

server.listen(PORT, () => {
  console.log(`TAKRAAR argument server running at http://localhost:${PORT}`);
});
