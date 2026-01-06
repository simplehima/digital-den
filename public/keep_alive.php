<?php
/**
 * Bot Keep-Alive Monitor
 * This script checks if the bot-status.json is recently updated.
 * It is meant to be called by a Cron Job to monitor bot health.
 */

require_once 'config.php';
require_once 'includes/db.php';

$statusFile = __DIR__ . '/bot-status.json';
$maxLag = 120; // 2 minutes in seconds

$response = [
    'online' => false,
    'message' => '',
    'last_seen' => 0
];

if (file_exists($statusFile)) {
    $data = json_decode(file_get_contents($statusFile), true);
    if ($data && isset($data['timestamp'])) {
        $lastSeen = round($data['timestamp'] / 1000);
        $diff = time() - $lastSeen;

        if ($diff < $maxLag) {
            $response['online'] = true;
            $response['message'] = "Bot is healthy. Last seen {$diff}s ago.";
            $response['last_seen'] = $lastSeen;
        } else {
            $response['message'] = "Bot appears OFFLINE. Last seen {$diff}s ago.";
            $response['last_seen'] = $lastSeen;

            // Log the failure to the database
            $db = Database::getInstance();
            $db->addLog('WARNING', "Keep-Alive Warning: Bot hasn't sent heartbeat for {$diff}s.");
        }
    } else {
        $response['message'] = "Invalid status file content.";
    }
} else {
    $response['message'] = "Status file not found. Bot might never have started.";
}

// Output JSON for potential monitoring tools
header('Content-Type: application/json');
echo json_encode($response);
?>