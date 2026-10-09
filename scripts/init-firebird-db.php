<?php
// ==============================================================================
// 🔥 火鸟门户 MySQL 数据库初始化与管理员创建脚本
// ==============================================================================

$dbHost = getenv('DB_HOST') ?: 'mysql.zxem.svc.cluster.local';
$dbPort = (int)(getenv('DB_PORT') ?: 3306);
$dbUser = getenv('DB_USER') ?: 'firebird_user';
$dbPass = getenv('DB_PASS') ?: 'firebirdpassword';
$dbName = getenv('DB_NAME') ?: 'firebird_manila';
$dbPrefix = getenv('DB_PREFIX') ?: 'huoniao_';
$dbLang = 'zh-CN';
$adminUser = 'admin';
$adminPass = 'admin888';

echo "==> 连接 MySQL 数据库: {$dbHost}:{$dbPort} / {$dbName} (用户: {$dbUser})...\n";
$conn = mysqli_connect($dbHost, $dbUser, $dbPass, $dbName, $dbPort);
if (!$conn) {
    die("❌ 数据库连接失败: " . mysqli_connect_error() . "\n");
}
mysqli_set_charset($conn, "utf8mb4");

echo "==> 检查现有数据表数量...\n";
$res = mysqli_query($conn, "SHOW TABLES");
$tableCount = mysqli_num_rows($res);
echo "==> 当前数据表数量: {$tableCount}\n";

$baseDir = dirname(__FILE__) . '/../webroot/install';
if (!file_exists($baseDir . '/db_structure.txt')) {
    $baseDir = '/tmp/install';
}
if (!file_exists($baseDir . '/db_structure.txt')) {
    die("❌ 找不到 db_structure.txt，请检查路径: {$baseDir}\n");
}

echo "==> 1. 开始创建数据表结构 (db_structure.txt)...\n";
$query = '';
$fp = fopen($baseDir . '/db_structure.txt', 'r');
$tableCreated = 0;
while (!feof($fp)) {
    $line = rtrim(fgets($fp, 2048));
    if (preg_match("#;$#", $line)) {
        $query .= $line . "\n";
        $query = str_replace('#@__', $dbPrefix, $query);
        $query = str_replace('NULLDEFAULT', 'NULL DEFAULT', $query);
        $rs = mysqli_query($conn, $query);
        if (!$rs) {
            $err = mysqli_error($conn);
            if (!strpos($err, 'already exists')) {
                // echo "⚠️ [结构警告] " . $err . "\n";
            }
        } else {
            $tableCreated++;
        }
        $query = '';
    } else if (!preg_match("#^(\/\/|--)#", $line)) {
        $query .= $line;
    }
}
fclose($fp);
echo "==> 数据表结构创建完成，累计执行语句: {$tableCreated}\n";

echo "==> 2. 开始导入默认基础数据 (db_default.txt)...\n";
$query = '';
$fp = fopen($baseDir . '/db_default.txt', 'r');
$dataInserted = 0;
while (!feof($fp)) {
    $line = rtrim(fgets($fp, 2048));
    if (preg_match("#;$#", $line)) {
        $query .= $line;
        $query = str_replace('#@__', $dbPrefix, $query);
        $query = str_replace('NULLDEFAULT', 'NULL DEFAULT', $query);
        $query = str_replace('#~lang~#', $dbLang, $query);
        $rs = mysqli_query($conn, $query);
        if (!$rs) {
            $err = mysqli_error($conn);
            // 忽略主键冲突
        } else {
            $dataInserted++;
        }
        $query = '';
    } else if (!preg_match("#^(\/\/|--)#", $line)) {
        $query .= $line;
    }
}
fclose($fp);
echo "==> 默认基础数据导入完成，累计执行插入: {$dataInserted}\n";

echo "==> 3. 初始化超级管理员账号...\n";
function _getSaltedHash($string) {
    $salt = substr(md5(time()), 0, 7);
    return $salt . sha1($salt . $string);
}

// 检查是否已有创始人管理组
$grpRes = mysqli_query($conn, "SELECT id FROM `{$dbPrefix}admingroup` WHERE id = 1");
if (mysqli_num_rows($grpRes) == 0) {
    mysqli_query($conn, "INSERT INTO `{$dbPrefix}admingroup` (`id`, `groupname`, `purviews`) VALUES (1, '创始人', 'founder')");
}

$pwd = _getSaltedHash($adminPass);
$checkUser = mysqli_query($conn, "SELECT id FROM `{$dbPrefix}member` WHERE `username` = '{$adminUser}'");
if (mysqli_num_rows($checkUser) > 0) {
    $updateSql = "UPDATE `{$dbPrefix}member` SET `password` = '{$pwd}', `mgroupid` = 1, `state` = 0 WHERE `username` = '{$adminUser}'";
    mysqli_query($conn, $updateSql);
    echo "==> 管理员 '{$adminUser}' 密码已更新为: '{$adminPass}'\n";
} else {
    $insertSql = "INSERT INTO `{$dbPrefix}member` (`mtype`, `username`, `password`, `nickname`, `mgroupid`, `state`) VALUES (0, '{$adminUser}', '{$pwd}', '系统管理员', 1, 0)";
    mysqli_query($conn, $insertSql);
    echo "==> 管理员 '{$adminUser}' 创建成功，初始密码为: '{$adminPass}'\n";
}

$res = mysqli_query($conn, "SHOW TABLES");
echo "==> 初始化完毕！当前数据库共有 " . mysqli_num_rows($res) . " 个数据表。\n";
mysqli_close($conn);
