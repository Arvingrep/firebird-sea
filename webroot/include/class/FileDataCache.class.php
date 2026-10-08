<?php
/**
 * 纯文件缓存工具类（无Redis/APC依赖）
 * 特点：自动创建目录、支持过期时间、防缓存穿透、批量操作、简洁易用
 * 适用场景：读多写少的配置数据、高频重复查询结果缓存
 */

/** 
 * // 使用说明

 * try {
 *     // 初始化文件缓存（自定义缓存目录和默认过期时间）
 *     $fileCache = new FileCache(
 *         cacheDir: '/www/cache/project_config/', // 缓存目录（可自定义）
 *         defaultTtl: 3600 * 24 // 默认缓存1天（配置类数据不常改，可设更长）
 *     );
 * } catch (Exception $e) {
 *     die("缓存初始化失败：" . $e->getMessage());
 * }

 * ============================================================================

 * // 单个缓存
 * // 替换前：直接查数据库（高并发下重复执行）
 * $moduleConfig = $pdo->query("SELECT wx, bd, qm FROM huoniao_site_module WHERE name = 'paimai'")->fetch();

 * // 替换后：用文件缓存，只查一次数据库
 * $moduleConfig = $fileCache->get(
 *     key: 'module_config_paimai', // 唯一缓存key（建议：表名_用途_条件）
 *     callback: function() use ($pdo) {
 *         // 缓存未命中时执行：查询数据库
 *         $stmt = $pdo->prepare("SELECT wx, bd, qm, dy, app FROM huoniao_site_module WHERE name = 'paimai' LIMIT 1");
 *         $stmt->execute();
 *         return $stmt->fetch(PDO::FETCH_ASSOC); // 返回要缓存的数据
 *     },
 *     ttl: 3600 * 12 // 单独设置过期时间（12小时），覆盖默认值
 * );

 * ============================================================================

 * // 多个缓存
 * // 批量获取多个模块配置（paimai、tuan、live）
 * $moduleNames = ['paimai', 'tuan', 'live'];
 * $moduleConfigs = $fileCache->batchGet(
 *     keys: array_map(function($name) {
 *         return "module_config_{$name}"; // 批量key：module_config_paimai、module_config_tuan...
 *     }, $moduleNames),
 *     batchCallback: function($missedKeys) use ($pdo) {
 *         // 未命中的key数组（比如第一次查询时，所有key都未命中）
 *         // 提取未命中的模块名（从key中解析：module_config_paimai → paimai）
 *         $missedNames = array_map(function($key) {
 *             return str_replace('module_config_', '', $key);
 *         }, $missedKeys);

 *         // 批量查询数据库（1次查询搞定所有未命中的模块）
 *         $placeholders = rtrim(str_repeat('?,', count($missedNames)), ',');
 *         $stmt = $pdo->prepare("SELECT name, wx, bd, qm FROM huoniao_site_module WHERE name IN ({$placeholders})");
 *         $stmt->execute($missedNames);

 *         // 组装key=>data格式返回
 *         $result = [];
 *         foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
 *             $key = "module_config_{$row['name']}";
 *             $result[$key] = $row;
 *         }
 *         return $result;
 *     }
 * );

 * // 使用结果：$moduleConfigs['module_config_paimai'] → 对应模块配置

 * ===========================================================================

 * // 缓存城市总数查询（SELECT count(id) FROM huoniao_site_city WHERE state=1）
 * $cityTotal = $fileCache->get(
 *     key: 'city_total_count_state_1',
 *     callback: function() use ($pdo) {
 *         $stmt = $pdo->query("SELECT count(id) as total FROM huoniao_site_city WHERE state = 1");
 *         return $stmt->fetch(PDO::FETCH_ASSOC)['total'];
 *     },
 *     ttl: 3600 * 24 // 城市总数很少变，缓存1天
 * );

 * ===========================================================================

 * // 删除单个缓存
 * $fileCache->delete('module_config_paimai');

 * // 批量删除多个模块缓存
 * $fileCache->batchDelete([
 *     'module_config_paimai',
 *     'module_config_tuan'
 * ]);

 * // 清空所有配置缓存（谨慎使用）
 * // $fileCache->clearAll();

*/

class FileDataCache
{
    /**
     * 缓存根目录（可根据项目调整，确保PHP有读写权限）
     * @var string
     */
    private $cacheDir;

    /**
     * 默认缓存过期时间（秒），默认1小时（3600秒）
     * @var int
     */
    private $defaultTtl;

    /**
     * 构造函数（初始化缓存目录和默认过期时间）
     * @param string $cacheDir 缓存目录（默认：项目根目录/cache/file_cache/）
     * @param int $defaultTtl 默认过期时间（秒），默认0（永不过期）
     * @throws Exception 目录无法创建时抛出异常
     */
    public function __construct(string $cacheDir = '', int $defaultTtl = 0)
    {
        // 初始化缓存目录（默认项目根目录下的/data/cache/file_data/）
        $this->cacheDir = $cacheDir ?: HUONIAODATA . '/cache/file_data/';
        $this->defaultTtl = $defaultTtl;

        // 自动创建缓存目录（递归创建，确保目录存在）
        if (!is_dir($this->cacheDir)) {
            if (!mkdir($this->cacheDir, 0755, true)) {
                throw new Exception("缓存目录创建失败：{$this->cacheDir}，请检查权限");
            }
        }

        // 确保目录可写
        if (!is_writable($this->cacheDir)) {
            throw new Exception("缓存目录不可写：{$this->cacheDir}，请设置权限为755或775");
        }
    }

    /**
     * 生成缓存文件路径（通过MD5处理key，避免特殊字符冲突）
     * @param string $key 缓存唯一标识
     * @return string 缓存文件绝对路径
     */
    private function getCacheFilePath(string $key): string
    {
        // MD5加密key，避免中文/特殊字符导致的路径问题
        $keyMd5 = md5($key);
        // 分目录存储（避免单目录文件过多，提升查找效率）
        $subDir = substr($keyMd5, 0, 2) . '/' . substr($keyMd5, 2, 2) . '/';
        $fullDir = $this->cacheDir . $subDir;

        // 自动创建子目录
        if (!is_dir($fullDir)) {
            mkdir($fullDir, 0755, true);
        }

        // 缓存文件后缀为.php，防止浏览器直接访问泄露数据
        return $fullDir . $keyMd5 . '.php';
    }

    /**
     * 获取缓存（核心方法：缓存命中则返回，未命中则执行回调查询并缓存）
     * @param string $key 缓存key
     * @param callable|null $callback 缓存未命中时的查询回调（返回要缓存的数据）
     * @param int $ttl 过期时间（秒，默认使用类的defaultTtl）
     * @return mixed 缓存数据（回调返回的数据）
     */
    public function get(string $key, callable $callback = null, int $ttl = 0)
    {
        $filePath = $this->getCacheFilePath($key);
        $ttl = $ttl ?: $this->defaultTtl;

        // 1. 缓存存在且未过期：直接返回数据
        if (file_exists($filePath) && ((time() - filemtime($filePath)) < $ttl || $ttl == 0)) {
            $content = file_get_contents($filePath);
            return $content ? unserialize($content) : null;
        }

        // 2. 无回调函数：缓存未命中返回null
        if (!$callback) {
            return null;
        }

        // 3. 执行回调函数（查询数据库/业务逻辑）
        $data = $callback();

        // 4. 缓存数据（空数据也缓存，防止缓存穿透）
        $this->set($key, $data, $ttl);

        return $data;
    }

    /**
     * 手动设置缓存
     * @param string $key 缓存key
     * @param mixed $data 要缓存的数据（支持数组、对象、字符串等）
     * @param int $ttl 过期时间（秒，默认使用类的defaultTtl）
     * @return bool 设置成功返回true
     */
    public function set(string $key, $data, int $ttl = 0): bool
    {
        $filePath = $this->getCacheFilePath($key);
        $ttl = $ttl ?: $this->defaultTtl;

        // 序列化数据（支持复杂类型，比json_encode更兼容对象）
        $content = serialize($data);

        // 写入文件（加锁写入，避免高并发下的文件损坏）
        $fileHandle = fopen($filePath, 'w');
        if (!$fileHandle) {
            return false;
        }

        // 排他锁：确保同一时间只有一个进程写入
        flock($fileHandle, LOCK_EX);
        fwrite($fileHandle, $content);
        flock($fileHandle, LOCK_UN);
        fclose($fileHandle);

        // 设置文件修改时间（用于过期判断）
        touch($filePath, time());

        return true;
    }

    /**
     * 批量获取缓存（优化多key查询，减少文件IO）
     * @param array $keys 缓存key数组
     * @param callable|null $batchCallback 批量未命中时的回调（接收未命中的key数组，返回key=>data数组）
     * @param int $ttl 过期时间（秒）
     * @return array 所有key对应的缓存数据（key=>data）
     */
    public function batchGet(array $keys, callable $batchCallback = null, int $ttl = 0): array
    {
        $result = [];
        $missedKeys = [];
        $ttl = $ttl ?: $this->defaultTtl;

        // 1. 遍历key，获取已命中的缓存
        foreach ($keys as $key) {
            $filePath = $this->getCacheFilePath($key);
            if (file_exists($filePath) && (time() - filemtime($filePath)) < $ttl) {
                $content = file_get_contents($filePath);
                $result[$key] = $content ? unserialize($content) : null;
            } else {
                $missedKeys[] = $key; // 记录未命中的key
            }
        }

        // 2. 无未命中key或无回调：直接返回已命中结果
        if (empty($missedKeys) || !$batchCallback) {
            return $result;
        }

        // 3. 批量查询未命中的数据
        $missedData = $batchCallback($missedKeys);
        if (!is_array($missedData)) {
            return $result;
        }

        // 4. 缓存未命中的数据，并合并到结果中
        foreach ($missedData as $key => $data) {
            if (in_array($key, $missedKeys)) {
                $this->set($key, $data, $ttl);
                $result[$key] = $data;
            }
        }

        return $result;
    }

    /**
     * 删除指定缓存
     * @param string $key 缓存key
     * @return bool 删除成功返回true（文件不存在也返回true）
     */
    public function delete(string $key): bool
    {
        $filePath = $this->getCacheFilePath($key);
        if (file_exists($filePath)) {
            return unlink($filePath);
        }
        return true;
    }

    /**
     * 批量删除缓存
     * @param array $keys 缓存key数组
     * @return void
     */
    public function batchDelete(array $keys): void
    {
        foreach ($keys as $key) {
            $this->delete($key);
        }
    }

    /**
     * 清空所有缓存（谨慎使用！会删除整个缓存目录下的所有文件）
     * @return bool 清空成功返回true
     */
    public function clearAll(): bool
    {
        // 递归删除缓存目录下的所有文件和子目录
        $dirIterator = new RecursiveDirectoryIterator($this->cacheDir, RecursiveDirectoryIterator::SKIP_DOTS);
        $fileIterator = new RecursiveIteratorIterator($dirIterator, RecursiveIteratorIterator::CHILD_FIRST);

        foreach ($fileIterator as $file) {
            if ($file->isFile()) {
                unlink($file->getPathname());
            } else {
                rmdir($file->getPathname());
            }
        }

        return true;
    }

    /**
     * 检查缓存是否存在且未过期
     * @param string $key 缓存key
     * @param int $ttl 过期时间（秒，默认使用类的defaultTtl）
     * @return bool 存在且未过期返回true
     */
    public function has(string $key, int $ttl = 0): bool
    {
        $filePath = $this->getCacheFilePath($key);
        $ttl = $ttl ?: $this->defaultTtl;
        return file_exists($filePath) && (time() - filemtime($filePath)) < $ttl;
    }
}