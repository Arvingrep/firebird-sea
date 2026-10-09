<?php
/**
 * 清除页面缓存
 *
 * @version        $Id: siteClearCache.php 2014-3-19 上午10:23:13 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteClearCache");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteClearCache.html";

if($action == "do"){

    $module = array();

    //前台缓存
    if($front){
        $filelog = HUONIAOROOT . "/templates_c/compiled/";
        $fplog = opendir($filelog);
        while ($file=readdir($fplog)) {
            if($file!="." && $file!="..") {
                $fullpath=$filelog."/".$file;
                if(is_dir($fullpath)) {
                    deldir($fullpath);
                }else{
                    unlinkFile($fullpath);
                }
            }
        }

        $filelog = HUONIAOROOT . "/templates_c/caches/";
        MkdirAll($filelog);
        $fplog = opendir($filelog);
        while ($file=readdir($fplog)) {
            if($file!="." && $file!="..") {
                $fullpath=$filelog."/".$file;
                if(is_dir($fullpath)) {
                    deldir($fullpath);
                }else{
                    unlinkFile($fullpath);
                }
            }
        }

        array_unshift($module, '前台缓存');
    }

    //后台缓存
    if($front){
        $filelog = HUONIAOROOT . "/templates_c/admin/";
        $fplog = opendir($filelog);
        while ($file=readdir($fplog)) {
            if($file!="." && $file!="..") {
                $fullpath=$filelog."/".$file;
                if(is_dir($fullpath)) {
                    deldir($fullpath);
                }else{
                    unlinkFile($fullpath);
                }
            }
        }

        array_unshift($module, '后台缓存');
    }

    //清空配置文件缓存
    cache_clear('php');

	//生成新的静态资源版本号为当前时间
    if($static) {
        $m_file = HUONIAODATA . "/admin/staticVersion.txt";
        $fp = fopen($m_file, "w");
        fwrite($fp, time());
        fclose($fp);

        array_unshift($module, '静态资源文件');
    }

    //删除系统日志
    if($staticlog){
        $filelog = HUONIAOROOT . "/log";
        $fplog = opendir($filelog);
        while ($file=readdir($fplog)) {
            if($file!="." && $file!="..") {
                $fullpath=$filelog."/".$file;
                if(is_dir($fullpath)) {
                    deldir($fullpath);
                }
            }
        }

        array_unshift($module, '系统日志');
    }

	//删除纯静态页面
    if($staticPath) {
        $dir = HUONIAOROOT . '/templates_c/html/';
        unlinkDir($dir);

        array_unshift($module, '纯静态页面');
    }


    //内存缓存
    if($memory == 'redis' && $HN_memory->enable){
        $HN_memory->clear();
        
        array_unshift($module, 'redis');
    }


    //生成多语言静态文件
    $lang_dir = HUONIAOINC . '/lang/';
    $floders = listDir($lang_dir);
    if(!empty($floders)){
        $i = 0;
        $landataname = '';
        foreach($floders as $key => $floder){

            $config = $lang_dir.'/'.$floder.'/config.xml';
            if(file_exists($config)){

                $langDataCache = array();
                $lang_path = $lang_dir.'/'.$floder.'/';
                $lang_dir_ = opendir($lang_path);
                while (($file = readdir($lang_dir_)) !== false) {
                    $sName = str_replace(".inc.php", "", $file);
                    if ($file == '.' || $file == '..' || $file == 'config.xml') {
                        continue;
                    } else {

                        if($cfg_lang==$floder){
                            $landataname .= $file.',';
                        }

                        $sub_dir = $lang_path . $file;
                        if (file_exists($sub_dir)) {
                            include($sub_dir);
                            $langDataCache[$sName] = $lang;
                        }
                    }
                }

                //写入缓存文件
                cache_write($floder.'.php', $langDataCache);

                $content = 'var langData =  ' . json_encode($langDataCache);

                PutFile($lang_dir.$floder . '.js', $content);
                PutFile($lang_dir.'siteConfiglangname' . '.txt', $landataname);
            }

        }
    }


    //将配置文件写入一个文件中
    $configFile = array(
        '/config/siteConfig.inc.php',
        '/config/pointsConfig.inc.php',
        '/config/wechatConfig.inc.php',
        '/config/settlement.inc.php',
        '/config/qiandaoConfig.inc.php',
        '/config/fenxiaoConfig.inc.php',
        '/config/privatenumberConfig.inc.php',
        '/config/payPhoneConfig.inc.php',
        '/config/member.inc.php',
        '/config/business.inc.php'
    );

    $configData = array();
    foreach($configFile as $key => $file){
        $filepath = HUONIAOINC . $file;
        if(file_exists($filepath)){
            $fileContent = file_get_contents($filepath);
            //去除头尾的php标签
            $fileContent = str_replace("<?php", "", $fileContent);
            $fileContent = str_replace("?>", "", $fileContent);
            $configData[] = "// $file" . $fileContent;
        }        
    }

    $cacheContent = "<?php\n";
    $cacheContent .= "//缓存文件\n";
    $cacheContent .= "//生成时间：".date('Y-m-d H:i:s')."\n\n";
    $cacheContent .= join("\n", $configData);
    $cacheContent .= "\n?>";

    cache_write('config.php', $cacheContent);

    //删除/data/cache/下的所有.json文件
    $dir = HUONIAODATA . '/cache/';
    $files = scandir($dir);
    foreach($files as $file){
        if(strstr($file, '.json')){
            unlinkFile($dir.$file);
        }
    }


    //APP多语言
    $lang_dir = HUONIAOINC . '/lang/app/';
    $lang_dir_ = opendir($lang_dir);
    while (($file = readdir($lang_dir_)) !== false) {
        $langDataCache = array();
        $sName = str_replace(".php", "", $file);
        if ($file == '.' || $file == '..' || $file == 'config.xml' || strstr($file, '.js')) {
            continue;
        } else {
            $sub_dir = $lang_dir . $file;
            if (file_exists($sub_dir)) {
                include($sub_dir);
                $langDataCache = $lang;
            }
        }

        $content = json_encode($langDataCache);
        PutFile($lang_dir.$sName . '.js', $content);
    }

    updateAppConfig();  //更新APP配置文件


	adminLog("清除页面缓存", join(",", $module));
	ShowMsg("页面缓存已经清除成功。", "siteClearCache.php");
	die;
}


//查看缓存目录大小
if($dopost == 'checkHtmlFolderSize'){

    $s = getFolderSize(HUONIAOROOT . '/templates_c/html/');
    $size = sizeFormat($s['size']);

    echo '{"state": 100, "size": "'.$size.'"}';
	die;
}

//查看缓存目录大小
if($dopost == 'checkLogFolderSize'){

    $s = getFolderSize(HUONIAOROOT . '/log/');
    $size = sizeFormat($s['size']);

    echo '{"state": 100, "size": "'.$size.'"}';
	die;
}

//查看缓存目录大小
if($dopost == 'checkCompiledFolderSize'){

    $s = getFolderSize(HUONIAOROOT . '/templates_c/compiled/');
    $s1 = getFolderSize(HUONIAOROOT . '/templates_c/caches/');
    $size = sizeFormat($s['size'] + $s1['size']);

    echo '{"state": 100, "size": "'.$size.'"}';
	die;
}

//查看缓存目录大小
if($dopost == 'checkAdminFolderSize'){

    $s = getFolderSize(HUONIAOROOT . '/templates_c/admin/');
    $size = sizeFormat($s['size']);

    echo '{"state": 100, "size": "'.$size.'"}';
	die;
}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'admin/siteConfig/siteClearCache.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('action', $action);

	if($HN_memory->enable){
        $huoniaoTag->assign('redis', 1);
    }

	$huoniaoTag->assign('moduleList', getModuleList());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}