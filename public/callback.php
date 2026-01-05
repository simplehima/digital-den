<?php
session_start();
require_once 'includes/discord.php';
require_once 'includes/db.php';

if (!isset($_GET['code'])) {
    die('No authorization code received');
}

// Exchange code for token
$tokenData = Discord::exchangeCode($_GET['code']);

if (!isset($tokenData['access_token'])) {
    die('Failed to get access token');
}

$accessToken = $tokenData['access_token'];

// Get user info
$user = Discord::getUserInfo($accessToken);

if (!$user) {
    die('Failed to get user info');
}

// Check if user is allowed admin
$isAllowed = in_array($user['id'], ALLOWED_ADMINS) || Discord::isAdmin($accessToken);

if (!$isAllowed) {
    die('Access denied: You are not authorized to access this dashboard. Contact the owner to be added.');
}

// Create session
$db = Database::getInstance();
$sessionId = $db->createSession($user['id'], $user);

// Set session cookie
setcookie('dd_session', $sessionId, time() + SESSION_LIFETIME, '/', '', true, true);

// Log login
$db->addLog('INFO', 'Admin login: ' . $user['username'], ['user_id' => $user['id']]);

// Redirect to dashboard
header('Location: dashboard.php');
exit;
?>