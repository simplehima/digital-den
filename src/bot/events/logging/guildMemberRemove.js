const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const logChannel = member.guild.channels.cache.find(ch => ch.name === 'member-logs');
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('👋 Member Left')
            .setThumbnail(member.user.displayAvatarURL())
            .addFields(
                { name: 'User', value: `${member.user.tag}`, inline: true },
                { name: 'ID', value: member.id, inline: true },
                { name: 'Joined', value: member.joinedAt ? member.joinedAt.toLocaleDateString() : 'Unknown', inline: true },
                { name: 'Roles', value: member.roles.cache.map(r => r.name).filter(n => n !== '@everyone').join(', ') || 'None' }
            )
            .setFooter({ text: `Members: ${member.guild.memberCount}` })
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    }
};
