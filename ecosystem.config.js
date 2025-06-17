const path = require('path');

module.exports = {
    apps: [
        {
            name: 'momento-notifications',
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
            name: 'momento-profile-updater',
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
            name: 'momento-analytics',
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
