require('@tensorflow/tfjs');
const use = require('@tensorflow-models/universal-sentence-encoder');
const { searchEmbeddings } = require('./vectorDB');
const { queryGemini } = require('./geminiService');

let model;

const loadModel = async () => {
  if (!model) model = await use.load();
  return model;
};

const handleChat = async (userQuery) => {
  const model = await loadModel();
  const embeddingTensor = await model.embed([userQuery]);
  const queryEmbedding = Array.from(embeddingTensor.arraySync()[0]);

  const results = await searchEmbeddings(queryEmbedding, 5);
  const context = results.map(r => r.payload.content);

  const llmResponse = await queryGemini(context, userQuery);
  return { context, llmResponse };
};

module.exports = { handleChat };
