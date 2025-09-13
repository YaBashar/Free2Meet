import config from './config.json';
import { app } from './app';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = (process.env.IP || '127.0.0.1');

// ====================================================================
// ====================================================================

const server = app.listen(PORT, HOST, () => {
  console.log(`Server running on ${PORT}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => {
    console.log('Shutting down server gracefully.');
    process.exit();
  });
});
