<?php
/**
 * 发布页自定义
 *
 * @version        $Id: siteFabuPages.php 2022-01-05 上午09:56:23 $
 * @package        HuoNiao.siteConfig
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("siteFabuPages");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "sitePcFabuPages.html";

$infoarr = array();
$archives = $dsql->SetQuery("SELECT `config`, `children`, `browse`,`title` FROM `#@__site_config` WHERE `type` = 'fabuPC'");
$results = $dsql->dsqlOper($archives, "results");
$infoarr['customConfig'] = unserialize($results[0]['config']) ? unserialize($results[0]['config']) : '';
$infoarr['customChildren'] = unserialize($results[0]['children']) ? unserialize($results[0]['children']) : '';
$huoniaoTag->assign("infoarr", $infoarr);
$titleinfo = unserialize($results[0]['title']);
$title = $titleinfo['title'] ? unserialize($results[0]['title']) : $infoarr['title'];
$huoniaoTag->assign("title", $title);

//保存
if($dopost == 'save'){
  $data = str_replace("\\", '', $_POST['customConfig']);
  $json = json_decode($data);
  $customConfig = objtoarr($json);
  $config = $customConfig ? serialize($customConfig) : '';
  $datas = str_replace("\\", '', $_POST['customChildren']);
  $jsons = json_decode($datas);
  $Children = objtoarr($jsons);
  $Childrenn = objtoarr($jsons);
  $Children = $Children ? serialize($Children) : '';
  $title = str_replace("\\", '', $_POST['title']);
  $title = json_decode($title);
  $title = objtoarr($title);
  $title = $title ? serialize($title) : '';
    if ($type == 1){
      $arr['config'] = $customConfig;
      $arr['customChildren'] = $Childrenn;
      $info = serialize($arr);
        //保存到主表
        $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `browse` = '$info',`title`='$title' WHERE `type` = 'fabuPC'");
        $aid = $dsql->dsqlOper($archives, "update");

        $param = array(
            "service"     => "member",
            "type"        => "user",
            "template"    => "publish",
        );
        $url = getUrlPath($param);
        if($aid  == "ok"){
            echo json_encode(array(
                'state' => 100,
                'info' => $url
            ));
        }
        die;
    }else{

      $archives = $dsql->SetQuery("SELECT `config`, `children`, `browse`,`title` FROM `#@__site_config` WHERE `type` = 'fabuPC'");
      $results = $dsql->dsqlOper($archives, "results");
        if ($results) {
          $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `config` = '$config',`children` = '$Children',`title` = '$title' WHERE `type` = 'fabuPC'");
          $aid = $dsql->dsqlOper($archives, "update");
        }else{
          //保存到主表
          $archives = $dsql->SetQuery("INSERT INTO `#@__site_config` (`type`, `config`,`children`,`title`) VALUES ('fabuPC', '$config','$Children','$title')");
          $aid = $dsql->dsqlOper($archives, "update");
        }
        if($aid  == "ok"){

            //更新APP配置信息
            updateAppConfig();

            echo json_encode(array(
                'state' => 100,
                'info' => '配置成功！'
            ));
        }
        die;
    }
}

//修改
if($dopost == 'edit'){
    //保存到主表
    // $config = unserialize($config);
    // $children = unserialize($children);

    $data = str_replace("\\", '', $_POST['customConfig']);
    $json = json_decode($data);
    $customConfig = objtoarr($json);
    $config = $customConfig ? serialize($customConfig) : '';
    $datas = str_replace("\\", '', $_POST['customChildren']);
    $jsons = json_decode($datas);
    $Children = objtoarr($jsons);
    $Childrenn = objtoarr($jsons);
    $Children = $Children ? serialize($Children) : '';
    $title = str_replace("\\", '', $_POST['title']);
    $title = json_decode($title);
    $titlearr = objtoarr($title);
    $title = $titlearr ? serialize($titlearr) : '';

    if ($type == 1){
      $arr['config'] = $customConfig;
      $arr['customChildren'] = $Childrenn;
      $arr['title'] = $titlearr;
        $info = serialize($arr);
        //保存到主表
        $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `type` = 'fabuPC', `browse` = '$info' WHERE `type` = 'fabuPC'");
        $aid = $dsql->dsqlOper($archives, "update");
        $param = array(
            "service"     => "member",
            "type"        => "user",
            "template"    => "publish",
        );
        $url         = getUrlPath($param);
        if($aid  == "ok"){
            echo json_encode(array(
                'state' => 100,
                'info' => $url
            ));
        }
        die;
    }else{
    $archives = $dsql->SetQuery("UPDATE  `#@__site_config` SET `type` = 'fabuPC', `config` = '$config',`children` = '$Children',`browse` = '$borwse',`title` = '$title' WHERE `type` = 'fabuPC'");
    $aid = $dsql->dsqlOper($archives, "update");
    if($aid  == "ok"){
        echo json_encode(array(
            'state' => 100,
            'info' => '修改成功！'
        ));
    }
    die;
  }
}


//验证模板文件
if(file_exists($tpl."/".$templates)){
  //注册公共模块函数，主要给在当前模块下调用其他模块数据时使用
  $contorllerFile = HUONIAOINC.'/loop.php';
  if(file_exists($contorllerFile)){
    require_once($contorllerFile);
    $huoniaoTag->registerPlugin("block", "loop", "loop");
  }

  $userDomain = getUrlPath(array("service" => "member", "type" => "user"));
  $huoniaoTag->assign('member_userDomain', $userDomain);
  if($cfg_remoteStatic){
    $huoniaoTag->assign('cfg_staticPath', $cfg_remoteStatic . '/static/');  //静态资源路径
  }else{
    $huoniaoTag->assign('cfg_staticPath', $cfg_staticPath);  //静态资源路径
  }
  $huoniaoTag->assign("cfg_weblogo", getFilePath($cfg_weblogo));

  $sfcar_displayConfig = array(
    array('人找车', '乘用载货'),
    array('车找人', '找客找货')
  );
  if(in_array("sfcar", $installModuleArr)){
    $sfcar_config = getModuleConfig('sfcar');
    $sfcar_displayConfig = $sfcar_config['displayConfig'];
  }
  $huoniaoTag->assign("sfcar_displayConfig", $sfcar_displayConfig);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
