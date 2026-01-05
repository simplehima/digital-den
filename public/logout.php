<?php
require_once 'includes/db.php';

if (isset($_COOKIE['dd_session'])) {
    $db = Database::getInstance();
    $db->deleteSession($_COOKIE['dd_session']);
    setcookie('dd_session', '', time() - 3600, '/', '', true, true);
}

header('Location: index.php');
exit;
?>