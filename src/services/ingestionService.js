const use = require('@tensorflow-models/universal-sentence-encoder');
// Add this line at the top of your main entry file or AI service file
//const use = require('@tensorflow/tfjs-node');
const fs = require('fs');
const { client, COLLECTION_NAME } = require('./vectorDB');

let model;

const loadModel = async () => {
  if (!model) model = await use.load();
  return model;
};

const ingestDocuments = async () => {
  const articles = JSON.parse(fs.readFileSync('./mock_articles.json'));
  const model = await loadModel();
  
  // Generate embeddings
  const embeddings = await model.embed(articles.map(a => a.content));
  const vectorsArray = await embeddings.array(); // Convert to standard JS array

  const vectors = vectorsArray.map((vec, idx) => ({
    id: idx + 1,        // Use 1, 2, 3... (Qdrant prefers positive integers)
    vector: vec,       // This must be an array of 512 numbers
    payload: articles[idx] // This must be a JSON object
  }));

  return await client.upsert({
    collection_name: COLLECTION_NAME,
    points: vectors
  });
};
module.exports = { ingestDocuments };
