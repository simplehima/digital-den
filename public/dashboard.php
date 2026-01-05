<?php
require_once 'includes/auth.php';
require_once 'includes/db.php';

$user = requireAuth();
$db = Database::getInstance();

// Get recent logs count
$logs = $db->getLogs(5);
$recentLogs = count($logs);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - The Digital Den</title>
    <link rel="stylesheet" href="assets/dashboard.css">
</head>

<body>
    <?php include 'includes/nav.php'; ?>

    <div class="container">
        <div class="welcome">
            <h1>Welcome back,
                <?php echo htmlspecialchars($user['username']); ?>! 🦊
            </h1>
            <p>Admin Dashboard for The Digital Den</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🤖</div>
                <div class="stat-info">
                    <h3>Bot Status</h3>
                    <p class="stat-value online">Online</p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                    <h3>Recent Logs</h3>
                    <p class="stat-value">
                        <?php echo $recentLogs; ?>
                    </p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">⚙️</div>
                <div class="stat-info">
                    <h3>Guild ID</h3>
                    <p class="stat-value small">
                        <?php echo GUILD_ID; ?>
                    </p>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-info">
                    <h3>Your Role</h3>
                    <p class="stat-value">Admin</p>
                </div>
            </div>
        </div>

        <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="actions-grid">
                <a href="logs.php" class="action-btn">
                    <span>📋</span>
                    View Logs
                </a>
                <a href="settings.php" class="action-btn">
                    <span>⚙️</span>
                    Bot Settings
                </a>
            </div>
        </div>

        <div class="recent-activity">
            <h2>Recent Activity</h2>
            <div class="activity-list">
                <?php foreach ($logs as $log): ?>
                    <div class="activity-item">
                        <span class="activity-time">
                            <?php echo date('Y-m-d H:i:s', $log['timestamp']); ?>
                        </span>
                        <span class="activity-level <?php echo strtolower($log['level']); ?>">
                            <?php echo $log['level']; ?>
                        </span>
                        <span class="activity-message">
                            <?php echo htmlspecialchars($log['message']); ?>
                        </span>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
</body>

</html>