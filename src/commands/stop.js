const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stops the music and clears the queue'),
    async execute(interaction) {
        const distube = interaction.client.distube;
        const queue = distube.getQueue(interaction.guildId);

        if (!queue) {
            return interaction.reply('I am not playing anything!');
        }

        await distube.stop(interaction.guildId);
        return interaction.reply('⏹️ Stopped the music!');
    },
};
