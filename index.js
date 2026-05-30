const path = require('path');
const fs = require('fs');

// Verify logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Logging utility
function logToFile(level, message, error = null) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}${error ? '\n' + error.stack : ''}\n`;

    // Console output
    console.log(logMessage.trim());

    // File output
    const logFile = level === 'ERROR' ? 'logs/errors.log' : 'logs/bot.log';
    fs.appendFileSync(path.join(__dirname, logFile), logMessage);
}

// Try multiple paths for .env-dis
const possiblePaths = [
    path.join(__dirname, '../../.env-dis'), // For public_html/discord-bots
    path.join(__dirname, '../.env-dis')     // For public_html root
];

let envFound = false;
for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
        console.log('Loading .env from:', envPath);
        require('dotenv').config({ path: envPath });
        envFound = true;
        break;
    }
}

if (!envFound) {
    console.log('Could not find .env-dis in expected paths. Trying default .env');
    require('dotenv').config();
}

console.log('Token status:', process.env.DISCORD_TOKEN ? 'Token Found' : 'Token Missing');
console.log('App ID:', process.env.CLIENT_ID || 'Missing');

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;



// --- BOT SETUP ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.commands = new Collection();

// Load Commands (recursively from subdirectories)
function loadCommands(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively load commands from subdirectories
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            // Load command file
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                console.log(`[COMMAND] Loaded: ${command.data.name}`);
            } else {
                console.log(`[WARNING] Command at ${filePath} is missing "data" or "execute" property.`);
            }
        }
    }
}

const commandsPath = path.join(__dirname, 'src/bot/commands');
if (fs.existsSync(commandsPath)) {
    loadCommands(commandsPath);
}

// Load Events (recursively from subdirectories)
function loadEvents(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Recursively load events from subdirectories
            loadEvents(filePath);
        } else if (file.endsWith('.js')) {
            // Load event file
            const event = require(filePath);
            if (event.name && event.execute) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args));
                } else {
                    client.on(event.name, (...args) => event.execute(...args));
                }
                console.log(`[EVENT] Loaded: ${event.name} from ${filePath}`);
            } else {
                console.log(`[WARNING] Event at ${filePath} is missing "name" or "execute" property.`);
            }
        }
    }
}

const eventsPath = path.join(__dirname, 'src/bot/events');
if (fs.existsSync(eventsPath)) {
    loadEvents(eventsPath);
}

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing ${interaction.commandName}:`, error);
        const reply = { content: 'There was an error while executing this command!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(reply);
        } else {
            await interaction.reply(reply);
        }
    }
});

const { REST, Routes } = require('discord.js');

client.once('ready', async () => {
    const loginMsg = `Bot logged in as ${client.user.tag}`;
    console.log(loginMsg);
    logToFile('INFO', loginMsg);

    // Write status file for PHP control panel
    const writeStatus = () => {
        const statusData = {
            status: 'online',
            uptime: process.uptime(),
            memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            timestamp: Date.now(),
            heartbeat: new Date().toISOString(),
            user: client.user.tag
        };
        fs.writeFileSync(path.join(__dirname, 'bot-status.json'), JSON.stringify(statusData, null, 2));
        // Heartbeat console log (don't spam the log file)
    };
    writeStatus();
    setInterval(writeStatus, 30000); // Update every 30 seconds

    const CLIENT_ID = client.user.id;
    // Use the guild from .env if available for faster updates, otherwise global (can take 1h)
    // or register for all guilds the bot is in (since this is a management bot)

    const commandsData = [];
    client.commands.forEach(cmd => commandsData.push(cmd.data.toJSON()));

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        // Set Bot Presence
        // Note: Bots cannot use Rich Presence assets (custom images)
        // Assets only work for user accounts, not bot accounts
        client.user.setPresence({
            activities: [{
                name: 'The Digital Den | /help',
                type: 3 // WATCHING
            }],
            status: 'online'
        });

        // If GUILD_ID is set in .env, register only for that guild (instant)
        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_ID),
                { body: commandsData },
            );
            console.log(`Successfully registered commands for guild ${process.env.GUILD_ID}`);
        } else {
            // Otherwise, register global commands
            await rest.put(
                Routes.applicationCommands(CLIENT_ID),
                { body: commandsData },
            );
            console.log('Successfully registered global application commands.');
        }

    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

client.on('error', (error) => {
    logToFile('ERROR', 'Discord Client Error', error);
});

client.login(process.env.DISCORD_TOKEN).catch((err) => {
    logToFile('ERROR', 'FAILED TO LOGIN - Check your DISCORD_TOKEN', err);
    process.exit(1);
});


// --- WEB SERVER SETUP ---
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/web/views'));
app.use(express.static(path.join(__dirname, 'src/assets')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'super secret key',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

const hasDashboardCreds = process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.REDIRECT_URI;

if (hasDashboardCreds) {
    passport.use(new DiscordStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: process.env.REDIRECT_URI,
        scope: ['identify', 'guilds']
    }, (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));

    // Routes
    const authRoutes = require('./src/web/routes/auth');
    const dashboardRoutes = require('./src/web/routes/dashboard');

    app.use('/auth', authRoutes);
    app.use('/dashboard', dashboardRoutes);

    app.get('/', (req, res) => {
        res.render('index', { user: req.user });
    });
} else {
    console.log('[WARNING] CLIENT_ID, CLIENT_SECRET, or REDIRECT_URI is missing. Web dashboard login is disabled.');
    
    app.get('/', (req, res) => {
        res.send('<h1>Digital Den Bot</h1><p>Web dashboard is disabled because CLIENT_ID or CLIENT_SECRET is not configured.</p>');
    });
}

// Add health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'online',
        bot: client.user?.tag || 'Not ready',
        uptime: process.uptime(),
        guilds: client.guilds.cache ? client.guilds.cache.size : 0,
        dashboardEnabled: !!hasDashboardCreds
    });
});

// Start the Express server
app.listen(PORT, () => {
    console.log(`Web server and health check running on port ${PORT}`);
    logToFile('INFO', `Web server started on port ${PORT}`);
});

// --- ERROR HANDLING & PURSUIT OF 24/7 ---
process.on('unhandledRejection', (reason, promise) => {
    logToFile('ERROR', `Unhandled Rejection at: ${promise}`, reason instanceof Error ? reason : new Error(String(reason)));
});

process.on('uncaughtException', (err, origin) => {
    logToFile('ERROR', `Uncaught Exception (origin: ${origin})`, err);
    // Give time to write logs before potential exit
    setTimeout(() => {
        console.error('Critical error - process may need restart');
    }, 1000);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logToFile('INFO', 'Received SIGINT - shutting down gracefully');
    client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    logToFile('INFO', 'Received SIGTERM - shutting down gracefully');
    client.destroy();
    process.exit(0);
});

module.exports = { client }; // Export client for use in other files if needed
