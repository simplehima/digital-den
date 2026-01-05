const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'messageDelete',
    async execute(message) {
        if (message.author.bot) return; // Ignore bot messages

        // Find logs channel
        const logChannel = message.guild.channels.cache.find(ch => ch.name === 'message-logs');
        if (!logChannel) return;

        // Create embed
        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🗑️ Message Deleted')
            .addFields(
                { name: 'Author', value: `${message.author.tag} (${message.author.id})`, inline: true },
                { name: 'Channel', value: `<#${message.channel.id}>`, inline: true },
                { name: 'Content', value: message.content || '*[No text content]*', inline: false }
            )
            .setTimestamp();

        if (message.attachments.size > 0) {
            embed.addFields({ name: 'Attachments', value: `${message.attachments.size} file(s)` });
        }

        await logChannel.send({ embeds: [embed] });

        // Save to database (will add this functionality)
        console.log(`[DELETE] ${message.author.tag}: ${message.content}`);
    }
};
