<?php
/**
 * 添加分类信息
 *
 * @version        $Id: infoAdd.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Info
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/info";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "infoAdd.html";

global $handler;
$handler = true;

$action     = "info";
$pagetitle  = "发布信息";
$dopost     = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost == "edit"){
	checkPurview("editInfo");
}else{
	checkPurview("infoAdd");
}
if(empty($userid)) $userid = 0;
if(!empty($characteristicservice)) $characteristicservice = join(",", $characteristicservice);

if($dopost != ""){
	$pubdate = GetMkTime(time());	//发布时间
	$rec     = (int)$rec;
	$fire    = (int)$fire;
	$top     = (int)$top;

	//对字符进行处理
	$title       = cn_substrR($title,60);
	$color       = cn_substrR($color,6);

	//获取当前管理员
	$adminid = $userLogin->getUserID();

	//获取分类下相应字段
    $itemResults = array();
    if($typeid){
        $infoitem = $dsql->SetQuery("SELECT `id`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default` FROM `#@__".$action."typeitem` WHERE `tid` = ".$typeid." ORDER BY `orderby` DESC, `id` ASC");
        $itemResults = $dsql->dsqlOper($infoitem, "results");
    }

	$valid = empty($valid) ? 0 : GetMkTime($valid);  //有效期
    $bid_start = empty($bid_start) ? 0 : GetMkTime($bid_start);  //置顶开始时间
    $bid_end = empty($bid_end) ? 0 : GetMkTime($bid_end);  //置顶结束时间
    $refreshBegan = empty($refreshBegan) ? 0 : GetMkTime($refreshBegan);  //刷新开始时间
    $refreshNext = empty($refreshNext) ? 0 : GetMkTime($refreshNext);  //刷新结束时间



}

//if(empty($click)) $click = mt_rand(50, 200);
if(empty($click)) $click = 1;
//阅读权限-下拉菜单
$huoniaoTag->assign('arcrankList', array(0 => '等待审核', 1 => '审核通过', 2 => '审核拒绝', 3 => '取消显示'));
$huoniaoTag->assign('arcrank', 1);  //阅读权限默认审核通过

if($dopost == "edit"){

	$pagetitle = "修改信息";

	if($submit == "提交"){
		if($token == "") die('token传递失败！');
        //表单二次验证
		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}
//
//		if(trim($title) == ''){
//			echo '{"state": 200, "info": "标题不能为空"}';
//			exit();
//		}

		if($userid == 0 && trim($user) == ''){
			echo '{"state": 200, "info": "请选择会员"}';
			exit();
		}
		if($userid == 0){
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
				exit();
			}
			$userid = $userResult[0]['id'];
		}else{
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = ".$userid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
				exit();
			}
		}

		//验证字段内容
		if(count($itemResults) > 0){
			foreach ($itemResults as $key=>$value) {
				$field = 'user_'.$value['field'];
				if($value["required"] == 1 && $$field == ""){
					if($value["formtype"] == "text"){
						echo '{"state": 200, "info": "'.$value['title'].'不能为空"}';
					}else{
						echo '{"state": 200, "info": "请选择'.$value['title'].'"}';
					}
					exit();
				}
			}
		}

		if(trim($addr) == ''){
			echo '{"state": 200, "info": "请选择所属地区"}';
			exit();
		}

		if(trim($body) == ''){
			echo '{"state": 200, "info": "请输入信息内容"}';
			exit();
		}

//		if(trim($person) == ''){
//			echo '{"state": 200, "info": "请输入联系人信息"}';
//			exit();
//		}

		if(trim($tel) == ''){
			echo '{"state": 200, "info": "请输入联系电话"}';
			exit();
		}

		if(empty($valid)){
			echo '{"state": 200, "info": "请选择有效期"}';
			exit();
		}
        if ($config){
            $configArr = explode('|', $config);
            $tp_beganDate = $configArr[0];
            $tp_endDate = $configArr[1];
            $period = explode(',', $configArr[2]);

            $diffDays = (int)(diffBetweenTwoDays($tp_beganDate, $tp_endDate) + 1);
            $tp_planArr = array();
            $tp_week = array();
            global $langData;
            $weekArr = $langData['siteConfig'][34][5];

            //时间范围内每天的明细
            for ($i = 0; $i < $diffDays; $i++) {
                $began = GetMkTime($tp_beganDate);
                $day = AddDay($began, $i);
                $week = date("w", $day);

                if($period[$week]){
                    array_push($tp_planArr, date('Y-m-d', $day) . " " . $weekArr[$week] . " " . ($period[$week] == 'all' ? '全天' : '早8点-晚8点'));
                    array_push($tp_week, array(
                        'week' => $week,
                        'type' => $period[$week]
                    ));
                }
            }
            $tp_beganDate = GetMkTime($tp_beganDate);
            $tp_endDate = GetMkTime($tp_endDate);

            $tp_weekSet = array();
            foreach ($tp_week as $key => $value) {
                array_push($tp_weekSet, "`bid_week".$value["week"]."` = '".$value['type']."'");
            }
            $tp_weekUpdate = ', ' . join(', ', $tp_weekSet);
        }


        //刷新
        $arr= array(
            'module' => 'info',
            'act' => 'detail',
            'userid' => '29',
        );
        $refre = new siteConfig($arr);
        $refreshConfig =$refre->refreshTopConfig();
        if($refreshConfig['state'] == 200){
            die($refreshConfig['info']);
        }else {
            $rtConfig = $refreshConfig['config'];
            $refresh = $rtConfig['refreshSmart'];  //智能刷新配置
        }
        $refreConfig = (int)$refreConfig;
        $smartData = $refresh[$refreConfig];
        if($smartData){
            $sr_day = $smartData['day'];
            $sr_discount = $smartData['discount'];
            $sr_offer = $smartData['offer'];
            $sr_price = $smartData['price'];
            $sr_times = $smartData['times'];
            $sr_unit = $smartData['unit'];
        }
        $time = GetMkTime(time());
        //下次刷新时间
        $nextRefreshTime = $time + (int)(24/($sr_times/$sr_day)) * 3600;
        $refreshSurplus = $sr_times - 1;



		$price = (float)$price;
		$yunfei = (float)$yunfei;

		$teladdr = getTelAddr($tel);

		$body = Replace_Links($body);
		$mbody = Replace_Links($mbody);
		$title = cn_substrR(strip_tags($body), 50);
		$addr = str_replace("\\", '', $addr);
		
		$addr = (int)$addr;
		$price_switch = (int)$price_switch;

		$lnglat = explode(',', $lnglat);
		$lng = $lnglat[0];
		$lat = $lnglat[1];

		//查询信息之前的状态
		$sql = $dsql->SetQuery("SELECT `arcrank`, `userid`, `pubdate` FROM `#@__".$action."list` WHERE `id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$arcrank_ = $ret[0]['arcrank'];
//			$userid   = $ret[0]['userid'];
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

				//审核失败
				}elseif($arcrank == 2){
					$state = 2;
					$status = "审核失败。";
				}

				$param = array(
					"service"  => "member",
					"type"     => "user",
					"template" => "manage",
					"action"   => "info"
				);

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

			}

		}

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `cityid` = '".$cityid."', `typeid` = ".$typeid.", `title` = '".$title."', `color` = '".$color."', `weight` = ".$weight.", `valid` = ".$valid.", `addr` = ".$addr.", `price` = '$price', `body` = '".$body."', `mbody` = '".$mbody."', `person` = '".$person."', `areaCode` = '$areaCode', `tel` = '".$tel."', `teladdr` = '".$teladdr."', `qq` = '".$qq."', `click` = ".$click.", `arcrank` = ".$arcrank.", `review` = '$review', `rec` = '$rec', `fire` = '$fire', `top` = '$top',`video`='$video',`videoPoster`='$videoPoster', `yunfei` = $yunfei, `price_switch`='$price_switch', `userid`='$userid',`label` = '$characteristicservice', `address` = '$address', `longitude` = '$lng', `latitude` = '$lat'  WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "主表保存失败！"}';
			exit();
		}

		//先删除信息所属字段
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."item` WHERE `aid` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//保存字段内容
		if(count($itemResults) > 0){
			foreach ($itemResults as $key=>$value) {

				$user_field = 'user_'.$value['field'];
				$val = $$user_field;
				if($value['formtype'] == "checkbox" && $val){
					$val = join(",", $val);
				}

				$infoitem = $dsql->SetQuery("INSERT INTO `#@__".$action."item` (`aid`, `iid`, `value`) VALUES (".$id.", ".$value['id'].", '".$val."')");
				$dsql->dsqlOper($infoitem, "update");
			}
		}

		//先删除信息所属图集
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."pic` WHERE `aid` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//保存图集表
		if($imglist != ""){
			$picList = explode("||",$imglist);
			foreach($picList as $k => $v){
				$picInfo = explode("|", $v);
				$pics = $dsql->SetQuery("INSERT INTO `#@__".$action."pic` (`aid`, `picPath`, `picInfo`) VALUES (".$id.", '".$picInfo[0]."', '".$picInfo[1]."')");
				$dsql->dsqlOper($pics, "update");
			}
		}

		adminLog("修改分类信息", $title);

		$param = array(
			"service"     => "info",
			"template"    => "detail",
			"id"          => $id
		);
		$url = getUrlPath($param);
        dataAsync("info",$id);  // 分类信息、修改
		echo '{"state": 100, "url": "'.$url.'"}';die;


	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."list` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");
			if(!empty($results)){
				$typeid  = $results[0]['typeid'];
                $title   = str_replace(array("&zwnj;"), "", $results[0]['body']);
				$weight  = $results[0]['weight'];
                $userid  = $results[0]['userid'];
                $valid   = $results[0]['valid'];
				$addr    = $results[0]['addr'];
                $address    = $results[0]['address'];
                $lat     = $results[0]['latitude'];
                $lng      = $results[0]['longitude'];
                $price   = $results[0]['price'];
				$body    = $results[0]['body'];
				$mbody   = $results[0]['mbody'];
				$person  = $results[0]['person'];
				$yunfei  = $results[0]['yunfei'];
				$areaCode = $results[0]['areaCode'];
				$tel     = $results[0]['tel'];
				$qq      = $results[0]['qq'];
				$click   = $results[0]['click'];
				$arcrank = $results[0]['arcrank'];
				$review = $results[0]['review'];
				$rec     = $results[0]['rec'];
				$fire    = $results[0]['fire'];
				$top     = $results[0]['top'];
                $cityid  = $results[0]['cityid'];
                $video   = $results[0]['video'];
                $videoPoster = $results[0]['videoPoster'];
                $price_switch    = $results[0]['price_switch'];
                $isbid           = $results[0]['isbid'];
                $bid_start       = $results[0]['bid_start'];
                $refreshTimes    = $results[0]['refreshTimes'];
                $refreshSmart    = $results[0]['refreshSmart'];
                $refreshBegan    = $results[0]['refreshBegan'];
                $refreshNext     = $results[0]['refreshNext'];
                $hasSetjili      = $results[0]['hasSetjili'];
//                $refreshTimes  = $results[0]['refreshTimes'];
                $hongbaoPrice    = $results[0]['hongbaoPrice'];
                $hisid = $results[0]['id'];
                $listt = $dsql->SetQuery("SELECT SUM(`price`)priceCount,count(`id`)id FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `type` = 2");
                $ret = $dsql->dsqlOper($listt, "results");
                $CounthongbaoPrice= $results[0]['hongbaoPrice'] + (float)$ret[0]['priceCount'];
                $memberCount     = $results[0]['hongbaoCount'] + $ret[0]['id'];
                $hongbaoMode     = $results[0]['status'] == 0 ? '随机分配' : '平均分配';
                $fenList = $dsql->SetQuery("SELECT SUM(`price`)priceCount,count(`id`)id FROM `#@__info_hongbao_historyclick` WHERE `proid` = '$hisid' AND `type` = 1");
                $listfen = $dsql->dsqlOper($fenList, "results");
                $kouling         = $results[0]['desc'];
                $Countreward     = $results[0]['rewardCount'] + $listfen[0]['id'];
                $hongbaoCount    = $results[0]['hongbaoCount'];
                $rewardPrice     = $results[0]['rewardPrice'];
                $rewardCount     = $results[0]['rewardCount'];
                $rewardCountPrice     = $results[0]['rewardCount'] *  $results[0]['rewardPrice'] ;
                $refreshCount    = $results[0]['refreshCount'];
                $refreshSurplus  = $results[0]['refreshSurplus'];
                $label           = $results[0]['label'];
                $sid             = $results[0]['id'];
                $item       = array();
                $infoitem   = $dsql->SetQuery("SELECT `iid`, `value` FROM `#@__infoitem` WHERE `aid` = " . $results[0]['id'] . " AND `custom` = 0 ORDER BY `id` ASC");
                $itemResult = $dsql->dsqlOper($infoitem, "results");
                if ($itemResult) {
                    foreach ($itemResult as $key => $val) {
                        $typeitem   = $dsql->SetQuery("SELECT i.`id`, i.`title`FROM `#@__infotypeitem` i LEFT JOIN `#@__infotype` t ON t.`id` = i.`tid` WHERE i.`id` = " . $val['iid'] . " AND t.`id` = i.`tid`");
                        $itemResult = $dsql->dsqlOper($typeitem, "results");
                        if ($itemResult) {
                            $item[$key]['id']    = $val['iid'];
                            $item[$key]['type']  = $itemResult[0]['title'];
                            $iteminfo   = $dsql->SetQuery("SELECT `iid`, `value`,`custom` FROM `#@__infoitem` WHERE `aid` = " . $results[0]['id'] . " AND `custom` = '1' ORDER BY `id` ASC");
                            $Resultitem = $dsql->dsqlOper($iteminfo, "results");
                            $_item = array();
                            if ($Resultitem){
                                foreach ($Resultitem as $ke => $vall) {
                                    $_item['value_custom'] = $vall['value'];
                                    $__item = explode(',', $vall['value']);
                                    $_item['valueArr_custom'] = $__item;
                                    $_item['iid'] = $vall['iid'];

                                }
                            }
                            if ($_item['iid'] == $val['iid']){
                                $item[$key]['value_custom'] = $_item['value_custom'];
                                $item[$key]['valueArr_custom'] = $_item['valueArr_custom'] ?  $_item['valueArr_custom'] : $_item['valueArr_custom']=array() ;
                            }

                            $item[$key]['value'] = $val['value'];
                            $item_ = explode(',', $val['value']);
                            $item[$key]['valueArr'] = $item_;
                        }
                    }
                }
                $sarchives = $dsql->SetQuery("SELECT `touid`,`price` FROM `#@__info_hongbao_historyclick` WHERE `proid` = ".$sid." AND `type` = 2 ");
                $sresults = $dsql->dsqlOper($sarchives, "results");
                if ($sresults){
                    $arr = array();
                    foreach ($sresults as $kc => $vc){
                        $touid = $vc['touid'];
                        $price = $vc['price'];

                        $uinfo = $userLogin->getMemberInfo($touid);
                        if(is_array($uinfo)) {
                            array_push($arr, array(
                                'uid' => $touid,
                                'nickname' => $uinfo['nickname'],
                                'price' => $price
                            ));
                        }else{
                            array_push($arr, array(
                                'uid' => $touid,
                                'nickname' => '会员已删除',
                                'price' => $price
                            ));
                        }
                    }
                    $lingqu = $arr;
                }

                //显示置顶信息
                if ($isbid) {
                    $bid_type  = $results[0]['bid_type'];
                    $bid_price = $results[0]['bid_price'];
                    $bid_start = $results[0]['bid_start'];
                    $bid_end   = $results[0]['bid_end'] > GetMkTime(time()) ? $results[0]['bid_end'] : 0;
                    //计划置顶详细
                    if ($results[0]['bid_type'] == 'plan') {
                        $tp_beganDate = date('Y-m-d', $results[0]['bid_start']);
                        $tp_endDate   = date('Y-m-d', $results[0]['bid_end']);

                        $diffDays   = (int)(diffBetweenTwoDays($tp_beganDate, $tp_endDate) + 1);
                        $tp_planArr = array();

                        $weekArr = array('周日', '周一', '周二', '周三', '周四', '周五', '周六');

                        //时间范围内每天的明细
                        for ($i = 0; $i < $diffDays; $i++) {
                            $began = GetMkTime($tp_beganDate);
                            $day   = AddDay($began, $i);
                            $week  = date("w", $day);

                            if ($results[0]['bid_week' . $week]) {
                                array_push($tp_planArr, array(
                                    'date' => date('Y-m-d', $day),
                                    'week' => $weekArr[$week],
                                    'type' => $results[0]['bid_week' . $week],
                                    'state' => $day < GetMkTime(date('Y-m-d', time())) ? 0 : 1
                                ));
                            }
                        }

                        $bid_plan = $tp_planArr;
                    }
                }

            }else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
				die;
			}

			//图表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."pic` WHERE `aid` = ".$id." ORDER BY `id` ASC");
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){
				$imglist = array();
				foreach($results as $key => $value){
					$imglist[$key]["path"] = getFilePath($value["picPath"]);
                    $imglist[$key]["pathSource"] = $value["picPath"];
                    $imglist[$key]["info"] = $value["picInfo"];
				}
				$imglist = json_encode($imglist);
			}else{
				$imglist = "''";
			}

		}else{
			ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
			die;
		}
	}
}elseif($dopost == "" || $dopost == "save"){
	$dopost = "save";

	//表单提交
	if($submit == "提交"){
		if($token == "") die('token传递失败！');
        //表单二次验证
		if($typeid == ''){
			echo '{"state": 200, "info": "请选择信息分类"}';
			exit();
		}

//		if(trim($title) == ''){
//			echo '{"state": 200, "info": "标题不能为空"}';
//			exit();
//		}

		if($userid == 0 && trim($user) == ''){
			echo '{"state": 200, "info": "请选择会员"}';
			exit();
		}
		if($userid == 0){
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` = '".$user."'");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
				exit();
			}
			$userid = $userResult[0]['id'];
		}else{
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `id` = ".$userid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "会员不存在，请在联想列表中选择"}';
				exit();
			}
		}

		//验证字段内容
		if(count($itemResults) > 0){
			foreach ($itemResults as $key=>$value) {
				$field = 'user_'.$value['field'];
				if($value["required"] == 1 && $$field == ""){
					if($value["formtype"] == "text"){
						echo '{"state": 200, "info": "'.$value['title'].'不能为空"}';
					}else{
						echo '{"state": 200, "info": "请选择'.$value['title'].'"}';
					}
					exit();
				}
			}
		}

		if(trim($addr) == ''){
			echo '{"state": 200, "info": "请选择所属地区"}';
			exit();
		}

		if(trim($body) == ''){
			echo '{"state": 200, "info": "请输入信息内容"}';
			exit();
		}

//		if(trim($person) == ''){
//			echo '{"state": 200, "info": "请输入联系人信息"}';
//			exit();
//		}

		if(trim($tel) == ''){
			echo '{"state": 200, "info": "请输入联系电话"}';
			exit();
		}

		if(empty($valid)){
			echo '{"state": 200, "info": "请选择有效期"}';
			exit();
		}

        $price = (float)$price;
        $yunfei = (float)$yunfei;

		$ip = GetIP();
		$ipAddr = getIpAddr($ip);

		$teladdr = getTelAddr($tel);

		$body = Replace_Links($body);
		$mbody = Replace_Links($body);
		$title = cn_substrR(strip_tags($body), 50);

		$addr = (int)$addr;
		$price_switch = (int)$price_switch;

		$lnglat = explode(',', $lnglat);
		$lng = $lnglat[0];
		$lat = $lnglat[1];

		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."list` (`cityid`, `typeid`, `title`, `color`, `weight`, `valid`, `addr`, `price`, `body`, `mbody`, `person`, `areaCode`, `tel`, `teladdr`, `qq`, `click`, `arcrank`, `review`, `ip`, `ipaddr`, `pubdate`, `userid`, `rec`, `fire`, `top`,`video`,`videoPoster`, `yunfei`, `price_switch`,`label`, `address`, `longitude`, `latitude`) VALUES ('".$cityid."', '".$typeid."', '".$title."', '".$color."', ".$weight.", ".$valid.", '".$addr."', '$price', '".$body."', '".$mbody."', '".$person."', '$areaCode', '".$tel."', '".$teladdr."', '".$qq."', ".$click.", ".$arcrank.", '$review', '".$ip."', '".$ipAddr."', ".GetMkTime(time()).", ".$userid.", '$rec', '$fire', '$top','$video','$videoPoster', $yunfei, '$price_switch','$characteristicservice', '$address', '$lng', '$lat')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		//保存字段内容
		if(count($itemResults) > 0){
			foreach ($itemResults as $key=>$value) {
				$user_field = 'user_'.$value['field'];
				$val = $$user_field;
				if($value['formtype'] == "checkbox" && $val){
					$val = join(",", $val);
				}
				$infoitem = $dsql->SetQuery("INSERT INTO `#@__".$action."item` (`aid`, `iid`, `value`) VALUES (".$aid.", ".$value['id'].", '".$val."')");
				$dsql->dsqlOper($infoitem, "update");
			}
		}

		//保存图集表
		if($imglist != ""){
			$picList = explode("||",$imglist);
			foreach($picList as $k => $v){
				$picInfo = explode("|", $v);
				$pics = $dsql->SetQuery("INSERT INTO `#@__".$action."pic` (`aid`, `picPath`, `picInfo`) VALUES (".$aid.", '".$picInfo[0]."', '".$picInfo[1]."')");
				$dsql->dsqlOper($pics, "update");
			}
		}
		adminLog("发布分类信息", $title);

		$param = array(
			"service"     => "info",
			"template"    => "detail",
			"id"          => $aid
		);
		$url = getUrlPath($param);

		if($arcrank == 1){
			updateCache("info_list", 300);
		}
        dataAsync("info",$aid);  // 发布分类信息

		echo '{"state": 100, "url": "'.$url.'"}';die;

	}

//获取字段信息
}elseif($dopost == "getInfoItem"){
	if($typeid != ""){
		if(count($itemResults) > 0){
			$list = array();
			foreach ($itemResults as $key=>$value) {
				$options = "";
				if($value["options"] != ""){
					$options = join(',', preg_split("[\r\n]", $value["options"]));
				}

				$itemVal = "";
				//获取分类下相应字段
				if($id != ""){
					$infoitem = $dsql->SetQuery("SELECT `value` FROM `#@__".$action."item` WHERE `aid` = ".$id." AND `iid` = ".$value["id"]);
					$itemResults = $dsql->dsqlOper($infoitem, "results");
					$itemVal = $itemResults[0]['value'];
				}

				array_push($list, '{"id": "'.$value["id"].'", "field": "user_'.$value["field"].'", "title": "'.$value["title"].'", "type": "'.$value["formtype"].'", "required": '.$value["required"].', "options": "'.$options.'", "default": "'.$value["default"].'", "value": "'.$itemVal.'"}');
			}
			echo '{"itemList": ['.join(",", $list).']}';
		}
	}
	die;
}

//验证模板文件
if(file_exists($tpl."/".$templates)){
	//js
	$jsFile = array(
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'publicAddr.js',
		'admin/info/infoAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


	require_once(HUONIAOINC."/config/".$action.".inc.php");
	global $customUpload;
	if($customUpload == 1){
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}

	//查询
    $city = '';
    if ($cityid){
        $city = getSiteCityName($cityid);
    }
	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('cityid', $cityid);
    $huoniaoTag->assign('city', $city);
    $huoniaoTag->assign('typeid', empty($typeid) ? 0 : $typeid);
	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('color', $color);
	$huoniaoTag->assign('addr', empty($addr) ? "" : $addr);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('weight', $weight == "" ? "1" : $weight);
	$huoniaoTag->assign('body', $body);
	$huoniaoTag->assign('mbody', $mbody);
	$huoniaoTag->assign('yunfei', $yunfei);
	$huoniaoTag->assign('person', $person);
	$huoniaoTag->assign('areaCode', $areaCode);
	$huoniaoTag->assign('tel', $tel);
	$huoniaoTag->assign('qq', $qq);
	$huoniaoTag->assign('valid', !empty($valid) ? date("Y-m-d", $valid) : "");
	$huoniaoTag->assign('arcrank', $arcrank == "" ? 1 : $arcrank);
    $huoniaoTag->assign('review', $review);
	$huoniaoTag->assign('imglist', empty($imglist) ? "''" : $imglist);
	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, $action."addr")));
    $huoniaoTag->assign('bid_end', !empty($bid_end) ? date("Y-m-d",$bid_end) : "");
    $huoniaoTag->assign('bid_start', !empty($bid_start) ? date("Y-m-d",$bid_start) : "");
    $huoniaoTag->assign('isbid', $isbid);
    $huoniaoTag->assign('refreshSmart', $refreshSmart);
    $huoniaoTag->assign('refreshTimes', $refreshTimes);
    $huoniaoTag->assign('refreshNext', !empty($refreshNext) ? date("Y-m-d",$refreshNext) : "");
    $huoniaoTag->assign('refreshBegan', !empty($refreshBegan) ? date("Y-m-d",$refreshBegan) : "");
    $huoniaoTag->assign('hasSetjili', $hasSetjili);
    $huoniaoTag->assign('lingqu', $lingqu);
    $huoniaoTag->assign('hongbaoCount', $hongbaoCount);
    $huoniaoTag->assign('hongbaoPrice', $hongbaoPrice);
    $huoniaoTag->assign('rewardCount', $rewardCount);
    $huoniaoTag->assign('rewardPrice', $rewardPrice);
    $huoniaoTag->assign('bid_plan', $bid_plan);
    $huoniaoTag->assign('bid_end', !empty($bid_end) ? date("Y-m-d",$bid_end) : "");
    $huoniaoTag->assign('rec', $rec);
	$huoniaoTag->assign('fire', $fire);
	$huoniaoTag->assign('top', $top);
    $huoniaoTag->assign('refreshSurplus', $refreshSurplus);
    $huoniaoTag->assign('refreshCount', $refreshCount);
    $huoniaoTag->assign('item', $item);
    $huoniaoTag->assign('CounthongbaoPrice', $CounthongbaoPrice);
    $huoniaoTag->assign('memberCount', $memberCount);
    $huoniaoTag->assign('hongbaoMode', $hongbaoMode);
    $huoniaoTag->assign('Countreward', $Countreward);
    $huoniaoTag->assign('rewardCountPrice', $rewardCountPrice);
    $huoniaoTag->assign('kouling', $kouling);
    $huoniaoTag->assign('address', $address);
    $huoniaoTag->assign('lat', $lat);
    $huoniaoTag->assign('lng', $lng);


    if ($typeid){
        //特色
        $typearchive = $dsql->SetQuery("SELECT `name`,`id` FROM `#@__infoitemtype` WHERE `tid` = ".$typeid);

        $typeresults = $dsql->dsqlOper($typearchive, "results");
        if (!empty($typeresults)){
            $characterslist = array();
            $charactersval = array();
            foreach($typeresults as $value){
                array_push($characterslist, $value['name']);
                array_push($charactersval, $value['id']);
            }
        }
    }



    $huoniaoTag->assign('characterslist', $characterslist);
    $huoniaoTag->assign('charactersval', $charactersval);
    $huoniaoTag->assign('characteristicservice', explode(",", $label));
	$huoniaoTag->assign('video', $video);
	$huoniaoTag->assign('videoPoster', $videoPoster);

	$huoniaoTag->assign('userid', $userid);
	$userSql = $dsql->SetQuery("SELECT `username`,`nickname` FROM `#@__member` WHERE `id` = ". $userid);
	$username = $dsql->getTypeName($userSql);
	$huoniaoTag->assign('username', $username[0]['nickname']);
	//价格开关-单选
	$huoniaoTag->assign('priceopt', array('0', '1'));
	$huoniaoTag->assign('pricenames',array('开启','关闭'));
	$huoniaoTag->assign('price_switch', ($price_switch == '' || $price_switch == 1) ? 1 : 0);  //价格开关默认开启

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/info";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
