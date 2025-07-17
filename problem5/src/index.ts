import express from 'express';
import userRoutes from './routes/userRoutes';
import { swaggerUi, specs } from './config/swagger';
import DatabaseManager from './config/database';

const app = express();

// Middleware
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'User Management API - TypeScript + Prisma Edition',
    documentation: 'http://localhost:3000/api-docs',
    features: [
      'TypeScript implementation',
      'Prisma ORM with type safety',
      'SQLite database persistence',
      'SQL injection protection',
      'Input validation & sanitization',
      'CRUD operations',
      'User filtering',
      'Email uniqueness validation',
      'Swagger documentation'
    ],
    security: [
      '✅ Prisma ORM prevents SQL injection',
      '✅ Input validation and sanitization',
      '✅ Type-safe database operations',
      '✅ Email format validation',
      '✅ Parameter validation',
      '✅ Error handling'
    ]
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;

// Setup graceful shutdown
DatabaseManager.setupGracefulShutdown();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`💾 Database: Prisma + SQLite (users.db)`);
  console.log(`🔒 Security: SQL injection protection enabled`);
});

export default app;
