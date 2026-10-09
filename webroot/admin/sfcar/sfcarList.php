<?php
/**
 * 管理分类信息
 *
 * @version        $Id: sfcarList.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.sfcar
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("sfcarList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/sfcar";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "sfcarList.html";

global $handler;
$handler = true;

$action = "sfcar";
$now = GetMkTime(time());

require(HUONIAOINC . "/config/sfcar.inc.php");
$displayConfig = $custom_displayConfig ? unserialize($custom_displayConfig) : array(
    array('title' => '人找车', 'subtitle' => '乘用载货'),
    array('title' => '车找人', 'subtitle' => '找客找货'),
);

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

    if($sKeyword != ""){
		$where .= " AND (`startaddr` like '%$sKeyword%' OR `endaddr` like '%$sKeyword%'  OR `accessaddr` like '%$sKeyword%')";
	}

	// if($sType != ""){
	// 	if($dsql->getTypeList($sType, "sfcaritem")){
	// 		global $arr_data;
	// 		$arr_data = array();
	// 		$lower = arr_foreach($dsql->getTypeList($sType, "sfcaritem"));
	// 		$lower = $sType.",".join(',',$lower);
	// 	}else{
	// 		$lower = $sType;
	// 	}
	// 	$where .= " AND `typeid` in ($lower)";
	// }

	if($type!=''){
		$where .= " AND `type`  = ".$type;
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."_list` WHERE `waitpay` = 0");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0 ".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1 ".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");
	//取消显示
	// $totalNoshow = $dsql->dsqlOper($archives." AND `arcrank` = 3".$where, "totalCount");

	if($state != "" && $state != 4){
		$where .= " AND `state` = $state";


		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}

	//筛选已经过期的信息
	// if($state == 4){
	// 	$where .= " AND (`valid` < ".$now." OR `valid` = 0)";
	// 	$totalPage = ceil($totalValid/$pagestep);
	// }


	$where .= " order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_list` WHERE `waitpay` = 0".$where);
	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] 			= $value["id"];
			$list[$key]["type"] 		= $value["type"];
			$list[$key]["usetype"] 		= $value["usetype"];
			$list[$key]["missiontype"] 	= $value["missiontype"];
			// $list[$key]["missiontime"] 	= $value["missiontime"];
			$list[$key]["userid"] 		= $value["userid"];
			$list[$key]["username"] 	= $value["username"];
			$list[$key]["tel"] 			= $value["tel"];
			$list[$key]["tag"] 			= $value["tag"];
			$list[$key]["number"] 		= $value["number"];
			$list[$key]["carseat"] 		= $value["carseat"];
			$list[$key]["note"] 		= $value["note"];
			$list[$key]["piclsit"] 		= $value["piclsit"];
			$list[$key]["accessaddr"] 	= $value["accessaddr"];
			$list[$key]["cartype"] 		= $value["cartype"];
			$list[$key]["startaddr"] 	= $value["startaddr"];
			$list[$key]["endaddr"] 		= $value["endaddr"];
			$list[$key]["pubdate"] 		= $value["pubdate"];
			$list[$key]["state"] 		= $value["state"];
			$list[$key]["onclick"] 		= $value["onclick"];
			$list[$key]["areaCode"] 	= $value["areaCode"];

            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] 	= $cityname;

        	if($value["usetype"] ==0){

        		$typename1 = '载人';
        	}else{

        		$typename1 = '载货';
        	}

            if($value["type"] == 0){

            	$typename = $displayConfig[0]['title'] . "(".$typename1.")";
            }else{

            	$typename = $displayConfig[1]['title'] . "(".$typename1.")";
            }
			//分类
			$list[$key]["type"] 		= $typename;

			$state = "";
			switch($value["state"]){
				case "0":
					$state = "等待审核";
					break;
				case "1":
					$state = "审核通过";
					break;
				case "2":
					$state = "审核拒绝";
					break;

			}

			$list[$key]["state"] = $state;

			if($value["missiontype"] == 0){

				$missiontype = "单次";
			}else{
				$missiontype = "天天";
			}

			$list[$key]["missiontime"] = $value["missiontime"]."<br />(".$missiontype.")";

			//会员信息
			$list[$key]['userid'] = $value['userid'];
			$username = "";
			$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value['userid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$username = $ret[0]['username'];
			}
			$list[$key]['username'] = $username;

			$list[$key]["date"] = date('y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"     => "sfcar",
				"template"    => "detail",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "articleList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("delsfcar")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){
		$each = explode(",", $id);
		$error = array();
		$title = array();
        $async = array();
		foreach($each as $val){
			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_list` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }

			checkArticleCache($val);
		}
		dataAsync("sfcar",$async); // 删除顺风车
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除分类信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;
	}
	die;

//删除所有待审核信息
}elseif($dopost == "delAllGray"){
	if(!testPurview("delsfcar")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_list` WHERE `state` = 0");
	$results = $dsql->dsqlOper($archives, "results");
	if($results){
		foreach ($results as $key => $value) {

			$results = explode(",", $value['piclsit']);


			//删除图片文件
			if(!empty($results)){
				$atlasPic = "";
				foreach($results as $k => $v){
					$atlasPic .= $v['picPath'].",";
				}
				delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", $action);
			}

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."_list` WHERE `id` = ".$value['id']);
			$dsql->dsqlOper($archives, "update");
		}

	}
	die;



//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("editsfcar")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){


			//查询信息之前的状态
			$sql = $dsql->SetQuery("SELECT `startaddr`, `endaddr`,`state`, `userid`, `pubdate` FROM `#@__".$action."_list` WHERE `id` = $val");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){

				$title    = $ret[0]['startaddr']."到".$ret[0]['endaddr'];
				$arcrank_ = $ret[0]['state'];
				$userid   = $ret[0]['userid'];
				$pubdate  = $ret[0]['pubdate'];

				//会员消息通知
				if($arcrank != $arcrank_){

					$state = "";
					$status = "";

					//等待审核
					if($arcrank == 0){
						$state = 0;
						$status = "进入等待审核状态。";

					//已审核
					}elseif($arcrank == 1){
						$state = 1;
						$status = "已经通过审核。";
                        $countIntegral = countIntegral($userid);    //统计积分上限
                        global $cfg_returnInteraction_sfcar;    //顺风车积分
                        global $cfg_returnInteraction_commentDay;
                        if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_sfcar >0) {
                            $infoname = getModuleTitle(array('name' => 'sfcar'));
                            //获取会员名
                            $username = "";
                            $point = "";
                            $sql = $dsql->SetQuery("SELECT `username`,`point` FROM `#@__member` WHERE `id` = $userid");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                $username = $ret[0]['username'];
                                $point = $ret[0]['point'];

                            }

                            //顺风车发布得积分
                            $date = GetMkTime(time());
                            global  $userLogin;
                            $sfcarpoint = $cfg_returnInteraction_sfcar;
                            //增加积分
                            $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_sfcar' WHERE `id` = '$userid'");
                            $dsql->dsqlOper($archives, "update");
                            $user  = $userLogin->getMemberInfo($userid);
                            $userpoint = $user['point'];
//                            $pointuser  = (int)($userpoint+$cfg_returnInteraction_sfcar);
                            //保存操作日志
                            global $langData;
                            $info = '发布'.$infoname;
                            $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_sfcar', '$info', '$date','zengsong','1','$userpoint')");//发布顺风车得积分
                            $dsql->dsqlOper($archives, "update");
                            $param = array(
                                "service" => "member",
                                "type" => "user",
                                "template" => "point"
                            );

                            //自定义配置
                            $config = array(
                                "username" => $username,
                                "amount" => $cfg_returnInteraction_sfcar,
                                "point" => $point,
                                "date" => date("Y-m-d H:i:s", $date),
                                "info" => $info,
                                "fields" => array(
                                    'keyword1' => '变动类型',
                                    'keyword2' => '变动积分',
                                    'keyword3' => '变动时间',
                                    'keyword4' => '积分余额'
                                )
                            );
                            updateMemberNotice($userid, "会员-积分变动通知", $param, $config);
                        }

					//审核失败
					}elseif($arcrank == 2){
						$state = 2;
						$status = "审核失败。";
					}

					$param = array(
						"service"  => "member",
						"type"     => "user",
						"template" => "manage",
						"action"   => "sfcar"
					);

					//会员信息
					// if($userid){
					// 	$usfcar = $userLogin->getMembersfcar($userid);
					// 	if($usfcar['userType'] == 2){
					// 		$param = array(
					// 			"service"  => "member",
					// 			"template" => "manage",
					// 			"action"   => "sfcar"
					// 		);
					// 	}
					// }

					$param['param'] = "state=".$state;

					//获取会员名
					$username = "";
					$sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $userid");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$username = $ret[0]['username'];
					}

					//自定义配置
					$config = array(
						"username" => $username,
						"title" => $title,
						"status" => $status,
						"date" => date("Y-m-d H:i:s", $pubdate),
						"fields" => array(
							'keyword1' => '信息标题',
							'keyword2' => '发布时间',
							'keyword3' => '进展状态'
						)
					);

					updateMemberNotice($userid, "会员-发布信息审核通知", $param, $config);

					checkArticleCache($val);

				}

			}


			$archives = $dsql->SetQuery("UPDATE `#@__".$action."_list` SET `state` = ".$arcrank." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
                $async[] = $val;
            }


		}
        dataAsync("sfcar",$async);  // 顺风车修改状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新分类信息状态", $id."=>".$arcrank);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

//更新时间
}elseif($dopost == "updateTime"){
	if(!testPurview("editsfcar")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `pubdate` = ".GetMkTime(time())." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				checkArticleCache($val);
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新分类信息时间", $id);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

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
		'ui/bootstrap-datetimepicker.min.js',
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/sfcar/sfcarList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('notice', $notice);

	// $huoniaoTag->assign('typeListArr', json_encode(array('0'=>array('0'=>'我要用车','1'=>'我是车主'))));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/sfcar";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

// 检查缓存
function checkArticleCache($id){
    checkCache("sfcar_list", $id);
    clearCache("sfcar_total", "key");
    clearCache("sfcar_detail", $id);
}
