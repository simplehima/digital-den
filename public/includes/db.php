<?php
require_once __DIR__ . '/../config.php';

class Database
{
    private static $instance = null;
    private $db;

    private function __construct()
    {
        // Create data directory if it doesn't exist
        $data_dir = dirname(DB_PATH);
        if (!is_dir($data_dir)) {
            mkdir($data_dir, 0755, true);
        }

        // Connect to SQLite
        $this->db = new SQLite3(DB_PATH);
        $this->createTables();
    }

    public static function getInstance()
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function createTables()
    {
        // Sessions table
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS sessions (
                session_id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                user_data TEXT,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                expires_at INTEGER
            )
        ");

        // Logs table
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp INTEGER DEFAULT (strftime('%s', 'now')),
                level TEXT,
                message TEXT,
                data TEXT
            )
        ");

        // Settings table
        $this->db->exec("
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        ");
    }

    public function query($sql, $params = [])
    {
        $stmt = $this->db->prepare($sql);
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        return $stmt->execute();
    }

    public function fetchAll($sql, $params = [])
    {
        $result = $this->query($sql, $params);
        $rows = [];
        while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function fetchOne($sql, $params = [])
    {
        $result = $this->query($sql, $params);
        return $result->fetchArray(SQLITE3_ASSOC);
    }

    // Session methods
    public function createSession($userId, $userData)
    {
        $sessionId = bin2hex(random_bytes(32));
        $expiresAt = time() + SESSION_LIFETIME;

        $this->query(
            "INSERT INTO sessions (session_id, user_id, user_data, expires_at) VALUES (:sid, :uid, :data, :exp)",
            [':sid' => $sessionId, ':uid' => $userId, ':data' => json_encode($userData), ':exp' => $expiresAt]
        );

        return $sessionId;
    }

    public function getSession($sessionId)
    {
        return $this->fetchOne(
            "SELECT * FROM sessions WHERE session_id = :sid AND expires_at > :now",
            [':sid' => $sessionId, ':now' => time()]
        );
    }

    public function deleteSession($sessionId)
    {
        $this->query("DELETE FROM sessions WHERE session_id = :sid", [':sid' => $sessionId]);
    }

    // Log methods
    public function addLog($level, $message, $data = null)
    {
        $this->query(
            "INSERT INTO logs (level, message, data) VALUES (:level, :msg, :data)",
            [':level' => $level, ':msg' => $message, ':data' => $data ? json_encode($data) : null]
        );
    }

    public function getLogs($limit = 100, $offset = 0)
    {
        return $this->fetchAll(
            "SELECT * FROM logs ORDER BY timestamp DESC LIMIT :limit OFFSET :offset",
            [':limit' => $limit, ':offset' => $offset]
        );
    }

    // Settings methods
    public function getSetting($key, $default = null)
    {
        $row = $this->fetchOne("SELECT value FROM settings WHERE key = :key", [':key' => $key]);
        return $row ? $row['value'] : $default;
    }

    public function setSetting($key, $value)
    {
        $this->query(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (:key, :val, :time)",
            [':key' => $key, ':val' => $value, ':time' => time()]
        );
    }
}
?>