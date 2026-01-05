<?php
require_once __DIR__ . '/db.php';

function requireAuth()
{
    if (!isset($_COOKIE['dd_session'])) {
        header('Location: index.php');
        exit;
    }

    $db = Database::getInstance();
    $session = $db->getSession($_COOKIE['dd_session']);

    if (!$session) {
        setcookie('dd_session', '', time() - 3600, '/', '', true, true);
        header('Location: index.php');
        exit;
    }

    return json_decode($session['user_data'], true);
}
?>