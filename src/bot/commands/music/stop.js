const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicQueue = require('../../utils/MusicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop playing and clear the queue'),

    async execute(interaction) {
        const queue = musicQueue.getQueue(interaction.guildId);

        if (!queue.voiceConnection) {
            return await interaction.reply({
                content: '❌ Nothing is playing right now!',
                ephemeral: true
            });
        }

        // Stop player and disconnect
        if (queue.audioPlayer) {
            queue.audioPlayer.stop();
        }

        if (queue.voiceConnection) {
            queue.voiceConnection.destroy();
        }

        // Clear queue
        musicQueue.delete(interaction.guildId);

        await interaction.reply('⏹️ Stopped playing and cleared the queue.');
    },
};
