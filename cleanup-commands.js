require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log('Deleting all commands...');

        // Delete guild commands
        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
                { body: [] }
            );
            console.log('✓ Deleted guild commands');
        }

        // Delete global commands
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: [] }
        );
        console.log('✓ Deleted global commands');
        console.log('All old commands removed! Restart the bot to re-register new ones.');
    } catch (error) {
        console.error('Error:', error);
    }
})();
