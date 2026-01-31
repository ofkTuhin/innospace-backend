module.exports = {
  apps: [
    {
      name: 'svm-api',
      script: './dist/server.js', // entry point after build
      instances: 1, // or 'max' for all CPU cores
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 5002,
      },
    },
  ],
}
// This configuration is for PM2, a process manager for Node.js applications.
