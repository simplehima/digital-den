const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/MusicPlayer');
const musicQueue = require('../../utils/MusicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

    async execute(interaction) {
        const queue = musicQueue.getQueue(interaction.guildId);

        if (!queue.voiceConnection) {
            return await interaction.reply({
                content: '❌ Nothing is playing right now!',
                ephemeral: true
            });
        }

        if (musicQueue.isEmpty(interaction.guildId)) {
            return await interaction.reply({
                content: '❌ Queue is empty!',
                ephemeral: true
            });
        }

        // Stop current song (will trigger next via event listener)
        queue.audioPlayer.stop();

        await interaction.reply('⏭️ Skipped!');
    },
};
