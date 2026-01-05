<nav class="dashboard-nav">
    <div class="nav-brand">
        <img src="assets/logo.png" alt="The Digital Den" class="nav-logo">
        <span>The Digital Den</span>
    </div>
    <div class="nav-links">
        <a href="dashboard.php">Dashboard</a>
        <a href="control.php">Bot Control</a>
        <a href="automod.php">AutoMod</a>
        <a href="logs.php">Logs</a>
        <a href="settings.php">Settings</a>
    </div>
    <div class="nav-user">
        <span>
            <?php echo htmlspecialchars($user['username'] ?? 'Admin'); ?>
        </span>
        <a href="logout.php" class="logout-btn">Logout</a>
    </div>
</nav>