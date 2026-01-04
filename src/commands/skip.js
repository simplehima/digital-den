const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the current song'),
    async execute(interaction) {
        const distube = interaction.client.distube;
        const queue = distube.getQueue(interaction.guildId);

        if (!queue) {
            return interaction.reply('I am not playing anything!');
        }

        try {
            await distube.skip(interaction.guildId);
            return interaction.reply('⏭️ Skipped the current track!');
        } catch (e) {
            return interaction.reply('There is no next song in the queue!');
        }
    },
};
