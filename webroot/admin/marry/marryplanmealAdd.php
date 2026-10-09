<?php
/**
 * 添加婚嫁套餐
 *
 * @version        $Id: marryplanmealAdd.php 2019-03-14 上午10:21:14 $
 * @package        HuoNiao.marry
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/marry";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "marryplanmealAdd.html";

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
}

$tab = "marry_planmeal";
$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改
if($dopost == "edit"){
	if($typeid == 0){
		$pagetitle = "修改婚嫁套餐";
        checkPurview("marryplanmealEdit");
    }elseif($typeid == 1){
		$pagetitle = "修改婚纱摄影套餐";
        checkPurview("marryplanmealEdit1");

    }elseif($typeid == 2){
		$pagetitle = "修改摄影跟拍套餐";
        checkPurview("marryplanmealEdit2");

    }elseif($typeid == 3){
		$pagetitle = "修改珠宝首饰套餐";
        checkPurview("marryplanmealEdit3");

    }elseif($typeid == 4){
		$pagetitle = "修改摄像跟拍套餐";
        checkPurview("marryplanmealEdit4");

    }elseif($typeid == 5){
		$pagetitle = "修改新娘跟妆套餐";
        checkPurview("marryplanmealEdit5");

    }elseif($typeid == 6){
		$pagetitle = "修改婚纱礼服套餐";
        checkPurview("marryplanmealEdit6");

    }elseif($typeid == 9){
        $pagetitle = "婚礼策划套餐";
        checkPurview("marryplanmealEdit9");

    }

}else{
	if($typeid == 0){
		$pagetitle = "添加婚嫁套餐";
        checkPurview("marryplanmealAdd");

    }elseif($typeid == 1){
		$pagetitle = "添加婚纱摄影套餐";
        checkPurview("marryplanmealAdd1");

    }elseif($typeid == 2){
		$pagetitle = "添加摄影跟拍套餐";
        checkPurview("marryplanmealAdd2");

    }elseif($typeid == 3){
		$pagetitle = "添加珠宝首饰套餐";
        checkPurview("marryplanmealAdd3");

    }elseif($typeid == 4){
		$pagetitle = "添加摄像跟拍套餐";
        checkPurview("marryplanmealAdd4");

    }elseif($typeid == 5){
		$pagetitle = "添加新娘跟妆套餐";
        checkPurview("marryplanmealAdd5");

    }elseif($typeid == 6){
		$pagetitle = "添加婚纱礼服套餐";
        checkPurview("marryplanmealAdd6");

    }elseif($typeid == 9){
        $pagetitle = "婚礼策划套餐";
        checkPurview("marryplanmealAdd9");

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
    if ($typeid == 1 ){
        //保存到表
        //婚纱摄影
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`xn_clothing`,`xl_clothing`,`clothing`,`hairstyle`,`shot`,`interior`,`location`,`psday`,`psnumber`,`jxnumber`,`rcnumber`,`xcnumber`,`xknumber`,`dresser`,`judge`,`pd`,`explain`,`explain_one`,`buynotice`,`note`,`xcexplain`,`xkexplain`,`tel`) VALUES ('$title','$userid','$comid', '$pics', '$tag', '$typeid', '$price', '$click', '$pubdate', '$weight', '$state','$planmealstyle','$style','$classification','$characteristicservice','$video','$xn_clothing','$xl_clothing','$clothing','$hairstyle','$shot','$interior','$location','$psday','$psnumber','$jxnumber','$rcnumber','$xcnumber','$xknumber','$dresser','$judge','$pd','$explain','$explain_one','$buynotice','$note','$xcexplain','$xkexplain','$tel')");
        $aid = $dsql->dsqlOper($archives, "lastid");

    }
    elseif ($typeid == 2){
        //保存到表
        //摄影跟拍
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`sy_team`,`explain`,`explain_one`,`explain_two`,`buynotice`,`note`,`tel`,`psnumber`,`jxnumber`) VALUES ('$title', '$userid','$comid', '$pics', '$tag', '$typeid', '$price', '$click', '$pubdate', '$weight', '$state','$planmealstyle','$style','$classification','$characteristicservice','$video','$sy_team','$explain','$explain_one','$explain_two','$buynotice','$note','$tel','$psnumber','$jxnumber')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }
    elseif ($typeid == 3){
        //保存到表
        //珠宝首饰
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`buynotice`,`note`,`tel`,`sy_team`,`sy_mv`,`judge`,`shape`) VALUES ('$title', '$userid','$comid', '$pics', '$tag', '$typeid','$price', '$click', '$pubdate', '$weight', '$state','$planmealstyle','$style','$classification','$characteristicservice','$video','$buynotice','$note','$tel','$sy_team','$sy_mv','$judge','$shape')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }
    elseif ($typeid == 4){
        //摄像跟拍
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`sy_team`,`sy_videotape`,`sy_mv`,`explain`,`explain_one`,`explain_two`,`buynotice`,`note`,`tel`) VALUES ('$title', '$userid','$comid', '$pics', '$tag', '$typeid', '$price', '$click', '$pubdate', '$weight', '$state','$planmealstyle','$style','$classification','$characteristicservice','$video','$sy_team','$sy_videotape','$sy_mv','$explain','$explain_one','$explain_two','$buynotice','$note','$tel')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }
    elseif ($typeid == 5){
        //新娘跟妆
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`, `company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`jxnumber`,`rcnumber`,`xcnumber`,`xknumber`,`dresser`,`pd`,`explain`,`explain_one`,`buynotice`,`note`,`tel`,`sy_team`,`explain_two`) VALUES ('$title', '$userid','$comid', '$pics', '$tag', '$typeid', '$price', '$click', '$pubdate', '$weight', '$state','$planmealstyle','$style','$classification','$characteristicservice','$video','$jxnumber','$rcnumber','$xcnumber','$xknumber','$dresser','$pd','$explain','$explain_one','$buynotice','$note','$tel','$sy_team','$explain_two')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }
    elseif ($typeid == 6){
        //婚纱礼服
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$tab."` (`title`,`userid`,`company`, `pics`, `tag`, `type`, `price`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`,`characteristicservice`,`video`,`xn_clothing`,`rcnumber`,`xl_clothing`,`dresser`,`pd`,`explain`,`buynotice`,`note`,`tel`,`clothing`) VALUES ('$title','$userid','$comid', '$pics', '$tag', '$typeid', '$price', '$click', '$pubdate', '$weight', '$state','$planmealstyle','$style','$classification','$characteristicservice','$video','$xn_clothing','$rcnumber','$xl_clothing','$dresser','$pd','$explain','$buynotice','$note','$tel','$clothing')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }else {
        $type = 9;
        $archives = $dsql->SetQuery("INSERT INTO `#@__" . $tab . "` (`title`,`userid`,`company`, `pics`, `click`, `pubdate`, `weight`, `state`,`planmealstyle`,`style`,`classification`, `characteristicservice`,`video`,`explain`,`explain_one`,`explain_two`,`dance`,`buynotice`,`planner`,`supervisor`,`host`,`photographer`,`cameraman`,`tel`,`colour`,`price`,`tag`,`type`) VALUES ('$title','$userid', '$comid', '$pics', '$click', '$pubdate', '$weight', '$state','$planmealstyle','$style','$classification','$characteristicservice','$video','$explain','$explain_one','$explain_two','$dance','$buynotice','$planner','$supervisor','$host','$photographer','$cameraman','$tel','$colour','$price','$tag','$type')");
        $aid = $dsql->dsqlOper($archives, "lastid");
    }


	if($aid){
        dataAsync("marry",$aid,"weddingphoto");  // 新增婚嫁套餐
        dataAsync("marry",$aid,"weddingggraphy");
        dataAsync("marry",$aid,"weddinggjewelry");
        dataAsync("marry",$aid,"weddingplan");
        dataAsync("marry",$aid,"weddingpo");
        dataAsync("marry",$aid,"weddingmakeup");
        dataAsync("marry",$aid,"weddingdress");
		adminLog($pagetitle, $userid);
		if($state == 1){
			updateCache("marry_planmeal_list", 300);
			clearCache("marry_planmeal_total", 'key');
		}
		$param = array(
			"service"  => "marry",
			"template" => "planmeal-detail",
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

	if($submit == "提交") {
	    if ($typeid == 1){
            //保存到表  婚纱摄影
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title',`userid` = '$userid' ,`company` = '$comid', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`style` = '$style',`classification` = '$classification',`characteristicservice` = '$characteristicservice',`video` = '$video',`xn_clothing` = '$xn_clothing',`xl_clothing` = '$xl_clothing',`clothing` = '$clothing',`hairstyle` = '$hairstyle',`shot` = '$shot',`interior` = '$interior',`location` = '$location',`psday` = '$psday',`psnumber` = '$psnumber',`jxnumber` = '$jxnumber',`rcnumber` = '$rcnumber',`xcnumber` = '$xcnumber',`xknumber` = '$xknumber',`dresser` = '$dresser',`judge` = '$judge',`pd` = '$pd',`explain` = '$explain',`explain_one` = '$explain_one',`buynotice` = '$buynotice',`note` = '$note',`xcexplain` = '$xcexplain',`xkexplain` = '$xkexplain',`tel` = '$tel' WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "update");

        }
        else    if ( $typeid == 2) {
            //摄影跟拍
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title',`userid` = '$userid' , `company` = '$comid', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`style` = '$style',`classification` = '$classification',`characteristicservice` = '$characteristicservice',`video` = '$video',`sy_team` = '$sy_team',`explain` = '$explain',`explain_one` = '$explain_one',`explain_two` = '$explain_two',`buynotice` = '$buynotice',`note` = '$note',`tel` = '$tel',`psnumber` = '$psnumber',`jxnumber` = '$jxnumber' WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "update");
        }
       elseif ($typeid == 3){
            //珠宝首饰
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title',`userid` = '$userid' , `company` = '$comid', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`style` = '$style',`classification` = '$classification',`characteristicservice` = '$characteristicservice',`video` = '$video',`buynotice` = '$buynotice',`note` = '$note',`tel` = '$tel',`sy_team` = '$sy_team',`sy_mv` = '$sy_mv',`judge` = '$judge',`shape` = '$shape' WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "update");
        }
        elseif ($typeid == 4){
            //摄像跟拍
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title',`userid` = '$userid' , `company` = '$comid', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`style` = '$style',`classification` = '$classification',`characteristicservice` = '$characteristicservice',`video` = '$video',`sy_team` = '$sy_team',`sy_videotape` = '$sy_videotape',`sy_mv` = '$sy_mv',`explain` = '$explain',`explain_one` = '$explain_one',`explain_two` = '$explain_two',`buynotice` = '$buynotice',`note` = '$note',`tel` = '$tel' WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "update");
        }
       elseif ($typeid == 5){
           //新娘跟妆
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title',`userid` = '$userid' , `company` = '$comid', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`style` = '$style',`classification` = '$classification',`characteristicservice` = '$characteristicservice',`video` = '$video',`jxnumber` = '$jxnumber',`rcnumber` = '$rcnumber',`xcnumber` = '$xcnumber',`xknumber` = '$xknumber',`dresser` = '$dresser',`pd` = '$pd',`sy_team` = '$sy_team',`explain` = '$explain',`explain_one` = '$explain_one',`buynotice` = '$buynotice',`note` = '$note',`tel` = '$tel',`explain_two` = '$explain_two' WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "update");
        }
        elseif ($typeid == 6){
            //婚纱礼服
            $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title',`userid` = '$userid' , `company` = '$comid', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `type` = '$typeid', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`style` = '$style',`classification` = '$classification',`characteristicservice` = '$characteristicservice',`video` = '$video',`xn_clothing` = '$xn_clothing',`xl_clothing` = '$xl_clothing',`rcnumber` = '$rcnumber',`dresser` = '$dresser',`pd` = '$pd',`explain` = '$explain',`buynotice` = '$buynotice',`note` = '$note',`tel` = '$tel',`clothing` = '$clothing' WHERE `id` = " . $id);
            $results = $dsql->dsqlOper($archives, "update");
        }else {
            $type = 9;

           $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `title` = '$title',`userid` = '$userid' , `company` = '$comid', `pics` = '$pics', `price` = '$price', `tag` = '$tag', `click` = '$click', `weight` = '$weight', `state` = '$state',`planmealstyle` = '$planmealstyle',`style` = '$style',`classification` = '$classification',`characteristicservice` = '$characteristicservice',`video` = '$video',`explain` = '$explain',`explain_one` = '$explain_one',`buynotice` = '$buynotice',`explain_two` = '$explain_two',`dance` = '$dance',`planner` ='$planner',`supervisor`='$supervisor',`host`='$host',`photographer` = '$photographer',`cameraman` = '$cameraman',`colour` = '$colour',`note` = '$note',`tel` = '$tel',`type` = '9' WHERE `id` = " . $id);
           $results = $dsql->dsqlOper($archives, "update");
       }
            if ($results == "ok") {
                adminLog($pagetitle, $id);

                checkCache("marry_planmeal_list", $id);
                clearCache("marry_planmeal_detail", $id);
                clearCache("marry_planmeal_total", 'key');

                $param = array(
                    "service" => "marry",
                    "template" => "planmeal-detail",
                    "id" => $id,
                    "typeid"   =>$typeid

                );
                $url = getUrlPath($param);

                echo '{"state": 100, "info": ' . json_encode('修改成功！') . ', "url": "' . $url . '"}';
            } else {
                echo '{"state": 200, "info": ' . json_encode('修改失败！') . '}';
            }
            die;

    }

	if(!empty($id)){

		//主表信息
		$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "results");

		if(!empty($results)){
            dataAsync("marry",$results[0]['id'],"weddingphoto");  // 修改婚嫁套餐
            dataAsync("marry",$results[0]['id'],"weddingggraphy");
            dataAsync("marry",$results[0]['id'],"weddinggjewelry");
            dataAsync("marry",$results[0]['id'],"weddingplan");
            dataAsync("marry",$results[0]['id'],"weddingpo");
            dataAsync("marry",$results[0]['id'],"weddingmakeup");
            dataAsync("marry",$results[0]['id'],"weddingdress");
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
		'admin/marry/marryplanmealAdd.js',
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
	$huoniaoTag->assign('atlasMax', $custom_marryplanmeal_atlasMax ? $custom_marryplanmeal_atlasMax : 9);

	if($id != ""){
		$huoniaoTag->assign('id', $id);

		$huoniaoTag->assign('comid', $company);
		$comSql = $dsql->SetQuery("SELECT `title` FROM `#@__marry_store` WHERE `id` = ". $company);
		$comname = $dsql->getTypeName($comSql);
		$huoniaoTag->assign('zjcom', $comname[0]['title']);

	}



    //婚纱摄影套餐类型
    $archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 20 ORDER BY `weight` ASC");
    $results = $dsql->dsqlOper($archives, "results");
    $list = array(0 => '请选择');
    foreach($results as $value){
        $list[$value['id']] = $value['typename'];
    }
    $huoniaoTag->assign('planmealstylelist', $list);
    $huoniaoTag->assign('planmealstyle', $planmealstyle == "" ? 0 : $planmealstyle);

    //婚纱摄影选择风格
    $stylearchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
    $styleresults = $dsql->dsqlOper($stylearchives, "results");
    $stylelist = array(0 => '请选择');
    foreach($styleresults as $v){
        $stylelist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('styleList', $stylelist);
    $huoniaoTag->assign('style', $style == "" ? 0 : $style);

    //摄像跟拍套餐类型
    $sx_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 56 ORDER BY `weight` ASC");
    $sx_results = $dsql->dsqlOper($sx_archives, "results");
    $sx_list = array(0 => '请选择');
    foreach($sx_results as $value){
        $sx_list[$value['id']] = $value['typename'];
    }
    $huoniaoTag->assign('sx_list', $sx_list);
    $huoniaoTag->assign('planmealstyle', $planmealstyle == "" ? 0 : $planmealstyle);
//摄像跟拍选择风格
    $sx_shexiang = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 61 ORDER BY `weight` ASC");
    $sx_results = $dsql->dsqlOper($sx_shexiang, "results");
    $sxlist = array(0 => '请选择');
    foreach($sx_results as $v){
        $sxlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('sxlist', $sxlist);
    $huoniaoTag->assign('classification', $classification == "" ? 0 : $classification);
//摄像跟拍选择类别
    $sx_leibie = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 58 ORDER BY `weight` ASC");
    $sx_leibieresults = $dsql->dsqlOper($sx_leibie, "results");
    $sx_leibielist = array(0 => '请选择');
    foreach($sx_leibieresults as $v){
        $sx_leibielist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('sx_leibielist', $sx_leibielist);
    $huoniaoTag->assign('style', $style == "" ? 0 : $style);
    //摄像跟拍 拍摄团队
    $sx_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 64 ORDER BY `weight` ASC");
    $sx_teamresults = $dsql->dsqlOper($sx_teamarchives, "results");
    $sx_teamlist = array(0 => '请选择');
    foreach($sx_teamresults as $v){
        $sx_teamlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('sx_teamlist', $sx_teamlist);
    $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);
    //婚纱摄影,选择婚纱场景
    $styleclassification = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 25 ORDER BY `weight` ASC");
    $classificationresult= $dsql->dsqlOper($styleclassification, "results");
    $classificationlist = array(0 => '请选择');
    foreach($classificationresult as $v){
        $classificationlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('classificationlist', $classificationlist);
    $huoniaoTag->assign('classification', $classification == "" ? 0 : $classification);
    //婚纱摄影新娘婚纱服装
    $stylexn_clothing = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 28 ORDER BY `weight` ASC");
    $xn_clothingresults = $dsql->dsqlOper($stylexn_clothing, "results");
    $clothixn_list = array(0 => '请选择');
    foreach($xn_clothingresults as $v){
        $clothixn_list[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('clothixn_list', $clothixn_list);
    $huoniaoTag->assign('xn_clothing', $xn_clothing == "" ? 0 : $xn_clothing);

    //婚纱摄影新郎婚纱服装
    $stylexl_clothing = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 31 ORDER BY `weight` ASC");
    $xl_clothingresults = $dsql->dsqlOper($stylexl_clothing, "results");
    $xl_clothinglist = array(0 => '请选择');
    foreach($xl_clothingresults as $v){
        $xl_clothinglist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('xl_clothinglist', $xl_clothinglist);
    $huoniaoTag->assign('xl_clothing', $xl_clothing == "" ? 0 : $xl_clothing);
    //婚纱摄影,拍摄场景
    $styleshot = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 35 ORDER BY `weight` ASC");
    $styleshotresults = $dsql->dsqlOper($styleshot, "results");
    $shotlist = array(0 => '请选择');
    foreach($styleshotresults as $v){
        $shotlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('shotlist', $shotlist);
    $huoniaoTag->assign('shot', $shot == "" ? 0 : $shot);
    //婚纱摄影,婚纱内景数量
    $styleinterior = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 39 ORDER BY `weight` ASC");
    $interiorresults = $dsql->dsqlOper($styleinterior, "results");
    $interiorlist = array(0 => '请选择');
    foreach($interiorresults as $v){
        $interiorlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('interiorlist', $interiorlist);
    $huoniaoTag->assign('interior', $interior == "" ? 0 : $interior);
    //婚纱摄影,婚纱外景数量
    $stylelocation = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 44 ORDER BY `weight` ASC");
    $locationresults = $dsql->dsqlOper($stylelocation, "results");
    $locationlist = array(0 => '请选择');
    foreach($locationresults as $v){
        $locationlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('locationlist', $locationlist);
    $huoniaoTag->assign('location', $location == "" ? 0 : $location);
    //婚纱摄影,拍摄天数
    $psdayarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 47 ORDER BY `weight` ASC");
    $psdayresults = $dsql->dsqlOper($psdayarchives, "results");
    $psdaylist = array(0 => '请选择');
    foreach($psdayresults as $v){
        $psdaylist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('psdaylist', $psdaylist);
    $huoniaoTag->assign('psday', $psday == "" ? 0 : $psday);
    //婚纱摄影,拍摄相册数量
    $xcnumberarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 50 ORDER BY `weight` ASC");
    $xcnumberresults = $dsql->dsqlOper($xcnumberarchives, "results");
    $xcnumberlist = array(0 => '请选择');
    foreach($xcnumberresults as $v){
        $xcnumberlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('xcnumberlist', $xcnumberlist);
    $huoniaoTag->assign('xcnumber', $xcnumber == "" ? 0 : $xcnumber);

    //婚纱摄影,拍摄相框数量
    $xknumberarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 53 ORDER BY `weight` ASC");
    $xknumberresults = $dsql->dsqlOper($xknumberarchives, "results");
    $xknumberlist = array(0 => '请选择');
    foreach($xknumberresults as $v){
        $xknumberlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('xknumberlist', $xknumberlist);
    $huoniaoTag->assign('xknumber', $xknumber == "" ? 0 : $xknumber);
    //珠宝首饰套餐分类
    $zhubaoarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 67 ORDER BY `weight` ASC");
    $zhubaoresults = $dsql->dsqlOper($zhubaoarchives, "results");
    $zhubaolist = array(0 => '请选择');
    foreach($zhubaoresults as $v){
        $zhubaolist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('zhubaolist', $zhubaolist);
    $huoniaoTag->assign('planmealstyle', $planmealstyle == "" ? 0 : $planmealstyle);
    //珠宝首饰选择材质
    $caizhiarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 70 ORDER BY `weight` ASC");
    $caizhiresults = $dsql->dsqlOper($caizhiarchives, "results");
    $caizhilist = array(0 => '请选择');
    foreach($caizhiresults as $v){
        $caizhilist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('caizhilist', $caizhilist);
    $huoniaoTag->assign('style', $style == "" ? 0 : $style);
    //珠宝首饰选择类型
    $zbarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 73 ORDER BY `weight` ASC");
    $zbresults = $dsql->dsqlOper($zbarchives, "results");
    $zblist = array(0 => '请选择');
    foreach($zbresults as $v){
        $zblist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('zblist', $zblist);
    $huoniaoTag->assign('classification', $classification == "" ? 0 : $classification);

    //摄影跟拍套餐类型
    $sy_archives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 77  ORDER BY `weight` ASC");
    $sy_results = $dsql->dsqlOper($sy_archives, "results");
    $sy_list = array(0 => '请选择');
    foreach($sy_results as $value){
        $sy_list[$value['id']] = $value['typename'];
    }
    $huoniaoTag->assign('sylist', $sy_list);
    $huoniaoTag->assign('planmealstyle', $planmealstyle == "" ? 0 : $planmealstyle);
    //摄影跟拍选择风格
    $sy_shexiang = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 81 ORDER BY `weight` ASC");
    $shexiangresults = $dsql->dsqlOper($sy_shexiang, "results");
    $shexianglist = array(0 => '请选择');
    foreach($shexiangresults as $v){
        $shexianglist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('shexianglist', $shexianglist);
    $huoniaoTag->assign('classification', $classification == "" ? 0 : $classification);
//摄影跟拍选择类别
    $sy_leibie = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 79 ORDER BY `weight` ASC");
    $sy_leibieresults = $dsql->dsqlOper($sy_leibie, "results");
    $sy_leibielist = array(0 => '请选择');
    foreach($sy_leibieresults as $v){
        $sy_leibielist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('leibielist', $sy_leibielist);
    $huoniaoTag->assign('style', $style == "" ? 0 : $style);
    //摄影跟拍 拍摄团队
    $sy_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 64 ORDER BY `weight` ASC");
    $sy_teamresults = $dsql->dsqlOper($sy_teamarchives, "results");
    $sy_teamlist = array(0 => '请选择');
    foreach($sy_teamresults as $v){
        $sy_teamlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('sy_teamlist', $sy_teamlist);
    $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);
    //新娘跟妆套餐
    $xn_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 84 ORDER BY `weight` ASC");
    $xn_teamresults = $dsql->dsqlOper($xn_teamarchives, "results");
    $xn_teamlist = array(0 => '请选择');
    foreach($xn_teamresults as $v){
        $xn_teamlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('xn_teamlist', $xn_teamlist);
    $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);
    //新娘跟妆选择风格
    $xnarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
    $xnresults = $dsql->dsqlOper($xnarchives, "results");
    $xnlist = array(0 => '请选择');
    foreach($xnresults as $v){
        $xnlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('xnlist', $xnlist);
    $huoniaoTag->assign('style', $style == "" ? 0 : $style);
    //新娘跟妆 化妆师资历
    $xn = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 64 ORDER BY `weight` ASC");
    $resultxn = $dsql->dsqlOper($xn, "results");
    $listnx = array(0 => '请选择');
    foreach($resultxn as $v){
        $listnx[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('listnx', $listnx);
    $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);
    //婚纱礼服套餐分类
    $hs = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 86 ORDER BY `weight` ASC");
    $resulths = $dsql->dsqlOper($hs, "results");
    $lisths = array(0 => '请选择');
    foreach($resulths as $v){
        $lisths[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('lisths', $lisths);
    $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);
    //婚纱礼服选择风格
    $hsarchives = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
    $hsarchives = $dsql->dsqlOper($hsarchives, "results");
    $hslist = array(0 => '请选择');
    foreach($hsarchives as $v){
        $hslist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('hslist', $hslist);
    $huoniaoTag->assign('style', $style == "" ? 0 : $style);
    //婚纱礼服套餐主推
    $hs_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 64 ORDER BY `weight` ASC");
    $hs_teamresults = $dsql->dsqlOper($hs_teamarchives, "results");
    $hs_teamlist = array(0 => '请选择');
    foreach($hs_teamresults as $v){
        $hs_teamlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('hs_teamlist', $hs_teamlist);
    $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);
    //婚纱礼服主推款式
    $zt_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 88 ORDER BY `weight` ASC");
    $zt_teamresults = $dsql->dsqlOper($zt_teamarchives, "results");
    $zt_teamlist = array(0 => '请选择');
    foreach($zt_teamresults as $v){
        $zt_teamlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('zt_teamlist', $zt_teamlist);
    $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);


    //婚纱礼服售卖方式
    $cs_teamarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 90 ORDER BY `weight` ASC");
    $cs_teamresults = $dsql->dsqlOper($cs_teamarchives, "results");
    $cs_teamlist = array(0 => '请选择');
    foreach($cs_teamresults as $v){
        $cs_teamlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('cs_teamlist', $cs_teamlist);
    $huoniaoTag->assign('sy_team', $sy_team == "" ? 0 : $sy_team);

    //策划管理 套餐分类
    $amarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 92 ORDER BY `weight` ASC");
    $aresults = $dsql->dsqlOper($amarchives, "results");
    $taocanlist = array(0 => '请选择');
    foreach($aresults as $v){
        $taocanlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('taocanlist', $taocanlist);
    $huoniaoTag->assign('planmealstyle', $planmealstyle == "" ? 0 : $planmealstyle);
    //策划管理 套餐风格
    $tcarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 22 ORDER BY `weight` ASC");
    $tcresults = $dsql->dsqlOper($tcarchives, "results");
    $tclist = array(0 => '请选择');
    foreach($tcresults as $v){
        $tclist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('tclist', $tclist);
    $huoniaoTag->assign('style', $style== "" ? 0 : $style);
    //策划管理 婚礼类别
    $hlarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 94 ORDER BY `weight` ASC");
    $hlresults = $dsql->dsqlOper($hlarchives, "results");
    $hllist = array(0 => '请选择');
    foreach($hlresults as $v){
        $hllist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('hllist', $hllist);
    $huoniaoTag->assign('classification', $classification== "" ? 0 : $classification);

    //策划管理 选择颜色
    $ysarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 97 ORDER BY `weight` ASC");
    $ysresults = $dsql->dsqlOper($ysarchives, "results");
    $yslist = array(0 => '请选择');
    foreach($ysresults as $v){
        $yslist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('yslist', $yslist);
    $huoniaoTag->assign('colour', $colour == "" ? 0 : $colour);
    //策划管理 策划师
    $plannerarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
    $plannerresults = $dsql->dsqlOper($plannerarchives, "results");
    $plannerlist = array(0 => '请选择');
    foreach($plannerresults as $v){
        $plannerlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('plannerlist', $plannerlist);
    $huoniaoTag->assign('planner', $planner== "" ? 0 : $planner);
    //策划管理 督导师
    $supervisorarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
    $supervisorresults = $dsql->dsqlOper($supervisorarchives, "results");
    $supervisorlist = array(0 => '请选择');
    foreach($supervisorresults as $v){
        $supervisorlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('supervisorlist', $supervisorlist);
    $huoniaoTag->assign('supervisor', $supervisor == "" ? 0 : $supervisor);
    //策划管理 主持人
    $hostarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
    $hostresults = $dsql->dsqlOper($hostarchives, "results");
    $hostlist = array(0 => '请选择');
    foreach($hostresults as $v){
        $hostlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('hostlist', $hostlist);
    $huoniaoTag->assign('host', $host == "" ? 0 : $host);
    //策划管理  摄影师
    $photographerarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
    $photographerresults = $dsql->dsqlOper($photographerarchives, "results");
    $photographerlist = array(0 => '请选择');
    foreach($photographerresults as $v){
        $photographerlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('photographerlist', $photographerlist);
    $huoniaoTag->assign('photographer', $photographer == "" ? 0 : $photographer);
    //策划管理  cameraman //摄像师
    $cameramanarchives  = $dsql->SetQuery("SELECT * FROM `#@__marryitem` WHERE `parentid` = 8 ORDER BY `weight` ASC");
    $cameramanresults = $dsql->dsqlOper($cameramanarchives, "results");
    $cameramanlist = array(0 => '请选择');
    foreach($cameramanresults as $v){
        $cameramanlist[$v['id']] = $v['typename'];
    }
    $huoniaoTag->assign('cameramanlist', $cameramanlist);
    $huoniaoTag->assign('cameraman', $cameraman == "" ? 0 : $cameraman);
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
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('typeid', $typeid);
	$huoniaoTag->assign('weight', $weight == "" || $weight == 0 ? "1" : $weight);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('pics', $pics ? json_encode(explode(",", $pics)) : "[]");
    $huoniaoTag->assign('planmealstyle', $planmealstyle);
    $huoniaoTag->assign('style', $style);
    $huoniaoTag->assign('classification', $classification);
    $huoniaoTag->assign('video', $video);
    $huoniaoTag->assign('xn_clothing', $xn_clothing);
    $huoniaoTag->assign('xl_clothing', $xl_clothing);
    $huoniaoTag->assign('clothing', $clothing);
    $huoniaoTag->assign('hairstyle', $hairstyle);
    $huoniaoTag->assign('shot', $shot);
    $huoniaoTag->assign('video', $video);
    $huoniaoTag->assign('tel', $tel);
    $huoniaoTag->assign('interior', $interior);
    $huoniaoTag->assign('location', $location);
    $huoniaoTag->assign('psday', $psday);
    $huoniaoTag->assign('psnumber', $psnumber);
    $huoniaoTag->assign('jxnumber', $jxnumber);
    $huoniaoTag->assign('rcnumber', $rcnumber);
    $huoniaoTag->assign('xcnumber', $xcnumber);
    $huoniaoTag->assign('xknumber', $xknumber);
    $huoniaoTag->assign('dresser', $dresser);
    $huoniaoTag->assign('judge', $judge);
    $huoniaoTag->assign('pd', $pd);
    $huoniaoTag->assign('explain', $explain);
    $huoniaoTag->assign('explain_one', $explain_one);
    $huoniaoTag->assign('explain_two', $explain_two);
    $huoniaoTag->assign('buynotice', $buynotice);
    $huoniaoTag->assign('note', $note);
    $huoniaoTag->assign('xcexplain', $xcexplain);
    $huoniaoTag->assign('xkexplain', $xkexplain);
    $huoniaoTag->assign('tag', $tag);
    $huoniaoTag->assign('tagSel', $tag ? explode("|", $tag) : array());
    $huoniaoTag->assign('sy_team', $sy_team);
    $huoniaoTag->assign('sy_videotape', $sy_videotape);
    $huoniaoTag->assign('sy_mv', $sy_mv);
    $huoniaoTag->assign('dance', $dance);
    $huoniaoTag->assign('buynotice', $buynotice);
    $huoniaoTag->assign('planner', $planner);
    $huoniaoTag->assign('supervisor', $supervisor);
    $huoniaoTag->assign('host', $host);
    $huoniaoTag->assign('photographer', $photographer);
    $huoniaoTag->assign('cameraman', $cameraman);
    $huoniaoTag->assign('tel', $tel);
    $huoniaoTag->assign('colour', $colour);
    $huoniaoTag->assign('price', $price);
    $huoniaoTag->assign('shape', $shape);



    //特色标签
	$tagArr = $custommarryTag ? explode("|", $custommarryTag) : array();
	$huoniaoTag->assign('tagArr', $tagArr);

	//显示状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已审核','审核拒绝'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	$huoniaoTag->assign('filter', $filter);

	$huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/marry";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
