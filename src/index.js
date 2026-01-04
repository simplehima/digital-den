require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { DisTube } = require('distube');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const express = require('express');
const fs = require('fs');
const path = require('path');

// --- Hostinger Keep-Alive / Health Check ---
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hima The Musician is alive and singing!');
});

app.listen(port, () => {
    console.log(`Web server listening on port ${port}`);
});

// --- Discord Bot Setup ---
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages
    ]
});

// Attach commands to client
client.commands = new Collection();

// --- DisTube Setup (SoundCloud only, YouTube handled in play.js) ---
const ffmpegPath = require('ffmpeg-static');
const distube = new DisTube(client, {
    plugins: [
        new SoundCloudPlugin()
    ],
    ffmpeg: { path: ffmpegPath },
    emitNewSongOnly: true
});

// DisTube events
distube.on('playSong', (queue, song) => {
    console.log(`[${queue.voiceChannel.guild.name}] Now playing: ${song.name}`);
    if (queue.textChannel) {
        queue.textChannel.send(`🎵 Now playing: **${song.name}** - \`${song.formattedDuration}\``).catch(() => { });
    }
});

distube.on('addSong', (queue, song) => {
    console.log(`[${queue.voiceChannel.guild.name}] Added: ${song.name}`);
    if (queue.textChannel) {
        queue.textChannel.send(`✅ Added **${song.name}** to the queue!`).catch(() => { });
    }
});

distube.on('error', (error, queueOrChannel) => {
    console.error('DisTube error:', error.message || error);

    let textChannel = null;
    if (queueOrChannel) {
        if (queueOrChannel.textChannel) textChannel = queueOrChannel.textChannel;
        else if (queueOrChannel.send) textChannel = queueOrChannel;
    }

    if (textChannel) {
        const errorMsg = error?.message || error || 'An unknown error occurred';
        textChannel.send(`❌ **Music Error**: ${errorMsg}`).catch(() => { });
    }
});

distube.on('finish', (queue) => {
    console.log(`[${queue.voiceChannel.guild.name}] Queue finished`);
});

distube.on('disconnect', (queue) => {
    console.log(`[${queue.voiceChannel.guild.name}] Disconnected`);
});

// Attach distube to client
client.distube = distube;

// --- Command Handler ---
const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) {
    fs.mkdirSync(commandsPath);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const commandsToRegister = [];

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if (command.data && command.execute) {
        client.commands.set(command.data.name, command);
        commandsToRegister.push(command.data.toJSON());
    }
}

// --- Deploy Commands ---
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        if (process.env.CLIENT_ID && process.env.DISCORD_TOKEN) {
            console.log(`Started refreshing ${commandsToRegister.length} application (/) commands.`);
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID),
                { body: commandsToRegister },
            );
            console.log('Successfully reloaded application (/) commands.');
        }
    } catch (error) {
        console.error('Failed to register commands:', error);
    }
})();

// --- Events ---
client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log('Hima Bot is ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        console.log(`[Interaction] Command /${interaction.commandName} by ${interaction.user.tag}`);
        await command.execute(interaction);
    } catch (error) {
        console.error('Interaction Execution Error:', error.message || error);

        const content = '❌ There was an error while executing this command!';
        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content, ephemeral: true });
            } else {
                await interaction.reply({ content, ephemeral: true });
            }
        } catch (e) {
            // Silently fail if interaction is already closed
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
