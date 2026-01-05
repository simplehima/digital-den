const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('📣 Make an announcement (Admin only)')
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The announcement message')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to send announcement (defaults to current channel)'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        const channel = interaction.options.getChannel('channel') || interaction.channel;

        const announceEmbed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('📣 Announcement')
            .setDescription(message)
            .setFooter({ text: `Posted by ${interaction.user.tag}` })
            .setTimestamp();

        await channel.send({ embeds: [announceEmbed] });
        await interaction.reply({ content: `✅ Announcement posted in ${channel}`, ephemeral: true });
    }
};
