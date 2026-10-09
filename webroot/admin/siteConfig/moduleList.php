<?php
/**
 * 频道模块管理
 *
 * @version        $Id: moduleList.php 2013-12-20 下午14:49:03 $
 * @package        HuoNiao.Config
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("moduleList");
$dsql = new dsql($dbo);
$tpl  = dirname(__FILE__)."/../templates/siteConfig";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "moduleList.html";

$defaultData = '';

//跳转到一下页的JS
$gotojs = "\r\nfunction GotoNextPage(){
    document.gonext."."submit();
}"."\r\nset"."Timeout('GotoNextPage()',500);";

$dojs = "<script language='javascript'>$gotojs\r\n</script>";

$action = "site_module";
$dopost = $_REQUEST['dopost'] ? $_REQUEST['dopost'] : "";

function getModuleName($id){
    global $dsql;
    $sql = $dsql->SetQuery("SELECT `title`, `subject` FROM `#@__site_module` WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "results");
    $ret = $ret[0];
    return $ret['subject'] ? $ret['subject'] : $ret['title'];
}

//获取指定ID信息说明
if($dopost == "getNote"){
	$id = $_POST['id'];
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT `note` FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		echo json_encode($results);die;
	}
	die;

//获取指定ID信息详情
}else if($dopost == "getDetail"){
	$id = $_POST['id'];
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT `parentid`, `title`, `name`, `icon`, `state`, `weight`, `wx` FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		echo json_encode($results);
	}
	die;

//微信小程序开关
}else if($dopost == "updateModuleWx"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_REQUEST['id'];

	if($id != ""){
		$state     = (int)$_POST['state'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `wx` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{

			adminLog("修改".getModuleName($id)."模块微信小程序状态", $state);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
	}
	die;

//百度小程序开关
}else if($dopost == "updateModuleBd"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_REQUEST['id'];

	if($id != ""){
		$state     = (int)$_POST['state'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `bd` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{

			adminLog("修改".getModuleName($id)."模块百度小程序状态", $state);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
	}
	die;

//QQ小程序开关
}else if($dopost == "updateModuleQm"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_REQUEST['id'];

	if($id != ""){
		$state     = (int)$_POST['state'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `qm` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{

			adminLog("修改".getModuleName($id)."模块QQ小程序状态", $state);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
	}
	die;

//抖音小程序开关
}else if($dopost == "updateModuleDy"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_REQUEST['id'];

	if($id != ""){
		$state     = (int)$_POST['state'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `dy` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{

			adminLog("修改".getModuleName($id)."模块抖音小程序状态", $state);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
	}
	die;

//APP开关
}else if($dopost == "updateModuleApp"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_REQUEST['id'];

	if($id != ""){
		$state     = (int)$_POST['state'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `app` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{

			adminLog("修改".getModuleName($id)."模块APP状态", $state);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
	}
	die;

//鸿蒙开关
}else if($dopost == "updateModuleHarmony"){
    if(!testPurview("modifyMoudule")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    };
    $id = $_REQUEST['id'];

    if($id != ""){
        $state     = (int)$_POST['state'];

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `harmony` = '$state' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");

        if($results != "ok"){
            echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
            exit();
        }else{

            adminLog("修改".getModuleName($id)."模块鸿蒙端状态", $state);

            echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
            exit();
        }
    }
    die;

//安卓开关
}else if($dopost == "updateModuleAndroid"){
    if(!testPurview("modifyMoudule")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    };
    $id = $_REQUEST['id'];

    if($id != ""){
        $state     = (int)$_POST['state'];

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `android` = '$state' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");

        if($results != "ok"){
            echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
            exit();
        }else{

            adminLog("修改".getModuleName($id)."模块安卓端状态", $state);

            echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
            exit();
        }
    }
    die;

//苹果开关
}else if($dopost == "updateModuleIos"){
    if(!testPurview("modifyMoudule")){
        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
    };
    $id = $_REQUEST['id'];

    if($id != ""){
        $state     = (int)$_POST['state'];

        //保存到主表
        $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `ios` = '$state' WHERE `id` = ".$id);
        $results = $dsql->dsqlOper($archives, "update");

        if($results != "ok"){
            echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
            exit();
        }else{

            adminLog("修改".getModuleName($id)."模块苹果端状态", $state);

            echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
            exit();
        }
    }
    die;

//PC开关
}else if($dopost == "updateModulePc"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_REQUEST['id'];

	if($id != ""){
		$state     = (int)$_POST['state'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `pc` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{

			adminLog("修改".getModuleName($id)."模块PC端状态", $state);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
	}
	die;

//H5开关
}else if($dopost == "updateModuleH5"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_REQUEST['id'];

	if($id != ""){
		$state     = (int)$_POST['state'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `h5` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{

			adminLog("修改".getModuleName($id)."模块H5端状态", $state);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
	}
	die;

//加粗开关
}else if($dopost == "updateModuleBold"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_REQUEST['id'];

	if($id != ""){
		$state     = (int)$_POST['state'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `bold` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{

			adminLog("修改".getModuleName($id)."模块加粗状态", $state);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
	}
	die;

//新窗口开关
}else if($dopost == "updateModuleTarget"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_REQUEST['id'];

	if($id != ""){
		$state     = (int)$_POST['state'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `target` = '$state' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{

			adminLog("修改".getModuleName($id)."模块新窗口状态", $state);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
	}
	die;

//修改模块基本信息
}else if($dopost == "updateModule"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_REQUEST['id'];

	if($id != ""){
		$title        = $_POST['title'];
		$icon         = $_POST['icon'];
		// $domainRules  = addslashes($_POST['domainRules']);
		// $catalogRules = addslashes($_POST['catalogRules']);
		$parentid     = (int)$_POST['parentid'];
		$state        = (int)$_POST['state'];
		$weight       = (int)$_POST['weight'];
		$wx           = (int)$_POST['wx'];

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `title` = '$title', `icon` = '$icon', `parentid` = '$parentid', `state` = '$state', `weight` = '$weight', `wx` = '$wx' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 101, "info": '.json_encode('修改失败，请重试！').'}';
			exit();
		}else{

			adminLog("修改".$title."模块信息", $title);

			echo '{"state": 100, "info": '.json_encode('修改成功！').'}';
			exit();
		}
	}
	die;

//停用
}else if($dopost == "disable"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_POST['id'];
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT `title` FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		$title = $results[0]['title'];

		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = 1 WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){
			adminLog("停用网站模块！", $title);

            //更新缓存
            updateMemory();

			die('{"state": 100, "info": '.json_encode('操作成功！').'}');
		}else{
			die('{"state": 200, "info": '.json_encode('操作失败！').'}');
		}
	}
	die;

//启用
}else if($dopost == "enable"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_POST['id'];
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT `title` FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		$title = $results[0]['title'];

		$archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `state` = 0 WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");
		if($results == "ok"){
			adminLog("启用网站模块！", $title);

            //更新缓存
            updateMemory();

			die('{"state": 100, "info": '.json_encode('操作成功！').'}');
		}else{
			die('{"state": 200, "info": '.json_encode('操作失败！').'}');
		}
	}
	die;

//删除链接
}else if($dopost == "del"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	$id = $_POST['id'];
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){
			$subject = $results[0]['subject'];
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				die('{"state": 200, "info": '.json_encode('删除失败，请重试！').'}');
			}
			adminLog("删除导航自定义链接", $subject);
			die('{"state": 100, "info": '.json_encode('删除成功！').'}');
		}else{
			die('{"state": 200, "info": '.json_encode('要删除的链接不存在或已删除！').'}');
		}
	}
	die;

//更新信息分类
}else if($dopost == "typeAjax"){
	if(!testPurview("modifyMoudule")){
		die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
	};
	if($_POST['data'] != ""){
		$json = json_decode($_POST['data']);

		$json = objtoarr($json);
		$json = moduleOpera($json, 0, $action);

        //更新缓存
        updateMemory();

		echo $json;
	}
	die;

//卸载
}else if($dopost == "uninstall"){
	checkPurview("uninstallMoudule");
	$id = $_GET['id'];
	$startpos = (int)$_POST['startpos'];
	if($id != ""){
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");
		if(!empty($results)){
			$title    = $results[0]['title'];
			$name     = $results[0]['name'];
			$icon     = $results[0]['icon'];
			$filelist = $results[0]['filelist'];
			$filelist = explode("\r\n",$filelist);
			$delsql   = $results[0]['delsql'];
			$delsql   = explode("\r\n",$delsql);

			$tmsg = "";
			$pos  = 0;
			if($startpos == 0){
				$tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: 0%;'>0%</div></div>\r\n";
				$tmsg .= "<font color='green'>正在执行卸载程序，请稍候...</font>\r\n";
				$pos  = 1;
			}elseif($startpos == 1){

				//删除相关文件
				unlinkFile(HUONIAOROOT.$icon);
				foreach($filelist as $v){
					if(!is_dir($v)){
						unlinkFile($v);
					}else{
						deldir($v);
					}
				}

				$tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: 50%;'>50%</div></div>\r\n";
				$tmsg .= "<font color='green'>模块文件删除成功，继续卸载数据库文件...</font>\r\n";
				$pos  = 2;
			}elseif($startpos == 2){

				//执行数据表删除语句
				foreach($delsql as $v){
					$archives = $dsql->SetQuery($v);
					$dsql->dsqlOper($archives, "update");
				}

				$tmsg  = "<div class='progress progress-striped active' style='width:400px; margin:10px auto;'><div class='bar' style='width: 100%;'>100%</div></div>\r\n";
				$tmsg .= "<font color='green'>数据库信息删除成功，继续卸载配置文件...</font>\r\n";
				$pos  = 3;
			}else{

				//删除模块配置表
				$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$id);
				$dsql->dsqlOper($archives, "update");

				//删除域名配置
				$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = '$name'");
				$dsql->dsqlOper($archives, "update");

				//删除附件表相关信息
				// $archives = $dsql->SetQuery("DELETE FROM `#@__attachment` WHERE `path` like '/$name/%'");
				// $dsql->dsqlOper($archives, "update");

				//删除广告相关信息
				// $archives = $dsql->SetQuery("DELETE FROM `#@__advtype` WHERE `model` = '$name'");
				// $dsql->dsqlOper($archives, "update");
				// $archives = $dsql->SetQuery("DELETE FROM `#@__advlist` WHERE `model` = '$name'");
				// $dsql->dsqlOper($archives, "update");

				adminLog("卸载网站模块", $title);

                //更新缓存
                updateMemory();

				ShowMsg($title.'模块卸载完成！', '../index.php?gotopage=siteConfig/moduleList.php');
				exit();
			}

			$doneForm  = "<form name='gonext' method='post' action='moduleList.php?dopost=uninstall&id=$id'>\r\n";
			$doneForm .= "  <input type='hidden' name='startpos' value='".$pos."' />\r\n</form>\r\n{$dojs}";
			PutInfo($tmsg, $doneForm);
			exit();

		}
	}
	die;
}
//批量更新状态
elseif($dopost == 'batchModuleState'){

    $state = $_REQUEST['state'];
    if($platform && $state){

        $state = $state == 'open' ? 1 : 0;
        $state = $platform == 'state' || $platform == 'app' ? !$state : $state;  //模块状态和APP状态值是反的
        $state = (int)$state;

        $sql = $dsql->SetQuery("UPDATE `#@__site_module` SET `".$platform."` = '$state'");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){

            //更新缓存
            updateMemory();

            die('{"state": 100, "info": '.json_encode('更新成功！').'}');
        }else{
            die('{"state": 200, "info": '.json_encode($ret).'}');
        }

    }

}
//导入默认数据
else if($dopost == "importDefaultData"){
    $importRes = array("state"=>100,"info"=>"操作成功");

    $defaultData = getDefaultData();
    $sql = $dsql->SetQuery("SELECT `name` FROM `#@__site_module` where `name` != ''");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach($ret as $key => $val){
            updateModuleNav($val['name']);
        }
    }

    adminLog("导入默认数据", "管理菜单_site_module");
    echo json_encode($importRes);
    die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/jquery-ui-sortable.js',
		'ui/jquery.ajaxFileUpload.js',
		'ui/jquery.colorPicker.js',
		'admin/siteConfig/moduleList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    //是否有安装新模块权限
    $installMoudulePurview = 0;
    if(testPurview("installMoudule")){
        $installMoudulePurview = 1;
    }
    $huoniaoTag->assign('installMoudulePurview', $installMoudulePurview);

	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('cfg_defaultindex', $cfg_defaultindex);
	$huoniaoTag->assign('moduleList', json_encode(getModuleList_(0, $action)));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/siteConfig";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取模块数据
function getModuleList_($id=0, $tab){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `type`, `parentid`, `icon`, `title`, `name`, `subject`, `state`, `weight`, `version`, `wx`, `app`, `bold`, `target`, `color`, `link`, `bd`, `qm`, `dy`, `pc`, `h5`, `harmony`, `android`, `ios` FROM `#@__".$tab."` WHERE `parentid` = $id ORDER BY `weight`, `id`");
	try{
		$result = $dsql->dsqlOper($sql, "results");

		if($result){//如果有子类
			foreach($result as $key => $value){

				$results[$key]["id"] = $value['id'];
                $results[$key]["type"] = $value['type'];
				$results[$key]["parentid"] = $value['parentid'];
				$results[$key]["title"] = $value['title'];
				$results[$key]["subject"] = $value['subject'] ? $value['subject'] : $value['title'];

				if($results[$key]["parentid"] != 0){
					$results[$key]["icon"] = empty($value['icon']) ? '/static/images/admin/nav/' . $value['name'] . '.png' : (strstr($value['icon'], '/') ? $value['icon'] : (strstr($value['icon'], '.') ? '/static/images/admin/nav/' . $value['icon'] : $value['icon']));
					$results[$key]["iconturl"] = empty($value['icon']) ? '/static/images/admin/nav/' . $value['name'] . '.png' : getFilePath($value['icon']);
					$results[$key]["name"] = $value['name'];
					$results[$key]["state"] = $value['state'];
					$results[$key]["version"] = $value['version'];
					$results[$key]["wx"] = $value['wx'];
					$results[$key]["app"] = $value['app'];
					$results[$key]["bold"] = $value['bold'];
					$results[$key]["target"] = $value['target'];
					$results[$key]["color"] = $value['color'];
					$results[$key]["link"] = $value['link'];
					$results[$key]["bd"] = $value['bd'];
					$results[$key]["qm"] = $value['qm'];
					$results[$key]["dy"] = $value['dy'];
					$results[$key]["pc"] = $value['pc'];
					$results[$key]["h5"] = $value['h5'];
                    $results[$key]['harmony'] = (int)$value['harmony'];
                    $results[$key]['android'] = (int)$value['android'];
                    $results[$key]['ios'] = (int)$value['ios'];
				}

				$results[$key]["lower"] = getModuleList_($value['id'], $tab);
			}
			return $results;
		}else{
			return "";
		}

	}catch(Exception $e){
		die("模块数据获取失败！");
	}
}

//模块操作
function moduleOpera($arr, $pid = 0, $dopost){
	global $dsql;

	if (!is_array($arr) && $arr != NULL) {
		return '{"state": 200, "info": "保存失败！"}';
	}
	for($i = 0; $i < count($arr); $i++){
		$id = (int)$arr[$i]["id"];
		$type = (int)$arr[$i]["type"];
		$title = $arr[$i]["title"];
		$link = $arr[$i]["link"];
		$icon = $arr[$i]["icon"];
		$color = $arr[$i]["color"];
        $color = $color == 'undefined' ? '' : $color;
		$bold = (int)$arr[$i]["bold"];
		$target = (int)$arr[$i]["target"];

		//如果ID为空则向数据库插入下级分类
		if($id == "" || $id == 0){
			$archives = $dsql->SetQuery("INSERT INTO `#@__".$dopost."` (`type`, `parentid`, `subject`, `weight`, `date`, `link`, `icon`, `color`, `bold`, `target`) VALUES (1, '1', '$title', '$i', '".GetMkTime(time())."', '$link', '$icon', '$color', '$bold', '$target')");
			$id = $dsql->dsqlOper($archives, "lastid");

			adminLog("添加自定义导航", $title . '=>' . $link);
		}
		//其它为数据库已存在的分类需要验证分类名是否有改动，如果有改动则UPDATE
		else{
			$archives = $dsql->SetQuery("SELECT `type`, `subject`, `weight`, `link`, `icon`, `color` FROM `#@__".$dopost."` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

        //验证标题
				if($results[0]["subject"] != $title){
					$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."` SET `subject` = '$title' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改自定义导航标题", $results[0]["subject"]."=>".$title);
				}

        //验证icon
				if($results[0]["icon"] != $icon){
					$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."` SET `icon` = '$icon' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改自定义导航图标", $results[0]["icon"]."=>".$icon);
				}

        //验证color
				if($results[0]["color"] != $color && 1 == 2){
					$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."` SET `color` = '$color' WHERE `id` = ".$id);
					$dsql->dsqlOper($archives, "update");

					adminLog("修改自定义导航颜色", $results[0]["color"]."=>".$color);
				}

        //自定义
        if($results[0]['type'] == 1){
          //验证链接
  				if($results[0]["link"] != $link){
  					$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."` SET `link` = '$link' WHERE `id` = ".$id);
  					$dsql->dsqlOper($archives, "update");

  					adminLog("修改自定义导航链接", $results[0]["link"]."=>".$link);
  				}
        }

				//验证排序
				if($results[0]["weight"] != $i){
					$archives = $dsql->SetQuery("UPDATE `#@__".$dopost."` SET `weight` = '$i' WHERE `id` = ".$id);
					$results = $dsql->dsqlOper($archives, "update");

					adminLog("修改自定义导航排序", $dopost."=>".$name."=>".$i);
				}

			}
		}
		if(is_array($arr[$i]["lower"])){
			moduleOpera($arr[$i]["lower"], $id, $dopost);
		}
	}
	return '{"state": 100, "info": "保存成功！"}';
}

function PutInfo($msg1,$msg2){
	$htmlhead  = "<html>\r\n<head>\r\n<title>温馨提示</title>\r\n";
	$htmlhead .= "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=".$GLOBALS['cfg_soft_lang']."\" />\r\n";
	$htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='".HUONIAOADMIN."/../static/css/admin/bootstrap.css?v=4' />";
	$htmlhead .= "<link rel='stylesheet' rel='stylesheet' href='".HUONIAOADMIN."/../static/css/admin/common.css?v=1111' />";
    $htmlhead .= "<base target='_self'/>\r\n</head>\r\n<body>\r\n";
    $htmlfoot  = "</body>\r\n</html>";
	$rmsg  = "<div class='s-tip'><div class='s-tip-head'><h1>".$GLOBALS['cfg_soft_enname']." 提示：</h1></div>\r\n";
    $rmsg .= "<div class='s-tip-body'>".str_replace("\"","“",$msg1)."\r\n".$msg2."\r\n";
    $msginfo = $htmlhead.$rmsg.$htmlfoot;
    echo $msginfo;
}


//更新缓存
function updateMemory(){
    global $HN_memory;

    $HN_memory->rm('site_module_count');
    getDomainFullUrl('', '');

    $HN_memory->rm('site_module');
    getModuleList();

}


function getDefaultData(){
    $_defaultData = array(
        'article' => '[{"menuName":"资讯管理","subMenu":[{"menuName":"资讯设置","menuUrl":"articleConfig.php","menuInfo":"资讯模块基本信息设置、页面风格、自定义远程附件、URL链接规则、资讯审核流程、自媒体介绍等"},{"menuName":"组织架构","menuUrl":"siteConfig/organizat.php","menuInfo":"资讯审核绑定管理员"},{"menuName":"自媒体","menuUrl":"selfmediaList.php","city":1,"menuChild":[{"menuName":"添加信息","menuMark":"addselfmedia","city":1},{"menuName":"修改信息","menuMark":"editselfmedia","city":1},{"menuName":"删除信息","menuMark":"delselfmedia","city":1},{"menuName":"自媒体领域","menuMark":"selfmediaField","city":1}]},{"menuName":"资讯分类","menuUrl":"articleType.php","menuInfo":"【头条】、【图集】、【视频】、【短视频】不同资讯属性的分类创建"},{"menuName":"添加资讯","menuUrl":"articleAdd.php","menuInfo":"新闻资讯添加","city":1},{"menuName":"管理资讯","menuUrl":"articleList.php","menuInfo":"新闻资讯管理","city":1,"menuChild":[{"menuName":"修改信息","menuMark":"editarticle","city":1},{"menuName":"删除信息","menuMark":"delarticle","city":1}]},{"menuName":"专题管理","menuUrl":"zhuanti.php","menuInfo":"新闻专题管理","city":0,"menuChild":[{"menuName":"添加专题","menuMark":"addzhuanti","city":1},{"menuName":"修改专题","menuMark":"editzhuanti","city":1},{"menuName":"删除专题","menuMark":"delzhuanti","city":1}]},{"menuName":"回收站","menuUrl":"articleList.php?recycle=1","menuInfo":"已删除资讯管理","city":1},{"menuName":"评论管理","menuUrl":"articleCommon.php","menuInfo":"用户资讯评论管理","city":1,"menuChild":[{"menuName":"修改评论","menuMark":"editarticleCommon","city":1},{"menuName":"删除评论","menuMark":"delarticleCommon","city":1}]},{"menuName":"模板标签","menuUrl":"mytag.php?action=article","menuInfo":"该功能适用于【拖拽专题】模块下【添加】--【应用】--【添加数据源】的功能，添加数据源填写的ID信息，为该页面创建的标签ID信息，输入标签后，可以选择调用","menuChild":[{"menuName":"新增标签","menuMark":"addarticleMytag"},{"menuName":"修改标签","menuMark":"editarticleMytag"},{"menuName":"删除标签","menuMark":"delarticleMytag"},{"menuName":"标签模板","menuMark":"mytagTemparticle","menuChild":[{"menuName":"添加模板","menuMark":"addmytagTemparticle"},{"menuName":"修改模板","menuMark":"editmytagTemparticle"},{"menuName":"删除模板","menuMark":"delmytagTemparticle"}]}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=article","menuInfo":"资讯广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=article","menuInfo":"资讯首页底部友情链接设置","city":1}]}]',
        'info' => '[{"menuName":"信息管理","subMenu":[{"menuName":"信息设置","menuUrl":"infoConfig.php","menuInfo":"分类信息模块基本信息设置、页面风格、自定义远程附件等，用户激励配置、手机号验证、信息有效时长设置"},{"menuName":"信息分类","menuUrl":"infoType.php","menuInfo":"信息内容分类管理，可设置分类参数字段、分类特色标签","menuChild":[{"menuName":"添加分类","menuMark":"addInfoType"},{"menuName":"修改分类","menuMark":"editInfoType"},{"menuName":"删除分类","menuMark":"delInfoType"},{"menuName":"字段管理","menuMark":"infoItem","menuChild":[{"menuName":"添加字段","menuMark":"addInfoItem"},{"menuName":"修改字段","menuMark":"editInfoItem"},{"menuName":"删除字段","menuMark":"delInfoItem"}]}]},{"menuName":"发布信息","menuUrl":"infoAdd.php","menuInfo":"发布分类信息","city":1},{"menuName":"信息管理","menuUrl":"infoList.php","menuInfo":"对已发布分类信息进行管理，可执行置顶、刷新、修改等操作","city":1,"menuChild":[{"menuName":"修改信息","menuMark":"editInfo","city":1},{"menuName":"删除信息","menuMark":"delInfo","city":1}]},{"menuName":"回收站","menuUrl":"infoList.php?recycle=1","menuInfo":"对已删除的分类信息进行管理","city":1},{"menuName":"评论管理","menuUrl":"infoCommon.php","menuInfo":"用户分类信息评论内容管理","city":1},{"menuName":"拨打电话记录","menuUrl":"infoPhoneLog.php","menuInfo":"","city":1},{"menuName":"模板标签","menuUrl":"mytag.php?action=info","menuInfo":"该功能适用于【拖拽专题】模块下【添加】--【应用】--【添加数据源】的功能，添加数据源填写的ID信息，为该页面创建的标签ID信息，输入标签后，可以选择调用","menuChild":[{"menuName":"新增标签","menuMark":"addinfoMytag"},{"menuName":"修改标签","menuMark":"editinfoMytag"},{"menuName":"删除标签","menuMark":"delinfoMytag"},{"menuName":"标签模板","menuMark":"mytagTempinfo","menuChild":[{"menuName":"添加模板","menuMark":"addmytagTempinfo"},{"menuName":"修改模板","menuMark":"editmytagTempinfo"},{"menuName":"删除模板","menuMark":"delmytagTempinfo"}]}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=info","menuInfo":"分类信息板块广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=info","menuInfo":"分类信息电脑端首页底部友情链接管理","city":1}]}]',
        'house' => '[{"menuName":"基本设置","subMenu":[{"menuName":"房产设置","menuUrl":"houseConfig.php","menuInfo":"房产模块基本设置，含发布信息审核机制、房源图集数量、经纪人套餐、页面风格、独立远程附件等"},{"menuName":"字段管理","menuUrl":"houseItem.php","menuInfo":"固定字段分类属性管理"},{"menuName":"行业分类","menuUrl":"houseIndustry.php","menuInfo":"商铺所属行业分类管理"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=house","menuInfo":"房产板块下的广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=house","menuInfo":"房产电脑端底部友情链接管理","city":1},{"menuName":"看房预约","menuUrl":"houseAppoint.php","menuInfo":"用户预约看房状态记录","city":1},{"menuName":"浏览记录","menuUrl":"history.php","menuInfo":"用户浏览楼盘记录","city":1},{"menuName":"看房团","menuUrl":"houseBooking.php","menuInfo":"用户看房团信息","city":1},{"menuName":"求租/求购管理","menuUrl":"houseDemand.php","menuInfo":"求租/求购管理","city":1,"menuChild":[{"menuName":"新增求租/求购","menuMark":"houseDemandAdd","city":1},{"menuName":"修改求租/求购","menuMark":"houseDemandEdit","city":1},{"menuName":"删除求租/求购","menuMark":"houseDemandDel","city":1}]},{"menuName":"模板标签","menuUrl":"mytag.php?action=house","menuInfo":"该功能适用于【拖拽专题】模块下【添加】--【应用】--【添加数据源】的功能，添加数据源填写的ID信息，为该页面创建的标签ID信息，输入标签后，可以选择调用","menuChild":[{"menuName":"新增标签","menuMark":"addhouseMytag"},{"menuName":"修改标签","menuMark":"edithouseMytag"},{"menuName":"删除标签","menuMark":"delhouseMytag"},{"menuName":"标签模板","menuMark":"mytagTemphouse","menuChild":[{"menuName":"添加模板","menuMark":"addmytagTemphouse"},{"menuName":"修改模板","menuMark":"editmytagTemphouse"},{"menuName":"删除模板","menuMark":"delmytagTemphouse"}]}]}]},{"menuName":"楼盘","subMenu":[{"menuName":"发布楼盘","menuUrl":"loupanAdd.php","menuInfo":"发布楼盘","city":1},{"menuName":"楼盘管理","menuUrl":"loupanList.php","menuInfo":"楼盘信息管理，含沙盘、全景、视频、户型、相册、楼盘资讯、楼盘顾问、楼盘管理员及带访确认单设置","city":1,"menuChild":[{"menuName":"添加楼盘","menuMark":"loupanAdd","city":1},{"menuName":"修改楼盘","menuMark":"loupanEdit","city":1},{"menuName":"删除楼盘","menuMark":"loupanDel","city":1},{"menuName":"房源管理","menuMark":"listing","city":1,"menuChild":[{"menuName":"添加房源","menuMark":"listingAdd","city":1},{"menuName":"修改房源","menuMark":"listingEdit","city":1},{"menuName":"删除房源","menuMark":"listingDel","city":1}]},{"menuName":"全景看房","menuMark":"house360qj","city":1},{"menuName":"电子沙盘","menuMark":"houseshapan","city":1},{"menuName":"户型管理","menuMark":"apartmentloupan","city":1,"menuChild":[{"menuName":"添加户型","menuMark":"apartmentloupanAdd","city":1},{"menuName":"修改户型","menuMark":"apartmentloupanEdit","city":1},{"menuName":"删除户型","menuMark":"apartmentloupanDel","city":1}]},{"menuName":"相册管理","menuMark":"housealbumloupan","city":1,"menuChild":[{"menuName":"添加相册","menuMark":"housealbumAddloupan","city":1},{"menuName":"修改相册","menuMark":"housealbumEditloupan","city":1},{"menuName":"删除相册","menuMark":"housealbumDelloupan","city":1}]},{"menuName":"楼盘资讯","menuMark":"loupannews","city":1},{"menuName":"楼盘顾问","menuMark":"loupanGw","city":1}]},{"menuName":"信息订阅","menuUrl":"houseNotice.php?action=loupan","menuInfo":"用户楼盘订阅列表","city":1},{"menuName":"活动管理","menuUrl":"houseHuodong.php","menuInfo":"楼盘活动管理","city":1},{"menuName":"活动报名","menuUrl":"houseTuan.php","menuInfo":"用户楼盘活动报名情况表","city":1},{"menuName":"合作申请","menuUrl":"houseCooperation.php","menuInfo":"合作申请表","city":1}]},{"menuName":"中介","subMenu":[{"menuName":"新增中介公司","menuUrl":"zjComAdd.php","menuInfo":"中介公司新增","city":1},{"menuName":"管理中介公司","menuUrl":"zjComList.php","menuInfo":"中介公司管理","city":1,"menuChild":[{"menuName":"修改中介公司","menuMark":"zjComEdit","city":1},{"menuName":"删除中介公司","menuMark":"zjComDel","city":1}]},{"menuName":"经纪人等级","menuUrl":"zjUserGroup.php","menuInfo":"经纪人等级样式设置","city":1},{"menuName":"添加经纪人","menuUrl":"zjUserAdd.php","menuInfo":"添加经纪人","city":1},{"menuName":"管理经纪人","menuUrl":"zjUserList.php","menuInfo":"经纪人信息管理","city":1,"menuChild":[{"menuName":"修改经纪人","menuMark":"zjUserEdit","city":1},{"menuName":"删除经纪人","menuMark":"zjUserDel","city":1}]}]},{"menuName":"小区","subMenu":[{"menuName":"发布小区","menuUrl":"communityAdd.php","menuInfo":"发布小区","city":1},{"menuName":"小区管理","menuUrl":"communityList.php","menuInfo":"小区管理，含基本信息维护、户型管理、相册示图展示等","city":1,"menuChild":[{"menuName":"添加小区","menuMark":"communityAdd","city":1},{"menuName":"修改小区","menuMark":"communityEdit","city":1},{"menuName":"删除小区","menuMark":"communityDel","city":1},{"menuName":"户型管理","menuMark":"apartmentcommunity","city":1,"menuChild":[{"menuName":"添加户型","menuMark":"apartmentcommunityAdd","city":1},{"menuName":"修改户型","menuMark":"apartmentcommunityEdit","city":1},{"menuName":"删除户型","menuMark":"apartmentcommunityDel","city":1}]},{"menuName":"相册管理","menuMark":"housealbumcommunity","city":1,"menuChild":[{"menuName":"添加相册","menuMark":"housealbumAddcommunity","city":1},{"menuName":"修改相册","menuMark":"housealbumEditcommunity","city":1},{"menuName":"删除相册","menuMark":"housealbumDelcommunity","city":1}]}]}]},{"menuName":"学校","subMenu":[{"menuName":"发布学校","menuUrl":"releaseschoolAdd.php","menuInfo":"发布学校信息，设定施教范围","city":1},{"menuName":"学校管理","menuUrl":"releaseschoolList.php","menuInfo":"学校信息管理","city":1,"menuChild":[{"menuName":"添加学校","menuMark":"releaseschoolAdd","city":1},{"menuName":"修改学校","menuMark":"releaseschoolEdit","city":1},{"menuName":"删除学校","menuMark":"releaseschoolDel","city":1}]},{"menuName":"评论管理","menuUrl":"houseCommon.php","menuInfo":"用户学校评论管理","city":1}]},{"menuName":"二手房","subMenu":[{"menuName":"发布二手房","menuUrl":"houseSaleAdd.php","menuInfo":"发布二手房","city":1},{"menuName":"管理二手房","menuUrl":"houseSale.php","menuInfo":"管理二手房","city":1,"menuChild":[{"menuName":"修改二手房","menuMark":"houseSaleEdit","city":1},{"menuName":"删除二手房","menuMark":"houseSaleDel","city":1}]}]},{"menuName":"租房","subMenu":[{"menuName":"发布租房","menuUrl":"houseZuAdd.php","menuInfo":"发布租房","city":1},{"menuName":"管理租房","menuUrl":"houseZu.php","menuInfo":"租房管理","city":1,"menuChild":[{"menuName":"修改租房","menuMark":"houseZuEdit","city":1},{"menuName":"删除租房","menuMark":"houseZuDel","city":1}]}]},{"menuName":"写字楼","subMenu":[{"menuName":"发布写字楼","menuUrl":"houseXzlAdd.php","menuInfo":"发布写字楼","city":1},{"menuName":"管理写字楼","menuUrl":"houseXzl.php","menuInfo":"写字楼管理","city":1,"menuChild":[{"menuName":"修改写字楼","menuMark":"houseXzlEdit","city":1},{"menuName":"删除写字楼","menuMark":"houseXzlDel","city":1}]}]},{"menuName":"商铺","subMenu":[{"menuName":"发布商铺","menuUrl":"houseSpAdd.php","menuInfo":"发布商铺","city":1},{"menuName":"管理商铺","menuUrl":"houseSp.php","menuInfo":"商铺管理","city":1,"menuChild":[{"menuName":"修改商铺","menuMark":"houseSpEdit","city":1},{"menuName":"删除商铺","menuMark":"houseSpDel","city":1}]}]},{"menuName":"厂房/仓库","subMenu":[{"menuName":"发布厂房/仓库","menuUrl":"houseCfAdd.php","menuInfo":"发布厂房/仓库","city":1},{"menuName":"管理厂房/仓库","menuUrl":"houseCf.php","menuInfo":"厂房/仓库管理","city":1,"menuChild":[{"menuName":"修改厂房/仓库","menuMark":"houseCfEdit","city":1},{"menuName":"删除厂房/仓库","menuMark":"houseCfDel","city":1}]}]},{"menuName":"车位","subMenu":[{"menuName":"发布车位","menuUrl":"houseCwAdd.php","menuInfo":"发布车位","city":1},{"menuName":"管理车位","menuUrl":"houseCw.php","menuInfo":"车位管理","city":1,"menuChild":[{"menuName":"修改车位","menuMark":"houseCwEdit","city":1},{"menuName":"删除车位","menuMark":"houseCwDel","city":1}]}]},{"menuName":"房产资讯","subMenu":[{"menuName":"资讯分类","menuUrl":"houseNewsType.php","menuInfo":"房产资讯分类","city":1},{"menuName":"添加资讯","menuUrl":"houseNewsList.php?dopost=Add","menuInfo":"添加房产资讯","city":1},{"menuName":"资讯管理","menuUrl":"houseNewsList.php","menuInfo":"房产资讯信息管理","city":1,"menuChild":[{"menuName":"修改资讯","menuMark":"houseNewsEdit","city":1},{"menuName":"删除资讯","menuMark":"houseNewsDel","city":1}]}]},{"menuName":"房产问答","subMenu":[{"menuName":"问答分类","menuUrl":"houseFaqType.php","menuInfo":"房产问题类型分类","city":1},{"menuName":"问答管理","menuUrl":"houseFaqList.php","menuInfo":"用户问答管理","city":1,"menuChild":[{"menuName":"修改问答","menuMark":"houseFaqEdit","city":1},{"menuName":"删除问答","menuMark":"houseFaqDel","city":1}]}]}]',
        'shop' => '[{"menuName":"基本设置","subMenu":[{"menuName":"商城管理平台","menuUrl":"shopOverview.php","menuInfo":"","city":1},{"menuName":"商城设置","menuUrl":"shopConfig.php","menuInfo":"商城基本设置；含:商品活动配置、用户交易设置、审核设置、平台配送方案设置"},{"menuName":"商城资讯","menuUrl":"shopNews.php","menuInfo":"商城资讯管理","city":1,"menuChild":[{"menuName":"资讯分类","menuMark":"shopNewsType","city":1,"menuChild":[{"menuName":"添加分类","menuMark":"addShopNews","city":1},{"menuName":"修改分类","menuMark":"editShopNews","city":1},{"menuName":"删除分类","menuMark":"delShopNews","city":1}]}]},{"menuName":"商城公告","menuUrl":"shopNotice.php","menuInfo":"商城公告管理","city":1},{"menuName":"活动促销管理","menuUrl":"shopHuodongConfig.php","menuInfo":"商品限时抢购场次设置","city":1},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=shop","menuInfo":"商城板块广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=shop","menuInfo":"商城电脑端底部友情链接管理","city":1},{"menuName":"商城统计","menuUrl":"shopStatistics.php","menuInfo":"商城订单统计","menuChild":[{"menuName":"商城营业额统计","menuMark":"shopStatisticsChartrevenue"},{"menuName":"订单按天统计","menuMark":"shopStatisticsChartorder"},{"menuName":"订单按时间段统计","menuMark":"shopStatisticsChartordertime"},{"menuName":"财务结算","menuMark":"shopStatisticsFinancenew"}]},{"menuName":"模板标签","menuUrl":"mytag.php?action=shop","menuInfo":"该功能适用于【拖拽专题】模块下【添加】--【应用】--【添加数据源】的功能，添加数据源填写的ID信息，为该页面创建的标签ID信息，输入标签后，可以选择调用","menuChild":[{"menuName":"新增标签","menuMark":"addshopMytag"},{"menuName":"修改标签","menuMark":"editshopMytag"},{"menuName":"删除标签","menuMark":"delshopMytag"},{"menuName":"标签模板","menuMark":"mytagTempshop","menuChild":[{"menuName":"添加模板","menuMark":"addmytagTempshop"},{"menuName":"修改模板","menuMark":"editmytagTempshop"},{"menuName":"删除模板","menuMark":"delmytagTempshop"}]}]}]},{"menuName":"店铺","subMenu":[{"menuName":"运费模板","menuUrl":"logisticTemplate.php","menuInfo":"平台商品运费模板管理","menuChild":[{"menuName":"运费模板","menuMark":"logisticTemplate"},{"menuName":"添加模板","menuMark":"addLogisticTemplate"},{"menuName":"修改模板","menuMark":"editLogisticTemplate"},{"menuName":"删除模板","menuMark":"delLogisticTemplate"}]},{"menuName":"店铺管理","menuUrl":"shopStoreList.php","menuInfo":"商城店铺管理，含:商铺信息维护、商铺运费模板调整、商铺分店信息管理等","city":1,"menuChild":[{"menuName":"添加店铺","menuMark":"shopStoreAdd","menuInfo":"商城商铺添加管理","city":1},{"menuName":"修改店铺","menuMark":"shopStoreEdit","city":1},{"menuName":"删除店铺","menuMark":"shopStoreDel","city":1}]},{"menuName":"分店管理","menuUrl":"shopBranchStore.php","menuInfo":"商城商铺分店信息管理","city":1,"menuChild":[]},{"menuName":"打印机绑定","menuUrl":"shopPrintBinding.php","menuInfo":"商城商铺订单打印机绑定","city":1,"menuChild":[]},{"menuName":"资质类型","menuUrl":"shopAuthAttr.php","menuInfo":"商城店铺预设资质管理","city":1}]},{"menuName":"商品&订单","subMenu":[{"menuName":"商品管理","menuUrl":"productList.php","menuInfo":"商品信息管理","city":1,"menuChild":[{"menuName":"上架新商品","menuMark":"productAdd","menuInfo":"上架新商品","city":1},{"menuName":"修改商品","menuMark":"productEdit","city":1},{"menuName":"删除商品","menuMark":"productDel","city":1}]},{"menuName":"活动商品管理","menuUrl":"huodongProductList.php","menuInfo":"商城活动商品管理","city":1,"menuChild":[{"menuName":"修改活动","menuMark":"huodongProductEdit","city":1},{"menuName":"删除活动","menuMark":"huodongProductDel","city":1}]},{"menuName":"商品评论","menuUrl":"shopCommon.php","menuInfo":"用户对商品订单的评价管理","city":1},{"menuName":"订单管理","menuUrl":"shopOrder.php","menuInfo":"商城订单记录管理","city":1,"menuChild":[{"menuName":"修改订单","menuMark":"shopOrderEdit","city":1},{"menuName":"删除订单","menuMark":"shopOrderDel","city":1}]},{"menuName":"平台介入订单","menuUrl":"shopKeFuOrder.php","menuInfo":"商城纠纷订单平台介入管理","city":1},{"menuName":"券码核销记录","menuUrl":"shopProQuanList.php","menuInfo":"商城劵码商品管理，平台可辅助商铺进行消费验券","city":1,"menuChild":[{"menuName":"消费/取消","menuMark":"shopProQuanOpera","city":1}]}]},{"menuName":"优惠券","subMenu":[{"menuName":"优惠券管理","menuUrl":"shopQuan.php","menuInfo":"商城优惠券列表"},{"menuName":"优惠券发放记录","menuUrl":"shopQuanList.php","menuInfo":"商城优惠券发放记录"}]},{"menuName":"字段管理","subMenu":[{"menuName":"规格","menuUrl":"shopSpe.php","menuInfo":"商城商品规格属性管理"},{"menuName":"分类","menuUrl":"shopType.php","menuInfo":"商城商品分类属性管理","menuChild":[{"menuName":"添加分类","menuMark":"addShopType"},{"menuName":"修改分类","menuMark":"editShopType"},{"menuName":"删除分类","menuMark":"delShopType"},{"menuName":"属性管理","menuMark":"shopItem","menuChild":[{"menuName":"添加属性","menuMark":"addShopItem"},{"menuName":"修改属性","menuMark":"editShopItem"},{"menuName":"删除属性","menuMark":"delShopItem"}]}]},{"menuName":"品牌","menuUrl":"shopBrand.php","menuInfo":"商城商品预设品牌设置","menuChild":[{"menuName":"品牌分类","menuMark":"shopBrandType"},{"menuName":"添加品牌","menuMark":"addShopBrand"},{"menuName":"修改品牌","menuMark":"editShopBrand"},{"menuName":"删除品牌","menuMark":"delShopBrand"}]}]}]',
        'renovation' => '[{"menuName":"基本设置","subMenu":[{"menuName":"装修设置","menuUrl":"renovationConfig.php","menuInfo":"装修模块基本信息设置、页面风格、自定义远程附件等"},{"menuName":"分类管理","menuUrl":"renovationType.php","menuInfo":"装修信息分类管理"},{"menuName":"小区管理","menuUrl":"renovationCommunity.php","menuInfo":"装修小区管理","city":1},{"menuName":"模板标签","menuUrl":"mytag.php?action=renovation","menuInfo":"该功能适用于【拖拽专题】模块下【添加】--【应用】--【添加数据源】的功能，添加数据源填写的ID信息，为该页面创建的标签ID信息，输入标签后，可以选择调用","menuChild":[{"menuName":"新增标签","menuMark":"addrenovationMytag"},{"menuName":"修改标签","menuMark":"editrenovationMytag"},{"menuName":"删除标签","menuMark":"delrenovationMytag"},{"menuName":"标签模板","menuMark":"mytagTemprenovation","menuChild":[{"menuName":"添加模板","menuMark":"addmytagTemprenovation"},{"menuName":"修改模板","menuMark":"editmytagTemprenovation"},{"menuName":"删除模板","menuMark":"delmytagTemprenovation"}]}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=renovation","menuInfo":"装修板块下广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=renovation","menuInfo":"装修电脑端底部友情链接管理","city":1}]},{"menuName":"装修管理","subMenu":[{"menuName":"装修招标","menuUrl":"renovationZhaobiao.php","menuInfo":"装修招标信息展示","city":1,"menuChild":[{"menuName":"新增招标","menuMark":"renovationZhaobiaoAdd","city":1},{"menuName":"修改招标","menuMark":"renovationZhaobiaoEdit","city":1},{"menuName":"删除招标","menuMark":"renovationZhaobiaoDel","city":1},{"menuName":"投标管理","menuMark":"renovationToubiao","city":1,"menuChild":[{"menuName":"修改投标","menuMark":"renovationToubiaoEdit","city":1},{"menuName":"删除投标","menuMark":"renovationToubiaoDel","city":1}]}]},{"menuName":"装修公司","menuUrl":"renovationStore.php","menuInfo":"装修公司管理","city":1,"menuChild":[{"menuName":"新增公司","menuMark":"renovationStoreAdd","city":1},{"menuName":"修改公司","menuMark":"renovationStoreEdit","city":1},{"menuName":"促销信息","menuMark":"renovationStoreSale","city":1},{"menuName":"删除公司","menuMark":"renovationStoreDel","city":1}]},{"menuName":"设计师","menuUrl":"renovationTeam.php","menuInfo":"装修设计师管理","city":1,"menuChild":[{"menuName":"新增设计师","menuMark":"renovationTeamAdd","city":1},{"menuName":"修改设计师","menuMark":"renovationTeamEdit","city":1},{"menuName":"删除设计师","menuMark":"renovationTeamDel","city":1}]},{"menuName":"工长","menuUrl":"renovationForeman.php","menuInfo":"装修工长管理","city":1,"menuChild":[{"menuName":"新增设计师","menuMark":"renovationForemanAdd","city":1},{"menuName":"修改设计师","menuMark":"renovationForemanEdit","city":1},{"menuName":"删除设计师","menuMark":"renovationForemanDel","city":1}]},{"menuName":"效果图","menuUrl":"renovationCase.php","menuInfo":"装修公司效果图管理","city":1,"menuChild":[{"menuName":"新增效果图","menuMark":"renovationCaseAdd","city":1},{"menuName":"修改效果图","menuMark":"renovationCaseEdit","city":1},{"menuName":"删除效果图","menuMark":"renovationCaseDel","city":1}]},{"menuName":"施工案例","menuUrl":"renovationDiary.php","menuInfo":"装修施工案例管理","city":1,"menuChild":[{"menuName":"新增案例","menuMark":"renovationDiaryAdd","city":1},{"menuName":"修改案例","menuMark":"renovationDiaryEdit","city":1},{"menuName":"删除案例","menuMark":"renovationDiaryDel","city":1}]},{"menuName":"留言管理","menuUrl":"renovationGuest.php","menuInfo":"用户留言管理","city":1},{"menuName":"装修大学","menuUrl":"renovationNewsList.php","menuInfo":"装修资讯管理","city":1},{"menuName":"文章动态管理","menuUrl":"renovationArticlesList.php","menuInfo":"装修公司、工长、设计师发布的文章动态管理","city":1},{"menuName":"工地管理","menuUrl":"renovationConstruction.php","menuInfo":"装修工地管理","city":1,"menuChild":[{"menuName":"新增案例","menuMark":"renovationConstructionAdd","city":1},{"menuName":"修改案例","menuMark":"renovationConstructionEdit","city":1},{"menuName":"删除案例","menuMark":"renovationConstructionDel","city":1}]}]},{"menuName":"预约管理","subMenu":[{"menuName":"在线预约","menuUrl":"renovationRese.php","menuInfo":"用户预约信息管理","city":1},{"menuName":"免费设计申请","menuUrl":"renovationEntrust.php","menuInfo":"用户提交的免费设计申请管理","city":1},{"menuName":"预约参观","menuUrl":"renovationVisit.php","menuInfo":"预约参观管理","city":1}]}]',
        'paper' => '[{"menuName":"基本设置","subMenu":[{"menuName":"报刊设置","menuUrl":"paperConfig.php","menuInfo":"报刊基本信息设置、页面风格、自定义远程附件等"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=paper","menuInfo":"报刊板块广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=paper","menuInfo":"电子报刊电脑端首页底部友情链接管理","city":1}]},{"menuName":"报刊管理","subMenu":[{"menuName":"报刊公司","menuUrl":"paperCompany.php","menuInfo":"报刊公司管理","city":1,"menuChild":[{"menuName":"添加报刊","menuMark":"paperCompanyAdd","city":1},{"menuName":"修改报刊","menuMark":"paperCompanyEdit","city":1},{"menuName":"删除报刊","menuMark":"paperCompanyDel","city":1}]},{"menuName":"版面管理","menuUrl":"paperForum.php","menuInfo":"报刊版面内容管理","city":1,"menuChild":[{"menuName":"添加版面","menuMark":"paperForumAdd","city":1},{"menuName":"修改版面","menuMark":"paperForumEdit","city":1},{"menuName":"删除版面","menuMark":"paperForumDel","city":1},{"menuName":"内容管理","menuMark":"paperNews","city":1,"menuChild":[{"menuName":"添加内容","menuMark":"paperNewsAdd","city":1},{"menuName":"修改内容","menuMark":"paperNewsEdit","city":1},{"menuName":"删除内容","menuMark":"paperNewsDel","city":1}]}]}]}]',
        'job' => '[{"menuName":"基本设置","subMenu":[{"menuName":"招聘管理平台","menuUrl":"jobOverview.php","menuInfo":"","city":1},{"menuName":"招聘设置","menuUrl":"jobConfig.php","menuInfo":""},{"menuName":"职位类别","menuUrl":"jobType.php","menuInfo":""},{"menuName":"行业类别","menuUrl":"jobIndustry.php","menuInfo":""},{"menuName":"筛选参数/字段","menuUrl":"jobItem.php","menuInfo":""},{"menuName":"套餐与增值包","menuUrl":"jobCharge.php","menuInfo":"","menuChild":[{"menuName":"套餐管理","menuMark":"jobCombo"},{"menuName":"添加套餐","menuMark":"jobComboAdd"},{"menuName":"增值包管理","menuMark":"jobPackage"},{"menuName":"添加增值包","menuMark":"jobPackageAdd"}]},{"menuName":"海报管理","menuUrl":"jobPoster.php","menuInfo":"","menuChild":[{"menuName":"添加海报","menuMark":"jobPosterAdd"},{"menuName":"修改海报","menuMark":"jobPosterEdit"},{"menuName":"删除海报","menuMark":"jobPosterDel"}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=job","menuInfo":"","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=job","menuInfo":"","city":1}]},{"menuName":"招聘管理","subMenu":[{"menuName":"企业管理","menuUrl":"jobCompany.php","menuInfo":"","city":1,"menuChild":[{"menuName":"添加企业","menuMark":"jobCompanyAdd","city":1},{"menuName":"修改企业","menuMark":"jobCompanyEdit","city":1},{"menuName":"删除企业","menuMark":"jobCompanyDel","city":1},{"menuName":"转交客户","menuMark":"jobCompanyDelivery","city":1},{"menuName":"释放客户","menuMark":"jobCompanyRelease","city":1}]},{"menuName":"客户管理与跟进","menuUrl":"jobCompanyGH.php","menuInfo":"","city":1,"menuChild":[{"menuName":"我的客户","menuMark":"jobCompanyMy"},{"menuName":"跟进记录","menuMark":"jobCompanyFollow"}]},{"menuName":"职位管理","menuUrl":"jobPost.php","menuInfo":"","city":1,"menuChild":[{"menuName":"添加职位","menuMark":"jobPostAdd","city":1},{"menuName":"修改职位","menuMark":"jobPostEdit","city":1},{"menuName":"删除职位","menuMark":"jobPostDel","city":1}]},{"menuName":"人才简历管理","menuUrl":"jobResume.php","menuInfo":"","city":1,"menuChild":[{"menuName":"添加简历","menuMark":"jobResumeAdd","city":1},{"menuName":"修改简历","menuMark":"jobResumeEdit","city":1},{"menuName":"删除简历","menuMark":"jobResumeDel","city":1}]},{"menuName":"投递记录","menuUrl":"jobDelivery.php","menuInfo":"","city":1},{"menuName":"面试日程","menuUrl":"jobInvitation.php","menuInfo":"","city":1},{"menuName":"刷新置顶记录","menuUrl":"jobRefresh.php","menuInfo":"","city":1,"menuChild":[{"menuName":"置顶记录","menuMark":"jobTop","city":1}]},{"menuName":"订单管理","menuUrl":"jobOrder.php","menuInfo":"","city":1,"menuChild":[{"menuName":"订单管理","menuMark":"jobOrder","city":1}]}]},{"menuName":"普工专区","subMenu":[{"menuName":"普工职位分类","menuUrl":"jobTypePg.php","menuInfo":"","city":0},{"menuName":"招聘信息","menuUrl":"jobSentence.php?type=0","menuInfo":"","city":1,"menuChild":[{"menuName":"添加招聘","menuMark":"jobSentencephptype0Add","city":1},{"menuName":"修改招聘","menuMark":"jobSentencephptype0Edit","city":1},{"menuName":"删除招聘","menuMark":"jobSentencephptype0Del","city":1}]},{"menuName":"求职信息","menuUrl":"jobSentence.php?type=1","menuInfo":"","city":1,"menuChild":[{"menuName":"添加求职","menuMark":"jobSentencephptype1Add","city":1},{"menuName":"修改求职","menuMark":"jobSentencephptype1Edit","city":1},{"menuName":"删除求职","menuMark":"jobSentencephptype1Del","city":1}]}]},{"menuName":"招聘会","subMenu":[{"menuName":"主办单位","menuUrl":"jobFairsOrganizer.php","menuInfo":"","city":1,"menuChild":[{"menuName":"添加主办单位","menuMark":"jobFairsOrganizerAdd","city":1},{"menuName":"修改主办单位","menuMark":"jobFairsOrganizerEdit","city":1},{"menuName":"删除主办单位","menuMark":"jobFairsOrganizerDel","city":1}]},{"menuName":"会场管理","menuUrl":"jobFairsCenter.php","menuInfo":"","city":1,"menuChild":[{"menuName":"添加会场","menuMark":"jobFairsCenterAdd","city":1},{"menuName":"修改会场","menuMark":"jobFairsCenterEdit","city":1},{"menuName":"删除会场","menuMark":"jobFairsCenterDel","city":1}]},{"menuName":"招聘会","menuUrl":"jobFairs.php","menuInfo":"","city":1,"menuChild":[{"menuName":"添加招聘会","menuMark":"jobFairsAdd","city":1},{"menuName":"修改招聘会","menuMark":"jobFairsEdit","city":1},{"menuName":"删除招聘会","menuMark":"jobFairsDel","city":1}]}]},{"menuName":"招聘资讯","subMenu":[{"menuName":"资讯分类","menuUrl":"jobNewsType.php","menuInfo":"","city":1},{"menuName":"资讯管理","menuUrl":"jobNewsList.php","menuInfo":"","city":1,"menuChild":[{"menuName":"修改资讯","menuMark":"jobNewsEdit","city":1},{"menuName":"删除资讯","menuMark":"jobNewsDel","city":1}]}]}]',
        'car' => '[{"menuName":"基本设置","subMenu":[{"menuName":"汽车设置","menuUrl":"carConfig.php","menuInfo":"汽车基本信息设置，包括:风格样式、附件水印管理、图集数量显示、平台服务范围以及车辆设备配置等"},{"menuName":"级别分类","menuUrl":"carlevel.php","menuInfo":"车辆级别分类设置"},{"menuName":"固定字段","menuUrl":"carItem.php","menuInfo":"车辆固定字段分类管理"},{"menuName":"品牌","menuUrl":"carBrand.php","menuInfo":"汽车品牌型号管理，注:品牌分类至少三级","menuChild":[{"menuName":"品牌分类","menuMark":"carBrandType"},{"menuName":"添加品牌","menuMark":"addCarBrand"},{"menuName":"修改品牌","menuMark":"editCarBrand"},{"menuName":"删除品牌","menuMark":"delCarBrand"}]},{"menuName":"委托卖车","menuUrl":"carentrust.php","menuInfo":"用户委托卖车信息","city":1},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=car","menuInfo":"汽车板块下广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=car","menuInfo":"汽车电脑端底部友情链接管理","city":1}]},{"menuName":"经销商","subMenu":[{"menuName":"认证属性","menuUrl":"carAuthAttr.php","menuInfo":"经销商认证属性设置","city":1},{"menuName":"新增经销商","menuUrl":"carStoreAdd.php","menuInfo":"新增经销商","city":1},{"menuName":"管理经销商","menuUrl":"carStoreList.php","menuInfo":"管理经销商","city":1,"menuChild":[{"menuName":"修改经销商","menuMark":"carStoreEdit","city":1},{"menuName":"删除经销商","menuMark":"carStoreDel","city":1}]},{"menuName":"添加顾问","menuUrl":"gwUserAdd.php","menuInfo":"汽车经销商添加顾问","city":1},{"menuName":"管理顾问","menuUrl":"gwUserList.php","menuInfo":"管理汽车商家顾问","city":1,"menuChild":[{"menuName":"修改顾问","menuMark":"gwUserEdit","city":1},{"menuName":"删除顾问","menuMark":"gwUserDel","city":1}]}]},{"menuName":"二手车","subMenu":[{"menuName":"发布二手车","menuUrl":"carAdd.php","menuInfo":"发布二手车信息","city":1},{"menuName":"管理二手车","menuUrl":"carList.php","menuInfo":"二手车信息管理","city":1,"menuChild":[{"menuName":"修改二手车","menuMark":"carEdit","city":1},{"menuName":"删除二手房","menuMark":"carDel","city":1}]}]},{"menuName":"汽车资讯","subMenu":[{"menuName":"资讯分类","menuUrl":"carNewsType.php","menuInfo":"汽车资讯分类","city":1},{"menuName":"添加资讯","menuUrl":"carNewsList.php?dopost=Add","menuInfo":"汽车资讯添加","city":1},{"menuName":"资讯管理","menuUrl":"carNewsList.php","menuInfo":"汽车资讯管理","city":1,"menuChild":[{"menuName":"修改资讯","menuMark":"carNewsEdit","city":1},{"menuName":"删除资讯","menuMark":"carNewsDel","city":1}]}]},{"menuName":"汽车报废","subMenu":[{"menuName":"申请列表","menuUrl":"carScrap.php","menuInfo":"查看提交的汽车报废数据"}]}]',
        'special' => '[{"menuName":"基本设置","subMenu":[{"menuName":"专题设置","menuUrl":"specialConfig.php","menuInfo":"专题基本设置管理"},{"menuName":"页面元素","menuUrl":"pageElement.php","menuInfo":"页面元素组件管理","menuChild":[{"menuName":"添加元素","menuMark":"pageElementAdd"},{"menuName":"修改元素","menuMark":"pageElementEdit"},{"menuName":"删除专题","menuMark":"pageElementDel"}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=special","menuInfo":"专题板块广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=special","menuInfo":"专题电脑端底部友情链接管理","city":1}]},{"menuName":"专题模版","subMenu":[{"menuName":"模板分类","menuUrl":"specialTempType.php","menuInfo":"专题模板分类管理"},{"menuName":"添加模版","menuUrl":"specialTempList.php?dopost=Add","menuInfo":"添加模版"},{"menuName":"模版列表","menuUrl":"specialTempList.php","menuInfo":"模版列表管理","menuChild":[{"menuName":"修改模板","menuMark":"specialTempEdit"},{"menuName":"删除模板","menuMark":"specialTempDel"}]}]},{"menuName":"专题管理","subMenu":[{"menuName":"专题分类","menuUrl":"specialType.php","menuInfo":"专题分类管理"},{"menuName":"新增专题","menuUrl":"specialAdd.php","menuInfo":"新增专题","city":1},{"menuName":"专题列表","menuUrl":"special.php","menuInfo":"专题列表管理","city":1,"menuChild":[{"menuName":"修改专题","menuMark":"specialEdit","city":1},{"menuName":"设计专题","menuMark":"specialDesign","city":1},{"menuName":"删除专题","menuMark":"specialDel","city":1}]}]}]',
        'website' => '[{"menuName":"基本设置","subMenu":[{"menuName":"自助建站设置","menuUrl":"websiteConfig.php","menuInfo":"自助建站基本信息设置，含:页面风格、附件水印等"},{"menuName":"功能模块","menuUrl":"websiteElement.php","menuInfo":"功能模块管理","menuChild":[{"menuName":"添加元素","menuMark":"websiteElementAdd"},{"menuName":"修改元素","menuMark":"websiteElementEdit"},{"menuName":"删除元素","menuMark":"websiteElementDel"}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=website","menuInfo":"自助建站广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=website","menuInfo":"自助建站电脑端底部友情链接管理","city":1}]},{"menuName":"建站模版","subMenu":[{"menuName":"模板分类","menuUrl":"websiteTempType.php","menuInfo":"建站模版分类管理"},{"menuName":"添加模版","menuUrl":"websiteTempList.php?dopost=Add","menuInfo":"建站预设模版管理"},{"menuName":"模版列表","menuUrl":"websiteTempList.php","menuInfo":"建站预设模版列表","menuChild":[{"menuName":"修改模板","menuMark":"websiteTempEdit"},{"menuName":"页面管理","menuMark":"websiteTempPages","menuChild":[{"menuName":"添加页面","menuMark":"websiteTempPagesAdd"},{"menuName":"修改页面","menuMark":"websiteTempPagesEdit"},{"menuName":"删除页面","menuMark":"websiteTempPagesDel"}]},{"menuName":"删除模板","menuMark":"websiteTempDel"}]}]},{"menuName":"网站管理","subMenu":[{"menuName":"新增网站","menuUrl":"websiteAdd.php","menuInfo":"新增自建网站","city":1},{"menuName":"网站列表","menuUrl":"website.php","menuInfo":"商家自建站网站列表","city":1,"menuChild":[{"menuName":"修改信息","menuMark":"websiteEdit","city":1},{"menuName":"设计网站","menuMark":"websiteDesign","city":1},{"menuName":"删除网站","menuMark":"websiteDel","city":1},{"menuName":"新闻中心","menuMark":"websiteArticle","city":1},{"menuName":"活动中心","menuMark":"websiteEvents","city":1},{"menuName":"产品展示","menuMark":"websiteProduct","city":1},{"menuName":"成功案例","menuMark":"websiteCase","city":1},{"menuName":"视频中心","menuMark":"websiteVideo","city":1},{"menuName":"全景展示","menuMark":"website360qj","city":1},{"menuName":"网站留言","menuMark":"websiteGuest","city":1}]}]}]',
        'dating' => '[{"menuName":"基本设置","subMenu":[{"menuName":"交友设置","menuUrl":"datingConfig.php","menuInfo":"互动交友基本信息配置、风格模板、远程附件、水印设置、婚恋平台信息、其他配置等"},{"menuName":"固定字段","menuUrl":"datingItem.php","menuInfo":"交友固定字段信息维护"},{"menuName":"兴趣爱好","menuUrl":"datingSkill.php","menuInfo":"用户兴趣爱好设置"},{"menuName":"封面管理","menuUrl":"datingCoverBg.php","menuInfo":"门店移动端背景图预设"},{"menuName":"礼物管理","menuUrl":"datingGift.php","menuInfo":"交友礼物列表"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=dating","menuInfo":"交友模块广告设置","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=dating","menuInfo":"交友电脑端首页友情链接设置","city":1},{"menuName":"现金提现","menuUrl":"datingwithdraw.php","menuInfo":"用户现金提现统计","city":1}]},{"menuName":"会员等级","subMenu":[{"menuName":"等级列表","menuUrl":"datingLevelList.php","city":1,"menuChild":[]},{"menuName":"特权设置","menuUrl":"datingLevelAuth.php","menuInfo":"交友等级特权设置"}]},{"menuName":"交友会员","subMenu":[{"menuName":"交友列表","menuUrl":"datingMember.php","city":1,"menuChild":[{"menuName":"相册管理","menuMark":"datingAlbum","city":1}]},{"menuName":"成功故事","menuUrl":"datingStory.php","menuInfo":"交友成功故事列表","city":1},{"menuName":"动态管理","menuUrl":"datingDynamicManager.php","menuInfo":"交友会员动态管理","city":1}]},{"menuName":"情感课堂","subMenu":[{"menuName":"信息列表","menuUrl":"datingSchool.php"},{"menuName":"信息分类","menuUrl":"datingSchoolType.php"}]}]',
        'quanjing' => '[{"menuName":"全景管理","subMenu":[{"menuName":"全景设置","menuUrl":"quanjingConfig.php","menuInfo":"全景模块的基本设置、风格管理、水印及远程附件等"},{"menuName":"全景分类","menuUrl":"quanjingType.php","menuInfo":"全景分类属性"},{"menuName":"添加全景","menuUrl":"quanjingAdd.php","menuInfo":"添加全景内容","city":1},{"menuName":"管理全景","menuUrl":"quanjingList.php","menuInfo":"管理全景信息","city":1,"menuChild":[{"menuName":"修改信息","menuMark":"editquanjing","city":1},{"menuName":"删除信息","menuMark":"delquanjing","city":1}]},{"menuName":"回收站","menuUrl":"quanjingList.php?recycle=1","menuInfo":"管理删除的全景信息","city":1},{"menuName":"评论管理","menuUrl":"quanjingCommon.php","menuInfo":"管理用户评论内容","city":1},{"menuName":"模板标签","menuUrl":"mytag.php?action=quanjing","menuInfo":"该功能适用于【拖拽专题】模块下【添加】--【应用】--【添加数据源】的功能，添加数据源填写的ID信息，为该页面创建的标签ID信息，输入标签后，可以选择调用","menuChild":[{"menuName":"新增标签","menuMark":"addquanjingMytag"},{"menuName":"修改标签","menuMark":"editquanjingMytag"},{"menuName":"删除标签","menuMark":"delquanjingMytag"},{"menuName":"标签模板","menuMark":"mytagTempquanjing","menuChild":[{"menuName":"添加模板","menuMark":"addmytagTempquanjing"},{"menuName":"修改模板","menuMark":"editmytagTempquanjing"},{"menuName":"删除模板","menuMark":"delmytagTempquanjing"}]}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=quanjing","menuInfo":"全景模块广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=quanjing","menuInfo":"全景电脑端首页底部友情链接信息","city":1}]}]',
        'waimai' => '[{"menuName":"基本设置","subMenu":[{"menuName":"外卖设置","menuUrl":"waimaiConfig.php","menuInfo":"外卖基本设置、骑手收入限制、订单状态变更条件、跑腿服务规则、准时宝相关条例和优惠推荐"},{"menuName":"跑腿分类设置","menuUrl":"waimailabelType.php","menuInfo":"跑腿服务预设分类设置"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=waimai","menuInfo":"外卖广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=waimai","menuInfo":"外卖电脑端底部友情链接管理","city":1}]},{"menuName":"统计","subMenu":[{"menuName":"外卖统计","menuUrl":"waimaiStatistics.php","menuInfo":"外卖订单统计","city":1,"menuChild":[{"menuName":"外卖营业额统计","menuMark":"waimaiStatisticsChartrevenue","city":1},{"menuName":"订单按天统计","menuMark":"waimaiStatisticsChartorder","city":1},{"menuName":"订单按时间段统计","menuMark":"waimaiStatisticsChartordertime","city":1},{"menuName":"配送员统计","menuMark":"waimaiStatisticsChartcourier","city":1},{"menuName":"财务结算","menuMark":"waimaiStatisticsFinancenew","city":1}]},{"menuName":"跑腿统计","menuUrl":"waimaiPaotuiStatistics.php","menuInfo":"跑腿订单统计","city":1,"menuChild":[{"menuName":"跑腿营业额统计","menuMark":"waimaiPaotuiStatisticsChartrevenue","city":1},{"menuName":"订单统计","menuMark":"waimaiPaotuiStatisticsChartorder","city":1},{"menuName":"配送员统计","menuMark":"waimaiPaotuiStatisticsChartcourier","city":1},{"menuName":"财务结算","menuMark":"waimaiPaotuiStatisticsFinancenew","city":1}]}]},{"menuName":"店铺管理","subMenu":[{"menuName":"店铺管理","menuUrl":"waimaiShop.php","menuInfo":"外卖店铺信息管理","city":1,"menuChild":[{"menuName":"添加店铺","menuMark":"waimaiShopAdd","city":1},{"menuName":"修改店铺","menuMark":"waimaiShopEdit","city":1},{"menuName":"删除店铺","menuMark":"waimaiShopDel","city":1},{"menuName":"商品分类","menuMark":"waimaiListType","city":1},{"menuName":"商品管理","menuMark":"waimaiList","city":1}]},{"menuName":"店铺分成","menuUrl":"waimaiFencheng.php","menuInfo":"外卖店铺分成管理","city":1,"menuChild":[{"menuName":"默认分成","menuMark":"defaultWaiMaiFenCheng","city":1}]},{"menuName":"打印机绑定","menuUrl":"waimaiPrintBinding.php","menuInfo":"外卖订单打印机关联设置","city":1,"menuChild":[]},{"menuName":"店铺分类","menuUrl":"waimaiType.php","menuInfo":"外卖店铺入驻分类管理","menuChild":[{"menuName":"添加分类","menuMark":"waimaiTypeAdd"},{"menuName":"修改分类","menuMark":"waimaiTypeEdit"},{"menuName":"删除分类","menuMark":"waimaiTypeDel"}]},{"menuName":"评论管理","menuUrl":"waimaiCommon.php","menuInfo":"用户订单评论管理","city":1}]},{"menuName":"订单管理","subMenu":[{"menuName":"订单列表","menuUrl":"waimaiOrder.php","menuInfo":"外卖订单列表，可查看每笔订单的详细情况","city":1,"menuChild":[{"menuName":"更新订单状态","menuMark":"updateWaimaiOrderState","city":1},{"menuName":"外卖订单设置配送员","menuMark":"updateWaimaiOrderCourier","city":1},{"menuName":"地图派单","menuMark":"waimaiOrderMap","city":1},{"menuName":"成功订单退款","menuMark":"waimaiSucOrderRefund","city":1},{"menuName":"失败订单退款","menuMark":"waimaiOrderRefund","city":1}]},{"menuName":"订单搜索","menuUrl":"waimaiOrderSearch.php","menuInfo":"根据相应条件对外卖订单进行搜索","city":1}]},{"menuName":"配送员管理","subMenu":[{"menuName":"配送员列表","menuUrl":"waimaiCourier.php","menuInfo":"配送员信息列表，可对配送基本信息、配送员收入进行查看或修改","city":1,"menuChild":[{"menuName":"新增配送员","menuMark":"waimaiCourierAdd","city":1},{"menuName":"修改配送员","menuMark":"waimaiCourierEdit","city":1},{"menuName":"修改敏感信息","menuMark":"waimaiSensitiveEdit","city":1},{"menuName":"删除配送员","menuMark":"waimaiCourierDelete","city":1},{"menuName":"配送员余额记录","menuMark":"waimaiCourierMoney","city":1,"menuChild":[{"menuName":"余额变动","menuMark":"waimaiCourierEditMoney","city":1},{"menuName":"删除变动记录","menuMark":"waimaiCourierDelMoney","city":1}]}]},{"menuName":"配送员位置","menuUrl":"waimaiCourierMap.php","menuInfo":"查看配送员当前所在位置","city":1},{"menuName":"配送员评论","menuUrl":"waimaiCourierCommon.php","menuInfo":"用户对配送员的评论","city":1},{"menuName":"配送员开停工日志","menuUrl":"waimaiCourierLog.php","menuInfo":"配送员开停工日志","city":1},{"menuName":"配送员提现记录","menuUrl":"waimaiTixianLog.php","menuInfo":"配送员提现记录","city":1}]},{"menuName":"优惠券","subMenu":[{"menuName":"优惠券发放列表","menuUrl":"waimaiQuanList.php","menuInfo":"优惠券发放列表"},{"menuName":"优惠券列表","menuUrl":"waimaiQuan.php","menuInfo":"优惠券列表"}]},{"menuName":"跑腿订单","subMenu":[{"menuName":"跑腿订单列表","menuUrl":"paotuiOrder.php","menuInfo":"跑腿订单列表","city":1},{"menuName":"跑腿订单搜索","menuUrl":"paotuiOrderSearch.php","menuInfo":"跑腿订单按条件搜索","city":1}]}]',
        'image' => '[{"menuName":"图片管理","subMenu":[{"menuName":"图片设置","menuUrl":"imageConfig.php","menuInfo":"图片模块基本信息设置、页面风格、自定义远程附件、URL链接规则等"},{"menuName":"图片分类","menuUrl":"imageType.php","menuInfo":"图片信息的分类管理"},{"menuName":"添加图片","menuUrl":"imageAdd.php","menuInfo":"添加图片内容","city":1},{"menuName":"管理图片","menuUrl":"imageList.php","menuInfo":"管理已有的图片","city":1,"menuChild":[{"menuName":"修改信息","menuMark":"editimage","city":1},{"menuName":"删除信息","menuMark":"delimage","city":1}]},{"menuName":"回收站","menuUrl":"imageList.php?action=image&recycle=1","menuInfo":"管理被删除的图片信息","city":1},{"menuName":"模板标签","menuUrl":"mytag.php?action=image","menuInfo":"该功能适用于【拖拽专题】模块下【添加】--【应用】--【添加数据源】的功能，添加数据源填写的ID信息，为该页面创建的标签ID信息，输入标签后，可以选择调用","menuChild":[{"menuName":"新增标签","menuMark":"addimageMytag"},{"menuName":"修改标签","menuMark":"editimageMytag"},{"menuName":"删除标签","menuMark":"delimageMytag"},{"menuName":"标签模板","menuMark":"mytagTempimage","menuChild":[{"menuName":"添加模板","menuMark":"addmytagTempimage"},{"menuName":"修改模板","menuMark":"editmytagTempimage"},{"menuName":"删除模板","menuMark":"delmytagTempimage"}]}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=image","menuInfo":"图片模块下的广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=image","menuInfo":"图片信息电脑端底部友情链接的管理","city":1}]}]',
        'tieba' => '[{"menuName":"贴吧管理","subMenu":[{"menuName":"贴吧设置","menuUrl":"tiebaConfig.php","menuInfo":"新闻模块基本信息设置、页面风格、远程附件、水印设置等"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=tieba","menuInfo":"贴吧模块下广告管理"},{"menuName":"贴吧分类","menuUrl":"tiebaType.php","menuInfo":"贴吧分类设置"},{"menuName":"帖子评论","menuUrl":"tiebaCommon.php","menuInfo":"用户帖子评论列表","city":1},{"menuName":"贴子管理","menuUrl":"tiebaList.php","menuInfo":"贴子管理","city":1,"menuChild":[{"menuName":"添加帖子","menuMark":"tiebaAdd","city":1},{"menuName":"修改帖子","menuMark":"tiebaEdit","city":1},{"menuName":"删除帖子","menuMark":"tiebaDel","city":1},{"menuName":"帖子评论","menuMark":"tiebaReply","city":1}]},{"menuName":"回收站","menuUrl":"recoveryList.php?recycle=1","menuInfo":"被删除帖子内容管理","city":1}]}]',
        'tuan' => '[{"menuName":"基本设置","subMenu":[{"menuName":"团购设置","menuUrl":"tuanConfig.php","menuInfo":"团购模块基本信息设置、页面风格、远程附件等"},{"menuName":"模板标签","menuUrl":"mytag.php?action=tuan","menuInfo":"该功能适用于【拖拽专题】模块下【添加】--【应用】--【添加数据源】的功能，添加数据源填写的ID信息，为该页面创建的标签ID信息，输入标签后，可以选择调用","menuChild":[{"menuName":"新增标签","menuMark":"addtuanMytag"},{"menuName":"修改标签","menuMark":"edittuanMytag"},{"menuName":"删除标签","menuMark":"deltuanMytag"},{"menuName":"标签模板","menuMark":"mytagTemptuan","menuChild":[{"menuName":"添加模板","menuMark":"addmytagTemptuan"},{"menuName":"修改模板","menuMark":"editmytagTemptuan"},{"menuName":"删除模板","menuMark":"delmytagTemptuan"}]}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=tuan","menuInfo":"团购模块的广告管理","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=tuan","menuInfo":"团购电脑端底部的友情链接管理","city":1}]},{"menuName":"商家管理","subMenu":[{"menuName":"分类管理","menuUrl":"tuanType.php","menuInfo":"团购商家分类管理，可对一级分类设定字段","menuChild":[{"menuName":"添加分类","menuMark":"addTuanType"},{"menuName":"修改分类","menuMark":"editTuanType"},{"menuName":"删除分类","menuMark":"editTuanType"},{"menuName":"字段管理","menuMark":"tuanItem","menuChild":[{"menuName":"添加字段","menuMark":"addTuanItem"},{"menuName":"修改字段","menuMark":"editTuanItem"},{"menuName":"删除字段","menuMark":"delTuanItem"}]}]},{"menuName":"商家列表","menuUrl":"tuanStore.php","menuInfo":"团购商家信息维护管理","city":1},{"menuName":"评论管理","menuUrl":"tuanCommon.php","menuInfo":"用户商家评论管理","city":1}]},{"menuName":"团购管理","subMenu":[{"menuName":"发布团购","menuUrl":"tuanAdd.php","menuInfo":"发布团购信息，团购参数、套餐内容及类型等","city":1},{"menuName":"团购列表","menuUrl":"tuanList.php","menuInfo":"团购商品列表","city":1,"menuChild":[{"menuName":"修改团购","menuMark":"editTuan","city":1},{"menuName":"删除团购","menuMark":"delTuan","city":1},{"menuName":"团购失败退款","menuMark":"refundTuanList","city":1}]},{"menuName":"管理订单","menuUrl":"tuanOrderList.php","menuInfo":"管理用户交易团购订单，可对订单进行退款操作","city":1,"menuChild":[{"menuName":"删除订单","menuMark":"delTuanOrder","city":1},{"menuName":"订单付款/退款","menuMark":"refundTuanOrder","city":1}]},{"menuName":"拼单管理","menuUrl":"tuanPinList.php","menuInfo":"用户拼团订单列表","city":1},{"menuName":"领券管理","menuUrl":"tuanVoucherList.php","menuInfo":"用户团购劵领取情况管理","city":1},{"menuName":"团购券管理","menuUrl":"tuanQuanList.php","menuInfo":"用户团购券使用状态查看，可协助商家消费登记","city":1,"menuChild":[{"menuName":"消费/取消","menuMark":"tuanQuanOpera","city":1}]}]},{"menuName":"统计","subMenu":[{"menuName":"团购统计","menuUrl":"tuanStatistics.php","menuInfo":"团购订单统计","menuChild":[{"menuName":"商城营业额统计","menuMark":"tuanStatisticsChartrevenue"},{"menuName":"订单按天统计","menuMark":"tuanStatisticsChartorder"},{"menuName":"订单按时间段统计","menuMark":"tuanStatisticsChartordertime"},{"menuName":"财务结算","menuMark":"tuanStatisticsFinancenew"}]}]}]',
        'huodong' => '[{"menuName":"活动管理","subMenu":[{"menuName":"活动设置","menuUrl":"huodongConfig.php","menuInfo":"活动模块的基本信息设置"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=huodong","menuInfo":"新增和管理广告位图片"},{"menuName":"活动分类","menuUrl":"huodongType.php","menuInfo":"新增和管理活动分类"},{"menuName":"活动评论","menuUrl":"huodongCommon.php","menuInfo":"查看用户对活动的评论，可以修改或删除评论"},{"menuName":"活动管理","menuUrl":"huodongList.php","menuInfo":"","city":1,"menuChild":[{"menuName":"修改活动","menuMark":"huodongEdit","city":1},{"menuName":"删除活动","menuMark":"huodongDel","city":1},{"menuName":"活动评论","menuMark":"huodongReply","city":1}]},{"menuName":"报名记录","menuUrl":"huodongReg.php","menuInfo":"查看活动的报名记录，可以对报名记录导入"},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=huodong","menuInfo":"新增和管理友情链接","city":1}]}]',
        'huangye' => '[{"menuName":"黄页管理","subMenu":[{"menuName":"黄页设置","menuUrl":"huangyeConfig.php","menuInfo":""},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=huangye","menuInfo":"","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=huangye","menuInfo":"","city":1}]}]',
        'video' => '[{"menuName":"视频管理","subMenu":[{"menuName":"视频设置","menuUrl":"videoConfig.php?action=video","menuIfo":"视频模块的基本设置"},{"menuName":"视频分类","menuUrl":"videoType.php?action=video","menuInfo":"新增和管理视频分类"},{"menuName":"视频专辑","menuUrl":"videoAlbum.php","menuInfo":"新增和管理视频专辑"},{"menuName":"添加视频","menuUrl":"videoAdd.php?action=video","menuInfo":"添加视频","city":1},{"menuName":"管理视频","menuUrl":"videoList.php?action=video","menuInfo":"","city":1,"menuChild":[{"menuName":"修改信息","menuMark":"editvideo","city":1},{"menuName":"删除信息","menuMark":"delvideo","city":1}]},{"menuName":"付费观看记录","menuUrl":"videoPayLogs.php","menuInfo":"查看视频的付费观看记录，可以将记录导出","city":1},{"menuName":"评论管理","menuUrl":"videoCommon.php","menuInfo":"查看用户对视频的评论，可以修改或删除评论"},{"menuName":"回收站","menuUrl":"videoList.php?action=video&recycle=1","menuInfo":"查看已经删除的视频，可以恢复或者彻底删除视频","city":1},{"menuName":"模板标签","menuUrl":"mytag.php?action=video","menuInfo":"","menuChild":[{"menuName":"新增标签","menuMark":"addvideoMytag"},{"menuName":"修改标签","menuMark":"editvideoMytag"},{"menuName":"删除标签","menuMark":"delvideoMytag"},{"menuName":"标签模板","menuMark":"mytagTempvideo","menuChild":[{"menuName":"添加模板","menuMark":"addmytagTempvideo"},{"menuName":"修改模板","menuMark":"editmytagTempvideo"},{"menuName":"删除模板","menuMark":"delmytagTempvideo"}]}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=video","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=video","menuInfo":"新增和管理友情链接","city":1}]}]',
        'vote' => '[{"menuName":"投票管理","subMenu":[{"menuName":"投票设置","menuUrl":"voteConfig.php","menuInfo":"投票模块的基本信息设置"},{"menuName":"投票管理","menuUrl":"voteList.php","menuInfo":"查看用户发布的投票信息，可以对投票信息进行审核或删除","city":1,"menuChild":[{"menuName":"删除投票","menuMark":"delVote","city":1}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=vote","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=vote","menuInfo":"新增和管理友情链接","city":1}]}]',
        'integral' => '[{"menuName":"基本设置","subMenu":[{"menuName":"商城设置","menuUrl":"integralConfig.php","menuInfo":"积分商城模块的基本信息设置"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=integral","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=integral","menuInfo":"新增和管理友情链接","city":1}]},{"menuName":"商品","subMenu":[{"menuName":"商品分类","menuUrl":"integralType.php","menuInfo":"","menuChild":[{"menuName":"添加分类","menuMark":"addIntegralType"},{"menuName":"修改分类","menuMark":"editIntegralType"},{"menuName":"删除分类","menuMark":"delIntegralType"}]},{"menuName":"上架新商品","menuUrl":"integralAdd.php","menuInfo":"添加新的积分商品","city":1},{"menuName":"商品管理","menuUrl":"integralList.php","menuInfo":"","city":1,"menuChild":[{"menuName":"修改商品","menuMark":"integralEdit","city":1},{"menuName":"删除商品","menuMark":"integralDel","city":1}]},{"menuName":"订单管理","menuUrl":"integralOrder.php","menuInfo":"查看用户提交的积分商品兑换订单，可以对订单进行发货","city":1,"menuChild":[{"menuName":"修改订单","menuMark":"integralOrderEdit","city":1},{"menuName":"删除订单","menuMark":"integralOrderDel","city":1}]}]}]',
        'live' => '[{"menuName":"基本设置","subMenu":[{"menuName":"直播设置","menuUrl":"liveConfig.php","menuInfo":"视频直播模块的基本信息设置"},{"menuName":"平台管理","menuUrl":"liveAccount.php","menuInfo":"配置阿里云直播平台信息","city":1},{"menuName":"直播分类","menuUrl":"liveType.php","menuInfo":"新增和管理直播分类","city":1},{"menuName":"直播管理","menuUrl":"liveList.php","menuInfo":"查看用户发布的直播，可以对直播进行审核","city":1},{"menuName":"主播管理","menuUrl":"liveAnchor.php","menuInfo":"查看所有直播用户信息","city":1},{"menuName":"礼物管理","menuUrl":"liveGift.php","menuInfo":"新增或删除礼物","city":1},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=live","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=live","menuInfo":"新增和管理友情链接","city":1}]}]',
        'homemaking' => '[{"menuName":"基本设置","subMenu":[{"menuName":"家政服务","menuUrl":"homemakingConfig.php","menuInfo":"家政模块的基本信息设置"},{"menuName":"固定字段","menuUrl":"homemakingItem.php","menuInfo":"发布家政信息需要用到的字段"},{"menuName":"家政分类","menuUrl":"homemakingType.php","menuInfo":"新增和管理家政分类","city":1},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=homemaking","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=homemaking","menuInfo":"新增和管理友情链接","city":1}]},{"menuName":"店铺","subMenu":[{"menuName":"认证属性","menuUrl":"homemakingAuthAttr.php","menuInfo":"家政店铺的认证属性","city":1},{"menuName":"新增店铺","menuUrl":"homemakingStoreAdd.php","menuInfo":"新增家政店铺","city":1},{"menuName":"管理店铺","menuUrl":"homemakingStoreList.php","menuInfo":"管理家政店铺，可以家政店铺信息进行修改","city":1,"menuChild":[{"menuName":"修改店铺","menuMark":"homemakingStoreEdit","city":1},{"menuName":"删除店铺","menuMark":"homemakingStoreDel","city":1}]},{"menuName":"添加服务人员","menuUrl":"personalAdd.php","menuInfo":"添加服务人员","city":1},{"menuName":"管理服务人员","menuUrl":"personalList.php","menuInfo":"管理服务人员","city":1,"menuChild":[{"menuName":"修改服务人员","menuMark":"personalEdit","city":1},{"menuName":"删除服务人员","menuMark":"personalDel","city":1}]},{"menuName":"添加保姆/月嫂","menuUrl":"nannyAdd.php","menuInfo":"添加保姆/月嫂","city":1},{"menuName":"管理保姆/月嫂","menuUrl":"nannyList.php","menuInfo":"管理保姆/月嫂","city":1,"menuChild":[{"menuName":"修改保姆/月嫂","menuMark":"nannyEdit","city":1},{"menuName":"删除保姆/月嫂","menuMark":"nannyDel","city":1}]}]},{"menuName":"家政管理","subMenu":[{"menuName":"发布家政","menuUrl":"homemakingAdd.php","menuInfo":"","city":1},{"menuName":"管理家政","menuUrl":"homemakingList.php","menuInfo":"","city":1,"menuChild":[{"menuName":"修改家政","menuMark":"homemakingEdit","city":1},{"menuName":"删除家政","menuMark":"homemakingDel","city":1}]},{"menuName":"管理订单","menuUrl":"homemakingOrderList.php","menuInfo":"","city":1,"menuChild":[{"menuName":"删除订单","menuMark":"delHomemakingOrder","city":1},{"menuName":"订单付款/退款","menuMark":"refundHomemakingOrder","city":1}]},{"menuName":"服务码管理","menuUrl":"homemakingQuanList.php","menuInfo":"","city":1,"menuChild":[{"menuName":"消费/取消","menuMark":"homemakingQuanOpera","city":1}]}]},{"menuName":"客服管理","subMenu":[{"menuName":"客服订单列表","menuUrl":"kefuOrder.php","menuInfo":"","city":1}]}]',
        'marry' => '[{"menuName":"基本设置","subMenu":[{"menuName":"婚嫁频道","menuUrl":"marryConfig.php","menuInfo":"婚嫁模块的基本信息设置"},{"menuName":"字段管理","menuUrl":"marryField.php","menuInfo":"发布婚嫁信息需要用的字段"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=marry","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=marry","menuInfo":"新增和管理友情链接","city":1}]},{"menuName":"店铺","subMenu":[{"menuName":"新增店铺","menuUrl":"marrystoreAdd.php","menuInfo":"新增婚嫁店铺","city":1},{"menuName":"管理店铺","menuUrl":"marrystoreList.php","menuInfo":"管理婚嫁店铺","city":1,"menuChild":[{"menuName":"修改店铺","menuMark":"marrystoreEdit","city":1},{"menuName":"删除店铺","menuMark":"marrystoreDel","city":1}]},{"menuName":"评论管理","menuUrl":"marryStoreCommon.php","menuInfo":"管理用户对婚嫁店铺的评论","city":1,"menuChild":[{"menuName":"修改评论","menuMark":"editmarryStoreCommon","city":1},{"menuName":"删除评论","menuMark":"delmarryStoreCommon","city":1}]}]},{"menuName":"酒店管理","subMenu":[{"menuName":"发布婚宴场地","menuUrl":"marryhotelfieldAdd.php","menuInfo":"发布婚宴场地","city":1},{"menuName":"管理婚宴场地","menuUrl":"marryhotelfieldList.php","menuInfo":"管理婚宴场地","city":1,"menuChild":[{"menuName":"修改婚宴场地","menuMark":"marryhotelfieldEdit","city":1},{"menuName":"删除婚宴场地","menuMark":"marryhotelfieldDel","city":1}]},{"menuName":"发布婚宴菜单","menuUrl":"marryhotelmenuAdd.php","menuInfo":"发布婚宴菜单","city":1},{"menuName":"管理婚宴菜单","menuUrl":"marryhotelmenuList.php","menuInfo":"管理婚宴菜单","city":1,"menuChild":[{"menuName":"修改婚宴菜单","menuMark":"marryhotelmenuEdit","city":1},{"menuName":"删除婚宴菜单","menuMark":"marryhotelmenuDel","city":1}]}]},{"menuName":"主持人管理","subMenu":[{"menuName":"发布主持人","menuUrl":"marryhostAdd.php","menuInfo":"发布主持人","city":1},{"menuName":"管理主持人套餐","menuUrl":"marryhostList.php","menuInfo":"管理主持人套餐","city":1,"menuChild":[{"menuName":"修改主持人","menuMark":"marryhostEdit","city":1},{"menuName":"删除主持人","menuMark":"marryhostDel","city":1}]},{"menuName":"发布主持人案例","menuUrl":"marryplancaseAdd.php?typeid=7","menuInfo":"发布主持人案例","city":1},{"menuName":"管理主持人案例","menuUrl":"marryplancaseList.php?typeid=7","menuInfo":"管理主持人案例","city":1,"menuChild":[{"menuName":"修改主持人案列","menuMark":"marryplancaseEdit7","city":1},{"menuName":"删除珠宝案列","menuMark":"marryplancaseDel7","city":1}]}]},{"menuName":"婚车管理","subMenu":[{"menuName":"发布婚车","menuUrl":"weddingcarAdd.php","menuInfo":"发布婚车","city":1},{"menuName":"管理婚车","menuUrl":"weddingcarList.php","menuInfo":"管理婚车","city":1,"menuChild":[{"menuName":"修改婚车","menuMark":"weddingcarEdit","city":1},{"menuName":"删除婚车","menuMark":"weddingcarDel","city":1}]},{"menuName":"评论管理","menuUrl":"marryStoreCommon.php?typeid=1","menuInfo":"管理用户对婚车的评论","city":1,"menuChild":[{"menuName":"修改评论","menuMark":"editmarryStoreCommon1","city":1},{"menuName":"删除评论","menuMark":"delmarryStoreCommon1","city":1}]},{"menuName":"发布婚车案例","menuUrl":"marryplancaseAdd.php?typeid=10","menuInfo":"发布婚车案例","city":1},{"menuName":"管理婚车案例","menuUrl":"marryplancaseList.php?typeid=10","menuInfo":"管理婚车案例","city":1,"menuChild":[{"menuName":"修改婚车案列","menuMark":"marryplancaseEdit10","city":1},{"menuName":"删除婚车案列","menuMark":"marryplancaseDel10","city":1}]}]},{"menuName":"婚纱摄影","subMenu":[{"menuName":"发布婚纱摄影套餐","menuUrl":"marryplanmealAdd.php?typeid=1","menuInfo":"发布婚纱摄影套","city":1},{"menuName":"管理婚纱摄影套餐","menuUrl":"marryplanmealList.php?typeid=1","menuInfo":"管理婚纱摄影套餐","city":1,"menuChild":[{"menuName":"修改婚纱摄影套餐","menuMark":"marryplanmealEdit1","city":1},{"menuName":"删除婚纱摄影套餐","menuMark":"marryplanmealDel1","city":1}]},{"menuName":"发布婚纱摄影案例","menuUrl":"marryplancaseAdd.php?typeid=1","menuInfo":"发布婚纱摄影案例","city":1},{"menuName":"管理婚纱摄影案例","menuUrl":"marryplancaseList.php?typeid=1","menuInfo":"管理婚纱摄影案例","city":1,"menuChild":[{"menuName":"修改婚纱摄影案列","menuMark":"marryplancaseEdit1","city":1},{"menuName":"删除婚纱摄影案列","menuMark":"marryplancaseDel1","city":1}]}]},{"menuName":"摄影跟拍","subMenu":[{"menuName":"发布摄影跟拍套餐","menuUrl":"marryplanmealAdd.php?typeid=2","menuInfo":"发布摄影跟拍套餐","city":1},{"menuName":"管理摄影跟拍套餐","menuUrl":"marryplanmealList.php?typeid=2","menuInfo":"管理摄影跟拍套餐","city":1,"menuChild":[{"menuName":"修改摄影跟拍套餐","menuMark":"marryplanmealEdit2","city":1},{"menuName":"删除摄影跟拍套餐","menuMark":"marryplanmealDel2","city":1}]},{"menuName":"发布摄影案例","menuUrl":"marryplancaseAdd.php?typeid=2","menuInfo":"发布摄影案例","city":1},{"menuName":"管理摄影案例","menuUrl":"marryplancaseList.php?typeid=2","menuInfo":"管理摄影案例","city":1,"menuChild":[{"menuName":"修改摄影案列","menuMark":"marryplancaseEdit2","city":1},{"menuName":"删除摄影案列","menuMark":"marryplancaseDel2","city":1}]}]},{"menuName":"珠宝首饰","subMenu":[{"menuName":"发布珠宝首饰套餐","menuUrl":"marryplanmealAdd.php?typeid=3","menuInfo":"发布珠宝首饰套餐","city":1},{"menuName":"管理珠宝首饰套餐","menuUrl":"marryplanmealList.php?typeid=3","menuInfo":"管理珠宝首饰套餐","city":1,"menuChild":[{"menuName":"修改珠宝首饰套餐","menuMark":"marryplanmealEdit3","city":1},{"menuName":"删除珠宝首饰套餐","menuMark":"marryplanmealDel3","city":1}]},{"menuName":"发布珠宝案例","menuUrl":"marryplancaseAdd.php?typeid=3","menuInfo":"发布珠宝案例","city":1},{"menuName":"管理珠宝案例","menuUrl":"marryplancaseList.php?typeid=3","menuInfo":"管理珠宝案例","city":1,"menuChild":[{"menuName":"修改珠宝案列","menuMark":"marryplancaseEdit3","city":1},{"menuName":"删除珠宝案列","menuMark":"marryplancaseDel3","city":1}]}]},{"menuName":"婚礼策划","subMenu":[{"menuName":"发布婚礼策划套餐","menuUrl":"marryplanmealAdd.php?typeid=9","menuInfo":"发布婚礼策划套餐","city":1},{"menuName":"管理婚礼策划套餐","menuUrl":"marryplanmealList.php?typeid=9","menuInfo":"管理婚礼策划套餐","city":1,"menuChild":[{"menuName":"修改婚礼策划套餐","menuMark":"marryplanmealEdit9","city":1},{"menuName":"删除婚礼策划套餐","menuMark":"marryplanmealDel9","city":1}]},{"menuName":"发布婚礼策划案例","menuUrl":"marryplancaseAdd.php?typeid=9","menuInfo":"发布婚礼策划案例","city":1},{"menuName":"管理婚礼策划案例","menuUrl":"marryplancaseList.php?typeid=9","menuInfo":"管理婚礼策划案例","city":1,"menuChild":[{"menuName":"修改婚礼策划案列","menuMark":"marryplancaseEdit9","city":1},{"menuName":"删除婚礼策划案列","menuMark":"marryplancaseDel9","city":1}]}]},{"menuName":"摄像跟拍","subMenu":[{"menuName":"发布摄像跟拍套餐","menuUrl":"marryplanmealAdd.php?typeid=4","menuInfo":"发布摄像跟拍套餐","city":1},{"menuName":"管理摄像跟拍套餐","menuUrl":"marryplanmealList.php?typeid=4","menuInfo":"管理摄像跟拍套餐","city":1,"menuChild":[{"menuName":"修改摄像跟拍套餐","menuMark":"marryplanmealEdit4","city":1},{"menuName":"删除摄像跟拍套餐","menuMark":"marryplanmealDel4","city":1}]},{"menuName":"发布摄像案例","menuUrl":"marryplancaseAdd.php?typeid=4","menuInfo":"发布摄像案例","city":1},{"menuName":"管理摄像案例","menuUrl":"marryplancaseList.php?typeid=4","menuInfo":"管理摄像案例","city":1,"menuChild":[{"menuName":"修改摄像案列","menuMark":"marryplancaseEdit4","city":1},{"menuName":"删除摄像案列","menuMark":"marryplancaseDel4","city":1}]}]},{"menuName":"新娘跟妆","subMenu":[{"menuName":"发布新娘跟妆套餐","menuUrl":"marryplanmealAdd.php?typeid=5","menuInfo":"发布新娘跟妆套餐","city":1},{"menuName":"管理新娘跟妆套餐","menuUrl":"marryplanmealList.php?typeid=5","menuInfo":"管理新娘跟妆套餐","city":1,"menuChild":[{"menuName":"修改新娘跟妆套餐","menuMark":"marryplanmealEdit5","city":1},{"menuName":"删除新娘跟妆套餐","menuMark":"marryplanmealDel5","city":1}]},{"menuName":"发布新娘案例","menuUrl":"marryplancaseAdd.php?typeid=5","menuInfo":"发布新娘案例","city":1},{"menuName":"管理新娘案例","menuUrl":"marryplancaseList.php?typeid=5","menuInfo":"管理新娘案例","city":1,"menuChild":[{"menuName":"修改新娘案列","menuMark":"marryplancaseEdit5","city":1},{"menuName":"删除新娘案列","menuMark":"marryplancaseDel5","city":1}]}]},{"menuName":"婚纱礼服","subMenu":[{"menuName":"发布婚纱礼服套餐","menuUrl":"marryplanmealAdd.php?typeid=6","menuInfo":"发布婚纱礼服套餐","city":1},{"menuName":"管理婚纱礼服套餐","menuUrl":"marryplanmealList.php?typeid=6","menuInfo":"管理婚纱礼服套餐","city":1,"menuChild":[{"menuName":"修改婚纱礼服套餐","menuMark":"marryplanmealEdit6","city":1},{"menuName":"删除婚纱礼服套餐","menuMark":"marryplanmealDel6","city":1}]},{"menuName":"发布婚纱案例","menuUrl":"marryplancaseAdd.php?typeid=6","menuInfo":"发布婚纱案例","city":1},{"menuName":"管理婚纱案例","menuUrl":"marryplancaseList.php?typeid=6","menuInfo":"管理婚纱案例","city":1,"menuChild":[{"menuName":"修改婚纱案列","menuMark":"marryplancaseEdit6","city":1},{"menuName":"删除婚纱案列","menuMark":"marryplancaseDel6","city":1}]}]}]',
        'travel' => '[{"menuName":"基本设置","subMenu":[{"menuName":"旅游频道","menuUrl":"travelConfig.php","menuInfo":"旅游模块的基本信息设置"},{"menuName":"旅游攻略分类","menuUrl":"travelstrategyType.php","menuInfo":"新增和删除旅游攻略分类","city":1},{"menuName":"租车分类","menuUrl":"travelrentcarType.php","menuInfo":"新增和删除租车分类","city":1},{"menuName":"签证地区","menuUrl":"travelvisacountryType.php","menuInfo":"新增和删除签证地区","city":1},{"menuName":"签证分类","menuUrl":"travelvisaType.php","menuInfo":"新增和删除签证分类","city":1},{"menuName":"所需材料","menuUrl":"travelItem.php","menuInfo":"新增和删除签证所需材料","city":1},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=travel","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=travel","menuInfo":"新增和管理友情链接","city":1}]},{"menuName":"店铺","subMenu":[{"menuName":"新增店铺","menuUrl":"travelstoreAdd.php","menuInfo":"新增旅游店铺","city":1},{"menuName":"管理店铺","menuUrl":"travelstoreList.php","menuInfo":"管理旅游店铺","city":1,"menuChild":[{"menuName":"修改店铺","menuMark":"travelstoreEdit","city":1},{"menuName":"删除店铺","menuMark":"travelstoreDel","city":1}]}]},{"menuName":"酒店管理","subMenu":[{"menuName":"发布酒店","menuUrl":"travelhotelAdd.php","menuInfo":"发布旅游酒店","city":1},{"menuName":"管理酒店","menuUrl":"travelhotelList.php","menuInfo":"管理旅游酒店","city":1,"menuChild":[{"menuName":"修改酒店","menuMark":"travelhotelEdit","city":1},{"menuName":"删除酒店","menuMark":"travelhotelDel","city":1}]},{"menuName":"管理订单","menuUrl":"travelOrderList.php?typeid=3","menuInfo":"管理旅游订单","city":1,"menuChild":[{"menuName":"删除订单","menuMark":"deltravelOrder","city":1},{"menuName":"订单付款/退款","menuMark":"refundtravelOrder","city":1}]},{"menuName":"评论管理","menuUrl":"travelCommon.php?typeid=5","menuInfo":"管理用户对旅游酒店的评论","city":1}]},{"menuName":"景点门票","subMenu":[{"menuName":"景点门票","menuUrl":"travelticketAdd.php","menuInfo":"新增景点门票","city":1},{"menuName":"管理景点","menuUrl":"travelticketList.php","menuInfo":"管理景点门票","city":1,"menuChild":[{"menuName":"修改景点","menuMark":"travelticketEdit","city":1},{"menuName":"删除景点","menuMark":"travelticketDel","city":1}]},{"menuName":"管理订单","menuUrl":"travelOrderList.php?typeid=1","menuInfo":"管理景点订单","city":1,"menuChild":[{"menuName":"删除订单","menuMark":"deltravelOrder","city":1},{"menuName":"订单付款/退款","menuMark":"refundtravelOrder","city":1}]},{"menuName":"评论管理","menuUrl":"travelCommon.php?typeid=2","menuInfo":"管理用户对景点的评论","city":1}]},{"menuName":"视频管理","subMenu":[{"menuName":"发布视频","menuUrl":"travelvideoAdd.php","menuInfo":"发布旅游相关视频","city":1},{"menuName":"管理视频","menuUrl":"travelvideoList.php","menuInfo":"管理旅游视频","city":1,"menuChild":[{"menuName":"修改视频","menuMark":"travelvideoEdit","city":1},{"menuName":"删除视频","menuMark":"travelvideoDel","city":1}]},{"menuName":"评论管理","menuUrl":"travelCommon.php","menuInfo":"管理用户对旅游视频的评论","city":1}]},{"menuName":"旅游攻略","subMenu":[{"menuName":"发布攻略","menuUrl":"travelstrategyAdd.php","menuInfo":"发布旅游攻略","city":1},{"menuName":"管理攻略","menuUrl":"travelstrategyList.php","menuInfo":"管理旅游攻略","city":1,"menuChild":[{"menuName":"修改攻略","menuMark":"travelstrategyEdit","city":1},{"menuName":"删除攻略","menuMark":"travelstrategyDel","city":1}]},{"menuName":"评论管理","menuUrl":"travelCommon.php?typeid=1","menuInfo":"管理用户对旅游攻略的评论","city":1}]},{"menuName":"租车管理","subMenu":[{"menuName":"发布租车","menuUrl":"travelrentcarAdd.php","menuInfo":"发布旅游租车信息","city":1},{"menuName":"管理租车","menuUrl":"travelrentcarList.php","menuInfo":"管理旅游租车信息","city":1,"menuChild":[{"menuName":"修改租车","menuMark":"travelrentcarEdit","city":1},{"menuName":"删除租车","menuMark":"travelrentcarDel","city":1}]}]},{"menuName":"旅游签证","subMenu":[{"menuName":"发布签证","menuUrl":"travelvisaAdd.php","menuInfo":"发布旅游签证","city":1},{"menuName":"管理签证","menuUrl":"travelvisaList.php","menuInfo":"管理旅游签证","city":1,"menuChild":[{"menuName":"修改签证","menuMark":"travelvisaEdit","city":1},{"menuName":"删除签证","menuMark":"travelvisaDel","city":1}]},{"menuName":"管理订单","menuUrl":"travelOrderList.php?typeid=4","menuInfo":"管理旅游签证订单","city":1,"menuChild":[{"menuName":"删除订单","menuMark":"deltravelOrder","city":1},{"menuName":"订单付款/退款","menuMark":"refundtravelOrder","city":1}]},{"menuName":"评论管理","menuUrl":"travelCommon.php?typeid=4","menuInfo":"管理用户对旅游签证的评论","city":1}]},{"menuName":"周边游","subMenu":[{"menuName":"发布周边游","menuUrl":"travelagencyAdd.php","menuInfo":"发布周边游","city":1},{"menuName":"管理周边游","menuUrl":"travelagencyList.php","menuInfo":"管理周边游","city":1,"menuChild":[{"menuName":"修改周边游","menuMark":"travelagencyEdit","city":1},{"menuName":"周边游","menuMark":"travelagencyDel","city":1}]},{"menuName":"管理订单","menuUrl":"travelOrderList.php?typeid=2","menuInfo":"管理周边游订单","city":1,"menuChild":[{"menuName":"删除订单","menuMark":"deltravelOrder","city":1},{"menuName":"订单付款/退款","menuMark":"refundtravelOrder","city":1}]},{"menuName":"评论管理","menuUrl":"travelCommon.php?typeid=3","menuInfo":"管理用户对周边游的评论","city":1}]},{"menuName":"客服管理","subMenu":[{"menuName":"客服订单列表","menuUrl":"kefuOrder.php","menuInfo":"查看客服订单","city":1}]}]',
        'education' => '[{"menuName":"基本设置","subMenu":[{"menuName":"教育培训","menuUrl":"educationConfig.php","menuInfo":"教育培训模块的基本信息设置"},{"menuName":"教育分类","menuUrl":"educationType.php","menuInfo":"新增和删除教育分类","city":1},{"menuName":"固定字段","menuUrl":"educationItem.php","menuInfo":"管理发布教育信息所需要用到的字段"},{"menuName":"留言管理","menuUrl":"educationWord.php","menuInfo":"管理用户对课程的留言","city":1},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=education","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=education","menuInfo":"新增和管理友情链接","city":1}]},{"menuName":"店铺","subMenu":[{"menuName":"新增店铺","menuUrl":"educationstoreAdd.php","menuInfo":"新增教育店铺","city":1},{"menuName":"管理店铺","menuUrl":"educationstoreList.php","menuInfo":"管理教育店铺","city":1,"menuChild":[{"menuName":"修改店铺","menuMark":"educationstoreEdit","city":1},{"menuName":"删除店铺","menuMark":"educationstoreDel","city":1}]},{"menuName":"管理教师","menuUrl":"educationteacherList.php","menuInfo":"管理教师","city":1,"menuChild":[{"menuName":"增加教师","menuMark":"educationteacherAdd","city":1},{"menuName":"修改教师","menuMark":"educationteacherEdit","city":1},{"menuName":"删除教师","menuMark":"educationteacherDel","city":1}]}]},{"menuName":"课程管理","subMenu":[{"menuName":"发布课程","menuUrl":"educationcoursesAdd.php","menuInfo":"发布教育课程","city":1},{"menuName":"管理课程","menuUrl":"educationcoursesList.php","menuInfo":"管理教育课程","city":1,"menuChild":[{"menuName":"修改课程","menuMark":"educationcoursesEdit","city":1},{"menuName":"删除课程","menuMark":"educationcoursesDel","city":1}]},{"menuName":"管理订单","menuUrl":"educationOrderList.php","menuInfo":"管理用户提交的课程订单","city":1,"menuChild":[{"menuName":"删除订单","menuMark":"deleducationOrder","city":1},{"menuName":"订单付款/退款","menuMark":"refundeducationOrder","city":1}]}]},{"menuName":"家教管理","subMenu":[{"menuName":"增加家教","menuUrl":"educationfamilyAdd.php","menuInfo":"新增家教","city":1},{"menuName":"管理家教","menuUrl":"educationfamilyList.php","menuInfo":"管理家教","city":1,"menuChild":[{"menuName":"修改家教","menuMark":"educationfamilyEdit","city":1},{"menuName":"删除家教","menuMark":"educationfamilyDel","city":1}]},{"menuName":"家教预约","menuUrl":"educationAppoint.php","menuInfo":"查看用户的家教预约信息","city":1}]}]',
        'pension' => '[{"menuName":"基本设置","subMenu":[{"menuName":"养老机构","menuUrl":"pensionConfig.php","menuInfo":"养老机构模块的基本信息设置"},{"menuName":"固定字段","menuUrl":"pensionItem.php","menuInfo":"管理发布养老信息所需要用到的字段"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=pension","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=pension","menuInfo":"新增和管理友情链接","city":1}]},{"menuName":"店铺","subMenu":[{"menuName":"新增店铺","menuUrl":"pensionstoreAdd.php","menuInfo":"新增养老店铺","city":1},{"menuName":"管理店铺","menuUrl":"pensionstoreList.php","menuInfo":"管理养老店铺","city":1,"menuChild":[{"menuName":"修改店铺","menuMark":"pensionstoreEdit","city":1},{"menuName":"删除店铺","menuMark":"pensionstoreDel","city":1},{"menuName":"相册管理","menuMark":"pensionalbumloupan","city":1,"menuChild":[{"menuName":"添加相册","menuMark":"pensionalbumAdd","city":1},{"menuName":"修改相册","menuMark":"pensionalbumEdit","city":1},{"menuName":"删除相册","menuMark":"pensionalbumDel","city":1}]}]},{"menuName":"邀请入驻","menuUrl":"pensionInvitate.php","menuInfo":"查看邀请入驻的老人信息","city":1},{"menuName":"入驻申请","menuUrl":"pensionApply.php","menuInfo":"查看用户申请入驻的信息","city":1},{"menuName":"机构预约","menuUrl":"pensionYuyue.php","menuInfo":"查看用户预约机构的信息","city":1},{"menuName":"评论管理","menuUrl":"pensionCommon.php","menuInfo":"查看用户对养老店铺的评论","city":1,"menuChild":[{"menuName":"修改评论","menuMark":"editpensionCommon","city":1},{"menuName":"删除评论","menuMark":"delpensionCommon","city":1}]}]},{"menuName":"老人信息","subMenu":[{"menuName":"新增老人","menuUrl":"pensionelderlyAdd.php","menuInfo":"新增老人","city":1},{"menuName":"管理老人","menuUrl":"pensionelderlyList.php","menuInfo":"管理老人","city":1,"menuChild":[{"menuName":"修改老人","menuMark":"pensionelderlyEdit","city":1},{"menuName":"删除老人","menuMark":"pensionelderlyDel","city":1}]}]}]',
        'circle' => '[{"menuName":"圈子管理","subMenu":[{"menuName":"圈子设置","menuUrl":"circleConfig.php","menuInfo":"圈子模块的基本信息设置"},{"menuName":"话题管理","menuUrl":"circleTopic.php","menuInfo":"添加和删除话题"},{"menuName":"动态管理","menuUrl":"circleList.php","menuInfo":"查看用户发布的圈子动态，可以对动态进行审核或删除"},{"menuName":"动态评论管理","menuUrl":"circleCommon.php","menuInfo":"查看用户对动态的评论"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=circle","menuInfo":"新增和管理广告位图片","city":1}]}]',
        'sfcar' => '[{"menuName":"顺风车管理","subMenu":[{"menuName":"顺风车设置","menuUrl":"sfcarConfig.php","menuInfo":"顺风车模块的基本信息设置"},{"menuName":"固定字段","menuUrl":"sfcarItem.php","menuInfo":"管理发布顺风车信息所需要用到的字段"},{"menuName":"顺风车信息管理","menuUrl":"sfcarList.php","menuInfo":"查看用户发布的顺风车新增，可以对信息进行审核或删除","city":1,"menuChild":[{"menuName":"修改信息","menuMark":"editsfcar","city":1},{"menuName":"删除信息","menuMark":"delsfcar","city":1}]},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=sfcar","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=sfcar","menuInfo":"新增和管理友情链接","city":1}]}]',
        'awardlegou' => '[{"menuName":"有奖乐购管理","subMenu":[{"menuName":"有奖乐购设置","menuUrl":"awardlegouConfig.php","menuInfo":"有奖乐购模块的基本信息设置"},{"menuName":"商品分类设置","menuUrl":"awardlegouType.php","menuInfo":"新增或删除发布有奖乐购商品需要用到的分类"},{"menuName":"商品管理","menuUrl":"awardlegouProList.php","menuInfo":"对商家发布的有奖乐购商品进行审核或删除","city":1,"menuChild":[{"menuName":"删除商品","menuMark":"awardlegouProListDel","city":1},{"menuName":"编辑商品","menuMark":"awardlegouProListEdit","city":1}]},{"menuName":"订单管理","menuUrl":"awardlegouOrderList.php","menuInfo":"查看用户提交的有奖乐购订单","city":1,"menuChild":""},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=awardlegou","menuInfo":"新增和管理友情链接","city":1}]}]',
        'paimai' => '[{"menuName":"基本设置","subMenu":[{"menuName":"拍卖设置","menuUrl":"paimaiConfig.php","menuInfo":"拍卖模块的基本信息设置"},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=paimai","menuInfo":"新增和管理广告位图片","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=paimai","menuInfo":"新增和管理友情链接","city":1}]},{"menuName":"商家管理","subMenu":[{"menuName":"分类管理","menuUrl":"paimaiType.php","menuInfo":"新增拍卖分类","menuChild":[{"menuName":"添加分类","menuMark":"addPaimaiType"},{"menuName":"修改分类","menuMark":"editPaimaiType"},{"menuName":"删除分类","menuMark":"editPaimaiType"},{"menuName":"字段管理","menuMark":"paiaiItem","menuChild":[{"menuName":"添加字段","menuMark":"addPaimaiItem"},{"menuName":"修改字段","menuMark":"editPaimaiItem"},{"menuName":"删除字段","menuMark":"delPaimaiItem"}]}]},{"menuName":"商家列表","menuUrl":"paimaiStore.php","menuInfo":"新增拍卖商家","city":1}]},{"menuName":"拍卖管理","subMenu":[{"menuName":"拍卖列表","menuUrl":"paimaiList.php","menuInfo":"查看商家发布的拍卖列表","city":1},{"menuName":"管理订单","menuUrl":"paimaiOrderList.php","menuInfo":"查看用户提交的拍卖订单","city":1}]}]',
        'task' => '[{"menuName":"基本设置","subMenu":[{"menuName":"任务设置","menuUrl":"taskConfig.php","menuInfo":"任务悬赏模块的基本信息设置","city":0},{"menuName":"任务类型","menuUrl":"taskType.php","menuInfo":"添加任务悬赏的类型","city":0},{"menuName":"自定义菜单","menuUrl":"taskMenu.php","menuInfo":"添加任务悬赏首页菜单","city":0},{"menuName":"商家中心链接","menuUrl":"taskBusinessLink.php","menuInfo":"添加商家中心的菜单链接","city":0},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=task","menuInfo":"新增和管理广告位图片","city":0},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=task","menuInfo":"新增和管理友情链接","city":0}]},{"menuName":"会员管理","subMenu":[{"menuName":"等级设置","menuUrl":"taskMemberLevel.php","menuInfo":"设置任务悬赏模块的会员等级","city":0},{"menuName":"会员管理","menuUrl":"taskMemberList.php","menuInfo":"管理任务悬赏模块的会员","city":0},{"menuName":"黑名单","menuUrl":"taskMemberBlack.php","menuInfo":"将违规用户添加到黑名单","city":0},{"menuName":"刷新道具","menuUrl":"taskRefreshPackage.php","menuInfo":"新增刷新套餐","city":0}]},{"menuName":"任务管理","subMenu":[{"menuName":"任务列表","menuUrl":"taskList.php","menuInfo":"查看用户发布的悬赏任务","city":0},{"menuName":"问题反馈","menuUrl":"taskFeedback.php","menuInfo":"查看用户对任务的反馈","city":0},{"menuName":"管理订单","menuUrl":"taskOrderList.php","menuInfo":"查看用户提交的悬赏订单","city":0},{"menuName":"举报维权","menuUrl":"taskReport.php","menuInfo":"查看用户对悬赏商家的举报","city":0}]}]',
        'zhaopin' => '[{"menuName":"基本设置","subMenu":[{"menuName":"招聘管理平台","menuUrl":"zhaopinOverview.php","menuInfo":"","city":1}]},{"menuName":"岗位管理","subMenu":[{"menuName":"全职岗位","menuUrl":"zhaopinPostList.php?tpl=quanzhiList","menuInfo":"","city":1},{"menuName":"兼职岗位","menuUrl":"zhaopinPostList.php?tpl=jianzhiList","menuInfo":"","city":1},{"menuName":"职位专区","menuUrl":"zhaopinPostZoneList.php","menuInfo":"","city":1}]},{"menuName":"企业管理","subMenu":[{"menuName":"企业库","menuUrl":"zhaopinCompanyList.php?tpl=companyList","menuInfo":"","city":1},{"menuName":"执照审核","menuUrl":"zhaopinCompanyLicenseList.php","menuInfo":"","city":1},{"menuName":"会员管理","menuUrl":"zhaopinCompanyList.php?tpl=companyVipList","menuInfo":"","city":1}]},{"menuName":"客户CRM","subMenu":[{"menuName":"Boss工作台","menuUrl":"zhaopinConsolePage.php","menuInfo":"","city":1},{"menuName":"销售商机","menuUrl":"salesPipeline.php","menuInfo":"","city":1},{"menuName":"销售工作台","menuUrl":"zhaopinSaleConsolePage.php","menuInfo":"","city":1},{"menuName":"外部客户","menuUrl":"zhaopinExtUserList.php?tpl=ExternalCust","menuInfo":"","city":1},{"menuName":"全部客户","menuUrl":"zhaopinCompanyList.php?tpl=companyCrmList","menuInfo":"","city":1},{"menuName":"我的客户","menuUrl":"zhaopinCompanyList.php?tpl=companyMyList","menuInfo":"","city":1},{"menuName":"公海客户","menuUrl":"zhaopinCompanyList.php?tpl=companySeaList","menuInfo":"","city":1},{"menuName":"老客户维护","menuUrl":"zhaopinCompanyList.php?tpl=companyCompleteList","menuInfo":"","city":1},{"menuName":"我的订单","menuUrl":"zhaopinOrderList.php?tpl=orderMyList","menuInfo":"","city":1},{"menuName":"未支付订单","menuUrl":"zhaopinOrderList.php?tpl=orderUnpaidList","menuInfo":"","city":1},{"menuName":"规则设置","menuUrl":"zhaopinConfig.php?tpl=crmConfig","menuInfo":""},{"menuName":"操作日志","menuUrl":"zhaopinLogs.php","menuInfo":"","city":1},{"menuName":"crm回收站","menuUrl":"zhaopinCompanyList.php?tpl=companyRecycleList","menuInfo":"","city":1}]},{"menuName":"人才管理","subMenu":[{"menuName":"运营工作台","menuUrl":"zhaopinOperationPage.php","menuInfo":"","city":1},{"menuName":"简历库","menuUrl":"zhaopinResumeList.php","menuInfo":"","city":1}]},{"menuName":"数据中心","subMenu":[{"menuName":"人才画像","menuUrl":"zhaopinUserPortrait.php","menuInfo":"","city":1},{"menuName":"简历来源分析","menuUrl":"zhaopinJobInfoZhongDuanPV.php","menuInfo":"","city":1},{"menuName":"日志记录","menuUrl":"zhaopinResumePostLog.php?tpl=LogDial","menuInfo":"","city":1}]},{"menuName":"注册用户","subMenu":[{"menuName":"用户管理","menuUrl":"zhaopinUserList.php?tpl=userManage","menuInfo":"","city":1}]},{"menuName":"应用中心","subMenu":[{"menuName":"职位推文模板","menuUrl":"zhaopinTemplateList.php?tpl=jobarticle","menuInfo":"","city":1},{"menuName":"简历推文模板","menuUrl":"zhaopinTemplateList.php?tpl=resumearticle","menuInfo":"","city":1},{"menuName":"招聘会","menuUrl":"zhaopinResumePostLog.php?tpl=zhaopinFair","menuInfo":"","city":1}]},{"menuName":"财务管理","subMenu":[{"menuName":"财务看板","menuUrl":"zhaopinSiteOrderReport.php","menuInfo":"","city":1},{"menuName":"订单管理","menuUrl":"zhaopinOrderList.php","menuInfo":"","city":1},{"menuName":"价格设置","menuUrl":"zhaopinPackageConfig.php","menuInfo":"","city":1},{"menuName":"开票申请管理","menuUrl":"zhaopinInvoiceList.php?type=1","menuInfo":"","city":1},{"menuName":"开票审核管理","menuUrl":"zhaopinInvoiceList.php?type=2","menuInfo":"","city":1}]},{"menuName":"资讯广告","subMenu":[{"menuName":"资讯管理","menuUrl":"zhaopinNewsList.php","menuInfo":"","city":1},{"menuName":"资讯分类","menuUrl":"zhaopinNewsType.php","menuInfo":""},{"menuName":"广告管理","menuUrl":"siteConfig/advList.php?action=zhaopin","menuInfo":"","city":1}]},{"menuName":"员工管理","subMenu":[{"menuName":"管理组","menuUrl":"member/adminGroup.php","menuInfo":"设定管理员小组及小组所属权限","menuChild":[{"menuName":"添加管理组","menuMark":"addAdminGroup"},{"menuName":"修改管理组","menuMark":"modifyAdminGroup"},{"menuName":"删除管理组","menuMark":"delAdminGroup"},{"menuName":"配置管理组权限","menuMark":"adminGroupPerm"}]},{"menuName":"管理员列表","menuUrl":"member/adminList.php","menuInfo":"查看管理员清单，进行资料维护和权限设置"},{"menuName":"添加管理员","menuUrl":"member/adminListAdd.php","menuInfo":"添加系统管理员帐号","city":1}]},{"menuName":"安全风控","subMenu":[{"menuName":"异常拨打","menuUrl":"zhaopinDialPTCList.php?tpl=abnLogDial","menuInfo":"","city":1},{"menuName":"异常投递","menuUrl":"zhaopinResumePostLog.php?tpl=abnLogRecords","menuInfo":"","city":1},{"menuName":"职位回收站","menuUrl":"zhaopinPostList.php?tpl=postRecover","menuInfo":"","city":1},{"menuName":"简历回收站","menuUrl":"zhaopinResumeList.php?tpl=resumeRecover","menuInfo":"","city":1}]},{"menuName":"系统设置","subMenu":[{"menuName":"基础设置","menuUrl":"zhaopinConfig.php?tpl=basicConfig","menuInfo":""},{"menuName":"用户权限","menuUrl":"zhaopinConfig.php?tpl=userConfig","menuInfo":""},{"menuName":"岗位类别","menuUrl":"zhaopinType.php","menuInfo":""},{"menuName":"行业类别","menuUrl":"zhaopinIndustry.php","menuInfo":""},{"menuName":"区域设置","menuUrl":"siteConfig/siteAddr.php","menuInfo":""},{"menuName":"SEO设置","menuUrl":"zhaopinConfig.php?tpl=seoConfig","menuInfo":""},{"menuName":"底部信息","menuUrl":"zhaopinConfig.php?tpl=footConfig","menuInfo":""},{"menuName":"客服信息","menuUrl":"zhaopinConfig.php?tpl=kefuConfig","menuInfo":"","city":1},{"menuName":"友情链接","menuUrl":"siteConfig/friendLink.php?action=zhaopin","menuInfo":"","city":1}]}]'
    );
    return $_defaultData;
}

function updateModuleNav($name){
    global $dsql;
    global $defaultData;

    $subnav = $defaultData[$name];
    if($subnav){
        $sql = $dsql->SetQuery("UPDATE `#@__site_module` SET `subnav` = '$subnav' WHERE `name` = '$name'");
        $dsql->dsqlOper($sql, "update");
    }
}