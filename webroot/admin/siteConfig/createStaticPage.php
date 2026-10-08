<?php
/**
 * 生成静态页面
 *
 * @version        $Id: createStaticPage.php 2023-7-13 上午11:24:18 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2023, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("createStaticPage");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "createStaticPage.html";

//获取所有分站
$siteConfigService = new siteConfig();
$siteCityList = $siteConfigService->siteCity();

if($action){

    $siteCityCount = count($siteCityList);

    //如果没有分站，直接结束
    if(!is_array($siteCityList) || $siteCityCount == 0){
        ShowMsg("请先开通分站！", "createStaticPage.php");
    }

    //生成指定分站
    if($action == 'index' && $cityid){
        $siteCityCount = 1;
        $_siteCityList = array();
        foreach($siteCityList as $val){
            if($val['cityid'] == $cityid){
                $_siteCityList = $val;
            }
        }
        $siteCityList = array($_siteCityList);
    }
    
    //分页信息
    $page = (int)$page;
    $pageSize = 50;  //每次生成50个文件
    $totalCityPage = ceil($siteCityCount / $pageSize);  //分站总页数

    //大首页
    if($action == 'index'){

        if($page == 0){
            ShowMsg("共有" . $siteCityCount . "个大首页需要生成，正在生成第1-" . ($pageSize > $siteCityCount ? $siteCityCount : $pageSize) . "个，请稍候...", "createStaticPage.php?action=index&page=1&cityid=" . $cityid);
        }
        else{
            $startRow = ($page - 1) * $pageSize;
            $siteCityData = array_slice($siteCityList, $startRow, $pageSize);

            if($siteCityData){
                foreach($siteCityData as $city){
                    $_cityid = $city['cityid'];  //城市ID
                    $_url = $city['url'];  //分站域名

                    //生成文件
                    createStaticPage($_url, 'siteConfig', 'index', $_cityid);
                }
            }
            
            $startRow = $page * $pageSize;
            $endRow = $startRow + $pageSize;
            $endRow = $endRow > $siteCityCount ? $siteCityCount : $endRow;

            if($page == $totalCityPage){
                adminLog('生成大首页静态页面', '共' . $siteCityCount . '个');
                ShowMsg("成功生成" . $siteCityCount . "个大首页！", "createStaticPage.php");
            }else{
                ShowMsg("共有" . $siteCityCount . "个大首页需要生成，正在生成第" . ($startRow + 1) . "-" . $endRow . "个，请稍候...", "createStaticPage.php?action=index&page=" . ($page + 1));
            }
        }

    }
    //模块首页
    elseif($action == 'moduleIndex'){

        global $siteCityInfo;

        $page = (int)$_GET['page'];

        //获取cookie中的siteCityInfo信息
        $siteCityInfoBak = getCookie('siteCityInfoBak');
        if(!$siteCityInfoBak){
            $_siteCityInfo = GetCookie('siteCityInfo');
            $siteCityInfoBak = $_siteCityInfo;
            PutCookie('siteCityInfoBak', $_siteCityInfo, 86400);  //写入cookie，以备生成结束后恢复生成前的siteCityInfo使用
        }

        //获取/创建缓存数据
        $siteModuleIndexFile = HUONIAOROOT . "/log/siteModuleIndex.json";
        $siteModuleIndex = @file_get_contents($siteModuleIndexFile);
        $siteModuleIndex = json_decode($siteModuleIndex, true);
        if($page == 0 || !$siteModuleIndex){

            //获取分站数据
            $siteModuleData = array();
            foreach($siteCityList as $key => $city){

                //将分站信息写入cookie，用于获取模块链接
                $siteCityInfo = $city;
                // PutCookie('siteCityInfo', json_encode($city), 3600);
                
                if($moduleid == 'business'){

                    $configHandels = new handlers('business', "config");
                    $moduleConfig = $configHandels->getHandle();
                    $moduleConfig  = $moduleConfig['info'];

                    array_push($siteModuleData, array(
                        'module' => $moduleid,
                        'url' => $moduleConfig['channelDomain'],
                        'cityid' => $city['cityid']
                    ));

                }else{
                    //获取所有分站
                    $siteConfigService = new siteConfig(array('cityid' => $city['cityid']));
                    $siteModuleList = $siteConfigService->siteModule();

                    //获取将该分站下的模块链接
                    foreach($siteModuleList as $module){

                        //生成指定模块首页
                        if($moduleid && $module['code'] == $moduleid){
                            array_push($siteModuleData, array(
                                'module' => $module['code'],
                                'url' => $module['url'],
                                'cityid' => $city['cityid']
                            ));
                        }
                        elseif(!$moduleid){
                            array_push($siteModuleData, array(
                                'module' => $module['code'],
                                'url' => $module['url'],
                                'cityid' => $city['cityid']
                            ));
                        }
                        
                    }
                }

            }

            $siteModuleIndex = $siteModuleData;

            //文件缓存
            $fp = @fopen($siteModuleIndexFile, "w");
            @fwrite($fp, json_encode($siteModuleData));
            @fclose($fp);

        }
        
        $siteModuleIndexCount = count($siteModuleIndex);
        $totalModulePage = ceil($siteModuleIndexCount / $pageSize);  //模块总页数

        if($page == 0){
            ShowMsg("共有" . $siteModuleIndexCount . "个模块首页需要生成，正在生成第1-" . ($pageSize > $siteModuleIndexCount ? $siteModuleIndexCount : $pageSize) . "个，请稍候...", "createStaticPage.php?action=moduleIndex&page=1&moduleid=" . $moduleid);
        }
        else{
            $startRow = ($page - 1) * $pageSize;
            $_siteModuleData = array_slice($siteModuleIndex, $startRow, $pageSize);

            if($_siteModuleData){
                foreach($_siteModuleData as $module){
                    $_cityid = $module['cityid'];  //城市ID
                    $_url = $module['url'];  //模块链接
                    $_module = $module['module'];  //模块标识

                    //生成文件
                    createStaticPage($_url, $_module, 'index', $_cityid);
                }
            }
            
            $startRow = $page * $pageSize;
            $endRow = $startRow + $pageSize;
            $endRow = $endRow > $siteModuleIndexCount ? $siteModuleIndexCount : $endRow;

            if($page == $totalModulePage){
                PutCookie('siteCityInfo', $siteCityInfoBak, 86400 * 7);  //恢复生成前的cookie信息
                DropCookie('siteCityInfoBak');  //删除备份cookie
                adminLog('生成模块首页静态页面', '共' . $siteModuleIndexCount . '个');
                unlinkFile($siteModuleIndexFile);  //删除生成的模块首页临时文件
                ShowMsg("成功生成" . $siteModuleIndexCount . "个模块首页！", "createStaticPage.php");
            }else{
                ShowMsg("共有" . $siteModuleIndexCount . "个模块首页需要生成，正在生成第" . ($startRow + 1) . "-" . $endRow . "个，请稍候...", "createStaticPage.php?action=moduleIndex&page=" . ($page + 1));
            }
        }

    }

	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'admin/siteConfig/createStaticPage.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    //按字母排序
    array_multisort(array_column($siteCityList,'pinyin'), SORT_ASC, $siteCityList);
	$huoniaoTag->assign('siteCityList', $siteCityList);  //分站信息

    //系统模块
    include HUONIAOINC . '/config/business.inc.php';
    $moduleArr = array(
        array('name' => 'business', 'title' => $customChannelName)
    );
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


    //获取分站数据
    $siteModuleData = array();
    foreach($siteCityList as $key => $city){

        $siteCityInfo = $city;
 
        //获取所有分站
        $siteConfigService = new siteConfig(array('cityid' => $city['cityid']));
        $siteModuleList = $siteConfigService->siteModule();

        //获取将该分站下的模块链接
        foreach($siteModuleList as $module){
            array_push($siteModuleData, array(
                'module' => $module['code'],
                'url' => $module['url'],
                'cityid' => $city['cityid']
            ));
        }
    }
    $huoniaoTag->assign('moduleIndexCount', count($siteModuleData));


	$huoniaoTag->assign('action', $action);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
