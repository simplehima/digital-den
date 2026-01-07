const { SlashCommandBuilder } = require('discord.js');
const musicQueue = require('../../utils/MusicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Set loop mode')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode')
                .setRequired(true)
                .addChoices(
                    { name: 'Off', value: 'off' },
                    { name: 'Song', value: 'song' },
                    { name: 'Queue', value: 'queue' }
                )
        ),

    async execute(interaction) {
        const queue = musicQueue.getQueue(interaction.guildId);

        if (!queue.voiceConnection) {
            return await interaction.reply({
                content: '❌ Nothing is playing right now!',
                ephemeral: true
            });
        }

        const mode = interaction.options.getString('mode');
        musicQueue.setLoopMode(interaction.guildId, mode);

        const modeEmojis = {
            'off': '➡️',
            'song': '🔂',
            'queue': '🔁'
        };

        const modeNames = {
            'off': 'Off',
            'song': 'Current Song',
            'queue': 'Queue'
        };

        await interaction.reply(`${modeEmojis[mode]} Loop mode set to: **${modeNames[mode]}**`);
    },
};
