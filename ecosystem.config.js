module.exports = {
  apps: [
    {
      name: 'shikshagraha-app',
      script: 'node_modules/.bin/next',
      args: 'start -p 3000',
      cwd: 'apps/shikshagraha-app',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
