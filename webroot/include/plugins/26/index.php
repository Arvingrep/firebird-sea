<?php
require_once(dirname(__FILE__) . '/../../common.inc.php');
require_once(dirname(__FILE__) . '/setting.php');
$customIncFile = dirname(__FILE__) . "/config.inc.php";

if($userLogin->getUserID()==-1){
    header("location:" . $cfg_secureAccess.$cfg_basehost);
    exit();
}

//保存配置
if($action == 'save'){
    $aiPlatform = (int)$aiPlatform;
    $model = trim($model);
    $outputMethod = (int)$outputMethod;
    $apiKey = trim($apiKey);
    $openPlugin = (int)$openPlugin;
    $modules = isset($modules) ? join(',',$modules) : '';
    $useLimit = (int)$useLimit;

    if ($model == null) {
        die('{"state": 200, "info": ' . json_encode("model不能为空！") .'}');
    }

    if ($apiKey == null) {
        die('{"state": 200, "info": ' . json_encode("API_KEY不能为空！") .'}');
    }

    if ($modules == null) {
        die('{"state": 200, "info": ' . json_encode("应用模块不能为空！") .'}');
    }

    $customInc = <<<eot
<?php
\$aiPlatform = '{$aiPlatform}';  //AI平台
\$model = '{$model}';  //model
\$outputMethod = '{$outputMethod}';  //输出方式
\$apiKey = '{$apiKey}';  //APIKEY
\$openPlugin = '{$openPlugin}';  //插件是否开启
\$modules = '{$modules}';  //应用模块
\$useLimit = '{$useLimit}';  //使用限制
eot;

    $fp = fopen($customIncFile, "w") or die('{"state": 200, "info": ' . json_encode("写入文件 $customIncFile 失败，请检查权限！") . '}');
    fwrite($fp, $customInc);
    fclose($fp);

    die('{"state": 100, "info": ' . json_encode("保存成功") .'}');
}

if(file_exists($customIncFile)){
    require_once($customIncFile);
}

$tpl = dirname(__FILE__) . "/";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "./tpl/config.html";

$huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);
$huoniaoTag->assign('cfg_basedomain', $cfg_basedomain);

//选项
$huoniaoTag->assign('aiPlatformOptions', $aiPlatformOptions);
$huoniaoTag->assign('outputMethodOptions', $outputMethodOptions);
$huoniaoTag->assign('openPluginOptions', $openPluginOptions);
$huoniaoTag->assign('useLimitOptions', $useLimitOptions);

$huoniaoTag->assign('aiPlatform', $aiPlatform);
$huoniaoTag->assign('model', $model);
$huoniaoTag->assign('outputMethod', $outputMethod);
$huoniaoTag->assign('apiKey', $apiKey);
$huoniaoTag->assign('openPlugin', $openPlugin);
$huoniaoTag->assign('modules', $modules ? explode(',', $modules) : array());
$huoniaoTag->assign('useLimit', $useLimit);
$huoniaoTag->assign('adminRoute', $adminRoute);

$huoniaoTag->display($templates);
