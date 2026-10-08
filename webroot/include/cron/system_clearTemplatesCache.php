<?php   if(!defined('HUONIAOINC')) exit('Request Error!');
/**
 * 检查模板缓存目录大于10个G时，自动清除
 *
 * @version        $Id: system_clearTemplatesCache.php 2025-05-28 上午11:38:26 $
 * @package        HuoNiao.cron
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
set_time_limit(0);

//获取目录大小
$cacheFolderPath = HUONIAOROOT . "/templates_c/caches/";
$cacheFolderInfo = getFolderSize($cacheFolderPath);
$cacheFolderSize = (int)$cacheFolderInfo['size'];  //单位字节

//转成GB，保留整数
$cacheFolderSize = (int)($cacheFolderSize / 1024 / 1024 / 1024);

//如果大于10G，则清除
if($cacheFolderSize >= 10){ 

    MkdirAll($cacheFolderPath);
    $fplog = opendir($cacheFolderPath);
    while ($file=readdir($fplog)) {
        if($file!="." && $file!="..") {
            $fullpath=$cacheFolderPath."/".$file;
            if(is_dir($fullpath)) {
                deldir($fullpath);
            }else{
                unlinkFile($fullpath);
            }
        }
    }
    
}
