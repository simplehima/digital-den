<?php
require_once 'includes/auth.php';
require_once 'includes/db.php';

$user = requireAuth();
$db = Database::getInstance();

// Get filter
$filter = $_GET['type'] ?? 'all';
$page = max(1, intval($_GET['page'] ?? 1));
$perPage = 50;
$offset = ($page - 1) * $perPage;

// Get logs from database
$logs = $db->getLogs($perPage, $offset);
$totalLogs = $db->query("SELECT COUNT(*) as count FROM activity_logs")->fetchArray()['count'] ?? 0;
$totalPages = ceil($totalLogs / $perPage);

// Group logs by type for stats
$stats = [
    'info' => $db->query("SELECT COUNT(*) as c FROM activity_logs WHERE level='INFO'")->fetchArray()['c'] ?? 0,
    'warning' => $db->query("SELECT COUNT(*) as c FROM activity_logs WHERE level='WARNING'")->fetchArray()['c'] ?? 0,
    'error' => $db->query("SELECT COUNT(*) as c FROM activity_logs WHERE level='ERROR'")->fetchArray()['c'] ?? 0,
];
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logs - The Digital Den</title>
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon.png">
    <link rel="stylesheet" href="assets/dashboard.css">
</head>

<body>
    <?php include 'includes/nav.php'; ?>

    <div class="container">
        <h1>📊 Activity Logs</h1>

        <!-- Stats Cards -->
        <div class="log-stats">
            <div class="log-stat info">
                <span class="stat-number"><?php echo $stats['info']; ?></span>
                <span class="stat-label">Info</span>
            </div>
            <div class="log-stat warning">
                <span class="stat-number"><?php echo $stats['warning']; ?></span>
                <span class="stat-label">Warnings</span>
            </div>
            <div class="log-stat error">
                <span class="stat-number"><?php echo $stats['error']; ?></span>
                <span class="stat-label">Errors</span>
            </div>
            <div class="log-stat total">
                <span class="stat-number"><?php echo $totalLogs; ?></span>
                <span class="stat-label">Total</span>
            </div>
        </div>

        <!-- Filter Tabs -->
        <div class="log-filters">
            <a href="?type=all" class="filter-btn <?php echo $filter === 'all' ? 'active' : ''; ?>">📋 All</a>
            <a href="?type=info" class="filter-btn <?php echo $filter === 'info' ? 'active' : ''; ?>">ℹ️ Info</a>
            <a href="?type=warning" class="filter-btn <?php echo $filter === 'warning' ? 'active' : ''; ?>">⚠️
                Warnings</a>
            <a href="?type=error" class="filter-btn <?php echo $filter === 'error' ? 'active' : ''; ?>">❌ Errors</a>
        </div>

        <!-- Logs Table -->
        <div class="logs-container card">
            <?php if (empty($logs)): ?>
                <div class="empty-state">
                    <span>📭</span>
                    <p>No logs yet. Activity will appear here once the bot is running.</p>
                </div>
            <?php else: ?>
                <div class="logs-list">
                    <?php foreach ($logs as $log): ?>
                        <div class="log-item <?php echo strtolower($log['level']); ?>">
                            <div class="log-icon">
                                <?php
                                echo match ($log['level']) {
                                    'INFO' => '✅',
                                    'WARNING' => '⚠️',
                                    'ERROR' => '❌',
                                    default => '📝'
                                };
                                ?>
                            </div>
                            <div class="log-content">
                                <div class="log-message"><?php echo htmlspecialchars($log['message']); ?></div>
                                <div class="log-meta">
                                    <span
                                        class="log-level <?php echo strtolower($log['level']); ?>"><?php echo $log['level']; ?></span>
                                    <span class="log-time"><?php echo date('M d, H:i:s', $log['timestamp']); ?></span>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>

        <!-- Pagination -->
        <?php if ($totalPages > 1): ?>
            <div class="pagination">
                <?php if ($page > 1): ?>
                    <a href="?page=<?php echo $page - 1; ?>&type=<?php echo $filter; ?>" class="page-btn">← Prev</a>
                <?php endif; ?>

                <span class="page-info">Page <?php echo $page; ?> of <?php echo $totalPages; ?></span>

                <?php if ($page < $totalPages): ?>
                    <a href="?page=<?php echo $page + 1; ?>&type=<?php echo $filter; ?>" class="page-btn">Next →</a>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>

    <style>
        .log-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .log-stat {
            background: var(--glass);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s;
        }

        .log-stat:hover {
            transform: translateY(-2px);
        }

        .log-stat.info {
            border-left: 4px solid #22c55e;
        }

        .log-stat.warning {
            border-left: 4px solid #f59e0b;
        }

        .log-stat.error {
            border-left: 4px solid #ef4444;
        }

        .log-stat.total {
            border-left: 4px solid #8a2be2;
        }

        .stat-number {
            display: block;
            font-size: 2rem;
            font-weight: 700;
            color: white;
        }

        .stat-label {
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .log-filters {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }

        .filter-btn {
            padding: 0.75rem 1.25rem;
            background: var(--glass);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            color: var(--text-muted);
            text-decoration: none;
            transition: all 0.3s;
        }

        .filter-btn:hover,
        .filter-btn.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
        }

        .logs-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .log-item {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            border-left: 3px solid var(--glass-border);
            transition: all 0.3s;
        }

        .log-item:hover {
            background: rgba(0, 0, 0, 0.3);
        }

        .log-item.info {
            border-left-color: #22c55e;
        }

        .log-item.warning {
            border-left-color: #f59e0b;
        }

        .log-item.error {
            border-left-color: #ef4444;
        }

        .log-icon {
            font-size: 1.25rem;
            width: 30px;
            text-align: center;
        }

        .log-content {
            flex: 1;
        }

        .log-message {
            color: white;
            margin-bottom: 0.5rem;
        }

        .log-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.8rem;
        }

        .log-level {
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .log-level.info {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
        }

        .log-level.warning {
            background: rgba(245, 158, 11, 0.2);
            color: #f59e0b;
        }

        .log-level.error {
            background: rgba(239, 68, 68, 0.2);
            color: #ef4444;
        }

        .log-time {
            color: var(--text-muted);
        }

        .empty-state {
            text-align: center;
            padding: 3rem;
            color: var(--text-muted);
        }

        .empty-state span {
            font-size: 3rem;
            display: block;
            margin-bottom: 1rem;
        }

        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            margin-top: 2rem;
        }

        .page-btn {
            padding: 0.75rem 1.5rem;
            background: var(--glass);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            color: white;
            text-decoration: none;
            transition: all 0.3s;
        }

        .page-btn:hover {
            background: var(--primary);
            border-color: var(--primary);
        }

        .page-info {
            color: var(--text-muted);
        }

        @media (max-width: 768px) {
            .log-stats {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</body>

</html>