import config from './config.json';
import { app } from './app';
import { Server } from "http";
import mongoose from 'mongoose';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = (process.env.IP || '127.0.0.1');

// ====================================================================
// ====================================================================
let server: Server | null = null;

mongoose.connect(process.env.MONGODB_URI, {
})
  .then(() => {
    console.log('DB Connection Successful')
    server = app.listen(PORT, HOST, () => {
      console.log(`Server running on ${PORT}`);
    });
  });


// For coverage, handle Ctrl+C gracefully
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, () => {
    if (!server) {
      process.exit(0);
    }

    server.close(() => {
      console.log("Server closed Gracefully");
      process.exit();
    });
  });
});

