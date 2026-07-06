require('dotenv').config();

const required = ['DATABASE_URL', 'CLERK_SECRET_KEY', 'CLERK_PUBLISHABLE_KEY'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Falta la variable de entorno: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  guardianAiUrl: process.env.GUARDIAN_AI_URL || 'http://localhost:8000',
  guardianAiTimeoutMs: Number(process.env.GUARDIAN_AI_TIMEOUT_MS || 60000),
};
