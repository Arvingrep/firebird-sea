<?php
/**
 * 整合第三方登录
 *
 * @version        $Id: loginConnect.php 2014-3-11 上午09:26:15 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("loginConnect");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$tab = 'site_loginconnect';

//列表
if(empty($action)){
	$templates = "loginConnect.html";

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/siteConfig/loginConnect.js'
	);

	//查询数据库中启用的支付方式
	$list = array();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` ORDER BY `weight`, `id`");
	$results  = $dsql->dsqlOper($archives, "results");
	foreach($results as $key => $val){
		$list[$val['code']] = $results[$key];
	}

    //取得文件中的支付方式
	$loginPath = '../../api/login/';
	$logindir = @opendir($loginPath);
    $set_modules = true;
    $login = $installArr = $uninstallArr = array();

    while(false !== ($subdir = @readdir($logindir))){
			if(is_dir($loginPath.$subdir) && $subdir != ".." && $subdir != "."){
				$file = $loginPath . $subdir. '/' . $subdir. '.php';
				if(file_exists($file)){
          @include_once($file);
        }
      }
    }
    @closedir($logindir);

    foreach ($login as $key => $value){
        ksort($login[$key]);
    }
    ksort($login);

    for($i = 0; $i < count($login); $i++){
        $code = $login[$i]['code'];
        /* 如果数据库中有，取数据库中的名称和描述 */
        if(isset($list[$code])){

			$in = isset($installArr) ? count($installArr) : 0;

            $installArr[$in]['id'] = $list[$code]['id'];
            $installArr[$in]['name'] = $list[$code]['name'];
            $installArr[$in]['version']  = $login[$i]['version'];
            $installArr[$in]['desc'] = $list[$code]['info'];
            $installArr[$in]['author']   = $login[$i]['author'];
            $installArr[$in]['website']  = $login[$i]['website'];
            $installArr[$in]['weight']   = $list[$code]['weight'];
            $installArr[$in]['state']    = $list[$code]['state'];
        }else{

			$un = isset($uninstallArr) ? count($uninstallArr) : 0;

			$uninstallArr[$un]['code'] = $login[$i]['code'];
            $uninstallArr[$un]['name'] = $login[$i]['name'];
            $uninstallArr[$un]['version']  = $login[$i]['version'];
            $uninstallArr[$un]['desc'] = $login[$i]['desc'];
            $uninstallArr[$un]['author']   = $login[$i]['author'];
            $uninstallArr[$un]['website']  = $login[$i]['website'];
            $uninstallArr[$un]['state']    = 0;
        }
    }

	$installArr = array_sort($installArr, "weight");
	$huoniaoTag->assign('installArr', $installArr);
	$huoniaoTag->assign('uninstallArr', $uninstallArr);

//安装
}elseif($action == "install"){

	if($submit == "提交"){

		$name = addslashes(stripslashes($_POST['name']));

		if(empty($code)){
			echo '{"state": 200, "info": "参数传递失败！"}';
			exit();
		}

		if(empty($name)){
			echo '{"state": 200, "info": "请输入名称！"}';
			exit();
		}

		if(empty($config)){
			echo '{"state": 200, "info": "请输入帐号配置信息！"}';
			exit();
		}

		//格式化
		$config = serialize(json_decode($_POST['config'], true));

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`code`, `name`, `info`, `config`, `state`, `pubdate`) VALUES ('$code', '$name', '$desc', '$config', '$state', '".GetMkTime(time())."')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("安装第三方登录接口", $name);

			updateAppConfig();  //更新APP配置文件

			echo '{"state": 100, "info": '.json_encode("安装成功！").'}';
		}else{
			echo $return;
		}
		die;

	}

	$templates = "loginConnectAdd.html";

	//js
	$jsFile = array(
		'admin/siteConfig/loginConnectAdd.js'
	);

	if(!empty($code)){

		//取得文件中的支付方式
		$loginPath = '../../api/login/';
		$logindir = @opendir($loginPath);
		$set_modules = true;
		$login = array();
		$name = $desc = $config = $f = "";

		while(false !== ($subdir = @readdir($logindir))){
			if(is_dir($loginPath.$subdir) && $subdir != ".." && $subdir != "."){
				@include_once($loginPath . $subdir. '/' . $subdir. '.php');
			}
		}
		@closedir($logindir);

		foreach ($login as $key => $value){
			ksort($login[$key]);
		}
		ksort($login);

		for($i = 0; $i < count($login); $i++){
			if($code == $login[$i]['code']){
				$f = "y";
				$name = $login[$i]['name'];
				$desc = $login[$i]['desc'];
				$config_   = $login[$i]['config'];
			}
		};

		if($f != ""){
			$huoniaoTag->assign('action', $action);
			$huoniaoTag->assign('code', $code);
			$huoniaoTag->assign('name', $name);
			$huoniaoTag->assign('desc', $desc);

			$config = array();
			foreach($config_ as $key => $val){
				array_push($config, '<dl class="clearfix">');

				if($val['type'] == "split"){
					array_push($config, '<dt><strong>'.$val['title'].'：</strong></dt>');
				}else{
					array_push($config, '<dt><label for="'.$val['name'].'">'.$val['title'].'：</label></dt>');
				}

				$ddHtml = "";
				if($val['type'] == "text"){
					$ddHtml = '<input type="text" class="input-xlarge" name="'.$val['name'].'" id="'.$val['name'].'" data-regex=".*" />';
					$ddHtml.= '<span class="input-tips"><s></s>请输入'.$val['title'].'。</span>';
				}elseif($val['type'] == "select"){
					$ddHtml = '<span><select class="input-xlarge" name="'.$val['name'].'" id="'.$val['name'].'">';

					foreach($val['options'] as $k => $v){
						$ddHtml.= '<option value="'.$k.'">'.$v.'</option>';
					}
					$ddHtml.= '</select></span>';
					$ddHtml.= '<span class="input-tips"><s></s>请选择'.$val['title'].'。</span>';
				}elseif($val['type'] == "textarea"){
					$ddHtml = '<textarea class="input-xxlarge" rows="5" name="'.$val['name'].'" id="'.$val['name'].'" data-regex=".*"></textarea>';
					$ddHtml.= '<span class="input-tips"><s></s>请输入'.$val['title'].'。</span>';
				}

				array_push($config, '<dd>'.$ddHtml.'</dd>');
				array_push($config, '</dl>');
			}

			$huoniaoTag->assign('config', join("", $config));

			//状态-单选
			$huoniaoTag->assign('stateList', array('1', '2'));
			$huoniaoTag->assign('stateName',array('启用','禁用'));
			$huoniaoTag->assign('state', 1);

		}else{
			echo "接口不存在，请确认后再试！";
			die;
		}
	}

//配置
}elseif($action == "edit"){

	if(empty($id)) die('请选择要配置的登录接口！');

	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ". $id);
	$loginData = $dsql->dsqlOper($archives, "results");

	if(!$loginData) die('接口不存在，请先安装！');

	if($submit == "提交"){

		$name = addslashes(stripslashes($_POST['name']));

		if(empty($name)){
			echo '{"state": 200, "info": "请输入名称！"}';
			exit();
		}

		if(empty($config)){
			echo '{"state": 200, "info": "请输入帐号配置信息！"}';
			exit();
		}

		//格式化
		$config = serialize(json_decode($_POST['config'], true));

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `name` = '$name', `info` = '$desc', `config` = '$config', `state` = '$state' WHERE `id` = ". $id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改第三方登录接口", $name);

			updateAppConfig();  //更新APP配置文件

			echo '{"state": 100, "info": '.json_encode("配置成功！").'}';
		}else{
			echo $return;
		}
		die;

	}

	$templates = "loginConnectAdd.html";

	//js
	$jsFile = array(
		'admin/siteConfig/loginConnectAdd.js'
	);

	//取得文件中的支付方式
	$loginPath = '../../api/login/';
	$logindir = @opendir($loginPath);
	$set_modules = true;
	$login = array();
	$name = $desc = $config = $f = "";

	while(false !== ($subdir = @readdir($logindir))){
		if(is_dir($loginPath.$subdir) && $subdir != ".." && $subdir != "."){
			@include_once($loginPath . $subdir. '/' . $subdir. '.php');
		}
	}
	@closedir($logindir);

	foreach ($login as $key => $value){
		ksort($login[$key]);
	}
	ksort($login);

	for($i = 0; $i < count($login); $i++){
		if($loginData[0]['code'] == $login[$i]['code']){
			$f = "y";
			$config_   = $login[$i]['config'];
		}
	};

	$loginConfig = unserialize($loginData[0]['config']);

	if($f != ""){
		$huoniaoTag->assign('action', $action);
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('code', $loginData[0]['code']);
		$huoniaoTag->assign('name', $loginData[0]['name']);
		$huoniaoTag->assign('desc', $loginData[0]['info']);

		$config = array();
		foreach($config_ as $key => $val){
			array_push($config, '<dl class="clearfix">');

			if($val['type'] == "split"){
				array_push($config, '<dt><strong>'.$val['title'].'：</strong></dt>');
			}else{
				array_push($config, '<dt><label for="'.$val['name'].'">'.$val['title'].'：</label></dt>');
			}

			// array_push($config, '<dt><label for="'.$val['name'].'">'.$val['title'].'：</label></dt>');

			$value = "";
			foreach($loginConfig as $k => $v){
				if($v['name'] == $val['name']){
					$value = $v['value'];
					break;
				}
			}

			$ddHtml = "";
			if($val['type'] == "text"){
				$ddHtml = '<input type="text" class="input-xlarge" name="'.$val['name'].'" id="'.$val['name'].'" data-regex=".*" value="'.$value.'" />';
				$ddHtml.= '<span class="input-tips"><s></s>请输入'.$val['title'].'。</span>';
			}elseif($val['type'] == "select"){
				$ddHtml = '<span><select class="input-xlarge" name="'.$val['name'].'" id="'.$val['name'].'">';

				foreach($val['options'] as $k => $v){

					$selected = "";
					if($k == $value){
						$selected = " selected";
					}

					$ddHtml.= '<option value="'.$k.'"'.$selected.'>'.$v.'</option>';
				}
				$ddHtml.= '</select></span>';
				$ddHtml.= '<span class="input-tips"><s></s>请选择'.$val['title'].'。</span>';
			}elseif($val['type'] == "textarea"){
				$ddHtml = '<textarea class="input-xxlarge" rows="5" name="'.$val['name'].'" id="'.$val['name'].'" data-regex=".*">'.$value.'</textarea>';
				$ddHtml.= '<span class="input-tips"><s></s>请输入'.$val['title'].'。</span>';
			}

			array_push($config, '<dd>'.$ddHtml.'</dd>');
			array_push($config, '</dl>');
		}

		$huoniaoTag->assign('config', join("", $config));

		//状态-单选
		$huoniaoTag->assign('stateList', array('1', '2'));
		$huoniaoTag->assign('stateName',array('启用','禁用'));
		$huoniaoTag->assign('state', $loginData[0]['state']);

	}else{
		echo "接口不存在，请确认后再试！";
		die;
	}

//排序
}elseif($action == "sort"){
	if($_POST['data'] != ""){
		$json = json_decode($_POST['data']);

		$arr = objtoarr($json);

		for($i = 0; $i < count($arr); $i++){
			$id = $arr[$i]["id"];

			$archives = $dsql->SetQuery("SELECT `weight` FROM `#@__".$tab."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				//验证排序
				if($results[0]["weight"] != $i){
					$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `weight` = '$i' WHERE `id` = ".$id);
					$results = $dsql->dsqlOper($archives, "update");

					adminLog("修改第三方登录接口排序", $id."=>".$i);
				}
			}
		}
		echo '{"state": 100, "info": "保存成功！"}';

	}
	die;

//卸载
}elseif($action == "uninstall"){
	if($id != ""){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){
			echo '{"state": 100, "info": "保存成功！"}';
		}else{
			echo '{"state": 200, "info": "卸载失败！"}';
		}
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
