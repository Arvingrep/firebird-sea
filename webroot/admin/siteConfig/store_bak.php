<?php
/**
 * 安装新模块
 *
 * @version        $Id: moduleInstall.php 2013-12-24 下午16:52:33 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
if($action != 'filecheck' && $action != 'sync' && $action != 'syncDatabase'){
  checkPurview("store");
}
require_once(HUONIAODATA."/admin/config_official.php");
$dsql = new dsql($dbo);

@set_time_limit(0);  // 修改为不限制超时时间(默认为30秒)
$data = $_GET['data'];

//跳转到下一页的JS
$gotojs = "\r\nfunction GotoNextPage(){
    document.gonext."."submit();
}"."\r\nset"."Timeout('GotoNextPage()',500);";

$dojs = "<script language='javascript'>$gotojs\r\n</script>";

$id = strstr($id, ',') ? $_GET['id'] : $id;

//转至官方
if(empty($auth) && (empty($id) || ($action != 'filecheck' && $action != 'sync' && $action != 'syncDatabase'))){
  $tpl = dirname(__FILE__)."/../templates/siteConfig";
  $templates = "store.html";

	global $cfg_basehost;
  $version = getSoftVersion();

  //获取系统所有已经安装的模板
  $moduleArr = array();
  $sql = $dsql->SetQuery("SELECT `name` FROM `#@__site_module` WHERE `state` = 0 AND `type` = 0 AND `name` != ''");
  $result = $dsql->dsqlOper($sql, "results");
  if($result){
      foreach ($result as $key => $value) {
          if(!empty($value['name'])){
              array_push($moduleArr, $value['name']);
          }
      }
  }

  //当前域名||程序安装文件||当前版本||当前已经安装的模块
	$returnUrl = $cfg_secureAccess.$cfg_basehost."||".($_SERVER['PHP_SELF'] ? $_SERVER['PHP_SELF'] : $_SERVER['SCRIPT_NAME'])."||".$version."||".serialize($moduleArr);
	$redirectUrl = $storeHost.'/?data='.base64_encode($returnUrl).'&v='.time();

  if(file_exists($tpl."/".$templates)){
    $huoniaoTag->assign('redirectUrl', $redirectUrl);

    $huoniaoTag->template_dir = $tpl;
    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
  	$huoniaoTag->display($templates);
  }

//从官方跳转进行安装
}else{

  //文件校验，生成指纹码
  if($action == 'filecheck'){


    //获取已安装模块和插件等信息
    if($_POST['check']){

        $data = array();

        //获取已安装模块
        $sql = $dsql->SetQuery("SELECT `name` FROM `#@__site_module` WHERE `type` = 0 AND `name` != ''");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $data['module'] = array();
            foreach ($ret as $key => $value) {
                array_push($data['module'], $value['name']);
            }
        }

        //获取已安装插件
        $sql = $dsql->SetQuery("SELECT `pid` FROM `#@__site_plugins`");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $data['plugins'] = array();
            foreach ($ret as $key => $value) {
                array_push($data['plugins'], (int)$value['pid']);
            }
        }

        $ret = array(
            "state" => 100,
            "info" => $data
        );
        die(json_encode($ret));

    }


    //取后台目录文件夹名称
    $dirName = str_replace('\\', '/', dirname(__FILE__));
    $dirArr = explode('/', $dirName);
    $adminFolder = $dirArr[count($dirArr)-2];

    //列出需要校验的文件范围
    $md5data = array();
  	checkfiles('./', '\.(php|htaccess|txt)', 0, 'fileSync_hn.php,skin.php,print.php,huoniao.php');
  	checkfiles($adminFolder . '/', '', 1, '', $adminFolder . '/', 'adminFolder/');
  	checkfiles('api/', '\.(php|htm|html|png|jpg|jpeg|gif)', 1, 'appConfig.json,config.inc.php,checkOrder.log,diancanPrint.log,login.log,memberEditWaimaiShop.log,pay.log,push.log');
  	checkfiles('data/admin/', '\.php');
    checkfiles('design/');
  	checkfiles('include/', '\.php', 0, 'dbinfo.inc.php');
  	checkfiles('include/class/');
  	checkfiles('include/cron/');
  	checkfiles('include/data/', '', 1, 'mark.gif,mark.png');
  	checkfiles('include/lang/zh-CN/');
  	checkfiles('include/lang/app/');
  	checkfiles('include/pdf/');
  	checkfiles('include/ueditor/', '\.js', 0);
  	checkfiles('include/ueditor/dialogs/');
  	checkfiles('include/ueditor/php/');
  	checkfiles('log/', '\.htaccess');
  	checkfiles('static/');
  	checkfiles('templates/', '\.htaccess');
  	checkfiles('templates/about/');
  	checkfiles('templates/certification/');
  	checkfiles('templates/courier/');
  	checkfiles('templates/diy/');
  	checkfiles('templates/feedback/');
  	checkfiles('templates/help/');
  	checkfiles('templates/member/');
  	checkfiles('templates/middlejump/');
  	checkfiles('templates/notice/');
  	checkfiles('templates/poster/');
  	checkfiles('templates/protocol/');
  	checkfiles('templates/siteConfig/', '\.html', 0);
	checkfiles('templates/tousu/');
	checkfiles('templates/supplier/');
  	checkfiles('wmsj/');

    //本地校验文件
    $huoniaofile = HUONIAODATA.'/admin/huoniaofiles.txt';

    //写入验证文件
    $fileDataList = array();
    unlinkFile($huoniaofile);
    foreach ($md5data as $key => $value) {
      array_push($fileDataList, $value . " " . iconv("UTF-8", "GB2312//IGNORE", $key));
    }

    PutFile($huoniaofile, join("\r\n", $fileDataList));
    echo join("\r\n", $fileDataList);
    die;

  //同步文件
  }elseif($action == 'sync'){

    //取后台目录文件夹名称
    $dirName = str_replace('\\', '/', dirname(__FILE__));
    $dirArr = explode('/', $dirName);
    $adminFolder = $dirArr[count($dirArr)-2];
    $file = $_GET['file'];

    $downloadUrl = $cloudHost.'/include/ajax.php?action=syncFile&auth='.$auth.'&file='.urlencode(preg_replace('/^\/'.$adminFolder.'\//', '/adminFolder/', $file));
    $trueFilePathFloder = dirname($file);

    //创建下载文件夹
    if(!is_dir(HUONIAOROOT.$trueFilePathFloder)){
      createDir(HUONIAOROOT.$trueFilePathFloder);
    }

    if(!is_dir(HUONIAOROOT.$trueFilePathFloder)){
      die($callback.'({"state": 200, "info": '.json_encode("文件夹创建失败，请检查服务器权限，或手动创建要同步的文件目录结构！").'})');
    }

    //先修改权限
    // @chmod(HUONIAOROOT . $file, '0777');

    /* 下载文件 */
    // if($file == '/huoniao'){
        
    //     $zipfile   = HUONIAODATA."/module/huoniao.zip";
	// 	$savepath  = HUONIAODATA."/module/huoniao";

    //     /* 下载文件 */
  	// 	$file = new httpdown();
  	// 	$file->OpenUrl($downloadUrl); # 远程文件地址
  	// 	$r = $file->SaveToBin($zipfile); # 保存路径及文件名
  	// 	$file->Close(); # 释放资源

    //     if(!$r){
    //         die($callback.'({"state": 200, "info": '.json_encode($httpdown->m_error).'})');
    //     }

    //     if(!file_exists($zipfile)) {
    //         die($callback.'({"state": 200, "info": '.json_encode("同步失败，请手动操作！").'})');
    //     }

    //     $zip = new ZipArchive;
    //     if($zip->open($zipfile) === TRUE){
    //         $zip->extractTo($savepath);
    //         $zip->close();
    //     }else{
    //         die($callback.'({"state": 200, "info": '.json_encode("解压失败，请检查服务器配置！").'})');
    //     }

	// 	@unlink($zipfile); //删除压缩包

    //     //移动模板至相应目录
  	// 	$current_dir = opendir($savepath);
  	// 	while(($file = readdir($current_dir)) !== false) {
  	// 		$sub_dir = $savepath."/".$file;
  	// 		if($file == '.' || $file == '..') {
  	// 			continue;
  	// 		}else{
    //             if(!is_dir($sub_dir)){
    //                 //判断是否移动成功
    //                 if(!moveFile($sub_dir, HUONIAOROOT.'/'.$file, true)){
    //                     die($callback.'({"state": 200, "info": '.json_encode("权限错误，文件移动失败，请给网站目录设置读写权限！").'})');
    //                 }
    //             }else{
    //                 //判断是否移动成功
    //                 if(!moveDir($sub_dir, HUONIAOROOT.'/'.$file, true)){
    //                     die($callback.'({"state": 200, "info": '.json_encode("权限错误，文件移动失败，请给网站目录设置读写权限！").'})');
    //                 }
    //             }
    //         }
	// 	}

    // }else{
        $httpdown = new httpdown();
        $httpdown->OpenUrl($downloadUrl); # 远程文件地址
        $r = $httpdown->SaveToBin(HUONIAOROOT . $file); # 保存路径及文件名
        $httpdown->Close(); # 释放资源

        if(!$r){
          die($callback.'({"state": 200, "info": '.json_encode($httpdown->m_error).'})');
        }

        if(!file_exists(HUONIAOROOT . $file)) {
            die($callback.'({"state": 200, "info": '.json_encode("同步失败，请手动操作！").'})');
        }

        //如果是DIY模板文件，需要删除同目录中的相同文件，以防出现垃圾文件
        if(strstr($file, "/templates/") && strstr($file, "/diy/") && !strstr($file, "static")){
            $filePath = HUONIAOROOT . $file;  //文件绝对路径
            $dirPath = dirname($filePath);  //文件所在目录
            $fileName = basename($file);  //文件名
            $_fileName = preg_replace('/(.js|.css)/', '', $fileName);  //去除文件名后缀
            $_fileName = substr($_fileName, 0, -9);  //去除文件名的hash值，通常为xxxx-8位字符|xxxx.8位字符

            $fileList = listFile($dirPath);
            if($fileList){
                foreach($fileList as $k => $v){
                    if($v != $fileName){
                        $_v = preg_replace('/(.js|.css)/', '', $v);  //去除文件名后缀
                        $_v = substr($_v, 0, -9);  //去除文件名的hash值，通常为xxxx-8位字符|xxxx.8位字符

                        if($_v == $_fileName){
                            unlinkFile($dirPath . '/' . $v);
                        }
                    }
                }
            }
        }
    // }

	adminLog("同步文件", $file);

  	die($callback.'({"state": 100, "info": '.json_encode("同步成功！").'})');


  //同步表结构
  }elseif($action == 'syncDatabase'){
    $sql = base64_decode(str_replace(' ', '+', $_POST['s']));
    if(!empty($sql)){
      $archives = $dsql->SetQuery($sql);
      $ret = $dsql->dsqlOper($archives, "update");
      if($ret != "ok"){
        $_ret = json_decode($ret, true);
        $_error = is_array($_ret) ? $_ret['info'] : $ret;
        $_error = $_error == '操作失败！' ? '执行失败，如需查看错误详情，请开启系统基本参数中的Debug模式！' : $_error;
        die($callback.'({"state": 200, "info": '.json_encode("SQL语句执行失败，错误信息：" . $_error).'})');
      }else{
        // 同步分表
        if(strstr($sql, 'articlelist')){
          sync_fenbiao();
        }

		adminLog("同步数据库", $sql);
        die($callback.'({"state": 100, "info": '.json_encode("执行成功！").'})');
      }
    }else{
      die($callback.'({"state": 200, "info": '.json_encode("SQL语句为空，执行失败！").'})');
    }

  }


  $startpos = (int)$_POST['startpos'];
  $hasnew   = $_POST['hasnew'];
  $newVersion = $_POST['newVersion'];
  $updateTime = $_POST['updateTime'];
  $updateToken = $_POST['updateToken'];
  $savepath = $_POST['savepath'];
  $name     = $_POST['name'];
  $module   = $_POST['module'];
  $mobile   = $_POST['mobile'];
  $folder   = $_POST['folder'];
  $ids      = explode(",", $_GET['id']);
  $name     = empty($name) ? $ids[0] : $name;
  if(empty($name)){
    ShowMsg('没有要安装的模块，请确认后重试！', 'store.php', 0, 10000);
    exit();
  }

	$pos = 0;


	/* 步骤一 下载文件 */
	if($startpos == 0){

    $url = $cloudHost.'/include/ajax.php?action=installModule&do='.$action.'&auth='.$auth.'&name='.$name;
    if($name == "system"){
      $softVersion = getSoftVersion();
    	$siteVersion  = explode("\n", $softVersion);  // 0：版本号  1：升级时间
      $url = $cloudHost.'/include/ajax.php?action=installModule&do='.$action.'&auth='.$auth.'&name='.$name.'&update='.(int)$siteVersion[1];
    }

    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_TIMEOUT, 20);
    curl_setopt($curl, CURLOPT_USERAGENT, "kumanyun/store");
    $con = curl_exec($curl);
    curl_close($curl);

    if($con){
      $data = json_decode($con, true);
    }else{
      ShowMsg('请求超时，请重试。<br />错误原因：' . curl_error($curl), 'store.php', 0, 10000);
      exit();
    }

    if(!is_array($data)){
      ShowMsg('安装包下载失败，请重试', 'store.php', 0, 10000);
      exit();
    }

    if($data['state'] == 200){
      ShowMsg($data['info'], 'store.php', 0, 10000);
      exit();
    }

    //请求成功
    if($data['state'] == 100){

      $dir = HUONIAODATA."/module/";

      //以下两个参数在升级模板或安装模板功能需要用到
      $module = $data['module'];  //所属模块
      $mobile = $data['mobile'];    //是否为手机版
      $folder = $data['folder'];    //模板安装目录

      //创建下载文件夹
      if(!is_dir($dir)){
        createDir(HUONIAODATA."/module/");
      }

      //先修改权限
      // @chmod(HUONIAODATA . "/module/", '0777');

      if(!is_dir($dir)){
        ShowMsg('文件夹创建失败，请检查服务器权限，或手动创建'.HUONIAODATA.'/module/文件夹！', 'store.php', 0, 10000);
        exit();
      }

  		/* 下载文件 */
  		$file = new httpdown();
  		$file->OpenUrl($data['info']); # 远程文件地址
  		$file->SaveToBin($dir.$name.".zip"); # 保存路径及文件名
  		$file->Close(); # 释放资源
      $tmsg  = '';
      $progress = 20; //进度
  		// $tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: 20%;'>20%</div></div>\r\n";
  		$pos = 1;

      //升级
      if($action == "update" || $action == "updateTemplate"){
        $hasnew = $data['hasnew'];
        $newVersion = $data['version'];
        $updateTime = $data['update'];
        $tmsg .= "正在下载 ".$data['title']." ".$newVersion." 升级包，请稍候...";

      //系统升级
      }elseif($name == "system"){
        $hasnew = $data['hasnew'];
        $newVersion = $data['version'];
        $updateTime = $data['update'];
        $updateToken = $data['token'];
        $tmsg .= "正在下载 ".$data['title']." ".$newVersion."，请稍候...";

      //正常安装
      }else{
        $tmsg .= "正在下载 ".$data['title']." 安装包，请稍候...";
      }


    //其他情况：升级时发现已经安装了最新版本，无需更新，直接跳转到最后一步
    }elseif($data['state'] == 201){
      if($name == "system"){
        ShowMsg($data['info'], 'store.php', 0, 10000);
        exit();
      }else{
        $progress = 0; //进度
        $tmsg  = "";
        // $tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: 0%;'>0%</div></div>\r\n";
        $tmsg .= $data['info'];
        $pos = 4;
      }

    }

	/* 步骤二 解压文件 */
	}elseif($startpos == 1){

		$zipfile   = HUONIAODATA."/module/".$name.".zip";
		$savepath  = HUONIAODATA."/module/".$name;

    if(!file_exists($zipfile)) {
      ShowMsg('下载失败，请重新安装！', 'store.php', 0, 10000);
      clearstatcache();
			exit();
    }

    $zip = new ZipArchive;
    if($zip->open($zipfile) === TRUE){
      $zip->extractTo($savepath);
      $zip->close();
    }else{
      ShowMsg('解压失败，请检查服务器配置！', 'store.php', 0, 10000);
      exit();
    }

		@unlink($zipfile); //删除压缩包

		// $tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: 40%;'>40%</div></div>\r\n";

    $progress = 40; //进度
		$tmsg  = "";
		$tmsg .= "正在解压安装包，请稍候...";
		$pos = 2;

	/* 步骤三 移动文件 */
	}elseif($startpos == 2){

    //遍历文件夹，获取文件和文件夹列表
		$fileList = traverseFloder($savepath);
		$fileList = singelArray($fileList);


    //安装模板、更新模板
    if($action == "updateTemplate" || $action == "installTemplate"){

      if($mobile){
          $tempDir = HUONIAOROOT."/templates/".$module."/touch/".$folder."/";
      }else{
          $tempDir = HUONIAOROOT."/templates/".$module."/".$folder."/";
      }

      //创建下载文件夹
      if(!is_dir($tempDir)){
        createDir($tempDir);
      }

      if(!is_dir($tempDir)){
        ShowMsg('文件夹创建失败，请检查服务器权限，或手动创建'.$tempDir.'文件夹！', 'store.php', 0, 10000);
        exit();
      }

      //移动模板至相应目录
  		$current_dir = opendir($savepath);
  		while(($file = readdir($current_dir)) !== false) {
  			$sub_dir = $savepath."/".$file;
  			if($file == '.' || $file == '..') {
  				continue;
  			}else{
          if(!is_dir($sub_dir)){
            //判断是否移动成功
            if(!moveFile($sub_dir, $tempDir.$file, true)){
              ShowMsg('权限错误，文件移动失败，请给网站目录设置读写权限！', 'store.php', 0, 10000);
              exit();
            }
          }else{
            //判断是否移动成功
            if(!moveDir($sub_dir, $tempDir.$file, true)){
              ShowMsg('权限错误，文件夹移动失败，请给网站目录设置读写权限！', 'store.php', 0, 10000);
              exit();
            }
          }
        }
		  }

      // $tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: 80%;'>80%</div></div>\r\n";
      $progress = 80; //进度
      $tmsg  = "";
  		$tmsg .= "正在移动模板文件至相应位置，请稍候...";
  		$pos = 4;

    //插件
    }elseif($action == "installPlugins"){

      $pluginsDir = HUONIAOINC."/plugins/".$name."/";

      //创建下载文件夹
      if(!is_dir($pluginsDir)){
        createDir($pluginsDir);
      }

      if(!is_dir($pluginsDir)){
        ShowMsg('文件夹创建失败，请检查服务器权限，或手动创建'.$pluginsDir.'文件夹！', 'store.php', 0, 10000);
        exit();
      }

      //移动模板至相应目录
  		$current_dir = opendir($savepath);
  		while(($file = readdir($current_dir)) !== false) {
  			$sub_dir = $savepath."/".$file;
  			if($file == '.' || $file == '..') {
  				continue;
  			}else{
          if(!is_dir($sub_dir)){
            //判断是否移动成功
            if(!moveFile($sub_dir, $pluginsDir.$file, true)){
              ShowMsg('权限错误，文件移动失败，请给网站目录设置读写权限！', 'store.php', 0, 10000);
              exit();
            }
          }else{
            //判断是否移动成功
            if(!moveDir($sub_dir, $pluginsDir.$file, true)){
              ShowMsg('权限错误，文件夹移动失败，请给网站目录设置读写权限！', 'store.php', 0, 10000);
              exit();
            }
          }
        }
		  }

      // $tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: 60%;'>60%</div></div>\r\n";
      $progress = 60; //进度
      $tmsg  = "";
  		$tmsg .= "正在移动插件文件至相应位置，请稍候...";
  		$pos = 3;

    //系统安装包、模块安装包
    }else{

      //系统升级先更新数据库 by gz 20180929
      $configFile = ($action == 'installPlugins' ? HUONIAOINC."/plugins/".$name : $savepath) . '/config.xml';
  		//读取模块配置文件
  		if (file_exists($configFile)){
        libxml_disable_entity_loader(false);
  			$xml = simplexml_load_file($configFile);

        if(!$xml){
            ShowMsg('模块配置文件读取失败，请检查服务器配置！', 'store.php', 0, 10000);
            exit();
        }

        //系统升级
        if($name == "system"){

          //配置信息
          $baseinfo = $xml->baseinfo;
          $title    = $baseinfo->title;   //模块名称
          $name     = $baseinfo->name;    //模块标识
          $version  = $baseinfo->version; //模块版本
          $setupsql = str_replace("&#39;", "'", base64_decode($xml->setupsql));  //数据库操作

          //操作执行数据库配置
          $querys = preg_split("#;[ \t]{0,}\r\n#",$setupsql);
          // $querys = explode(';', $setupsql);
          foreach($querys as $q){
            $q = trim($q);
        		if($q==""){
        			continue;
        		}
            $archives = $dsql->SetQuery($q);
            $ret = $dsql->dsqlOper($archives, "update");
            if($ret != "ok"){
              // ShowMsg('SQL语句执行失败，请联系售后处理！<br />'.str_replace(array("\r\n", "\r", "\n"), '<br />', $q), 'store.php', 0, 10000);
              // exit();
            }
          }
        }
      }

  		$files = "";
  		foreach($fileList as $file){
  			$file = iconv("UTF-8", "gb2312", $file);
  			$file = str_replace($savepath.'/config.xml', '', $file);
  			$file = str_replace($savepath."/front", '../..', str_replace($savepath."/admin", '..', $file));
  			if($file != "../../" && $file != "../" && $file != ""){
  				if($file[strlen($file)-1] == "/"){
  					$f = explode("/", $file);
  					if($name == $f[count($f) - 2]){
  						$files .= $file."\r\n";
  					}
  				}else{
  					$files .= $file."\r\n";
  				}
  			}
  		}

  		//移动后台文件夹至相应目录
  		$current_dir = opendir($savepath."/admin");
  		while(($file = readdir($current_dir)) !== false) {
  			$sub_dir = $savepath."/admin" . "/" . $file;
  			if($file == '.' || $file == '..') {
  				continue;
  			}else{
          if(!is_dir($sub_dir)){
            //判断是否移动成功
            if(!moveFile($sub_dir, HUONIAOADMIN."/".$file, true)){
              ShowMsg('权限错误，文件移动失败，请给网站目录设置读写权限！', 'store.php', 0, 10000);
              exit();
            }
          }else{
            //先修改权限
            // @chmod(HUONIAOADMIN."/".$file, '0777');

            //判断是否移动成功
            if(!moveDir($sub_dir, HUONIAOADMIN."/".$file, true)){
              ShowMsg('权限错误，文件移动失败，请给网站目录设置读写权限！', 'store.php', 0, 10000);
              exit();
            }
          }
        }
  		}


      if($name != "system"){
        //判断是否已经安装过，如果已经安装过，需要保留原有模块配置文件
        //首先将原有文件重命名，移动完成后再将新的配置文件删除，最后再将原有配置文件还原
        $has = 0;
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_module` WHERE `name` = '$name'");
        $ret = $dsql->dsqlOper($sql, "totalCount");
        if($ret > 0){
          $has = 1;
          @rename(HUONIAOINC."/config/".$name.".inc.php", HUONIAOINC."/config/".$name.".inc.bak.php");
        }
      }


  		//移动前台文件夹至相应目录
  		$current_dir = opendir($savepath."/front");
  		while(($file = readdir($current_dir)) !== false) {
        $sub_dir = $savepath."/front" . "/" . $file;
        if($file == '.' || $file == '..') {
          continue;
        }else{
          if(!is_dir($sub_dir)){
            //判断是否移动成功
            if(!moveFile($sub_dir, "../".HUONIAOADMIN."/".$file, true)){
              ShowMsg('权限错误，文件移动失败，请给网站目录设置读写权限！', 'store.php', 0, 10000);
              exit();
            }
          }else{

            //先修改权限
            // @chmod("../".HUONIAOADMIN."/".$file, '0777');

            //判断是否移动成功
            if(!moveDir($sub_dir, "../".HUONIAOADMIN."/".$file, true)){
              ShowMsg('权限错误，文件移动失败，请给网站目录设置读写权限！', 'store.php', 0, 10000);
              exit();
            }
          }
        }
  		}

      if($name != "system"){
        //如果是重装或升级，先删除最新的配置文件，再将备份好的还原
        if($has){
            @rename(HUONIAOINC."/config/".$name.".inc.bak.php", HUONIAOINC."/config/".$name.".inc.php");
        }
      }

  		$tmsg  = "";
      $progress = 60; //进度
  		// $tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: 60%;'>60%</div></div>\r\n";
  		$tmsg .= "<font color='green'>正在移动程序文件至相应位置，请稍候...</font>\r\n";
  		$pos = 3;
    }

	/* 步骤四 数据库配置 */
	}elseif($startpos == 3){

    $configFile = ($action == 'installPlugins' ? HUONIAOINC."/plugins/".$name : $savepath) . '/config.xml';
		//读取模块配置文件
		if (file_exists($configFile)){
      libxml_disable_entity_loader(false);
            $xml = simplexml_load_string(file_get_contents($configFile));
// 			$xml = simplexml_load_file($configFile);
      if(!$xml){
          ShowMsg('模块配置文件读取失败，请检查服务器配置！', 'store.php', 0, 10000);
          exit();
      }

      //系统升级
      if($name == "system"){

        //配置信息
        $baseinfo = $xml->baseinfo;
        $title    = $baseinfo->title;   //模块名称
        $name     = $baseinfo->name;    //模块标识
        $version  = $baseinfo->version; //模块版本
        $setupsql = str_replace("&#39;", "'", base64_decode($xml->setupsql));  //数据库操作

        //操作执行数据库配置
//        $querys = preg_split("#;[ \t]{0,}\r\n#",$setupsql);
        $querys = preg_split("#;[ \t]{0,}\n#",$setupsql);
        // $querys = explode(';', $setupsql);
        foreach($querys as $q){
          $q = trim($q);
      		if($q==""){
      			continue;
      		}
          $archives = $dsql->SetQuery($q);
          $ret = $dsql->dsqlOper($archives, "update");
          if($ret != "ok"){
            // ShowMsg('SQL语句执行失败，请联系售后处理！<br />'.str_replace(array("\r\n", "\r", "\n"), '<br />', $q), 'store.php', 0, 10000);
            // exit();
          }
        }

      //插件
      }elseif($action == 'installPlugins'){

        $setupsql = str_replace("&#39;", "'", base64_decode($xml->setupsql));  //数据库操作
        $delsql   = str_replace("&#39;", "'", base64_decode($xml->delsql));    //删除数据表sql

        $dataArr = unserialize($module);
        if(!$dataArr){
          ShowMsg('数据传输错误，插件安装失败，请重新安装！', 'store.php', 0, 10000);
          exit();
        }

        $p_id = $dataArr['id'];
        $p_title = $dataArr['title'];
        $p_author = $dataArr['author'];
        $p_version = $dataArr['version'];
        $p_update = $dataArr['update'];
        $p_description = $dataArr['description'];
        $p_litpic = $dataArr['litpic'];
        $time = GetMkTime(time());

        //由于汽车初始数据一键导入插件的SQL比较多，有的客户会执行超时，这里直接不执行，由售后手动操作
        if($p_id != 7){
            //操作执行数据库配置
            $querys = preg_split("#;[ \t]{0,}\r\n#",$setupsql);
            // $querys = explode(';', $setupsql);
            foreach($querys as $q){
            $q = trim($q);
                if($q==""){
                    continue;
                }
            $archives = $dsql->SetQuery($q);
            $ret = $dsql->dsqlOper($archives, "update");
            if($ret != "ok"){
                ShowMsg('SQL语句执行失败，请联系插件作者处理！<br />'.str_replace(array("\r\n", "\r", "\n"), '<br />', $q), 'store.php', 0, 10000);
                exit();
            }
            }
        }

        //新增插件数据
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_plugins` WHERE `pid` = $p_id");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){

          $sql = $dsql->SetQuery("UPDATE `#@__site_plugins` SET `title` = '$p_title', `author` = '$p_author', `version` = '$p_version', `uptime` = '$p_update', `delsql` = '$delsql', `description` = '$p_description', `litpic` = '$p_litpic' WHERE `pid` = '$p_id'");
          $dsql->dsqlOper($sql, "update");

        }else{
          $sql = $dsql->SetQuery("INSERT INTO `#@__site_plugins` (`pid`, `title`, `author`, `version`, `uptime`, `delsql`, `pubdate`, `state`, `description`, `litpic`) VALUES ('$p_id', '$p_title', '$p_author', '$p_version', '$p_update', '$delsql', '$time', '1', '$p_description', '$p_litpic')");
          $dsql->dsqlOper($sql, "update");
        }
        unlinkFile($configFile);

      }else{

        //查询模块一级分类
  			$moduleSql = $dsql->SetQuery("SELECT `id` FROM `#@__site_module` WHERE `parentid` = 0 AND `state` = 0 AND `type` = 0 ORDER BY `weight`");
  			$moduleResult = $dsql->dsqlOper($moduleSql, "results");
  			if($moduleResult){
          $parentid = $moduleResult[0]['id'];

        //如果没有一级就创建一级
        }else{
          $sql = $dsql->SetQuery("INSERT INTO `#@__site_module` (`parentid`, `title`) VALUES ('0', '系统默认模块')");
          $parentid = $dsql->dsqlOper($sql, "lastid");
        }

        //根据模块标识查询是否已经安装过
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__site_module` WHERE `name` = '$name'");
        $ret = $dsql->dsqlOper($sql, "totalCount");

        //更新升级
        if($ret > 0 && $action == "update"){

          //配置信息
          $baseinfo = $xml->baseinfo;
    			$title    = $baseinfo->title;   //模块名称
    			$name     = $baseinfo->name;    //模块标识
    			$version  = $baseinfo->version; //模块版本
          $setupsql = str_replace("&#39;", "'", base64_decode($xml->setupsql));  //数据库操作

          $moduleSql = $dsql->SetQuery("UPDATE `#@__site_module` SET `version` = '$version', `date` = ".GetMkTime(time())." WHERE `name` = '$name'");
          $moduleResult = $dsql->dsqlOper($moduleSql, "update");

          //操作执行数据库配置
          $querys = preg_split("#;[ \t]{0,}\r\n#",$setupsql);
    			// $querys = explode(';', $setupsql);
    			foreach($querys as $q){
            $q = trim($q);
        		if($q==""){
        			continue;
        		}
    				$archives = $dsql->SetQuery($q);
    				$ret = $dsql->dsqlOper($archives, "update");
            if($ret != "ok"){
              // ShowMsg('SQL语句执行失败，请联系售后处理！<br />'.str_replace(array("\r\n", "\r", "\n"), '<br />', $q), 'store.php', 0, 10000);
              // exit();
            }
    			}

        //新安装
        }else{

          //配置信息
          $baseinfo = $xml->baseinfo;
    			$title    = $baseinfo->title;   //模块名称
    			$name     = $baseinfo->name;    //模块标识
    			$version  = $baseinfo->version; //模块版本
    			$note     = $baseinfo->note;    //模块描述

    			$subnav   = RpLine(addslashes(base64_decode($xml->subnav)));           //后台导航菜单
          $setupsql = str_replace("&#39;", "'", base64_decode($xml->setupsql));  //数据表及默认数据
          $delsql   = str_replace("&#39;", "'", base64_decode($xml->delsql));    //删除数据表sql
          // $domainRules  = base64_decode($xml->domainRules);    //子域名规则
          // $catalogRules = base64_decode($xml->catalogRules);   //子目录规则

          //文件路径、主要用在卸载模块时一并删除相关的文件
          $files = $_POST['files'];

          //删除模块数据
          $sql = $dsql->SetQuery("DELETE FROM `#@__site_module` WHERE `name` = '$name'");
          $dsql->dsqlOper($sql, "update");

          //先删除数据表
                $uninstallSql = preg_split("#;[ \t]{0,}\r\n#",$delsql);
    			// $uninstallSql = explode(";",$delsql);
    			foreach($uninstallSql as $v){
                    $v = trim($v);
            		if($v==""){
            			continue;
            		}
    				$archives = $dsql->SetQuery($v);
    				$dsql->dsqlOper($archives, "update");
    			}

    			//建立表结构
                $querys = preg_split("#;[ \t]{0,}\r\n#",$setupsql);
    			// $querys = explode(';', $setupsql);
    			foreach($querys as $q){
                    $q = trim($q);
            		if($q==""){
            			continue;
            		}
    				$archives = $dsql->SetQuery($q);
    				$ret = $dsql->dsqlOper($archives, "update");
            if($ret != "ok"){
              // ShowMsg('SQL语句执行失败，请联系售后处理！<br />'.str_replace(array("\r\n", "\r", "\n"), '<br />', $q), 'store.php', 0, 10000);
              // exit();
            }
    			}

          $icon         = $name.'.png';
          $files        = RpLine($files);
          // $domainRules  = RpLine(addslashes($domainRules));
          // $catalogRules = RpLine(addslashes($catalogRules));
          $delsql       = RpLine(addslashes($delsql));
          $time         = GetMkTime(time());

          //新增模块数据
  				$moduleSql = $dsql->SetQuery("INSERT INTO `#@__site_module` (`parentid`, `title`, `name`, `icon`, `note`, `state`, `weight`, `subnav`, `filelist`, `delsql`, `version`, `date`) VALUES ('$parentid', '$title', '$name', '', '$note', 0, 50, '$subnav', '$files', '$delsql', '$version', '$time')");
  				$moduleResult = $dsql->dsqlOper($moduleSql, "update");
        }

      }

		}

		// $tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: 80%;'>80%</div></div>\r\n";
    $progress = 80; //进度
		$tmsg  = "";
		$tmsg .= "正在配置数据库，请稍候...";
		$pos = 4;

	/* 步骤五 清除安装文件 */
	}elseif($startpos == 4){

		deldir($savepath);

    //系统升级只需要修改版本文件/data/admin/version.txt即可
    if($name == "system" && $newVersion && $updateTime){
      $m_file = HUONIAODATA."/admin/version.txt";
      $val = $newVersion."\r\n".$updateTime."\r\n".$updateToken."\r\n".time();
  		$fp = fopen($m_file, "w") or ShowMsg('写入文件 $m_file 失败，请检查权限！', 'store.php', 0, 10000);
  		fwrite($fp, $val);
  		fclose($fp);
    }

    //如果还有新的版本，则不删除正在进行的模块
    if(!$hasnew){
      //删除已经安装的模块
      array_splice($ids, 0, 1);
    }

    if($name == "system"){
        $action = "update";
    }

    //更新官网会员订单状态
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $cloudHost.'/include/ajax.php?action=installModuleSuccess&auth='.$auth.'&name='.$name.'&do='.$action.'&version='.$newVersion.'&update='.$updateTime);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($curl, CURLOPT_TIMEOUT, 20);
    curl_setopt($curl, CURLOPT_USERAGENT, "kumanyun/store");
    curl_exec($curl);
    curl_close($curl);

    //全部安装完成
    if(empty($ids)){
      $progress = 100;
      if($action == "updateTemplate" || $action == "installTemplate"){
          $tmsg = "模板安装成功！";
          // $tmsg = "<font color='green'>模板安装成功！</font>\r\n";
      }elseif($action == "installPlugins"){
          $tmsg = "插件安装成功！";
      }else{
          $tmsg = "模块安装成功！";
      }
  		$doneForm = '<script language="javascript">
  			function GotoNextPage(){
  				top.location.href = "../index.php?gotopage=siteConfig/store.php";
  			}
  			setTimeout("GotoNextPage()",1000);
  		</script>';
  		PutInfo($tmsg, $doneForm, $progress, $action);
  		exit();

    //继续安装下一个
    }else{
      $id = join(",", $ids);
      $pos = 0;

      if($hasnew){
        $tmsg = "发现其他升级包，继续安装，请稍候...";
      }else{
        $name = "";
        $tmsg = "继续安装下一个模块，请稍候...";
      }
    }

	}

	$doneForm  = "<form name='gonext' method='post' action='store.php?id=".$id."&auth=".$auth."'>\r\n";
	$doneForm .= "  <input type='hidden' name='name' value='".$name."' />\r\n";
	$doneForm .= "  <input type='hidden' name='hasnew' value='".$hasnew."' />\r\n";
	$doneForm .= "  <input type='hidden' name='newVersion' value='".$newVersion."' />\r\n";
	$doneForm .= "  <input type='hidden' name='updateTime' value='".$updateTime."' />\r\n";
	$doneForm .= "  <input type='hidden' name='updateToken' value='".$updateToken."' />\r\n";
	$doneForm .= "  <input type='hidden' name='action' value='".$action."' />\r\n";
	$doneForm .= "  <input type='hidden' name='savepath' value='".$savepath."' />\r\n";
	$doneForm .= "  <input type='hidden' name='module' value='".$module."' />\r\n";
	$doneForm .= "  <input type='hidden' name='mobile' value='".$mobile."' />\r\n";
	$doneForm .= "  <input type='hidden' name='folder' value='".$folder."' />\r\n";
	$doneForm .= "  <textarea name='files' style='display:none;'></textarea>\r\n";
	$doneForm .= "  <input type='hidden' name='startpos' value='".$pos."' />\r\n</form>\r\n{$dojs}";
	PutInfo($tmsg, $doneForm, $progress, $action);
	exit();
}

//遍历文件夹
function traverseFloder($path = '.') {
	$fileList = array();
	$current_dir = opendir($path);    //opendir()返回一个目录句柄,失败返回false
	while(($file = readdir($current_dir)) !== false) {    //readdir()返回打开目录句柄中的一个条目
		$sub_dir = $path . "/" . $file;    //构建子目录路径
		if($file == '.' || $file == '..') {
			continue;
		} else if(is_dir($sub_dir)) {
			$fileList[] = $sub_dir."/";
			$fileList[] = traverseFloder($sub_dir);
		} else {
			$fileList[] = $sub_dir;
		}
	}
	return $fileList;
}

//遍历多维数组为一维数组
function singelArray($arr) {
	static $data;
	if (!is_array ($arr) && $arr != NULL) {
		return $data;
	}
	foreach ($arr as $key => $val ) {
		if (is_array ($val)) {
			singelArray ($val);
		} else {
			if($val != NULL){
				$data[]=$val;
			}
		}
	}
	return $data;
}

function PutInfo($msg1,$msg2,$progress=100,$type){
    global $cfg_staticVersion;
    $str = '模块';
    if($type == 'installPlugins'){
      $str = '插件';
    }else if($type == "updateTemplate" || $type == "installTemplate"){
      $str = '模板';
    }
    $htmlhead  = "<html>\r\n<head>\r\n<title>温馨提示</title>\r\n";
    $htmlhead .= "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=".$GLOBALS['cfg_soft_lang']."\" />\r\n";
    $htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='".HUONIAOADMIN."/../static/css/admin/bootstrap.css?v=".$cfg_staticVersion."' />";
    $htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='".HUONIAOADMIN."/../static/css/admin/common.css?v=".$cfg_staticVersion."' />";
    $htmlhead .= "<base target='_self'/>\r\n</head>\r\n<body>\r\n";
    $htmlfoot  = "</body>\r\n</html>";
    $rmsg      = "<div class='install_progress main-content fn-clear' >\r\n";
    $rmsg     .= "<div class='content-left'>\r\n";
    if($progress < 100 ){
      $rmsg     .= "<img src='/static/images/install_ball.gif?v=".$cfg_staticVersion."' alt='' >\r\n";
    }else{
      $rmsg     .= "<img class='success-img' src='/static/images/install_success.png?v=".$cfg_staticVersion."' alt=''>\r\n";
    }
    $rmsg     .= "</div>\r\n";
    $rmsg     .= "<div class='content-right'>\r\n";
    if($progress < 100){
      $rmsg     .= "<div class='installState' >\r\n";
      $rmsg     .= "<span>". $str ."安装中";
      if($progress > 0){
        $rmsg     .= "<em style='font-style:normal;'>". $progress ."%</em>";
      }
      $rmsg     .= "</span>\r\n";
      $rmsg     .= "<span>". $msg1 ."</span>\r\n";
      $rmsg     .= "<div class='progress progress-striped active'>\r\n";
      $rmsg     .= "<div class='bar' style='width: ". $progress ."%'></div>\r\n";
      $rmsg     .= "</div>\r\n";
      $rmsg     .= "</div>\r\n";
    }else{
      $rmsg     .= "<div class='installState'>\r\n";
      $rmsg     .= "<span>". $str ."安装成功</span>\r\n";
      $rmsg     .= "<span>". $msg1 ."</span>\r\n";
      $rmsg     .= "<div class='progress progress-striped active'>\r\n";
      $rmsg     .= "<div class='bar' style='opacity: 0.5;'></div>\r\n";
      $rmsg     .= "</div>\r\n";
      $rmsg     .= "</div>\r\n";
    }
    $rmsg     .= "</div>\r\n";
    $rmsg     .= "</div>\r\n";
    $rmsg     .= $msg2;
	  // $rmsg  = "<div class='s-tip'><div class='s-tip-head'><h1>".$GLOBALS['cfg_soft_enname']." 提示：</h1></div>\r\n";
    // $rmsg .= "<div class='s-tip-body'>".str_replace("\"","“",$msg1)."\r\n".$msg2."\r\n";
    $msginfo = $htmlhead.$rmsg.$htmlfoot;
    echo $msginfo;
}


//根据文件生成MD5指纹
function checkfiles($currentdir, $ext = '', $sub = 1, $skip = '', $adminFolderName = '', $replaceAdminFolderName = '') {
  global $md5data;
  $dir = @opendir(HUONIAOROOT.'/'.$currentdir);
  $exts = '/('.$ext.')$/i';
  $skips = explode(',', $skip);

  while($entry = @readdir($dir)) {
    $file = HUONIAOROOT.'/'.$currentdir.$entry;

    if($entry != '.' && $entry != '..' && (($ext && preg_match($exts, $entry) || !$ext) || $entry == 'huoniao' || ($sub && is_dir($file))) && !in_array($entry, $skips)) {
      if($sub && is_dir($file)) {
        checkfiles(str_replace(HUONIAOROOT . '/', '', $file) . '/', $ext, $sub, $skip, $adminFolderName, $replaceAdminFolderName);
      } else {

        //替换关键字
        $file_ = $adminFolderName && $replaceAdminFolderName ? str_replace($adminFolderName, $replaceAdminFolderName, $file) : $file;

        if(is_dir($file)) {
          $md5data[str_replace(HUONIAOROOT . '/', '*', $file_)] = md5($file);
        } elseif(strstr($entry, '.')) {
          if(file_exists($file)){
            $md5data[str_replace(HUONIAOROOT . '/', '*', $file_)] = md5_file($file);
          }else{
            $md5data[str_replace(HUONIAOROOT . '/', '*', $file_)] = '00000000000000000000000000000000';
          }
        } elseif($entry == 'huoniao'){
            $md5data[str_replace(HUONIAOROOT . '/', '*', $file_)] = md5_file($file);
        }
      }
    }
  }
}


// 同步分表

function sync_fenbiao($base = "articlelist"){
  // global $cfg_cookieDomain;
  // PutCookie('syncFenbiao', 'article', 60);
  // PutCookie('cookieDomain', $cfg_cookieDomain, 60);

  // $sql = $dsql->SetQuery("SELECT id FROM `#@__site_sub_tablelist` WHERE `service` = 'article' LIMIT 1");
  // $tabs = $dsql->dsqlOper($sql, "results");

  // // 移除默认表的关联，分表较多时耗时较长
  // if($tabs){
  //     $sql = $dsql->SetQuery("DROP TABLE IF EXISTS `#@__".$base."_all`");
  //     $res = $dsql->dsqlOper($sql, "update");

  //     $sql = $dsql->SetQuery("show create table ".$base);
  //     $res = $dsql->dsqlOper($sql, "results");
  //     $defSql = $res[0]['Create Table'];
  //     $defSql = str_replace("\r","",$defSql);
  //     $defSql = str_replace("\n","",$defSql);

  //     $sql = preg_replace("#AUTO_INCREMENT=([0-9]{1,})[ \r\n\t]{1,}#i", "", $defSql);
  //     $sql = str_replace($base, $base."_all", $sql);
  //     $sql = str_replace('ENGINE=MyISAM', 'ENGINE=MRG_MyISAM', $sql);
  //     $sql .= " UNION=(".join(",", $un).")";
  //     $sql = $dsql->SetQuery($sql);
  //     $res = $dsql->dsqlOper($sql, "update");
  // }

  return;
}
sync_fenbiao();

function compare_database($new, $old, $orig_table, $fb_table){
    // print_r($new);
    // print_r($old);die;
  $diff = array('table' => array(), 'field' => array(), 'index' => array());
  //table
  // foreach ($old['table'] as $table_name => $table_detail) {
    // if(strstr($table_name, 'site_plugins_')) continue;
    // if(!checkInArray($table_name)) continue;

    // if (!isset($new['table'][$table_name])){
    //   $diff['table']['drop'][$table_name] = $table_name; //删除表
    // }
  // }
  foreach ($new['table'] as $table_name => $table_detail) {
    // if(strstr($table_name, 'site_plugins_')) continue;
    // if(!checkInArray($table_name)) continue;

    // if (!isset($old['table'][$table_name])) {
    //   //新建表
    //   $diff['table']['create'][$table_name] = $table_detail;
    //   $diff['field']['create'][$table_name] = $new['field'][$table_name];
    //   $diff['index']['create'][$table_name] = $new['index'][$table_name];
    // } else {

    // }
      //对比表
      $old_detail = $old['table'][$fb_table];
      $change = array();
      if ($table_detail['Engine'] !== $old_detail['Engine'])
        $change['Engine'] = $table_detail['Engine'];
      if ($table_detail['Row_format'] !== $old_detail['Row_format'])
        $change['Row_format'] = $table_detail['Row_format'];
      if ($table_detail['Collation'] !== $old_detail['Collation'])
        $change['Collation'] = $table_detail['Collation'];
      //if($table_detail['Create_options']!=$old_detail['Create_options'])
      //    $change['Create_options']=$table_detail['Create_options'];
      if ($table_detail['Comment'] !== $old_detail['Comment'])
        $change['Comment'] = $table_detail['Comment'];
      if (!empty($change))
        $diff['table']['change'][$fb_table] = $change;

  }

  //index
  foreach ($old['index'] as $table => $indexs) {
    // if(strstr($table, 'site_plugins_')) continue;
    // if(!checkInArray($table)) continue;
    if (isset($new['index'][$orig_table])) {
      $new_indexs = $new['index'][$orig_table];
      foreach ($indexs as $index_name => $index_detail) {
        if (!isset($new_indexs[$index_name])) {
          //索引不存在，删除索引
          $diff['index']['drop'][$table][$index_name] = $index_name;
        }
      }
    } else {
      if (!isset($diff['table']['drop'][$table])) {
        foreach ($indexs as $index_name => $index_detail) {
          $diff['index']['drop'][$table][$index_name] = $index_name;
        }
      }
    }
  }
  foreach ($new['index'] as $table => $indexs) {
    // if(strstr($table, 'site_plugins_')) continue;
    // if(!checkInArray($table)) continue;
    if (isset($old['index'][$fb_table])) {
      $old_indexs = $old['index'][$fb_table];
      foreach ($indexs as $index_name => $index_detail) {
        if (isset($old_indexs[$index_name])) {
          //存在，对比内容
          if ($index_detail['Non_unique'] !== $old_indexs[$index_name]['Non_unique'] || $index_detail['Column_name'] !== $old_indexs[$index_name]['Column_name'] || $index_detail['Collation'] !== $old_indexs[$index_name]['Collation'] || $index_detail['Index_type'] !== $old_indexs[$index_name]['Index_type']) {
            $diff['index']['drop'][$fb_table][$index_name] = $index_name;
            $diff['index']['add'][$fb_table][$index_name] = $index_detail;
          }
        } else {
          //不存在，新建索引
          $diff['index']['add'][$fb_table][$index_name] = $index_detail;
        }
      }
    } else {
      if (!isset($diff['table']['create'][$fb_table])) {
        foreach ($indexs as $index_name => $index_detail) {
          $diff['index']['add'][$fb_table][$index_name] = $index_detail;
        }
      }
    }
  }

  //fields
  foreach ($old['field'] as $table => $fields) {
    // if(strstr($table, 'site_plugins_')) continue;
    // if(!checkInArray($table)) continue;
    if (isset($new['field'][$orig_table])) {
      $new_fields = $new['field'][$orig_table];
      foreach ($fields as $field_name => $field_detail) {
        if (!isset($new_fields[$field_name])) {
          //字段不存在，删除字段
          $diff['field']['drop'][$table][$field_name] = $field_detail;
        }
      }
    } else {
      //旧数据库中的表在新数据库中不存在，需要删除
    }
  }
  foreach ($new['field'] as $table => $fields) {
    // if(strstr($table, 'site_plugins_')) continue;
    // if(!checkInArray($table)) continue;
    if (isset($old['field'][$fb_table])) {
      $old_fields = $old['field'][$fb_table];
      $last_field = '';
      foreach ($fields as $field_name => $field_detail) {
        if (isset($old_fields[$field_name])) {
          //字段存在，对比内容
          if ($field_detail['Type'] !== $old_fields[$field_name]['Type'] || $field_detail['Collation'] !== $old_fields[$field_name]['Collation'] || $field_detail['Null'] !== $old_fields[$field_name]['Null'] || $field_detail['Default'] !== $old_fields[$field_name]['Default'] || $field_detail['Extra'] !== $old_fields[$field_name]['Extra'] || $field_detail['Comment'] !== $old_fields[$field_name]['Comment']) {
              $diff['field']['change'][$fb_table][$field_name] = $field_detail;
          }
        } else {
          //字段不存在，添加字段
          $field_detail['After'] = $last_field;
          $diff['field']['add'][$fb_table][$field_name] = $field_detail;
        }
        $last_field = $field_name;
      }
    } else {
        //新数据库中的表在旧数据库中不存在，需要新建
    }
  }

  return $diff;
}


function build_query($diff, $prefix){
    $sqls = array();
    if ($diff) {
        if (isset($diff['table']['drop'])) {
            foreach ($diff['table']['drop'] as $table_name => $table_detail) {
                $table_name = str_replace('#@__', $prefix, $table_name);
                $sqls[] = "DROP TABLE `{$table_name}`";
            }
        }
        if (isset($diff['table']['create'])) {
            foreach ($diff['table']['create'] as $table_name => $table_detail) {
                $fields = $diff['field']['create'][$table_name];
                $table_name_ = str_replace('#@__', $prefix, $table_name);
                $sql = "CREATE TABLE `$table_name_` (";
                $t = array();
                $k = array();
                foreach ($fields as $field) {
                    $t[] = "`{$field['Field']}` " . strtoupper($field['Type']) . sqlnull($field['Null']) . sqldefault($field['Default']) . sqlextra($field['Extra']) . sqlcomment($field['Comment']);
                }
                if (isset($diff['index']['create'][$table_name]) && !empty($diff['index']['create'][$table_name])) {
                    $indexs = $diff['index']['create'][$table_name];
                    foreach ($indexs as $index_name => $index_detail) {
                        if ($index_name == 'PRIMARY')
                            $k[] = "PRIMARY KEY (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                        else
                            $k[] = ($index_detail['Non_unique'] == 0 ? "KEY" : "INDEX") . " `$index_name`" . " (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                    }
                }
                list($charset) = explode('_', $table_detail['Collation']);
                $sql .= implode(', ', $t) . (!empty($k) ? ',' . implode(', ', $k) : '') . ') ENGINE = ' . $table_detail['Engine'] . ' DEFAULT CHARSET = ' . $charset . ' COMMENT = \'' . $table_detail['Comment'] . '\'';
                $sqls[] = $sql;
            }
        }
        if (isset($diff['table']['change'])) {
            foreach ($diff['table']['change'] as $table_name => $table_changes) {
                $table_name = str_replace('#@__', $prefix, $table_name);
                if (!empty($table_changes)) {
                    $sql = "ALTER TABLE `$table_name`";
                    foreach ($table_changes as $option => $value) {
                        if ($option == 'Collation') {
                            list($charset) = explode('_', $value);
                            $sql .= " DEFAULT CHARACTER SET $charset COLLATE $value";
                        } else{
                            if(strtoupper($option) == 'COMMENT'){
                              $sql .= " " . strtoupper($option) . " = '$value' ";
                            }else{
                              $sql .= " " . strtoupper($option) . " = $value ";
                            }
                        }
                    }
                    $sqls[] = $sql;
                }
            }
        }
        if (isset($diff['index']['drop'])) {
            foreach ($diff['index']['drop'] as $table_name => $indexs) {
                $table_name = str_replace('#@__', $prefix, $table_name);
                foreach ($indexs as $index_name => $index_detail) {
                    if ($index_name == 'PRIMARY')
                        $sqls[] = "ALTER TABLE `$table_name` DROP PRIMARY KEY";
                    else
                        $sqls[] = "ALTER TABLE `$table_name` DROP INDEX `$index_name`";
                }
            }
        }
        if (isset($diff['field']['drop'])) {
            foreach ($diff['field']['drop'] as $table_name => $fields) {
                $table_name = str_replace('#@__', $prefix, $table_name);
                foreach ($fields as $field_name => $field_detail) {
                    $sqls[] = "ALTER TABLE `$table_name` DROP `$field_name`";
                }
            }
        }
        if (isset($diff['field']['add'])) {
            foreach ($diff['field']['add'] as $table_name => $fields) {
                $table_name = str_replace('#@__', $prefix, $table_name);
                foreach ($fields as $field_name => $field_detail) {
                    $sqls[] = "ALTER TABLE `$table_name` ADD `{$field_name}` " . strtoupper($field_detail['Type']) . sqlcol($field_detail['Collation']) . sqlnull($field_detail['Null']) . sqldefault($field_detail['Default']) . sqlextra($field_detail['Extra']) . sqlcomment($field_detail['Comment']) . " AFTER `{$field_detail['After']}`";
                }
            }
        }
        if (isset($diff['index']['add'])) {
            foreach ($diff['index']['add'] as $table_name => $indexs) {
                $table_name = str_replace('#@__', $prefix, $table_name);
                foreach ($indexs as $index_name => $index_detail) {
                    if ($index_name == 'PRIMARY')
                        $sqls[] = "ALTER TABLE `$table_name` ADD PRIMARY KEY (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                    else
                        $sqls[] = "ALTER TABLE `$table_name` ADD" . ($index_detail['Non_unique'] == 0 ? " INDEX " : " INDEX ") . "`$index_name`" . " (`" . implode('`,`', $index_detail['Column_name']) . "`)";
                }
            }
        }
        if (isset($diff['field']['change'])) {
            foreach ($diff['field']['change'] as $table_name => $fields) {
                $table_name = str_replace('#@__', $prefix, $table_name);
                foreach ($fields as $field_name => $field_detail) {
                    $sqls[] = "ALTER TABLE `$table_name` CHANGE `{$field_name}` `{$field_name}` " . $field_detail['Type'] . sqlcol($field_detail['Collation']) . sqlnull($field_detail['Null']) . sqldefault($field_detail['Default']) . sqlextra($field_detail['Extra']) . sqlcomment($field_detail['Comment']);
                }
            }
        }
    }

    return $sqls;
}

function sqlkey($val){
  switch ($val) {
      case 'PRI':
          return ' PRIMARY';
      case 'UNI':
          return ' UNIQUE';
      case 'MUL':
          return ' INDEX';
      default:
          return '';
  }
}

function sqlcol($val){
    switch ($val) {
        case null:
            return '';
        default:
            list($charset) = explode('_', $val);
            return ' CHARACTER SET ' . $charset . ' COLLATE ' . $val;
    }
}

function sqldefault($val){
    if($val===null){
        return '';
    }else{
        return " DEFAULT '" . stripslashes($val) . "'";
    }
}

function sqlnull($val){
    switch ($val) {
        case 'NO':
            return ' NOT NULL';
        case 'YES':
            return ' NULL';
        default:
            return '';
    }
}

function sqlextra($val){
    switch ($val) {
        case '':
            return '';
        default:
            return ' ' . strtoupper($val);
    }
}

function sqlcomment($val){
    switch ($val) {
        case '':
            return '';
        default:
            return " COMMENT '" . stripslashes($val) . "'";
    }
}
