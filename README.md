# News Intelligence Backend

A powerful Retrieval-Augmented Generation (RAG) system for intelligent news article querying and analysis. This backend service enables users to ask natural language questions about news articles and receive AI-powered responses based on semantic search through a vector database of news content.

## Features

- **Semantic Search**: Uses TensorFlow.js Universal Sentence Encoder to generate embeddings for articles and queries
- **RAG Architecture**: Combines vector similarity search with Google Gemini AI for contextual responses
- **Session Management**: Maintains conversation history using Redis
- **Interaction Logging**: Tracks all queries and responses in PostgreSQL
- **Vector Database**: Stores and searches article embeddings using Qdrant
- **Docker Support**: Fully containerized with Docker Compose for easy deployment

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **AI/ML**:
  - TensorFlow.js with Universal Sentence Encoder (for embeddings)
  - Google Gemini 1.5 Flash (for LLM responses)
- **Databases**:
  - PostgreSQL 15 (for interaction logging)
  - Redis 7 (for session/conversation caching)
  - Qdrant (vector database for semantic search)
- **Containerization**: Docker & Docker Compose

##  Architecture

```
User Query → Embedding Generation → Vector Search (Qdrant) → Context Retrieval → Gemini AI → Response
```

1. User submits a query via the chat API
2. Query is converted to an embedding using Universal Sentence Encoder
3. Similar articles are retrieved from Qdrant using cosine similarity
4. Retrieved context is passed to Google Gemini AI
5. Gemini generates a contextual response based on the retrieved articles
6. Response is stored in Redis (session history) and PostgreSQL (interaction log)

##  Prerequisites

- Node.js 20+ (if running locally)
- Docker & Docker Compose (recommended)
- Google Gemini API Key 

## Installation & Setup

### Using Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd News-Intelligence
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3004
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # PostgreSQL Configuration
   PG_HOST=postgres
   PG_USER=postgres
   PG_PASSWORD=postgres
   PG_DB=news_rag
   PG_PORT=5432
   
   # Redis Configuration
   REDIS_URL=redis://redis:6379
   
   # Qdrant Configuration
   QDRANT_URL=http://qdrant:6333
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Initialize the database** (if needed)
   ```sql
   CREATE TABLE IF NOT EXISTS interactions (
     id SERIAL PRIMARY KEY,
     session_id VARCHAR(255),
     user_query TEXT,
     llm_response TEXT,
     response_time INTEGER,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

5. **Ingest articles**
   ```bash
   curl -X POST http://localhost:3004/ingest
   ```

### Local Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables** (create `.env` file as shown above)

3. **Start PostgreSQL, Redis, and Qdrant** (use Docker Compose for just these services)

4. **Run the application**
   ```bash
   npm start
   ```

##  API Endpoints

### Chat Endpoints

#### POST `/chat`
Submit a query and receive an AI-powered response.

**Request Body:**
```json
{
  "sessionId": "optional-session-id",
  "query": "What are the latest AI developments?"
}
```

**Response:**
```json
{
  "sessionId": "uuid-v4",
  "response": "Based on the articles...",
  "context": ["article content 1", "article content 2", ...]
}
```

#### GET `/chat/history/:sessionId`
Retrieve conversation history for a session.

**Response:**
```json
{
  "sessionId": "uuid-v4",
  "history": [
    { "query": "...", "response": "..." },
    ...
  ]
}
```

#### DELETE `/chat/history/:sessionId`
Clear conversation history for a session.

**Response:**
```json
{
  "message": "Session {sessionId} cleared"
}
```

### Ingestion Endpoints

#### POST `/ingest`
Ingest articles from `mock_articles.json` into the vector database.

**Response:**
```json
{
  "message": "Articles ingested successfully",
  "result": { ... }
}
```

##  Usage Examples

### Query News Articles

```bash
curl -X POST http://localhost:3004/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tell me about recent space exploration news"
  }'
```

### Continue a Conversation

```bash
# First query
SESSION_ID=$(curl -s -X POST http://localhost:3004/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What AI news is there?"}' \
  | jq -r '.sessionId')

# Follow-up query
curl -X POST http://localhost:3004/chat \
  -H "Content-Type: application/json" \
  -d "{
    \"sessionId\": \"$SESSION_ID\",
    \"query\": \"Tell me more about that\"
  }"
```

### Get Conversation History

```bash
curl http://localhost:3004/chat/history/{sessionId}
```

## Project Structure

```
News-Intelligence/
├── src/
│   ├── app.js                 # Express app entry point
│   ├── controllers/           # Request handlers
│   │   ├── chatController.js
│   │   └── ingestController.js
│   ├── routes/                # API routes
│   │   ├── chatRoutes.js
│   │   └── ingestRoutes.js
│   ├── services/              # Business logic
│   │   ├── dbService.js       # PostgreSQL operations
│   │   ├── geminiService.js   # Gemini AI integration
│   │   ├── ingestionService.js # Article ingestion
│   │   ├── ragService.js      # RAG orchestration
│   │   ├── redisClient.js     # Redis client wrapper
│   │   └── vectorDB.js        # Qdrant operations
│   └── utils/                 # Utilities
│       ├── errorHandler.js
│       └── logger.js
├── docker-compose.yml         # Docker services configuration
├── Dockerfile                 # Application container
├── mock_articles.json         # Sample articles for ingestion
└── package.json               # Dependencies and scripts
```

##  Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `GEMINI_API_KEY` | Google Gemini API key | *Required* |
| `PG_HOST` | PostgreSQL host | `postgres` |
| `PG_USER` | PostgreSQL user | `postgres` |
| `PG_PASSWORD` | PostgreSQL password | `postgres` |
| `PG_DB` | PostgreSQL database name | `news_rag` |
| `PG_PORT` | PostgreSQL port | `5432` |
| `REDIS_URL` | Redis connection URL | `redis://redis:6379` |
| `QDRANT_URL` | Qdrant API URL | `http://qdrant:6333` |

##  Docker Services

- **api**: Node.js backend application (port 3004)
- **postgres**: PostgreSQL database (port 5433)
- **redis**: Redis cache (port 6379)
- **qdrant**: Vector database (port 6333)

##  How It Works

1. **Article Ingestion**:
   - Articles are loaded from `mock_articles.json`
   - Each article's content is converted to a 512-dimensional embedding
   - Embeddings are stored in Qdrant with article metadata as payload

2. **Query Processing**:
   - User query is converted to an embedding
   - Top 5 most similar articles are retrieved from Qdrant
   - Article contents are used as context for Gemini AI
   - Gemini generates a response based on the context

3. **Session Management**:
   - Each conversation gets a unique session ID
   - Conversation history is cached in Redis (expires after 1 hour)
   - All interactions are logged in PostgreSQL for analytics



### Database Schema

The `interactions` table structure:
```sql
CREATE TABLE interactions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  user_query TEXT,
  llm_response TEXT,
  response_time INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Performance Considerations

- **Embedding Model**: Universal Sentence Encoder loads on first use (~50MB model)
- **Vector Search**: Qdrant handles similarity search efficiently
- **Caching**: Redis caches session data to reduce database load
- **Response Time**: Typically 2-5 seconds depending on network and model load



##  License
This project is licensed under the MIT License.


