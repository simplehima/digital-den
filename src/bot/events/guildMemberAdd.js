const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const welcomeChannelName = 'welcome';
        const channel = member.guild.channels.cache.find(ch => ch.name === welcomeChannelName);

        // Welcome GIF URL
        const WELCOME_GIF = 'https://media.giphy.com/media/Cmr1OMJ2FN0B2/giphy.gif';

        // Send DM to new member
        try {
            const dmEmbed = new EmbedBuilder()
                .setColor('#8a2be2')
                .setTitle(`🦊 Welcome to ${member.guild.name}!`)
                .setDescription(`Hey **${member.user.username}**! 👋\n\nWe're excited to have you join our community!\n\n📜 Check out <#rules> for our server rules\n💬 Introduce yourself in <#general-chat>\n🎮 Have fun and enjoy your stay!`)
                .setImage(WELCOME_GIF)
                .setThumbnail(member.guild.iconURL({ size: 128 }))
                .setFooter({ text: `You are member #${member.guild.memberCount}` })
                .setTimestamp();

            await member.send({ embeds: [dmEmbed] });
            console.log(`Sent DM welcome to ${member.user.tag}`);
        } catch (dmError) {
            console.log(`Could not DM ${member.user.tag} - DMs may be disabled`);
        }

        // Send welcome in channel
        if (!channel) return;

        try {
            // Unassigning canvas here to handle potential load failures safely
            let Canvas;
            try {
                Canvas = require('canvas');
            } catch (e) {
                console.log('Canvas not found or failed to load. Skipping image generation.');
            }

            if (Canvas) {
                const canvas = Canvas.createCanvas(1024, 450); // Typical banner size
                const ctx = canvas.getContext('2d');

                // Load Background
                const bgPath = path.join(__dirname, '../../assets/background.png');
                if (fs.existsSync(bgPath)) {
                    const background = await Canvas.loadImage(bgPath);
                    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
                } else {
                    ctx.fillStyle = '#1a1a1a';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // Add Text
                ctx.font = '60px sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText(`Welcome to The Digital Den,`, canvas.width / 2, canvas.height / 2 + 50);

                ctx.font = '45px sans-serif';
                ctx.fillText(`${member.user.username}!`, canvas.width / 2, canvas.height / 2 + 110);

                // Avatar (Circle)
                // P.S. Simplified for robustness.
                const avatarURL = member.user.displayAvatarURL({ extension: 'png' });
                try {
                    const avatar = await Canvas.loadImage(avatarURL);
                    ctx.beginPath();
                    ctx.arc(canvas.width / 2, 125, 100, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(avatar, canvas.width / 2 - 100, 25, 200, 200);
                } catch (err) {
                    console.log('Failed to load user avatar for welcome image');
                }

                const attachment = new AttachmentBuilder(canvas.toBuffer(), { name: 'welcome-image.png' });
                await channel.send({ content: `Welcome ${member}!`, files: [attachment] });

            } else {
                // Fallback if no canvas
                await channel.send(`Welcome to The Digital Den, ${member}! 🦊`);
            }

        } catch (error) {
            console.error('Error sending welcome message:', error);
        }
    }
};

