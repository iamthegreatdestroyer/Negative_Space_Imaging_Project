/**
 * Application Entry Point
 * Initialize and start the Negative Space Imaging API server
 */

import dotenv from 'dotenv';
import { startServer } from './server/server';
import { log } from './services/loggingService';

// Load environment variables
dotenv.config();

/**
 * Application entry point
 */
async function main(): Promise<void> {
  try {
    log.info('🌟 Negative Space Imaging API Server');
    log.info(`Environment: ${process.env.NODE_ENV || 'development'}`);

    // Start the server
    await startServer();
  } catch (error) {
    log.error('Failed to start application', error as Error);
    process.exit(1);
  }
}

// Execute entry point
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => shutdownGracefully('SIGTERM'));
    process.on('SIGINT', () => shutdownGracefully('SIGINT'));
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer().catch((error) => {
  console.error('Unhandled error during startup:', error);
  process.exit(1);
});
