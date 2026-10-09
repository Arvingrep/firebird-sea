<?php
/**
 * 添加商家案例
 *
 * @version        $Id: marryplancaseAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.marry
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/marry";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "marryplancaseAdd.html";

$typeid = $typeid ? $typeid : 0;

if($typeid == 1){
    $filter = 1;
}elseif($typeid == 2){
    $filter = 2;
}elseif($typeid == 3){
    $filter = 3;
}elseif($typeid == 4){
    $filter = 4;
}elseif($typeid ==5){
    $filter = 5;
}elseif($typeid == 6){
    $filter = 6;
}elseif($typeid == 7){
    $filter = 7;
}
elseif($typeid == 9){
    $filter = 9;
}elseif($typeid == 10){
    $filter = 10;
}
$tab = "marry_plancase";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
    if($typeid == 0){
        $pagetitle = "修改婚嫁案例";
        checkPurview("marryplancaseEdit");
    }elseif($typeid == 1){
        $pagetitle = "修改婚纱摄影案例";
        checkPurview("marryplancaseEdit1");
    }elseif($typeid == 2){
        $pagetitle = "修改摄影跟拍案例";
        checkPurview("marryplancaseEdit2");

    }elseif($typeid == 3){
        $pagetitle = "修改珠宝首饰案例";
        checkPurview("marryplancaseEdit3");

    }elseif($typeid == 4){
        $pagetitle = "修改摄像跟拍案例";
        checkPurview("marryplancaseEdit4");

    }elseif($typeid == 5){
        $pagetitle = "修改新娘跟妆案例";
        checkPurview("marryplancaseEdit5");

    }elseif($typeid == 6){
        $pagetitle = "修改婚纱礼服案例";
        checkPurview("marryplancaseEdit6");

    }elseif($typeid == 7){
        $pagetitle = "修改主持人案例";
        checkPurview("marryplancaseEdit7");

    }elseif($typeid == 10){
        $pagetitle = "修改婚车案例";
        checkPurview("marryplancaseEdit10");

    }


}else{
    if($typeid == 0){
        $pagetitle = "添加婚嫁案例";
    }elseif($typeid == 1){
        $pagetitle = "添加婚纱摄影案例";
        checkPurview("marryplancaseAdd1");

    }elseif($typeid == 2){
        $pagetitle = "添加摄影跟拍案例";
        checkPurview("marryplancaseAdd2");

    }elseif($typeid == 3){
        $pagetitle = "添加珠宝首饰案例";
        checkPurview("marryplancaseAdd3");

    }elseif($typeid == 4){
        $pagetitle = "添加摄像跟拍案例";
        checkPurview("marryplancaseAdd4");

    }elseif($typeid == 5){
        $pagetitle = "添加新娘跟妆案例";
        checkPurview("marryplancaseAdd5");

    }elseif($typeid == 6){
        $pagetitle = "添加婚纱礼服案例";
        checkPurview("marryplancaseAdd6");

    }elseif($typeid == 7){
        $pagetitle = "添加主持人案例";
        checkPurview("marryplancaseAdd7");

    }elseif($typeid == 10){
        $pagetitle = "添加婚车案例";
        checkPurview("marryplancaseAdd10");

    }
}
if(empty($comid)) $comid = 0;
if(empty($userid)) $userid = 0;
if(empty($weight)) $weight = 1;
if(empty($state)) $state = 0;
if(empty($click)) $click = mt_rand(50, 200);

if(!empty($characteristicservice)) $characteristicservice = join(",", $characteristicservice);
$joindate = GetMkTime(time());
$pubdate  = GetMkTime(time());
$holdingtime = GetMkTime($holdingtime);
if(!empty($tag)) $tag = join('|', $tag);

if($_POST['submit'] == "提交"){

	if($token == "") die('token传递失败！');

	if($comid == 0 && trim($comid) == ''){
		echo '{"state": 200, "info": "请选择婚嫁公司"}';
		exit();
	}
	if($comid == 0){
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `title` = '".$zjcom."'");
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "婚嫁公司不存在，请在联想列表中选择"}';
			exit();
		}
		$comid = $comResult[0]['id'];
	}else{
		$comSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_store` WHERE `id` = ".$comid);
		$comResult = $dsql->dsqlOper($comSql, "results");
		if(!$comResult){
			echo '{"state": 200, "info": "婚嫁公司不存在，请在联想列表中选择"}';
			exit();
		}
	}

	//检测是否已经注册
	if($dopost == "save"){

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_hotelfield` WHERE `title` = '".$title."'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它婚嫁公司，不可以重复添加！"}';
			exit();
		} */

	}else{

		/* $userSql = $dsql->SetQuery("SELECT `id` FROM `#@__marry_hotelfield` WHERE `title` = '".$title."' AND `id` != ". $id);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo '{"state": 200, "info": "此会员已经加入其它婚嫁公司，不可以重复添加！"}';
			exit();
		} */

	}

}
if($dopost == "save" && $submit == "提交"){
	//保存到表
    //婚纱摄影案例
    if ($typeid == 1){
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `holdingtime`, `hoteltitle`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`tag`,`typeid`,`note`) VALUES ('$title', '$userid','$comid', '$pics', '$holdingtime','$hoteltitle','$click','$pubdate','$weight','$state','$planmealstyle','$tag','$typeid','$note')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }elseif ($typeid == 2){
        //摄影跟拍案例
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `holdingtime`, `hoteltitle`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`tag`,`typeid`,`note`) VALUES ('$title', '$userid','$comid', '$pics', '$holdingtime','$hoteltitle','$click','$pubdate','$weight','$state','$planmealstyle','$tag','$typeid','$note')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }elseif ($typeid == 3){
        //珠宝首饰案例
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `holdingtime`, `hoteltitle`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`tag`,`typeid`,`note`) VALUES ('$title', '$userid','$comid', '$pics', '$holdingtime','$hoteltitle','$click','$pubdate','$weight','$state','$planmealstyle','$tag','$typeid','$note')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }elseif($typeid == 4){
        //摄像跟拍
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `holdingtime`, `hoteltitle`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`tag`,`typeid`,`note`) VALUES ('$title', '$userid','$comid', '$pics', '$holdingtime','$hoteltitle','$click','$pubdate','$weight','$state','$planmealstyle','$tag','$typeid','$note')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }elseif($typeid == 5){
        //新娘跟妆
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `holdingtime`, `hoteltitle`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`tag`,`typeid`,`note`) VALUES ('$title', '$userid','$comid', '$pics', '$holdingtime','$hoteltitle','$click','$pubdate','$weight','$state','$planmealstyle','$tag','$typeid','$note')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }elseif($typeid == 6){
        //婚纱礼服
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `holdingtime`, `hoteltitle`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`tag`,`typeid`,`note`) VALUES ('$title', '$userid','$comid', '$pics', '$holdingtime','$hoteltitle','$click','$pubdate','$weight','$state','$planmealstyle','$tag','$typeid','$note')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }elseif ($typeid == 7){
        //  主持人
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `holdingtime`, `hoteltitle`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`tag`,`typeid`,`note`) VALUES ('$title', '$userid','$comid', '$pics', '$holdingtime','$hoteltitle','$click','$pubdate','$weight','$state','$planmealstyle','$tag','$typeid','$note')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }elseif ($typeid == 10){
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `holdingtime`, `hoteltitle`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`tag`,`typeid`,`note`) VALUES ('$title', '$userid','$comid', '$pics', '$holdingtime','$hoteltitle','$click','$pubdate','$weight','$state','$planmealstyle','$tag','$typeid','$note')");
        $aid = $dsql->dsqlOper($archives, "lastid");

    }else{
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `holdingtime`, `hoteltitle`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`tag`,`typeid`,`note`) VALUES ('$title', '$userid','$comid', '$pics', '$holdingtime','$hoteltitle','$click','$pubdate','$weight','$state','$planmealstyle','$tag','9','$note')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }

	if($aid){
		adminLog("添加商家案例", $userid);
		if($state == 1){
			updateCache("marry_plancase_list", 300);
			clearCache("marry_plancase_total", 'key');
		}
		$param = array(
			"service"  => "marry",
			"template" => "plancase-detail",
			"id"       => $aid,
            "typeid"   =>$typeid
		);
		$url = getUrlPath($param);

		echo '{"state": 100, "url": "'.$url.'"}';
	}else{
		echo '{"state": 200, "info": '.json_encode("保存到数据库失败！").'}';
	}
	die;
}elseif($dopost == "edit"){

	if($submit == "提交"){
		//保存到表
        //编辑婚纱摄影案例
        if ($typeid == 1){
            $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `company` = '$comid', `pics` = '$pics', `holdingtime` = '$holdingtime', `hoteltitle` = '$hoteltitle', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`tag` = '$tag',`typeid` = '$typeid',`note` = '$note' WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");
        }elseif($typeid == 2){
            //摄影跟拍案例
            $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `company` = '$comid', `pics` = '$pics', `holdingtime` = '$holdingtime', `hoteltitle` = '$hoteltitle', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`tag` = '$tag',`typeid` = '$typeid',`note` = '$note' WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");

        }elseif($typeid == 3){
            //珠宝首饰案例
            $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `company` = '$comid', `pics` = '$pics', `holdingtime` = '$holdingtime', `hoteltitle` = '$hoteltitle', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`tag` = '$tag',`typeid` = '$typeid',`note` = '$note' WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");
        }elseif($typeid == 4){
            //摄像跟拍案例
            $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `company` = '$comid', `pics` = '$pics', `holdingtime` = '$holdingtime', `hoteltitle` = '$hoteltitle', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`tag` = '$tag',`typeid` = '$typeid' ,`note` = '$note'WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");
        }elseif ($typeid == 5){
            //新娘跟妆案例
            $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `title` = '$title', `company` = '$comid', `pics` = '$pics', `holdingtime` = '$holdingtime', `hoteltitle` = '$hoteltitle', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`tag` = '$tag',`typeid` = '$typeid',`note` = '$note' WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "update");

        }elseif ($typeid == 6) {
            //婚纱礼服
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title', `company` = '$comid', `pics` = '$pics', `holdingtime` = '$holdingtime', `hoteltitle` = '$hoteltitle', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`tag` = '$tag',`typeid` = '$typeid' ,`note` = '$note'WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "update");
        }elseif ($typeid ==7){
            //主持人
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title', `company` = '$comid', `pics` = '$pics', `holdingtime` = '$holdingtime', `hoteltitle` = '$hoteltitle', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`tag` = '$tag',`typeid` = '$typeid',`note` = '$note' WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "update");
        }elseif($typeid == 10){
            //婚车
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title', `company` = '$comid', `pics` = '$pics', `holdingtime` = '$holdingtime', `hoteltitle` = '$hoteltitle', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`tag` = '$tag',`typeid` = '$typeid' ,`note` = '$note' WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "update");
        }else{
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title', `company` = '$comid', `pics` = '$pics', `holdingtime` = '$holdingtime', `hoteltitle` = '$hoteltitle', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`tag` = '$tag',`typeid` = '9'  ,`note` = '$note' WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "update");
        }
		if($results == "ok"){
			adminLog("修改商家案例信息", $id);

			checkCache("marry_plancase_list", $id);
			clearCache("marry_plancase_detail", $id);
			clearCache("marry_plancase_total", 'key');

			$param = array(
				"service"  => "marry",
				"template" => "plancase-detail",
				"id"       => $id,
                "typeid"   =>$typeid

			);
			$url = getUrlPath($param);

			echo '{"state": 100, "info": '.json_encode('修改成功！').', "url": "'.$url.'"}';
		}else{
			echo '{"state": 200, "info": '.json_encode('修改失败！').'}';
		}
		die;
	}

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){

			foreach ($results[0] as $key => $value) {
				${$key} = $value;
			}

		}else{
			ShowMsg('要修改的信息不存在或已删除！', "-1");
			die;
		}

	}else{
		ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
		die;
	}

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//css
    $cssFile = array(
        'ui/jquery.chosen.css',
        'admin/chosen.min.css'
    );
    $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

	//js
	$jsFile = array(
		'ui/jquery.dragsort-0.5.1.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/marry/marryplancaseAdd.js',
        'ui/jquery.dragsort-0.5.1.min.js',
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('dopost', $dopost);
	require_once(HUONIAOINC."/config/marry.inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
	}
	$huoniaoTag->assign('atlasMax', $custom_marryplancase_atlasMax ? $custom_marryplancase_atlasMax : 9);

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__marry_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);
		
	}
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('holdingtime', $holdingtime ? date("Y-m-d H:i:s", $holdingtime) : '');
    $huoniaoTag->assign('hoteltitle', $hoteltitle);
	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "1" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");
    $huoniaoTag->assign('planmealstyle', $planmealstyle);
    $huoniaoTag->assign('style', $style);
    $huoniaoTag->assign('classification', $classification);
    $huoniaoTag->assign('characteristicservice', $characteristicservice);
    $huoniaoTag->assign('video', $video);
    $huoniaoTag->assign('explain', $explain);
    $huoniaoTag->assign('explain_one', $explain_one);
    $huoniaoTag->assign('explain_two', $explain_two);
    $huoniaoTag->assign('shot', $shot);
    $huoniaoTag->assign('buynotice', $buynotice);
    $huoniaoTag->assign('planner', $planner);
    $huoniaoTag->assign('supervisor', $supervisor);
    $huoniaoTag->assign('host', $host);
    $huoniaoTag->assign('photographer', $photographer);
    $huoniaoTag->assign('cameraman', $cameraman);
    $huoniaoTag->assign('tel', $tel);
    $huoniaoTag->assign('colour', $colour);
    $huoniaoTag->assign('price', $price);
    $huoniaoTag->assign('typeid', $typeid);
    $huoniaoTag->assign('note', $note);
    $huoniaoTag->assign('filter', $filter);




    //婚纱摄影套餐分类
            $amarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 20 ORDER BY `weight` ASC");
            $results = $dsql->dsqlOper($amarchives, "results");
            $planmealstylelist = array(0 => '请选择');
            foreach($results as $v){
                $planmealstylelist[$v['id']] = $v['typename'];
            }
            $huoniaoTag->assign('planmealstylelist', $planmealstylelist);
            $huoniaoTag->assign('planmealstyle', $planmealstyle == "" ? 0 : $planmealstyle);

            //摄影跟拍类型
            $syarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 77 ORDER BY `weight` ASC");
            $syresults = $dsql->dsqlOper($syarchives, "results");
            $sylist = array(0 => '请选择');
            foreach($syresults as $v){
                $sylist[$v['id']] = $v['typename'];
            }
            $huoniaoTag->assign('sylist', $sylist);
            $huoniaoTag->assign('planmealstyle', $planmealstyle == "" ? 0 : $planmealstyle);

    //  珠宝首饰类型
    $zbarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 67 ORDER BY `weight` ASC");
    $zbresults = $dsql->dsqlOper($zbarchives, "results");
    $zblist = array(0 => '请选择');
    foreach($zbresults as $v){
        $zblist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('zblist', $zblist);
    $huoniaoTag->assign('planmealstyle', $planmealstyle== "" ? 0 : $planmealstyle);
    //  摄像类型
    $sxarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 56 ORDER BY `weight` ASC");
    $sxresults = $dsql->dsqlOper($sxarchives, "results");
    $sxlist = array(0 => '请选择');
    foreach($sxresults as $v){
        $sxlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('sxlist', $sxlist);
    $huoniaoTag->assign('planmealstyle', $planmealstyle== "" ? 0 : $planmealstyle);
    //  新娘跟妆类型
    $xnarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 84 ORDER BY `weight` ASC");
    $xnresults = $dsql->dsqlOper($xnarchives, "results");
    $xnlist = array(0 => '请选择');
    foreach($xnresults as $v){
        $xnlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('xnlist', $xnlist);
    $huoniaoTag->assign('planmealstyle', $planmealstyle== "" ? 0 : $planmealstyle);
    //  婚纱礼服类型
    $lfarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 86 ORDER BY `weight` ASC");
    $lfresults = $dsql->dsqlOper($lfarchives, "results");
    $lflist = array(0 => '请选择');
    foreach($lfresults as $v){
        $lflist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('lflist', $lflist);
    $huoniaoTag->assign('planmealstyle', $planmealstyle== "" ? 0 : $planmealstyle);
    //  主持人类型
    $zcarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 4 ORDER BY `weight` ASC");
    $zcresults = $dsql->dsqlOper($zcarchives, "results");
    $zclist = array(0 => '请选择');
    foreach($zcresults as $v){
        $zclist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('zclist', $zclist);
    $huoniaoTag->assign('planmealstyle', $planmealstyle== "" ? 0 : $planmealstyle);
    //  婚车类型
    $hcarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 10 ORDER BY `weight` ASC");
    $hcresults = $dsql->dsqlOper($hcarchives, "results");
    $hclist = array(0 => '请选择');
    foreach($hcresults as $v){
        $hclist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('hclist', $hclist);
    $huoniaoTag->assign('planmealstyle', $planmealstyle== "" ? 0 : $planmealstyle);
    //  婚礼策划  类型
    $charchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 92 ORDER BY `weight` ASC");
    $chresults = $dsql->dsqlOper($charchives, "results");
    $chlist = array(0 => '请选择');
    foreach($chresults as $v){
        $chlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('chlist', $chlist);
    $huoniaoTag->assign('planmealstyle', $planmealstyle== "" ? 0 : $planmealstyle);
    //特色标签
    $tagArr = $custommarryTag ? explode("|", $custommarryTag) : array();
    $huoniaoTag->assign('tagArr', $tagArr);
    //特色
    $chararchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 16 ORDER BY `weight` ASC");
    $charresults = $dsql->dsqlOper($chararchives, "results");
    $characterslist = array();
    $charactersval = array();
    foreach($charresults as $value){
        array_push($characterslist, $value['typename']);
        array_push($charactersval, $value['id']);
    }
    $huoniaoTag->assign('characterslist', $characterslist);
    $huoniaoTag->assign('charactersval', $charactersval);
    $huoniaoTag->assign('characteristicservice', explode(",", $characteristicservice));

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/marry";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
