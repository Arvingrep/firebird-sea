<?php
/**
 * 管理二手车
 *
 * @version        $Id: carList.php 2019-03-18 上午90:27:11 $
 * @package        HuoNiao.car
 * @copyright      Copyright (c) 2013 - 2019, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("carList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/car";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "carList.html";

$tab = "car_list";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

  $where =  getCityFilter('`cityid`');
  if ($cityid){
      $where .= getWrongCityFilter('`cityid`', $cityid);
  }

	if($sKeyword != ""){
		$sidArr = array();
		$userSql = $dsql->SetQuery("SELECT zj.id FROM `#@__car_store` zj LEFT JOIN `#@__member` user ON user.id = zj.userid WHERE (user.username like '%$sKeyword%' OR user.phone like '%$sKeyword%')");
		$userResult = $dsql->dsqlOper($userSql, "results");
		foreach ($userResult as $key => $value) {
			$sidArr[$key] = $value['id'];
		}
		if(!empty($sidArr)){
			$where .= " AND (`title` like '%$sKeyword%' OR `contact` like '%$sKeyword%' OR `userid` in (".join(",",$sidArr)."))";
		}else{
			$where .= " AND (`title` like '%$sKeyword%' OR `contact` like '%$sKeyword%')";
		}
	}

	if($sType){
		$sTypeArr = $dsql->getTypeList($sType, "car_brandtype", false);
		if($sTypeArr){
			$lower = arr_foreach($sTypeArr);
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}
		$where .= " AND `brand` in ($lower)";
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `waitpay` = 0");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待审核
	$totalGray = $dsql->dsqlOper($archives." AND `state` = 0".$where, "totalCount");
	//已审核
	$totalAudit = $dsql->dsqlOper($archives." AND `state` = 1".$where, "totalCount");
	//拒绝审核
	$totalRefuse = $dsql->dsqlOper($archives." AND `state` = 2".$where, "totalCount");

	if($state != ""){
		$where .= " AND `state` = $state";

		if($state == 0){
			$totalPage = ceil($totalGray/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($totalAudit/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($totalRefuse/$pagestep);
		}
	}

	$where .= " AND `waitpay` = 0 order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `brand`, `carsystem`, `model`, `addrid`, `price`, `usertype`, `userid`, `username`, `contact`, `state`, `weight`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["litpic"] = $value["litpic"];

			//品牌
			$list[$key]["brand"] = $value["brand"];
			$list[$key]["carsystem"] = $value["carsystem"];
			$list[$key]["model"] = $value["model"];

			global $data;
			$data = "";
			$typeArr = getParentArr("car_brandtype", $value['brand']);
			$typeArr = array_reverse(parent_foreach($typeArr, "typename"));
			$list[$key]['brandname']    = join("-", $typeArr);

			//地区
			$addrname = $value['addrid'];
			if($addrname){
				$addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
			}
			$list[$key]["addrname"] = $addrname;

			$list[$key]["price"] = $value["price"];
			$list[$key]["usertype"] = $value["usertype"];
			$list[$key]["userid"] = $value["userid"];

			$username = $contact = "无";
			if($value['userid'] != 0 && $value['usertype'] == 1){
				//会员
				$userSql = $dsql->SetQuery("SELECT `userid` FROM `#@__car_adviser` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				if($username){
					$userSql = $dsql->SetQuery("SELECT `id`, `username`, `phone` FROM `#@__member` WHERE `id` = ". $username[0]["userid"]);
					$username = $dsql->getTypeName($userSql);
					$list[$key]["userid"] = $username[0]["id"];
					$contact = $username[0]["phone"];
					$username = $username[0]["username"];
				}
			}else{
				//会员
				//$userSql = $dsql->SetQuery("SELECT `username`, `contact` FROM `#@__house_zjuser` WHERE `id` = ". $value['userid']);
				//$username = $dsql->getTypeName($userSql);
				//$contact = $username[0]["contact"];
				//$username = $username[0]["username"];
				$contact = $value["contact"];
				$username = $value["username"];
			}
			$list[$key]["username"] = $username;
			$list[$key]["contact"] = $contact;

			$list[$key]["state"] = $value["state"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "car",
				"template" => "detail",
				"id"       => $value["id"]
			);
			$list[$key]["url"] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "carList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("carDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['litpic'], "delThumb", "car");
			delPicFile($results[0]['pics'], "delAtlas", "car");

			//删除举报信息
			$archives = $dsql->SetQuery("DELETE FROM `#@__member_complain` WHERE `module` = 'car' AND `action` = 'detail' AND `aid` = ".$val);
			$dsql->dsqlOper($archives, "update");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("car",$async,"list");  // 删除车源
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkCarCache($id);
			adminLog("删除二手车信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("carEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){

            $sql = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `brand`, `carsystem`, `model`, `addrid`, `price`, `usertype`, `userid`, `username`, `contact`, `state`, `weight`, `pubdate` FROM `#@__".$tab."` WHERE `id` = ".$val);
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret) continue;
            $state_ = $ret[0]['state'];
            $userid = $ret[0]['userid'];
            //会员消息通知
            if($state != $state_){
                if($state== 1) {
                    global $cfg_returnInteraction_car;
                    $countIntegral = countIntegral($userid);    //统计积分上限
                    global $cfg_returnInteraction_commentDay;
                    if ($countIntegral < $cfg_returnInteraction_commentDay && $cfg_returnInteraction_car > 0) {
                        $username = $point = "无";
                        if ($ret[0]['userid'] != 0 && $ret[0]['usertype'] == 1) {
                            //会员
                            $userSql = $dsql->SetQuery("SELECT `userid` FROM `#@__house_zjuser` WHERE `id` = " . $ret[0]['userid']);
                            $username = $dsql->getTypeName($userSql);
                            if ($username) {
                                $userSql = $dsql->SetQuery("SELECT `id`, `username`, `point` FROM `#@__member` WHERE `id` = " . $username[0]["userid"]);
                                $user = $dsql->getTypeName($userSql);
                                $userid = $user[0]["id"];
                                $point = $user[0]["point"];
                                $username = $user[0]["username"];
                            }
                        } else {
                            $userid = $ret[0]['userid'];
                            $userSql = $dsql->SetQuery("SELECT `id`, `username`, `point` FROM `#@__member` WHERE `id` = " . $userid);
                            $user = $dsql->getTypeName($userSql);
                            $point = $user[0]["point"];
                            $username = $ret[0]["username"];
                        }
                        $infoname = getModuleTitle(array('name' => 'car'));
                        global  $userLogin;
                        //汽车门户发布得积分
                        $date = GetMkTime(time());
                        //增加积分
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$cfg_returnInteraction_car' WHERE `id` = '$userid'");
                        $dsql->dsqlOper($archives, "update");
                        $user  = $userLogin->getMemberInfo($userid);
                        $userpoint = $user['point'];
//                        $pointuser   = (int)($userpoint+$cfg_returnInteraction_car);
                        //保存操作日志
                        $info = '发布'.$infoname;
                        $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`interaction`,`balance`) VALUES ('$userid', '1', '$cfg_returnInteraction_car', '$info', '$date','zengsong','1','$userpoint')");
                        $dsql->dsqlOper($archives, "update");

                        $param = array(
                            "service" => "member",
                            "type" => "user",
                            "template" => "point"
                        );

                        //自定义配置
                        $config = array(
                            "username" => $username,
                            "amount" => $cfg_returnInteraction_car,
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
                }

            }



			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
        dataAsync("car",$async,"list");  // 汽车门户、车源、更新状态

        if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			checkCarCache($id);
			adminLog("更新二手车状态", $id."=>".$state);
			echo '{"state": 100, "info": '.json_encode("修改成功！").'}';
		}
	}
	die;

}
// 检查缓存
function checkCarCache($id){
    checkCache("car_list", $id);
	clearCache("car_detail", $id);
	clearCache("car_list_total", 'key');
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
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/car/carList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "car_brandtype", false)));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/car";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
