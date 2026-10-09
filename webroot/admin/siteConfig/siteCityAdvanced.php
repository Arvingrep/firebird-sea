<?php
/**
 * 分站高级设置
 *
 * @version        $Id: siteCityAdvanced.php 2019-02-25 下午16:38:16 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteCityAdvanced");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "siteCityAdvanced.html";

$db = "site_city";


//配置信息
if($cid) {
    $sql = $dsql->SetQuery("SELECT `config` FROM `#@__site_city` WHERE `cid` = " . $cid);
    $ret = $dsql->dsqlOper($sql, "results");
    if (!$ret) {
        die('分站不存在或已经删除，请确认后重试！');
    }
    $configArr = $ret[0]['config'] ? unserialize($ret[0]['config']) : array();
}


//删除模板文件夹
if($action == "delTpl") {
    if (empty($floder)) die('请选择要删除的模板！');

    $dir = HUONIAOROOT . "/templates/" . $dopost; //当前目录
    $floder = $dir . "/" . iconv('utf-8', 'gbk', $floder);

    $deldir = deldir($floder);
    if ($deldir) {
        adminLog("删除城市分站模板", $cid . '=>' . $floder);

        die('{"state": 100, "info": ' . json_encode("删除成功！") . '}');
    } else {
        die('{"state": 200, "info": ' . json_encode("删除失败！") . '}');
    }
}


//所属模块
$action = $action ? $action : 'siteConfig';


//获取模板
if($dopost == 'getTemplate'){

    //模板风格
    $dir = "../../templates/" . $action; //当前目录
    $floders = listDir($dir);
    $floderList = $tplList = $defaultTplList = array();

    if(!empty($floders)){
        foreach($floders as $key => $floder){
            $config = $dir . '/' . $floder . '/config.xml';
            $floderArr = explode('__', $floder);

            if (file_exists($config)) {
                //解析xml配置文件
                $xml = new DOMDocument();
                libxml_disable_entity_loader(false);
                $xml->load($config);
                $data = $xml->getElementsByTagName('Data')->item(0);
                $tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
                $copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;

                if($floderArr && $floderArr[0] == $cid) {
                    array_push($floderList, $floderArr[1]);
                    array_push($tplList, array(
                        'tplname' => $tplname,
                        'directory' => $floder,
                        'copyright' => $copyright
                    ));
                }

                if(!in_array($floder, $floderList)) {

                    if (!strstr($floder, '__')) {
                        array_push($defaultTplList, array(
                            'tplname' => $tplname,
                            'directory' => $floder,
                            'copyright' => $copyright
                        ));
                    }
                }

            }

        }
    }


    //touch模板
    $floders = listDir($dir.'/touch');
    $floderList = $touchTplList = $touchDefaultTplList = array();

    //系统首页增加DIY模板
    if($action == 'siteConfig'){
        array_push($touchTplList, array(
            'tplname' => 'diy',
            'directory' => 'diy',
            'copyright' => '火鸟门户'
        ));
    }

    if(!empty($floders)){
        $i = 0;
        foreach($floders as $key => $floder){
            $config = $dir . '/touch/' . $floder . '/config.xml';
            $floderArr = explode('__', $floder);

            if (file_exists($config)) {
                //解析xml配置文件
                $xml = new DOMDocument();
                libxml_disable_entity_loader(false);
                $xml->load($config);
                $data = $xml->getElementsByTagName('Data')->item(0);
                $tplname = $data->getElementsByTagName("tplname")->item(0)->nodeValue;
                $copyright = $data->getElementsByTagName("copyright")->item(0)->nodeValue;

                if($floderArr && $floderArr[0] == $cid) {
                    array_push($floderList, $floderArr[1]);
                    array_push($touchTplList, array(
                        'tplname' => $tplname,
                        'directory' => $floder,
                        'copyright' => $copyright
                    ));
                }

                if(!in_array($floder, $floderList)) {

                    if (!strstr($floder, '__')) {
                        array_push($touchDefaultTplList, array(
                            'tplname' => $tplname,
                            'directory' => $floder,
                            'copyright' => $copyright
                        ));
                    }
                }
            }

        }
    }

    $current = $configArr[$action]['template'];
    if(!file_exists($dir . '/' . $current . '/config.xml')){
        $current = '';
    }

    $touchCurrent = $configArr[$action]['touchTemplate'];
    if(!file_exists($dir . '/touch/' . $touchCurrent . '/config.xml') && $touchCurrent != 'diy'){
        $touchCurrent = '';
    }


    echo json_encode(array(
        'current' => $current,
        'defaultTplList' => $defaultTplList,
        'tplList' => $tplList,
        'touchCurrent' => $touchCurrent,
        'touchDefaultTplList' => $touchDefaultTplList,
        'touchTplList' => $touchTplList
    ));
    die;

//复制模板
}elseif($dopost == 'copyTemplate'){

    $tempDir = HUONIAOROOT . '/templates/' . $action . ($type ? '/touch' : '');
    $oldTemp = $tempDir . '/' . $template;
    $newTemp = $tempDir . '/' . $cid . '__' . $template;
    copyDir($oldTemp, $newTemp);

    if(is_dir($newTemp)){

        //更改权限
        ChmodAll($newTemp, '777');

        adminLog("复制城市分站模板", $cid . '=>' . ($type ? 'touch/' : '') . '=>' . $template);

        echo json_encode(array(
            'state' => 100,
            'info' => '复制成功！'
        ));
    }else{
        echo json_encode(array(
            'state' => 200,
            'info' => '复制失败，请检查文件夹权限！'
        ));
    }
    die;

//保存
}elseif($dopost == 'save'){

    $data = array();

    //系统配置
    if($action == 'siteConfig'){
        $data = array(
            'webname' => $webname,
            'weblogo' => $litpic,
            'keywords' => $keywords,
            'description' => trim($description),
            'hotline' => $hotline,
            'areaCode' => $areaCode,
            'statisticscode' => stripslashes($statisticscode),
            'powerby' => $powerby,
            'template' => $template,
            'touchTemplate' => $touchTemplate,
            'cfg_fzrewardFee'       => (float)$fzrewardFee,
            'cfg_fzbusinessMaidanFee' => (float)$fzbusinessMaidanFee,
            'cfg_fztuanFee'         => (float)$fztuanFee,
            'cfg_fztravelFee'       => (float)$fztravelFee,
            'cfg_fzjobFee'          => (float)$fzjobFee,
            'cfg_fzshopFee'         => (float)$fzshopFee,
            'cfg_fzwaimaiFee'       => (float)$fzwaimaiFee,
            'cfg_fzwaimaiPaotuiFee' => (float)$fzwaimaiPaotuiFee,
            'cfg_fzhuodongFee'      => (float)$fzhuodongFee,
            'cfg_fzliveFee'         => (float)$fzliveFee,
            'cfg_fzvideoFee'        => (float)$fzvideoFee,
            'cfg_fzawardlegouFee'   => (float)$fzawardlegouFee,
            'cfg_fzhomemakingFee'   => (float)$fzhomemakingFee,
            'cfg_fzeducationFee'    => (float)$fzeducationFee,
            'cfg_roofFee'           => (float)$roofFee,
            'cfg_setmealFee'        => (float)$setmealFee,
            'cfg_fabulFee'          => (float)$fabulFee,
            'cfg_levelFee'          => (float)$levelFee,
            'cfg_storeFee'          => (float)$storeFee,
            'cfg_fenxiaoFee'        => (float)$fenxiaoFee,
            'cfg_jiliFee'           => (float)$jiliFee,
            'cfg_payPhoneFee'       => (float)$payPhoneFee,
            'miniProgramName'       => trim($miniProgramName),
            'miniProgramAppid'      => trim($miniProgramAppid),
            'miniProgramAppsecret'  => trim($miniProgramAppsecret),
            'miniProgramId'         => trim($miniProgramId)
        );

    }else{

        $data = array(
            'state' => $state,
            'title' => $title,
            'keywords' => $keywords,
            'description' => trim($description),
            'logo' => $litpic,
            'short_video_promote' => $short_video_promote,
            'hotline' => $hotline,
            'router' => $router,
            'template' => $template,
            'touchRouter' => $touchRouter,
            'touchTemplate' => $touchTemplate,
            'serviceMoney' => (float)$paotuiServiceMoney,
            'cityDispatch' => (int)$cityDispatch

        );

    }

    
    //如果是外卖模块，则增加恶劣天气配送费相关配置
    if ($action == 'waimai') {
        $data['badWeatherState'] = (int)$badWeatherState; //是否开启恶劣天气配送费 1启用 0关闭
        $data['badWeatherMoney'] = (float)$badWeatherMoney; //恶劣天气增加费用
        $data['badWeatherStart'] = trim($badWeatherStart); //开始时间
        $data['badWeatherEnd'] = trim($badWeatherEnd); //结束时间
    }


    if(!$configArr[$action]){
        $configArr[$action] = array();
    }
    $configArr[$action] = $data;

    $config = serialize($configArr);
    $config = addslashes($config);
    $sql = $dsql->SetQuery("UPDATE `#@__site_city` SET `config` = '$config' WHERE `cid` = $cid");
    $ret = $dsql->dsqlOper($sql, "update");
    if($ret == 'ok'){

        adminLog("编辑城市分站高级设置", $cid);

        echo json_encode(array(
            'state' => 100,
            'info' => '配置成功！'
        ));
    }else{
        echo json_encode(array(
            'state' => 200,
            'info' => $ret
        ));
    }
    die;

}


//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
        'ui/jquery.dragsort-0.5.1.min.js',
        'ui/bootstrap-datetimepicker.min.js',
        'publicUpload.js',
		'admin/siteConfig/siteCityAdvanced.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cid', (int)$cid);

	//系统模块
    $moduleArr = array();
    $sql = $dsql->SetQuery("SELECT `title`, `subject`, `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 ORDER BY `weight`, `id`");
    $result = $dsql->dsqlOper($sql, "results");
    if($result){
        foreach ($result as $key => $value) {
            if(!empty($value['name'])){
                $moduleArr[] = array(
                    "name" => $value['name'],
                    "title" => $value['subject'] ? $value['subject'] : $value['title']
                );
            }
        }
    }
    $huoniaoTag->assign('moduleArr', $moduleArr);
    $huoniaoTag->assign('action', $action);

    //配置
    $huoniaoTag->assign('config', $configArr);


    //如果是外卖模块，则向前端传递状态配置数组
    if ($action == 'waimai') {
        $badWeatherStateArr = array(1 => '启用', 0 => '关闭');
        $huoniaoTag->assign('badWeatherStateArr', $badWeatherStateArr);
    }


	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
