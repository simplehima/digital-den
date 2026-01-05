const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (newMessage.author.bot) return;
        if (oldMessage.content === newMessage.content) return; // No content change

        // Find logs channel
        const logChannel = newMessage.guild.channels.cache.find(ch => ch.name === 'message-logs');
        if (!logChannel) return;

        // Create embed
        const embed = new EmbedBuilder()
            .setColor('#F39C12')
            .setTitle('✏️ Message Edited')
            .addFields(
                { name: 'Author', value: `${newMessage.author.tag} (${newMessage.author.id})`, inline: true },
                { name: 'Channel', value: `<#${newMessage.channel.id}>`, inline: true },
                { name: 'Before', value: oldMessage.content || '*[No text]*', inline: false },
                { name: 'After', value: newMessage.content || '*[No text]*', inline: false },
                { name: 'Jump to Message', value: `[Click here](${newMessage.url})`, inline: false }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] });

        console.log(`[EDIT] ${newMessage.author.tag}: ${oldMessage.content} → ${newMessage.content}`);
    }
};
