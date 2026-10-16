import app from './app';
import { config } from './config/env';
import { initDatabase } from './config/database';

async function startServer() {
  try {
    // Initialize PostgreSQL database connection & tables
    const dbOk = await initDatabase();
    if (!dbOk) {
      console.error('Failed to initialize database. Server startup aborted.');
      process.exit(1);
    }

    const server = app.listen(config.port, () => {
      console.log(`========================================`);
      console.log(`🚀 BizTrack Backend Server is running!`);
      console.log(`📡 URL: http://localhost:${config.port}`);
      console.log(`🩺 Health: http://localhost:${config.port}/api/health`);
      console.log(`📊 Stats: http://localhost:${config.port}/api/stats`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🗄️ Database: Neon Cloud PostgreSQL`);
      console.log(`========================================`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received. Closing HTTP server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT signal received. Closing HTTP server...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

