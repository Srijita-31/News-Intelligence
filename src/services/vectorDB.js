const axios = require('axios');

const BASE_URL = process.env.QDRANT_URL || 'http://qdrant:6333';

const COLLECTION_NAME = 'news_articles';

const http = axios.create({ baseURL: BASE_URL, timeout: 10000 });

const client = {
  upsert: async ({ collection_name, points }) => {
    try {
      // Use PUT and ensure the body is exactly { points: [...] }
      const res = await http.put(`/collections/${collection_name}/points?wait=true`, { 
        points: points 
      });
      return res.data;
    } catch (err) {
      // Detailed logging to see exactly why Qdrant rejected it
      console.error('Qdrant Error Response:', err.response?.data || err.message);
      throw err;
    }
  },
  search: async ({ collection_name, vector, limit = 5 }) => {
    try {
      const res = await http.post(`/collections/${collection_name}/points/search`, { 
        vector, 
        limit,
        with_payload: true // Ensures you get your article data back in search
      });
      return res.data.result || res.data;
    } catch (err) {
      console.error('Qdrant Search Details:', err.response?.data || err.message);
      throw err;
    }
  }
};

const searchEmbeddings = async (queryEmbedding, topK = 5) => {
  const results = await client.search({ collection_name: COLLECTION_NAME, vector: queryEmbedding, limit: topK });
  return results;
};

module.exports = { client, COLLECTION_NAME, searchEmbeddings };
