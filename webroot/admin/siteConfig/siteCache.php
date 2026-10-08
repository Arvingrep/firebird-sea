<?php
/**
 * 系统缓存设置
 *
 * @version        $Id: siteCache.php 2014-3-19 上午10:23:13 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteCache");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteCache.html";

if($action == "check"){

    if($type == "redis"){
        $redis = $_POST['redis'];

        if(empty($redis['server'])){
            die('{"state":200, "info": "请填写redis服务器地址"}');
        }
        if(empty($redis['port'])){
            die('{"state":200, "info": "请填写redis服务器端口"}');
        }

        // 测试
        $config = array(
                "prefix" => "huoniao_",
                "redis" => array(
                        "server" => $redis['server'],
                        "port" => $redis['port'],
                        "requirepass" => $redis['requirepass'],
                        "pconnect" => 1,
                        "serializer" => 1,
                    )
            );
        $HN_memory_test = new memory($config);
        if(!$HN_memory_test->enable){
            die('{"state":200, "info": "配置错误，请重新填写"}');
        }else{
            die('{"state":100, "info": "连接成功"}');
        }
    }
    die('{"state":200, "info": "操作错误"}');
}


if($action == "save"){

    $redis = $_POST['redis'];

    // $redis['port'] = empty($redis['port']) ? 6379 : (int)empty($redis['port']);
    // $redis['prefix'] = empty($redis['prefix']) ? 'huoniao_' : empty($redis['prefix']);

    $cacheContent = array();
    $cacheContent[] = "//内存优化配置信息";
    $cacheContent[] = "\$cfg_memory['prefix'] = '".$prefix."';     //内存变量前缀，可更改，避免同服务器中的程序引用错乱";
    $cacheContent[] = "\$cfg_memory['redis']['state'] = ".(int)$redis['state'].";    //redis服务器状态";
    $cacheContent[] = "\$cfg_memory['redis']['server'] = '".$redis['server']."';    //redis服务器地址，默认127.0.0.1";
    $cacheContent[] = "\$cfg_memory['redis']['port'] = '".$redis['port']."';           //redis服务端口，默认6379";
    $cacheContent[] = "\$cfg_memory['redis']['requirepass'] = '".$redis['requirepass']."';  //requirepass";
    $cacheContent[] = "\$cfg_memory['redis']['db'] = '".$redis['db']."';          //使用数据库";
    $cacheContent[] = "\$cfg_memory['redis']['pconnect'] = '1';          //保持长连接";
    $cacheContent[] = "\$cfg_memory['redis']['serializer'] = '1';        //使用内置序列化/反序列化";

    $cacheContent = join("\n", $cacheContent);

    $configIncFile = HUONIAOINC.'/dbinfo.inc.php';
    $fp = fopen($configIncFile, "r") or die(ShowMsg("修改失败", '-1', 0, 1000));
    $content = fread($fp, filesize($configIncFile));

    $content = trim($content);
    $content = trim($content, '?>');
    $content = trim($content);

    $fg = "//--------------++++--------------";
    $contentArr = explode($fg, $content);

    $body = $contentArr[0];
    if(!strstr($content, $fg)){
        $body .= "\n\n";
    }
    $body .= $fg;
    $body .= "\n";
    $body .= $cacheContent;

    $fp = fopen($configIncFile, "w") or die(ShowMsg("修改失败", '-1', 0, 1000));
    fwrite($fp, $body);
    fclose($fp);

	adminLog("修改内存优化配置");

    die('{"state":100, "info": "配置成功"}');
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

    //js
    $jsFile = array(
        'admin/siteConfig/siteCache.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cfg_memory', $cfg_memory);


    //状态
    $huoniaoTag->assign('redisState', array('0', '1'));
    $huoniaoTag->assign('redisStateNames',array('关闭','开启'));
    $huoniaoTag->assign('redisStateChecked', (int)$cfg_memory['redis']['state']);

    //使用数据库
    $db = array();
    for($i = 0; $i < 16; $i++){
        $db[$i] = 'DB-'.$i;
    }
    $huoniaoTag->assign('dbList', $db);
    $huoniaoTag->assign('db', (int)$cfg_memory['redis']['db']);  //阅读权限默认审核通过

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
