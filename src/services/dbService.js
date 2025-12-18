const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  port: process.env.PG_PORT
});

const logInteraction = async (sessionId, query, response, responseTime) => {
  const queryText = `INSERT INTO interactions(session_id, user_query, llm_response, response_time)
                     VALUES($1, $2, $3, $4)`;
  await pool.query(queryText, [sessionId, query, response, responseTime]);
};

module.exports = { pool, logInteraction };
