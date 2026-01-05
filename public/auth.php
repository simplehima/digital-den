<?php
require_once 'includes/discord.php';

// Redirect to Discord OAuth
header('Location: ' . Discord::getOAuthURL());
exit;
?>