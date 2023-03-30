const express = require('express');
const authRouter = require('./auth/authRouter');
const cors = require('cors');
const conncetion = require('./db');

const PORT = process.env.PORT || 5000;

const app = express();

const server = require('http').Server(app);
app.use(express.json());
app.use(cors());

app.use('/auth', authRouter);

const start = async () => {
  try {
    server.listen(PORT, () => console.log(`server started on port ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const users = [];
const updateMessages =
  'UPDATE chatUsers SET message = JSON_ARRAY_APPEND(message,  "$", ?) WHERE name = ?';
const isUserExist = 'SELECT * FROM chatUsers WHERE name = ?';
const createUser = 'INSERT INTO chatUsers (name) VALUES (?)';

io.on('connection', (socket) => {
  socket.on('user_connected', (username) => {
    users[username] = socket.id;

    socket.on('private message', (data) => {
      const userName = data.recipient;

      const { message, Topic, sender, isVisible } = data;

      const saveToDBData = JSON.stringify({
        message,
        Topic,
        sender,
        isVisible,
      });

      conncetion.query(isUserExist, [userName], (error, result) => {
        const user = result[0];
        if (!user) {
          conncetion.query(createUser, [userName], (error) => {
            if (error) {
              console.log(error);
            }
          });
          conncetion.query(updateMessages, [saveToDBData, userName]);
          return;
        }
        conncetion.query(updateMessages, [saveToDBData, userName]);
      });

      const recipientSocketId = users[data.recipient];

      io.to(recipientSocketId).emit('newMessage', {
        message,
        Topic,
        sender,
        isVisible,
      });
    });
  });
});

start();
