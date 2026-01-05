const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('👤 View information about a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to get info about (defaults to you)')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);

        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle(`${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .addFields(
                { name: '🆔 User ID', value: user.id, inline: true },
                { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '📥 Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '🎭 Roles', value: member.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join(', ') || 'None', inline: false }
            )
            .setFooter({ text: `Requested by ${interaction.user.tag}` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
