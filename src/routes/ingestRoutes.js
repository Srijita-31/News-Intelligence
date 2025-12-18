const express = require('express');
const router = express.Router();
const { ingestArticles } = require('../controllers/ingestController');

router.post('/', ingestArticles);

module.exports = router;
