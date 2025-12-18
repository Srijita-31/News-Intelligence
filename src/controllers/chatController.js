const { handleChat } = require('../services/ragService');
const redisClient = require('../services/redisClient');
const { logInteraction } = require('../services/dbService');
const { v4: uuidv4 } = require('uuid');

const chatQuery = async (req, res, next) => {
  try {
    const { sessionId, query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const session = sessionId || uuidv4();
    const pastContext = await redisClient.get(session);
    let conversationContext = pastContext ? JSON.parse(pastContext) : [];

    const startTime = Date.now();
    const { context, llmResponse } = await handleChat(query);
    const responseTime = Date.now() - startTime;

    conversationContext.push({ query, response: llmResponse });
    await redisClient.set(session, JSON.stringify(conversationContext), { EX: 3600 });

    await logInteraction(session, query, llmResponse, responseTime);

    res.json({ sessionId: session, response: llmResponse, context });
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const history = await redisClient.get(sessionId);
    res.json({ sessionId, history: history ? JSON.parse(history) : [] });
  } catch (err) {
    next(err);
  }
};

const clearHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    await redisClient.del(sessionId);
    res.json({ message: `Session ${sessionId} cleared` });
  } catch (err) {
    next(err);
  }
};

module.exports = { chatQuery, getHistory, clearHistory };
