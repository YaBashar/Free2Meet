/* eslint-env node */
/* eslint-disable no-undef, @typescript-eslint/no-require-imports */
const mongoose = require("mongoose");

require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });

process.env.MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || process.env.MONGODB_URI;

// Fail fast when tests hit models without an active DB connection.
mongoose.set("bufferCommands", false);
mongoose.set("bufferTimeoutMS", 2000);

