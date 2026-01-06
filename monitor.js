const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const STATUS_FILE = path.join(__dirname, 'bot-status.json');
const LOG_FILE = path.join(__dirname, 'logs', 'monitor.log');
const MAX_HEARTBEAT_AGE = 120000; // 2 minutes in milliseconds

// Ensure logs directory exists
if (!fs.existsSync(path.join(__dirname, 'logs'))) {
    fs.mkdirSync(path.join(__dirname, 'logs'));
}

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(LOG_FILE, logMessage);
}

function isBotAlive() {
    try {
        if (!fs.existsSync(STATUS_FILE)) {
            log('⚠️  Status file not found - bot may not be running');
            return false;
        }

        const statusData = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
        const lastHeartbeat = statusData.timestamp || 0;
        const now = Date.now();
        const age = now - lastHeartbeat;

        if (age > MAX_HEARTBEAT_AGE) {
            log(`❌ Bot heartbeat is stale (${Math.round(age / 1000)}s old) - bot appears dead`);
            return false;
        }

        log(`✅ Bot is alive (heartbeat ${Math.round(age / 1000)}s ago)`);
        return true;
    } catch (error) {
        log(`⚠️  Error checking bot status: ${error.message}`);
        return false;
    }
}

function restartBot() {
    log('🔄 Attempting to restart bot...');

    try {
        // Start the bot in a detached process
        const bot = spawn('node', ['index.js'], {
            detached: true,
            stdio: 'ignore',
            cwd: __dirname
        });

        bot.unref();
        log(`✅ Bot restart initiated (PID: ${bot.pid})`);
        return true;
    } catch (error) {
        log(`❌ Failed to restart bot: ${error.message}`);
        return false;
    }
}

function main() {
    log('========================================');
    log('🔍 Bot Monitor - Checking bot health...');

    if (!isBotAlive()) {
        log('🚨 Bot is not responding - initiating restart');
        restartBot();
    }

    log('========================================');
}

// Run the monitor
main();
