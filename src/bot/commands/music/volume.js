const { SlashCommandBuilder } = require('discord.js');
const musicQueue = require('../../utils/MusicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjust the playback volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)
        ),

    async execute(interaction) {
        const queue = musicQueue.getQueue(interaction.guildId);

        if (!queue.audioPlayer) {
            return await interaction.reply({
                content: '❌ Nothing is playing right now!',
                ephemeral: true
            });
        }

        const volume = interaction.options.getInteger('level');
        musicQueue.setVolume(interaction.guildId, volume);

        // Update current playing volume if exists
        if (queue.audioPlayer.state.resource?.volume) {
            queue.audioPlayer.state.resource.volume.setVolume(volume / 100);
        }

        await interaction.reply(`🔊 Volume set to ${volume}%`);
    },
};
