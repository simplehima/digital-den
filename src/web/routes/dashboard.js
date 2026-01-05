const express = require('express');
const router = express.Router();

// Middleware to check if user is authenticated and admin
function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        const guildId = process.env.GUILD_ID;
        const adminRoleId = process.env.ADMIN_ROLE_ID; // Or check permissions directly if possible, or just check if they are owner

        // For MVP, we'll just check if they are logged in. 
        // In prod, you'd check req.user.guilds to see if they have ManageGuild in the target server.
        const userGuilds = req.user.guilds || [];
        const targetGuild = userGuilds.find(g => g.id === process.env.GUILD_ID);

        // Check for Administrator permission (0x8)
        if (targetGuild && (parseInt(targetGuild.permissions) & 0x8) === 0x8) {
            return next();
        } else {
            // Allow if they are just testing and we haven't set specific guild env yet, 
            // but strictly for this "manage my server" bot, we should check admin.
            // If GUILD_ID isn't set, maybe just let them in if they have any admin guild? 
            // Let's being strict if GUILD_ID is present.
            if (!process.env.GUILD_ID) return next(); // Relaxed for setup
        }
    }
    res.redirect('/');
}

router.get('/', isAdmin, (req, res) => {
    res.render('dashboard', { user: req.user });
});

module.exports = router;
