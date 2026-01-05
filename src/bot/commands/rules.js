const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rules')
        .setDescription('📜 Display The Digital Den server rules'),
    async execute(interaction) {
        const rulesEmbed = new EmbedBuilder()
            .setColor('#8A2BE2')
            .setTitle('📜 The Digital Den Rules')
            .setDescription('Welcome to our high-tech sanctuary! Here are the guidelines to keep this den a safe and fun place for everyone.')
            .addFields(
                {
                    name: '🦊 1. Respect Everyone',
                    value: 'Treat all members with kindness. No harassment, hate speech, or discrimination of any kind.'
                },
                {
                    name: '💬 2. Keep it Clean',
                    value: 'No NSFW content, excessive profanity, or spam. Keep conversations appropriate for all ages.'
                },
                {
                    name: '🎮 3. Stay On Topic',
                    value: 'Use the appropriate channels for your content. Gaming talk in gaming channels, art in creative corner, etc.'
                },
                {
                    name: '🎵 4. No Self-Promotion Without Permission',
                    value: 'Ask a moderator before sharing external links, servers, or promotional content.'
                },
                {
                    name: '🔊 5. Voice Channel Etiquette',
                    value: 'Don\'t spam soundboards, music bots, or scream into the mic. Be considerate of others.'
                },
                {
                    name: '🛡️ 6. Listen to the Mods',
                    value: 'Our moderators are here to help. If they ask you to stop something, please comply.'
                },
                {
                    name: '⚡ 7. Have Fun!',
                    value: 'This is a chill community. Share your projects, play games, make friends, and enjoy your time here!'
                }
            )
            .setFooter({ text: '🦊 Breaking these rules may result in warnings, mutes, or bans.' })
            .setTimestamp();

        await interaction.reply({ embeds: [rulesEmbed] });
    }
};
