const redis = require('redis');
require('dotenv').config();
const _client = redis.createClient({ url: process.env.REDIS_URL });

let connected = false;

_client.on('error', (err) => {
	console.error('Redis Client Error', err);
});

_client.connect()
	.then(() => {
		connected = true;
		console.log('Connected to Redis');
	})
	.catch(err => {
		connected = false;
		console.warn('Redis connection failed (continuing without Redis):', err.message || err);
	});

const client = {
	get: async (key) => {
		if (!connected) return null;
		return _client.get(key);
	},
	set: async (key, value, opts) => {
		if (!connected) return null;
		if (opts && opts.EX) {
			return _client.set(key, value, { EX: opts.EX });
		}
		return _client.set(key, value);
	},
	del: async (key) => {
		if (!connected) return null;
		return _client.del(key);
	},
	// expose raw client if needed
	_raw: _client
};

module.exports = client;
