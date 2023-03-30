const Router = require('express');
const router = new Router();

const { login, getMe ,getUsers } = require('./authController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/login', (req, res) => {
  return login(req, res);
});

router.get('/getme', authMiddleware, (req, res) => {
  getMe(req, res);
});
router.get('/users', (req, res) => {
  getUsers(req, res);
});


module.exports = router;
