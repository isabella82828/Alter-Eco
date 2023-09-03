const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateSystemMessage,
  generateLocationMessage,
} = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', (options, callback) => {
    // tries add user to users array
    const { user, error } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);

    socket.emit('systemMessage', generateSystemMessage('Welcome to Alter-Eco!'));
    socket.broadcast
      .to(user.room)
      .emit(
        'systemMessage',
        generateSystemMessage(`${user.username} has joined!`),
      );

    // Refresh sidebar for all room members
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    // Filters the message then emits new message to users in room
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));
    callback();
  });

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    // emits location message to users in room
    const user = getUser(socket.id);

    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${latitude},${longitude}`,
      ),
    );
    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    // check if user actually joined the room (may have been booted if duplicate username)
    if (user) {
      io.to(user.room).emit(
        'systemMessage',
        generateSystemMessage(`${user.username} has left the room.`),
      );
      // Update sidebar
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up at http://localhost:${port}`);
});
