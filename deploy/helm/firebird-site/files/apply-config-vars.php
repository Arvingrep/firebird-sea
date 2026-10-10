<?php
/**
 * ③ 声明式配置变量覆盖：把 Git(values.configVars) 里声明的 `$var = literal;` 写进 include/config/<file>.inc.php。
 *
 * 用法: php apply-config-vars.php <config_dir> <vars.txt>
 * vars.txt 每行: <file> <var> <php-literal>     例: waimai.inc.php custom_fencheng_foodprice 18
 *
 * 语义: 变量已存在 → 原位替换（保留 CRLF）；不存在 → 追加（若文件以 ?> 结尾则插在其前）。
 * 后台页面保存会整文件重写（如 waimaiFenchengConfig.php 用 fopen("w")），因此"Git 为准"在每次 Pod 启动时重新施加。
 */
if (PHP_SAPI !== 'cli') { exit(1); }
if ($argc < 3) { fwrite(STDERR, "usage: apply-config-vars.php <config_dir> <vars.txt>\n"); exit(2); }

$dir = rtrim($argv[1], '/');
$lines = @file($argv[2], FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
if ($lines === false) { fwrite(STDERR, "[config-vars] cannot read {$argv[2]}\n"); exit(2); }

$files = [];
foreach ($lines as $i => $line) {
    $line = trim($line);
    if ($line === '' || $line[0] === '#') { continue; }
    $parts = explode(' ', $line, 3);
    if (count($parts) !== 3) { fwrite(STDERR, "[config-vars] line " . ($i + 1) . ": bad format\n"); continue; }
    list($file, $var, $literal) = $parts;
    // 只允许 include/config 下的 *.inc.php，变量名必须是合法标识符
    if (!preg_match('/^[A-Za-z0-9_.-]+\.inc\.php$/', $file) || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $var)) {
        fwrite(STDERR, "[config-vars] line " . ($i + 1) . ": rejected ({$file} {$var})\n");
        continue;
    }
    $files[$file][$var] = $literal;
}

$rc = 0;
foreach ($files as $file => $vars) {
    $path = $dir . '/' . $file;
    if (!is_file($path)) { fwrite(STDERR, "[config-vars] skip {$file}: not found\n"); continue; }
    $src = file_get_contents($path);
    $out = $src;
    foreach ($vars as $var => $literal) {
        $re = '/^\$' . preg_quote($var, '/') . '[ \t]*=[^\r\n]*;[ \t]*(\r?)$/m';
        $stmt = '$' . $var . ' = ' . $literal . ';';
        if (preg_match($re, $out)) {
            $out = preg_replace_callback($re, function ($m) use ($stmt) { return $stmt . $m[1]; }, $out, 1);
        } elseif (preg_match('/\?>\s*$/', $out)) {
            $out = preg_replace('/\?>\s*$/', $stmt . "\n?>\n", $out, 1);
        } else {
            $out = rtrim($out, "\r\n") . "\n" . $stmt . "\n";
        }
    }
    if ($out !== $src) {
        if (file_put_contents($path, $out) === false) { fwrite(STDERR, "[config-vars] write failed {$file}\n"); $rc = 1; continue; }
        echo "[config-vars] applied " . count($vars) . " var(s) to {$file}\n";
    }
}
exit($rc);
