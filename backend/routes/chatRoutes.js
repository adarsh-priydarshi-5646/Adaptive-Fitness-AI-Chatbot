const express = require('express');
const router = express.Router();
const { sendMessage, sendMessageStream, getChatHistory, clearHistory } = require('../controllers/chatController');

router.post('/message', sendMessage);
router.post('/stream', sendMessageStream);
router.get('/history/:userId', getChatHistory);
router.delete('/history/:userId', clearHistory);

module.exports = router;
