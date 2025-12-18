const { ingestDocuments } = require('../services/ingestionService');

const ingestArticles = async (req, res, next) => {
  try {
    const result = await ingestDocuments();
    res.json({ message: 'Articles ingested successfully', result });
  } catch (err) {
    next(err);
  }
};

module.exports = { ingestArticles };
