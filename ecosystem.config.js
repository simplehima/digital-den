module.exports = {
    apps: [{
        name: 'hima-bot',
        script: './index.js',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '500M',
        error_file: './logs/pm2-error.log',
        out_file: './logs/pm2-out.log',
        log_file: './logs/pm2-combined.log',
        time: true,
        env: {
            NODE_ENV: 'production'
        },
        // Restart settings
        exp_backoff_restart_delay: 100,
        max_restarts: 10,
        min_uptime: '10s',
        // Auto-restart on crash
        restart_delay: 4000
    }]
};
