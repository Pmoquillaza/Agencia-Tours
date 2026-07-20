module.exports = {
    apps: [
        {
            name: 'travelgo-backend',
            cwd: '/var/www/travelgo/backend',
            script: 'index.js',
            instances: 1,
            exec_mode: 'fork',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            },
            max_memory_restart: '350M'
        }
    ]
};
