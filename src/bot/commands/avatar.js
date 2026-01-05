const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('🖼️ View a user\'s avatar')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose avatar to view (defaults to you)')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setColor('#E91E63')
            .setTitle(`${user.username}'s Avatar`)
            .setImage(avatarURL)
            .setFooter({ text: 'Click the image to view full size' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
