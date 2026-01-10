const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory } = require('../controllers/chatController');

router.post('/message', sendMessage);
router.get('/history/:userId', getChatHistory);

module.exports = router;
