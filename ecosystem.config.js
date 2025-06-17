const path = require('path');

module.exports = {
    apps: [
        {
            name: 'notifications',
            script: './src/bots/momento-notifications/index.ts',
            interpreter: 'node',
            interpreter_args: '--import tsx',
            watch: false,
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'development',
            },
        },
        {
            name: 'profile-updater',
            script: './src/bots/momento-profile-updater/index.ts',
            interpreter: 'node',
            interpreter_args: '--import tsx',
            watch: false,
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'development',
            },
        },
        {
            name: 'analytics',
            script: './src/bots/momento-analytics/index.ts',
            interpreter: 'node',
            interpreter_args: '--import tsx',
            watch: false,
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'development',
            },
        },
    ],
};
