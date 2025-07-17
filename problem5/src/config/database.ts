import { PrismaClient } from '@prisma/client';

// Singleton Prisma client instance
class DatabaseManager {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new PrismaClient({
        log: ['query', 'info', 'warn', 'error']
      });

      console.log('🔗 Prisma Client connected to SQLite database');
    }

    return DatabaseManager.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseManager.instance) {
      await DatabaseManager.instance.$disconnect();
      console.log('🔌 Prisma Client disconnected');
    }
  }

  // Handle graceful shutdown
  public static setupGracefulShutdown(): void {
    process.on('SIGINT', async () => {
      console.log('\n⚡ Received SIGINT, shutting down gracefully...');
      await DatabaseManager.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n⚡ Received SIGTERM, shutting down gracefully...');
      await DatabaseManager.disconnect();
      process.exit(0);
    });
  }
}

export default DatabaseManager;
