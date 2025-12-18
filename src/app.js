const express = require('express');
const bodyParser = require('body-parser');
const ingestRoutes = require('./routes/ingestRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { errorHandler } = require('./utils/errorHandler');

process.on('unhandledRejection', (reason) => {
	console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
});

const app = express();
app.use(bodyParser.json());

app.use('/ingest', ingestRoutes);
app.use('/chat', chatRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
