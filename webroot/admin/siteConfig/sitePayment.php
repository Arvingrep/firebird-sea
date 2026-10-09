<?php
/**
 * 管理支付方式
 *
 * @version        $Id: sitePayment.php 2014-3-11 上午09:26:15 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("sitePayment");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$tab = 'site_payment';

//列表
if(empty($action)){
	$templates = "sitePayment.html";

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'admin/siteConfig/sitePayment.js'
	);

	//查询数据库中启用的支付方式
	$pay_list = array();
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` ORDER BY `weight`, `id`");
	$results  = $dsql->dsqlOper($archives, "results");
	foreach($results as $key => $val){
		$pay_list[$val['pay_code']] = $results[$key];
	}

    //取得文件中的支付方式
	$payPath = '../../api/payment/';
	$paydir = @opendir($payPath);
    $set_modules = true;
    $payment = $installArr = $uninstallArr = array();

    while(false !== ($subdir = @readdir($paydir))){
		if(is_dir($payPath.$subdir) && $subdir != ".." && $subdir != "."){
            @include_once($payPath . $subdir. '/' . $subdir. '.php');
        }
    }
    @closedir($paydir);

    foreach ($payment as $key => $value){
        ksort($payment[$key]);
    }
    ksort($payment);

    for($i = 0; $i < count($payment); $i++){
        $code = $payment[$i]['pay_code'];
        /* 如果数据库中有，取数据库中的名称和描述 */
        if(isset($pay_list[$code])){

			$in = isset($installArr) ? count($installArr) : 0;

            $installArr[$in]['pay_id'] = $pay_list[$code]['id'];
            $installArr[$in]['pay_name'] = $pay_list[$code]['pay_name'];
            $installArr[$in]['version']  = $payment[$i]['version'];
            $installArr[$in]['pay_desc'] = $pay_list[$code]['pay_desc'];
            $installArr[$in]['author']   = $payment[$i]['author'];
            $installArr[$in]['website']  = $payment[$i]['website'];
            $installArr[$in]['weight']   = $pay_list[$code]['weight'];
            $installArr[$in]['state']    = $pay_list[$code]['state'];
        }else{

			$un = isset($uninstallArr) ? count($uninstallArr) : 0;

			$uninstallArr[$un]['pay_code'] = $payment[$i]['pay_code'];
            $uninstallArr[$un]['pay_name'] = $payment[$i]['pay_name'];
            $uninstallArr[$un]['version']  = $payment[$i]['version'];
            $uninstallArr[$un]['pay_desc'] = $payment[$i]['pay_desc'];
            $uninstallArr[$un]['author']   = $payment[$i]['author'];
            $uninstallArr[$un]['website']  = $payment[$i]['website'];
            $uninstallArr[$un]['state']    = 0;
        }
    }

	$installArr = array_sort($installArr, "weight");
	$huoniaoTag->assign('installArr', $installArr);
	$huoniaoTag->assign('uninstallArr', $uninstallArr);

//安装
}elseif($action == "install"){

	if($submit == "提交"){

		if(empty($code)){
			echo '{"state": 200, "info": "支付方式参数传递失败！"}';
			exit();
		}

		if(empty($pay_name)){
			echo '{"state": 200, "info": "请输入支付方式名称！"}';
			exit();
		}

		if(empty($pay_config)){
			echo '{"state": 200, "info": "请输入帐号信息！"}';
			exit();
		}

		//格式化
		$pay_config = serialize(json_decode($_POST['pay_config'], true));

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`pay_code`, `pay_name`, `pay_desc`, `pay_config`, `state`, `pubdate`) VALUES ('$code', '$pay_name', '$pay_desc', '$pay_config', '$state', '".GetMkTime(time())."')");
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("安装支付方式", $pay_name);

			updateAppConfig();  //更新APP配置文件

			echo '{"state": 100, "info": '.json_encode("安装成功！").'}';
		}else{
			echo $return;
		}
		die;

	}

	$templates = "sitePaymentAdd.html";

	//js
	$jsFile = array(
		'admin/siteConfig/sitePaymentAdd.js'
	);

	if(!empty($code)){

		//取得文件中的支付方式
		$payPath = '../../api/payment/';
		$paydir = @opendir($payPath);
		$set_modules = true;
		$payment = array();
		$pay_name = $pay_desc = $config = $f = "";

		while(false !== ($subdir = @readdir($paydir))){
			if(is_dir($payPath.$subdir) && $subdir != ".." && $subdir != "."){
				@include_once($payPath . $subdir. '/' . $subdir. '.php');
			}
		}
		@closedir($paydir);

		foreach ($payment as $key => $value){
			ksort($payment[$key]);
		}
		ksort($payment);

		for($i = 0; $i < count($payment); $i++){
			if($code == $payment[$i]['pay_code']){
				$f = "y";
				$pay_name = $payment[$i]['pay_name'];
            	$pay_desc = $payment[$i]['pay_desc'];
            	$config   = $payment[$i]['config'];
			}
		};

		if($f != ""){
			$huoniaoTag->assign('action', $action);
			$huoniaoTag->assign('code', $code);
			$huoniaoTag->assign('pay_name', $pay_name);
			$huoniaoTag->assign('pay_desc', $pay_desc);

			$pay_config = array();
			foreach($config as $key => $val){

				$ddHtml = "";
				array_push($pay_config, '<dl class="clearfix">');

				if($val['type'] == "split"){
					array_push($pay_config, '<dt style="margin-top: 15px;"><strong>'.$val['title'].'：</strong></dt>');
					$ddHtml = "<span style='display: block; margin-top: 15px; font-size: 14px; color: #999; line-height: 30px;'>".$val['description']."</span>";
				}else{
					array_push($pay_config, '<dt><label for="'.$val['name'].'">'.$val['title'].'：</label></dt>');
				}

				if($val['type'] == "text"){
					$ddHtml = '<input type="text" class="'.($val['class'] ? $val['class'] : 'input-xlarge').'" name="'.$val['name'].'" id="'.$val['name'].'" data-regex=".*" />';
					$ddHtml.= '<span class="input-tips"><s></s>请输入'.$val['title'].'。</span>';
                    if($val['description']){
                        $ddHtml .= '<div style="font-size: 12px; padding-top: 10px; color: #999;">'.$val['description'].'</div>';
                    }
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

				array_push($pay_config, '<dd>'.$ddHtml.'</dd>');
				array_push($pay_config, '</dl>');
			}

			$huoniaoTag->assign('pay_config', join("", $pay_config));

			//状态-单选
			$huoniaoTag->assign('stateList', array('1', '2'));
			$huoniaoTag->assign('stateName',array('启用','禁用'));
			$huoniaoTag->assign('state', 1);

		}else{
			echo "支付方式不存在，请确认后再试！";
			die;
		}
	}

//配置
}elseif($action == "edit"){

	if(empty($id)) die('请选择要配置的支付方式！');

	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ". $id);
	$payData = $dsql->dsqlOper($archives, "results");

	if(!$payData) die('支付方式不存在，请先安装！');

	if($submit == "提交"){
		if(empty($pay_name)){
			echo '{"state": 200, "info": "请输入支付方式名称！"}';
			exit();
		}

		if(empty($pay_config)){
			echo '{"state": 200, "info": "请输入帐号信息！"}';
			exit();
		}
		//校验手续费
        $payConfig = json_decode($_POST['pay_config'], true);
        $payConfig_ = array_column($payConfig,'value','name');
		if(isset($payConfig_['charge'])){
		    $charge = $payConfig_['charge'];
		    if(!is_numeric($charge)){
                echo '{"state": 200, "info": "请输入正确的平台手续费！"}';
                exit();
            }
        }
		//格式化
		$pay_config = serialize(json_decode($_POST['pay_config'], true));

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `pay_name` = '$pay_name', `pay_desc` = '$pay_desc', `pay_config` = '$pay_config', `state` = '$state' WHERE `id` = ". $id);
		$return = $dsql->dsqlOper($archives, "update");

		if($return == "ok"){
			adminLog("修改支付方式", $pay_name);

			updateAppConfig();  //更新APP配置文件

			echo '{"state": 100, "info": '.json_encode("配置成功！").'}';
		}else{
			echo $return;
		}
		die;

	}

	$templates = "sitePaymentAdd.html";

	//js
	$jsFile = array(
		'admin/siteConfig/sitePaymentAdd.js'
	);

	//取得文件中的支付方式
	$payPath = '../../api/payment/';
	$paydir = @opendir($payPath);
	$set_modules = true;
	$payment = array();
	$pay_name = $pay_desc = $config = $f = "";

	while(false !== ($subdir = @readdir($paydir))){
		if(is_dir($payPath.$subdir) && $subdir != ".." && $subdir != "."){
			@include_once($payPath . $subdir. '/' . $subdir. '.php');
		}
	}
	@closedir($paydir);

	foreach ($payment as $key => $value){
		ksort($payment[$key]);
	}
	ksort($payment);

	for($i = 0; $i < count($payment); $i++){
		if($payData[0]['pay_code'] == $payment[$i]['pay_code']){
			$f = "y";
			$config   = $payment[$i]['config'];
		}
	};

	$payConfig = unserialize($payData[0]['pay_config']);

	if($f != ""){
		$huoniaoTag->assign('action', $action);
		$huoniaoTag->assign('id', $id);
		$huoniaoTag->assign('pay_name', $payData[0]['pay_name']);
		$huoniaoTag->assign('pay_desc', $payData[0]['pay_desc']);
		$huoniaoTag->assign('pay_code', $payData[0]['pay_code']);

		$pay_config = array();
		foreach($config as $key => $val){
			$ddHtml = "";

			array_push($pay_config, '<dl class="clearfix">');
			if($val['type'] == "split"){
				array_push($pay_config, '<dt style="margin-top: 15px;"><strong>'.$val['title'].'：</strong></dt>');
				$ddHtml = "<span style='display: block; margin-top: 15px; font-size: 14px; color: #999; line-height: 30px;'>".$val['description']."</span>";
			}else{
				array_push($pay_config, '<dt><label for="'.$val['name'].'">'.$val['title'].'：</label></dt>');
			}
			// array_push($pay_config, '<dt><label for="'.$val['name'].'">'.$val['title'].'：</label></dt>');

			$value = "";
			foreach($payConfig as $k => $v){
				if($v['name'] == $val['name']){
					$value = $v['value'];
					break;
				}
			}

			if($val['type'] == "text"){
				$ddHtml = '<input type="text" class="'.($val['class'] ? $val['class'] : 'input-xlarge').'" name="'.$val['name'].'" id="'.$val['name'].'" data-regex=".*" value="'.$value.'" />';
				$ddHtml.= '<span class="input-tips"><s></s>请输入'.$val['title'].'。</span>';
                if($val['description']){
                    $ddHtml .= '<div style="font-size: 12px; padding-top: 10px; color: #999;">'.$val['description'].'</div>';
                }
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

			array_push($pay_config, '<dd>'.$ddHtml.'</dd>');
			array_push($pay_config, '</dl>');
		}

		$huoniaoTag->assign('pay_config', join("", $pay_config));

		//状态-单选
		$huoniaoTag->assign('stateList', array('1', '2'));
		$huoniaoTag->assign('stateName',array('启用','禁用'));
		$huoniaoTag->assign('state', $payData[0]['state']);

	}else{
		echo "支付方式不存在，请确认后再试！";
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

					adminLog("修改支付方式排序", $id."=>".$i);
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
