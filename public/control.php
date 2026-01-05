<?php
require_once 'includes/auth.php';

$user = requireAuth();

// Handle bot control actions
$message = '';
$botStatus = 'offline';
$uptime = 0;
$memory = 0;
$botUser = '';

// Read status from file (written by the bot)
$statusFile = __DIR__ . '/bot-status.json';
if (file_exists($statusFile)) {
    $statusData = json_decode(file_get_contents($statusFile), true);

    // Check if status is recent (within 60 seconds)
    if ($statusData && isset($statusData['timestamp'])) {
        $age = (time() * 1000 - $statusData['timestamp']) / 1000;

        if ($age < 60) {
            $botStatus = 'online';
            $uptime = $statusData['uptime'] ?? 0;
            $memory = $statusData['memory'] ?? 0;
            $botUser = $statusData['user'] ?? '';
        }
    }
}

// Handle actions
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    switch ($action) {
        case 'start':
            exec('cd /home/u496570606/domains/digital-den.ibrahim-azab.com/public_html && pm2 start index.js --name "digital-den" 2>&1', $out, $code);
            $message = $code === 0 ? '✅ Bot started successfully!' : '❌ Failed to start bot';
            break;

        case 'restart':
            exec('pm2 restart digital-den 2>&1', $out, $code);
            $message = $code === 0 ? '✅ Bot restarted successfully!' : '❌ Failed to restart bot';
            break;

        case 'stop':
            exec('pm2 stop digital-den 2>&1', $out, $code);
            $message = $code === 0 ? '✅ Bot stopped successfully!' : '❌ Failed to stop bot';
            break;

        case 'logs':
            exec('pm2 logs digital-den --lines 50 --nostream 2>&1', $logs);
            break;
    }

    // Refresh status
    sleep(1);
    header('Location: control.php' . ($message ? '?msg=' . urlencode($message) : ''));
    exit;
}

if (isset($_GET['msg'])) {
    $message = $_GET['msg'];
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bot Control - The Digital Den</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon.png">
    <link rel="apple-touch-icon" href="assets/favicon.png">
    <link rel="stylesheet" href="assets/dashboard.css">
</head>

<body>
    <?php include 'includes/nav.php'; ?>

    <div class="container">
        <h1>🤖 Bot Control Panel</h1>

        <?php if ($message): ?>
            <div class="alert <?php echo strpos($message, '✅') !== false ? 'success' : 'error'; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>

        <div class="bot-status-card card">
            <h2>Bot Status</h2>
            <div class="status-grid">
                <div class="status-item">
                    <span class="status-label">Status:</span>
                    <span class="status-badge <?php echo strtolower($botStatus); ?>">
                        <?php echo $botStatus === 'online' ? '🟢 Online' : '🔴 Offline'; ?>
                    </span>
                </div>
                <?php if (isset($uptime)): ?>
                    <div class="status-item">
                        <span class="status-label">Uptime:</span>
                        <span>
                            <?php echo gmdate('H:i:s', (time() - $uptime / 1000)); ?>
                        </span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">Memory:</span>
                        <span>
                            <?php echo $memory; ?> MB
                        </span>
                    </div>
                    <div class="status-item">
                        <span class="status-label">CPU:</span>
                        <span>
                            <?php echo $cpu; ?>%
                        </span>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <div class="control-buttons card">
            <h2>📋 Bot Control (SSH Required)</h2>
            <p style="color: #b19cd9; margin-bottom: 1rem;">Due to shared hosting limitations, bot control must be done
                via SSH:</p>
            <div class="ssh-commands">
                <code>pm2 restart digital-den</code> - Restart bot<br>
                <code>pm2 stop digital-den</code> - Stop bot<br>
                <code>pm2 start index.js --name digital-den</code> - Start bot<br>
                <code>pm2 logs digital-den</code> - View logs
            </div>
        </div>

        <div class="quick-links card">
            <h2>Quick Links</h2>
            <div class="actions-grid">
                <a href="logs.php" class="action-btn">📋 View Logs</a>
                <a href="settings.php" class="action-btn">⚙️ Settings</a>
                <a href="dashboard.php" class="action-btn">🏠 Dashboard</a>
            </div>
        </div>
    </div>

    <style>
        .alert {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
        }

        .alert.success {
            background: rgba(46, 204, 113, 0.2);
            border: 1px solid #2ecc71;
            color: #2ecc71;
        }

        .alert.error {
            background: rgba(231, 76, 60, 0.2);
            border: 1px solid #e74c3c;
            color: #e74c3c;
        }

        .bot-status-card h2,
        .control-buttons h2,
        .quick-links h2 {
            color: #8a2be2;
            margin-bottom: 1.5rem;
        }

        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }

        .status-item {
            display: flex;
            justify-content: space-between;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 8px;
        }

        .status-label {
            color: #b19cd9;
            font-weight: bold;
        }

        .status-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-weight: bold;
        }

        .status-badge.online {
            background: rgba(46, 204, 113, 0.2);
            color: #2ecc71;
        }

        .status-badge.offline,
        .status-badge.stopped {
            background: rgba(231, 76, 60, 0.2);
            color: #e74c3c;
        }

        .ssh-commands {
            background: rgba(0, 0, 0, 0.3);
            padding: 1rem;
            border-radius: 8px;
            font-family: monospace;
            line-height: 2;
        }

        .ssh-commands code {
            background: rgba(138, 43, 226, 0.3);
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            color: #da70d6;
        }

        .btn-success {
            background: #2ecc71;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s;
        }

        .btn-success:hover {
            background: #27ae60;
        }

        .btn-danger {
            background: #e74c3c;
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s;
        }

        .btn-danger:hover {
            background: #c0392b;
        }
    </style>

    <script>
        // Auto-refresh status every 30 seconds
        setTimeout(() => location.reload(), 30000);
    </script>
</body>

</html>