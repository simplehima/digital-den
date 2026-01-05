<?php
require_once 'includes/auth.php';
require_once 'includes/db.php';

$user = requireAuth();
$db = Database::getInstance();

// Get filter parameters
$type = isset($_GET['type']) ? $_GET['type'] : 'all';
$page = isset($_GET['page']) ? (int) $_GET['page'] : 1;
$perPage = 50;
$offset = ($page - 1) * $perPage;

// Get logs
$logs = $db->getLogs($perPage, $offset);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logs - The Digital Den</title>
    <link rel="icon" type="image/png" href="assets/favicon.png">
    <link rel="stylesheet" href="assets/dashboard.css">
</head>

<body>
    <?php include 'includes/nav.php'; ?>

    <div class="container">
        <h1>📋 Activity Logs</h1>

        <div class="filter-bar card">
            <a href="logs.php?type=all" class="filter-btn <?php echo $type === 'all' ? 'active' : ''; ?>">All</a>
            <a href="logs.php?type=INFO" class="filter-btn <?php echo $type === 'INFO' ? 'active' : ''; ?>">Info</a>
            <a href="logs.php?type=WARNING"
                class="filter-btn <?php echo $type === 'WARNING' ? 'active' : ''; ?>">Warnings</a>
            <a href="logs.php?type=ERROR" class="filter-btn <?php echo $type === 'ERROR' ? 'active' : ''; ?>">Errors</a>
        </div>

        <div class="logs-container card">
            <table class="log-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Level</th>
                        <th>Message</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($logs)): ?>
                        <tr>
                            <td colspan="3" style="text-align: center; padding: 2rem;">No logs found</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($logs as $log): ?>
                            <tr>
                                <td>
                                    <?php echo date('Y-m-d H:i:s', $log['timestamp']); ?>
                                </td>
                                <td>
                                    <span class="activity-level <?php echo strtolower($log['level']); ?>">
                                        <?php echo htmlspecialchars($log['level']); ?>
                                    </span>
                                </td>
                                <td>
                                    <?php echo htmlspecialchars($log['message']); ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>

            <div class="pagination">
                <?php if ($page > 1): ?>
                    <a href="logs.php?type=<?php echo $type; ?>&page=<?php echo $page - 1; ?>" class="btn-primary">←
                        Previous</a>
                <?php endif; ?>

                <span>Page
                    <?php echo $page; ?>
                </span>

                <?php if (count($logs) === $perPage): ?>
                    <a href="logs.php?type=<?php echo $type; ?>&page=<?php echo $page + 1; ?>" class="btn-primary">Next
                        →</a>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <style>
        .filter-bar {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            margin-bottom: 2rem;
        }

        .filter-btn {
            padding: 0.5rem 1rem;
            background: rgba(0, 0, 0, 0.3);
            color: #b19cd9;
            text-decoration: none;
            border-radius: 5px;
            transition: all 0.3s;
        }

        .filter-btn.active,
        .filter-btn:hover {
            background: #8a2be2;
            color: white;
        }

        .pagination {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            margin-top: 1rem;
        }
    </style>
</body>

</html>