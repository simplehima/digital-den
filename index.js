const path = require('path');
// specific secure path: 2 levels up from typical public_html/discord-bots structure
require('dotenv').config({ path: path.join(__dirname, '../../.env-dis') });
// fallback to default .env just in case
require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const fs = require('fs');

// --- BOT SETUP ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

// Load Commands
const commandsPath = path.join(__dirname, 'src/bot/commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Load Events
const eventsPath = path.join(__dirname, 'src/bot/events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

const { REST, Routes } = require('discord.js');

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const CLIENT_ID = client.user.id;
    // Use the guild from .env if available for faster updates, otherwise global (can take 1h)
    // or register for all guilds the bot is in (since this is a management bot)

    const commandsData = [];
    client.commands.forEach(cmd => commandsData.push(cmd.data.toJSON()));

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

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

app.listen(PORT, () => {
    console.log(`Web server running on port ${PORT}`);
});

module.exports = { client }; // Export client for use in other files if needed
