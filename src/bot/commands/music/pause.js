const { SlashCommandBuilder } = require('discord.js');
const musicQueue = require('../../utils/MusicQueue');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),

    async execute(interaction) {
        const queue = musicQueue.getQueue(interaction.guildId);

        if (!queue.audioPlayer) {
            return await interaction.reply({
                content: '❌ Nothing is playing right now!',
                ephemeral: true
            });
        }

        if (queue.audioPlayer.state.status === AudioPlayerStatus.Paused) {
            return await interaction.reply({
                content: '⏸️ Already paused!',
                ephemeral: true
            });
        }

        queue.audioPlayer.pause();
        await interaction.reply('⏸️ Paused!');
    },
};
