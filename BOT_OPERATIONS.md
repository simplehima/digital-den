# Bot Operations Guide

## Quick Start - Getting Bot Online Now

### Option 1: Quick Start (Windows)
```bash
# Double-click this file or run in terminal:
start-bot.bat
```

### Option 2: Manual Start
```bash
# Navigate to the bot directory
cd "d:\Github Repos\Hima The Musician"

# Start the bot
node index.js
```

The bot should now appear online in Discord! ✅

---

## 24/7 Uptime Solutions

### Solution A: PM2 Process Manager (Recommended for VPS/Dedicated Hosting)

#### 1. Install PM2 Globally
```bash
npm install -g pm2
```

#### 2. Start Bot with PM2
```bash
# Start the bot
pm2 start ecosystem.config.js

# Check status
pm2 status

# View logs
pm2 logs hima-bot

# Restart bot
pm2 restart hima-bot

# Stop bot
pm2 stop hima-bot
```

#### 3. Enable Auto-Start on Server Reboot
```bash
# Generate startup script
pm2 startup

# Save current process list
pm2 save
```

**Benefits of PM2:**
- ✅ Automatic restart on crash
- ✅ Memory management (restarts if >500MB)
- ✅ Log rotation and management
- ✅ Zero-downtime updates
- ✅ Monitoring dashboard

---

### Solution B: Cron-Based Monitoring (For Shared Hosting like Hostinger)

#### 1. Test Monitor Script Locally
```bash
# Run monitor once to test
node monitor.js
```

#### 2. Set Up Cron Job on Hostinger

**For Hostinger Shared Hosting:**

1. Log in to your Hostinger Control Panel
2. Go to **Advanced** → **Cron Jobs**
3. Create a new cron job:

```bash
# Run every minute to check if bot is alive
* * * * * cd /home/username/public_html/discord-bot && node monitor.js
```

Replace `/home/username/public_html/discord-bot` with your actual bot path.

**What this does:**
- Checks bot heartbeat every minute
- If heartbeat is >2 minutes old, restarts the bot automatically
- Logs all restart attempts to `logs/monitor.log`

---

### Solution C: Windows Task Scheduler (For Local Windows Server)

1. Open **Task Scheduler**
2. Create Basic Task:
   - **Name:** Bot Monitor
   - **Trigger:** Every 1 minute
   - **Action:** Start a program
   - **Program:** `node`
   - **Arguments:** `monitor.js`
   - **Start in:** `d:\Github Repos\Hima The Musician`

---

## Monitoring & Logs

### Check Bot Status
```bash
# View status file (updated every 30 seconds)
type bot-status.json  # Windows
cat bot-status.json   # Linux/Mac
```

### View Logs
```bash
# Error logs only
type logs\errors.log  # Windows
cat logs/errors.log   # Linux/Mac

# All bot logs
type logs\bot.log

# Monitor logs (if using cron)
type logs\monitor.log

# PM2 logs (if using PM2)
pm2 logs hima-bot
```

### Real-Time Log Monitoring
```bash
# PM2 users
pm2 logs hima-bot --lines 100

# Manual monitoring (Windows)
Get-Content logs\bot.log -Wait -Tail 20

# Manual monitoring (Linux/Mac)
tail -f logs/bot.log
```

---

## Troubleshooting

### Bot is Offline

1. **Check if process is running:**
   ```bash
   # PM2 users
   pm2 status
   
   # Manual check (Windows)
   tasklist /FI "IMAGENAME eq node.exe"
   
   # Manual check (Linux/Mac)
   ps aux | grep "node index.js"
   ```

2. **Check error logs:**
   ```bash
   type logs\errors.log
   ```

3. **Common issues:**
   - ❌ Invalid Discord token → Check `.env-dis` file
   - ❌ Missing dependencies → Run `npm install`
   - ❌ Port already in use → Change `PORT` in `.env-dis`
   - ❌ Out of memory → Bot will auto-restart if using PM2

4. **Manual restart:**
   ```bash
   # PM2 users
   pm2 restart hima-bot
   
   # Manual users
   # 1. Kill existing process
   # 2. Run: start-bot.bat
   ```

### Bot Keeps Crashing

1. **Check memory usage:**
   ```bash
   # In bot-status.json, check "memory" field
   # If consistently >300MB, there may be a memory leak
   ```

2. **Review error logs:**
   ```bash
   type logs\errors.log
   # Look for repeated errors
   ```

3. **Enable debug mode:**
   Add to `.env-dis`:
   ```
   DEBUG=true
   ```

### Monitor Script Not Working

1. **Test manually:**
   ```bash
   node monitor.js
   ```

2. **Check permissions:**
   - Ensure script can read `bot-status.json`
   - Ensure script can write to `logs/monitor.log`

3. **Verify cron job:**
   ```bash
   # Check cron logs (Hostinger)
   # Control Panel → Cron Jobs → View Logs
   ```

---

## Maintenance

### Update Bot
```bash
# PM2 users
git pull
npm install
pm2 restart hima-bot

# Manual users
git pull
npm install
# Restart using start-bot.bat
```

### Clear Logs
```bash
# Clear all logs (keeps files)
echo. > logs\bot.log
echo. > logs\errors.log
echo. > logs\monitor.log

# PM2 users
pm2 flush  # Clear PM2 logs
```

### Backup Configuration
```bash
# Backup important files
copy .env-dis .env-dis.backup
copy bot-status.json bot-status.backup.json
```

---

## Environment Variables

Required variables in `.env-dis`:

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=https://yourdomain.com/auth/callback
SESSION_SECRET=your_random_session_secret
PORT=3000
GUILD_ID=your_guild_id (optional, for faster command updates)
```

---

## Best Practices

1. **Use PM2** if you have VPS or dedicated hosting
2. **Use Cron + Monitor Script** for shared hosting
3. **Check logs regularly** for unusual patterns
4. **Keep dependencies updated** with `npm update`
5. **Monitor memory usage** in `bot-status.json`
6. **Set up alerts** for critical errors (optional)

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `start-bot.bat` | Quick start (Windows) |
| `node index.js` | Start bot manually |
| `node monitor.js` | Check/restart bot |
| `pm2 start ecosystem.config.js` | Start with PM2 |
| `pm2 logs` | View PM2 logs |
| `pm2 restart hima-bot` | Restart bot |
| `type bot-status.json` | Check bot health |

---

## Support

If you continue to experience issues:
1. Check `logs/errors.log` for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure Node.js version is compatible (v16+)
4. Check Discord API status: https://discordstatus.com/

For hosting-specific issues:
- **Hostinger:** Contact support about Node.js process management
- **VPS:** Ensure firewall allows outbound connections to Discord API
