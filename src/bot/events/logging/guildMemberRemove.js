const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const logChannel = member.guild.channels.cache.find(ch => ch.name === 'server-logs');
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('👋 Member Left')
            .setDescription(`${member.user.tag} has left the server`)
            .setThumbnail('https://media.giphy.com/media/2ept7eRuyq98s/giphy.gif') // Wave goodbye GIF
            .addFields(
                { name: 'User', value: `${member.user.tag}\n<@${member.id}>`, inline: true },
                { name: 'ID', value: `\`${member.id}\``, inline: true },
                { name: 'Joined', value: member.joinedAt ? `<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>` : 'Unknown', inline: true }
            )
            .setFooter({ text: `Total members: ${member.guild.memberCount}` })
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });
    }
};
