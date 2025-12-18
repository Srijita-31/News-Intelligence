const express = require('express');
const router = express.Router();
const { chatQuery, getHistory, clearHistory } = require('../controllers/chatController');

router.post('/', chatQuery);
router.get('/history/:sessionId', getHistory);
router.delete('/history/:sessionId', clearHistory);

module.exports = router;
