const jwt = require('jsonwebtoken');

const connection = require('../db');
const { secret } = require('../config');

function generateAccessToken(id) {
  const payload = { id };
  return jwt.sign(payload, secret, {
    expiresIn: '24h',
  });
}

async function login(req, res) {
  const { name } = req.body;
  const getUser = 'SELECT * FROM chatUsers WHERE name = ?';
  const addNewUser = 'INSERT INTO chatUsers (name) VALUES (?)';

  connection.query(getUser, [name], (error, result) => {
    const user = result[0];

    if (user) {
      const token = generateAccessToken(user.id);
      return res.json({ token, user });
    }
    if (error) {
      return console.log(error);
    } else {
      connection.query(addNewUser, [name], (error, result) => {
        if (error) {
          return console.log(error);
        }
        const id = result.insertId;
        connection.query(getUser, [id], (error, result) => {
          const user = result[0];
          console.log('NEW', user);
          if (error) {
            return console.log(error);
          }
          
          const token = generateAccessToken(user.id);
          return res.json({ token, user });
        });
      });
    }
  });
}

const getMe = async (req, res) => {
  const findUser = 'SELECT * FROM chatUsers WHERE id = ?';
  const id = req.userId;

  connection.query(findUser, [id], (error, result) => {
    const User = result[0];
    console.log(result);
    if (error) {
      return res.status(500).json(error.message);
    }
    if (req.userId != id) {
      return res.status(401).json({
        message: 'user is not defined',
      });
    }
    const token = generateAccessToken(req.userId);
    return res.json({ User, token });
  });
};

const getUsers = async (req, res) => {
  const allUsers = 'SELECT name FROM chatUsers;';
  connection.query(allUsers, (error, data) => {
    return res.json(data);
  });
};
module.exports = {
  login,
  getMe,
  getUsers,
};
