# Backend API

Production-ready Node.js backend with TypeScript, MongoDB, OpenAI integration, centralized logging, and authentication.

## Quick Start

```bash
# Install dependencies
cd backend
npm install

# Set environment variables (see Configuration)
cp .env.example .env

# Development
npm run dev

# Production
npm run build
npm start
```

## Configuration

Create `.env` file with required variables:

```bash
# Database
DATABASE_URL=mongodb://localhost:27017/your-database

# Authentication
JWT_SECRET=your-jwt-secret-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Server
PORT=3001
NODE_ENV=development

# Logging (optional)
LOG_LEVEL=debug  # trace, debug, info, warn, error, fatal
```

## API Endpoints

### Health
- `GET /` - Server status
- `GET /health/database` - Database health check

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### OpenAI
- `POST /api/generate-activity` - Generate single activity
- `POST /api/generate-bulk-activities` - Generate multiple activities
- `POST /api/generate-activity-variations` - Generate activity variations
- `POST /api/analyze-activity-quality` - Analyze activity quality
- `GET /api/test-openai-connection` - Test OpenAI connection

## Database

MongoDB connection with automatic retry, health monitoring, and graceful shutdown.

### Usage
```typescript
import { connectDatabase, getDatabaseStatus, checkDatabaseHealth } from './utils/database';

// Connect with retry logic
await connectDatabase();

// Check status
const status = getDatabaseStatus();
const isHealthy = await checkDatabaseHealth();
```

### Connection States
- `disconnected` (0) - Not connected
- `connected` (1) - Connected and ready
- `connecting` (2) - Connection in progress
- `disconnecting` (3) - Disconnection in progress

## Logging

Pino-based logging with colors in development, structured JSON in production.

### Usage
```typescript
import logger, { createChildLogger } from './utils/logger';

// Basic logging
logger.info('Server started');
logger.debug({ userId: 123 }, 'Processing request');
logger.error({ error }, 'Operation failed');

// Child loggers with context
const userLogger = createChildLogger({ userId: 123 });
userLogger.info('User operation completed');
```

### Log Levels
- `trace` - Detailed trace information
- `debug` - Debug information (default in development)
- `info` - General information (default in production)
- `warn` - Warning conditions
- `error` - Error conditions
- `fatal` - System unusable

### Output Formats

**Development (colorized):**
```
INFO [2025-01-15 10:30:45.123]: Server started
DEBUG [2025-01-15 10:30:46.456]: User login attempt
    email: "user@example.com"
```

**Production (JSON):**
```json
{"level":"info","time":1642258245123,"msg":"Server started"}
{"level":"debug","time":1642258246456,"reqId":"abc123","email":"user@example.com","msg":"User login attempt"}
```

## Authentication

JWT-based authentication with bcrypt password hashing.

### User Model
```typescript
{
  name: string,
  email: string,
  password: string, // bcrypt hashed
  role: string
}
```

### JWT Payload
```typescript
{
  user: {
    id: string
  },
  exp: number // 5 hours expiry
}
```

## Request Logging

Automatic HTTP request/response logging with correlation IDs.

### Request Logger
```typescript
// Available on all requests
req.logger.info('Processing user request');
req.logger.debug({ payload }, 'Request details');
```

### Logged Information
- Request method and URL
- Response status code and time
- Request correlation ID
- Client IP address
- Error details with stack traces in development

## Validation

Centralized Zod schema validation in route handlers.

```typescript
import { AIGenerationRequestSchema } from '../shared/schemas';

// Single point of validation
const validatedRequest = AIGenerationRequestSchema.parse(req.body);
```

## Error Handling

Structured error logging with context preservation.

```typescript
try {
  await riskyOperation();
} catch (error) {
  logger.error({ error, context }, 'Operation failed');
  res.status(500).json({ error: 'Internal server error' });
}
```

## Development

### File Structure
```
backend/
├── index.ts              # Main application entry
├── models/               # Mongoose models
├── routes/               # API route handlers
├── services/             # Business logic services
├── utils/                # Utilities (logger, database)
└── middleware/           # Express middleware
```

### Scripts
```bash
npm run dev      # Development with hot reload
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Lint TypeScript files
```

### Development Workflow
1. **Terminal 1 (Backend)**: `cd backend && npm run dev`
2. **Terminal 2 (Frontend)**: `npm run dev` (from project root)

This approach ensures:
- Clear separation between frontend and backend
- Independent development and deployment
- No confusion about which commands to run where

### Dependencies
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **pino** - Fast JSON logger
- **zod** - Schema validation
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT tokens
- **openai** - OpenAI API client

## Production

### Environment Setup
```bash
NODE_ENV=production
LOG_LEVEL=info
DATABASE_URL=mongodb+srv://...
```

### Monitoring
- Database health: `GET /health/database`
- Structured JSON logs for aggregation
- Connection state monitoring
- Automatic reconnection handling

### Deployment
1. Set production environment variables
2. Run `npm run build`
3. Start with `npm start`
4. Monitor logs and health endpoints

## Security

- Password hashing with bcrypt
- JWT token expiration (5 hours)
- CORS configuration for frontend
- Input validation with Zod schemas
- Error sanitization in production
