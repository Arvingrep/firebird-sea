<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Firebird SEA 基地就绪</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: #1e293b; padding: 2.5rem; border-radius: 1rem; border: 1px solid #334155; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); max-width: 520px; text-align: center; }
        h1 { color: #38bdf8; margin-top: 0; }
        .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; background: #0369a1; color: #e0f2fe; font-size: 0.875rem; margin-bottom: 1rem; }
        p { color: #94a3b8; line-height: 1.6; }
        .info { background: #0f172a; border-radius: 0.5rem; padding: 1rem; text-align: left; font-size: 0.85rem; color: #cbd5e1; margin-top: 1.5rem; font-family: monospace; }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">东南亚 (菲律宾) 本地化基地</span>
        <h1>火鸟系统运行底座就绪</h1>
        <p>PHP 7.4-FPM + Nginx + MySQL + Redis + n8n 容器矩阵已联动成功。<br>准备进行第 1 步：解压官方旗舰版初始安装包。</p>
        <div class="info">
            <div>• 授权域名: <strong>fh580.net</strong></div>
            <div>• PHP 运行时: <?php echo phpversion(); ?></div>
            <div>• 数据库驱动: <?php echo extension_loaded('mysqli') ? 'MySQLi [OK]' : 'MySQLi [MISSING]'; ?></div>
            <div>• 缓存驱动: <?php echo extension_loaded('redis') ? 'Redis [OK]' : 'Redis [MISSING]'; ?></div>
        </div>
    </div>
</body>
</html>
