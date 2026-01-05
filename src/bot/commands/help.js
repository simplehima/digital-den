const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('❓ View all available commands'),
    async execute(interaction) {
        const helpEmbed = new EmbedBuilder()
            .setColor('#00D9FF')
            .setTitle('🦊 The Digital Den - Command List')
            .setDescription('Here are all the commands you can use!')
            .addFields(
                {
                    name: '📋 General Commands',
                    value: '`/help` - Show this message\n`/rules` - View server rules\n`/serverinfo` - Server information'
                },
                {
                    name: '🛡️ Admin Commands',
                    value: '`/setup` - Set up server roles and channels\n`/announce` - Post an announcement'
                }
            )
            .setFooter({ text: '🦊 The Digital Den' })
            .setTimestamp();

        await interaction.reply({ embeds: [helpEmbed], ephemeral: true });
    }
};
