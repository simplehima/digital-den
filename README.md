# Hima The Musician - Discord Bot

A Discord bot with web dashboard for The Digital Den server.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env-dis` file in the root directory (or in the parent directory if deploying to hosting):

```env
DISCORD_TOKEN=your_discord_bot_token_here
CLIENT_ID=your_discord_client_id_here
CLIENT_SECRET=your_discord_client_secret_here
REDIRECT_URI=https://yourdomain.com/auth/callback
SESSION_SECRET=your_random_session_secret_here
PORT=3000
GUILD_ID=your_guild_id_optional
```

### 3. Start the Bot

**Option A: Quick Start (Windows)**
```bash
start-bot.bat
```

**Option B: Manual Start**
```bash
node index.js
```

## 📚 Documentation

For complete setup, monitoring, and troubleshooting instructions, see:
- **[BOT_OPERATIONS.md](BOT_OPERATIONS.md)** - Complete operations guide

## 🔧 Features

- ✅ Discord bot with slash commands
- ✅ Web dashboard with Discord OAuth
- ✅ Moderation commands (ban, lock, unlock)
- ✅ Auto-restart on crash (with PM2)
- ✅ Heartbeat monitoring
- ✅ File-based logging
- ✅ Graceful shutdown handling

## 📁 Project Structure

```
├── index.js                 # Main bot entry point
├── start-bot.bat            # Quick start script (Windows)
├── monitor.js               # Health check & auto-restart script
├── ecosystem.config.js      # PM2 configuration
├── src/
│   ├── bot/
│   │   ├── commands/        # Slash commands
│   │   └── events/          # Bot events
│   └── web/
│       ├── routes/          # Web routes
│       └── views/           # EJS templates
└── logs/                    # Bot logs (auto-generated)
```

## 🔄 Keeping Bot Online 24/7

### For VPS/Dedicated Hosting (Recommended)
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Enable auto-start on reboot
pm2 startup
pm2 save
```

### For Shared Hosting (Hostinger)
Set up a cron job to run every minute:
```bash
* * * * * cd /path/to/bot && node monitor.js
```

See [BOT_OPERATIONS.md](BOT_OPERATIONS.md) for detailed instructions.

## 📊 Monitoring

Check bot health:
```bash
# View status file
type bot-status.json

# View logs
type logs\bot.log
type logs\errors.log
```

## ⚠️ Troubleshooting

If bot goes offline:
1. Check `logs/errors.log` for errors
2. Verify `.env-dis` file exists and has correct values
3. Restart using `start-bot.bat` or `pm2 restart hima-bot`
4. Run `node monitor.js` to check health and auto-restart

For detailed troubleshooting, see [BOT_OPERATIONS.md](BOT_OPERATIONS.md).

## 📝 License

Private project for The Digital Den server.
