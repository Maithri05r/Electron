export const config = {
  APP_NAME: 'SDRPOCApp',
  PORT: 41234,
  BROADCAST_INTERVAL: 5000, // how often to announce
  TTL_MS: 30000, // consider peer offline after 30s silence
  APP_ID: 'com.alten.sdrpoc', // change to your app
  SHARED_SECRET: '', // optional: set to enable HMAC signing
  TCP_PORT: 5000,
};
