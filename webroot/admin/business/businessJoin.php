<?php
/**
 * 管理商家入驻列表
 *
 * @version        $Id: businessJoin.php 2017-08-07 下午15:44:28 $
 * @package        HuoNiao.Business
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("businessJoin");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/business";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "businessJoin.html";

global $handler;
$handler = true;

$action = "business";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	//城市管理员
	if($userType == 3){
		if($adminCityIds){
			$where .= getCityFilter('l.`cityid`');
		}else{
			$where .= " AND 1 = 2";
		}
	}

	//城市
	if($cityid){
		// global $data;
		// $data = '';
		// $cityAreaData = $dsql->getTypeList($cityid, 'site_area');
		// $cityAreaIDArr = parent_foreach($cityAreaData, 'id');
		// $cityAreaIDs = join(',', $cityAreaIDArr);
		// if($cityAreaIDs){
		// 	$where .= " AND l.`cityid` in ($cityAreaIDs)";
		// }else{
		// 	$where .= " 3 = 4";
		// }
        $where .= getWrongCityFilter('l.`cityid`', $cityid);
	}

	if($sKeyword != ""){

		$sidArr = array();
		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `phone` like '%$sKeyword%' OR `company` like '%$sKeyword%'");
		$results = $dsql->dsqlOper($userSql, "results");
		foreach ($results as $key => $value) {
			$sidArr[$key] = $value['id'];
		}

		if(!empty($sidArr)){
			$where .= " AND (l.`title` like '%$sKeyword%' OR l.`company` like '%$sKeyword%' OR l.`phone` like '%$sKeyword%' OR l.`address` like '%$sKeyword%' OR l.`tel` like '%$sKeyword%' OR l.`uid` in (".join(",",$sidArr)."))";
		}else{
			$where .= " AND (l.`title` like '%$sKeyword%' OR l.`company` like '%$sKeyword%' OR l.`phone` like '%$sKeyword%' OR l.`address` like '%$sKeyword%' OR l.`tel` like '%$sKeyword%')";
		}

	}

	if($sType != ""){
		if($dsql->getTypeList($sType, $action."_type")){
			global $arr_data;
			$arr_data = array();
			$lower = arr_foreach($dsql->getTypeList($sType, $action."_type"));
			$lower = $sType.",".join(',',$lower);
		}else{
			$lower = $sType;
		}

		$where .= " AND l.`typeid` in (".$lower.")";
	}

	$where .= " AND l.`state` = 3 AND o.`id` != '' GROUP BY l.`id`";

	$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__".$action."_list` l LEFT JOIN `#@__business_order` o ON o.`bid` = l.`id` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");

	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	$where .= " order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT l.`id`, l.`uid`, l.`title`, l.`logo`, l.`typeid`, l.`addrid`, l.`phone`, l.`email`, l.`pubdate`, l.`authattr`, l.`state` FROM `#@__".$action."_list` l LEFT JOIN `#@__business_order` o ON o.`bid` = l.`id` WHERE 1 = 1".$where);

	$results = $dsql->dsqlOper($archives, "results");
	if(count($results) > 0){
		$list = array();
		$i = 0;
		foreach ($results as $key=>$value) {
			$list[$i]["id"] = $value["id"];
			$list[$i]["uid"] = $value["uid"];

			$user = "";
			$sql = $dsql->SetQuery("SELECT `nickname`, `company` FROM `#@__member` WHERE `id` = ".$value['uid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				if($ret[0]['company']){
					$user = $ret[0]['company'];
				}else{
					$user = $ret[0]['nickname'];
				}
			}
			$list[$i]['user'] = $user;

			$list[$i]["title"] = $value["title"];
			$list[$i]["logo"] = getFilePath($value["logo"]);

			//分类
			$list[$i]["typeid"] = $value["typeid"];
			$typename = "";
			$sql = $dsql->SetQuery("SELECT `typename` FROM `#@__".$action."_type` WHERE `id` = ".$value['typeid']);
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$typename = $ret[0]['typename'];
			}
			$list[$i]['typename'] = $typename;

			//区域
			$addrname = $value['addrid'];
			if($addrname){
				$addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
			}
			$list[$i]["addrname"] = $addrname;

			$list[$i]["phone"] = $value["phone"];
			$list[$i]["email"] = $value["email"];
			$list[$i]["pubdate"] = date("Y-m-d H:i:s", $value["pubdate"]);
			$list[$i]["state"] = $value['state'];

			$auth = array();
			if($value['authattr']){
				$authattr = explode(",", $value['authattr']);
				foreach ($authattr as $k => $v) {
					$sql = $dsql->SetQuery("SELECT `jc`, `typename` FROM `#@__business_authattr` WHERE `id` = $v");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						array_push($auth, array("jc" => $ret[0]['jc'], "typename" => $ret[0]['typename']));
					}
				}
			}
			$list[$i]["auth"] = $auth;

			//查询商家订单
			$order = array();
			$list[$i]['order'] = array();
			// $sql = $dsql->SetQuery("SELECT m.`module` FROM `#@__business_order_module` m LEFT JOIN `#@__business_order` o ON o.`id` = m.`oid` WHERE o.`bid` = " . $value['id']);
			// $ret = $dsql->dsqlOper($sql, "results");
			// if($ret){
			// 	foreach ($ret as $k => $v) {
			// 		$name = getModuleTitle(array("name" => $v['module']));
			// 		if($name){
			// 			array_push($order, $name);
			// 		}
			// 	}
   //              $list[$i]['order'] = $order;
			// }else{
   //              $list[$i]['order'] = array();
   //          }
			$i++;
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "businessList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}}';
	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if($id == "") die;
	$each = explode(",", $id);
	$storeTitle = array();
	foreach($each as $val){

		//查询是否为未入驻

		//验证权限
        $sql = $dsql->SetQuery("SELECT l.* FROM `#@__business_list` l LEFT JOIN `#@__business_order` o ON o.`bid` = l.`id` WHERE l.`state` = 3 AND o.`id` != '' AND l.`id` = $val" . getCityFilter('l.`cityid`'));
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){
			foreach ($ret as $key => $value) {

				$cityid = $value['cityid'];
				$uid = $value['uid'];
				$title = $value['title'];
				$logo = $value['logo'];
				$address = $value['address'];
				$tel = $value['tel'];
				$qq = $value['qq'];
				$name = $value['name'];
				$phone = $value['phone'];
				$email = $value['email'];
				$company = $value['company'];
				$license = $value['license'];
				$licensenum = $value['licensenum'];

				array_push($storeTitle, $title);

				//获取会员名
				$username = "";
				$nickname = "";
				$sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $uid");
				$ret = $dsql->dsqlOper($sql, "results");

				if($ret){
					$username = $ret[0]['username'];
					$nickname = $ret[0]['nickname'];
				}
				//升级会员为企业会员
				$sql = $dsql->SetQuery("UPDATE `#@__member` SET `mtype` = 2, `company` = '$company', `address` = '$address', `license` = '$license', `licenseState` = '1' WHERE `id` = $uid");
				$dsql->dsqlOper($sql, "update");

				//更新商家入驻状态
				$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `state` = 1 WHERE `id` = $val");
				$dsql->dsqlOper($sql, "update");

				$sql = $dsql->SetQuery("UPDATE `#@__business_list` SET `title` = '$nickname' WHERE `id` = $val AND `title` = ''");
				$dsql->dsqlOper($sql, "update");


				//消息通知
				$param = array(
					"service"  => "member",
					"template" => "config",
					"action"   => "business"
				);


				//自定义配置
				$config = array(
					"username" => $username,
					"title" => $title,
					"status" => "已经通过审核",
					"date" => date("Y-m-d H:i:s", time()),
					"fields" => array(
						'keyword1' => '店铺名称',
						'keyword2' => '审核结果',
						'keyword3' => '处理时间'
					)
				);

				updateMemberNotice($uid, "会员-店铺审核通知", $param, $config);


				//查询开通的模块
				$sql = $dsql->SetQuery("SELECT m.`module` FROM `#@__business_order_module` m LEFT JOIN `#@__business_order` o ON o.`id` = m.`oid` WHERE o.`bid` = $val");
				echo  $sql;die;
				$rea = $dsql->dsqlOper($sql, "results");
				if($rea){
					foreach ($rea as $k => $v) {
						$module = $v['module'];
						$time = time();

						//分类信息
						if($module == 'info'){



						//团购秒杀
						}elseif($module == 'tuan'){

							$sql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `uid` = $uid");
							$ret = $dsql->dsqlOper($sql, "results");
							if(!$ret){
								$sql = $dsql->SetQuery("INSERT INTO `#@__tuan_store` (`cityid`, `uid`, `address`, `tel`, `jointime`, `weight`, `state`) VALUES ('$cityid', '$uid', '$address', '$tel', '$time', '1', '1')");
								$dsql->dsqlOper($sql, "update");
							}

						//房产门户
						}elseif($module == 'house'){

							$sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjcom` WHERE `userid` = $uid");
							$ret = $dsql->dsqlOper($sql, "results");
							if(!$ret){
								$sql = $dsql->SetQuery("INSERT INTO `#@__house_zjcom` (`cityid`, `title`, `litpic`, `userid`, `tel`, `address`, `email`, `weight`, `state`, `pubdate`) VALUES ('$cityid', '$company', '$logo', '$uid', '$tel', '$address', '$email', '1', '1', '$time')");
								$zjcomid = $dsql->dsqlOper($sql, "lastid");

								//经纪人
								if(is_numeric($zjcomid)){
									$sql = $dsql->SetQuery("SELECT `id` FROM `#@__house_zjuser` WHERE `userid` = '$uid'");
									$ret = $dsql->dsqlOper($sql, "results");

									//如果会员已经是中介，则将所属公司更改为新创建的公司
									if($ret){
										$sql = $dsql->SetQuery("UPDATE `#@__house_zjuser` SET `zjcom` = $zjcomid WHERE `userid` = $uid");
										$dsql->dsqlOper($sql, "update");
									}else{
										$sql = $dsql->SetQuery("INSERT INTO `#@__house_zjuser` (`cityid`, `userid`, `zjcom`, `litpic`, `weight`, `state`, `flag`, `pubdate`) VALUES ('$cityid', '$uid', '$zjcomid', '$logo', '1', '1', '1', '$time')");
										$zjuser = $dsql->dsqlOper($sql, "lastid");

										//个人会员升级为企业会员后，需要将此会员所发布的所有房源类型更新为中介
										if(is_numeric($zjuser)){

											//二手房
											$sql = $dsql->SetQuery("UPDATE `#@__house_sale` SET `usertype` = 1, `userid` = $zjuser WHERE `usertype` = 0 AND `userid` = $uid");
											$dsql->dsqlOper($sql, "update");

											//租房
											$sql = $dsql->SetQuery("UPDATE `#@__house_zu` SET `usertype` = 1, `userid` = $zjuser WHERE `usertype` = 0 AND `userid` = $uid");
											$dsql->dsqlOper($sql, "update");

											//写字楼
											$sql = $dsql->SetQuery("UPDATE `#@__house_xzl` SET `usertype` = 1, `userid` = $zjuser WHERE `usertype` = 0 AND `userid` = $uid");
											$dsql->dsqlOper($sql, "update");

											//商铺
											$sql = $dsql->SetQuery("UPDATE `#@__house_sp` SET `usertype` = 1, `userid` = $zjuser WHERE `usertype` = 0 AND `userid` = $uid");
											$dsql->dsqlOper($sql, "update");

											//厂房
											$sql = $dsql->SetQuery("UPDATE `#@__house_cf` SET `usertype` = 1, `userid` = $zjuser WHERE `usertype` = 0 AND `userid` = $uid");
											$dsql->dsqlOper($sql, "update");

										}
									}
								}
							}

						//商城系统
						}elseif($module == 'shop'){

							$sql = $dsql->SetQuery("SELECT `id` FROM `#@__shop_store` WHERE `userid` = $uid");
							$ret = $dsql->dsqlOper($sql, "results");
							if(!$ret){
								$sql = $dsql->SetQuery("INSERT INTO `#@__shop_store` (`cityid`, `title`, `company`, `address`, `logo`, `userid`, `people`, `contact`, `tel`, `qq`, `weight`, `state`, `certi`, `pubdate`) VALUES ('$cityid', '$title', '$company', '$address', '$logo', '$uid', '$name', '$phone', '$tel', '$qq', '1', '1', '1', '$time')");
								$dsql->dsqlOper($sql, "update");
							}

						//装修门户
						}elseif($module == 'renovation'){

							$sql = $dsql->SetQuery("SELECT `id` FROM `#@__renovation_store` WHERE `userid` = $uid");
							$ret = $dsql->dsqlOper($sql, "results");
							if(!$ret){
								$sql = $dsql->SetQuery("INSERT INTO `#@__renovation_store` (`cityid`, `company`, `logo`, `userid`, `people`, `contact`, `qq`, `address`, `weight`, `state`, `license`, `certi`, `regnumber`, `legalPer`, `pubdate`) VALUES ('$cityid', '$company', '$logo', '$uid', '$name', '$tel', '$qq', '$address', '1', '1', '1', '1', '$licensenum', '$name', '$time')");
								$dsql->dsqlOper($sql, "update");
							}

						//招聘求职
						}elseif($module == 'job'){

							$sql = $dsql->SetQuery("SELECT `id` FROM `#@__job_company` WHERE `userid` = $uid");
							$ret = $dsql->dsqlOper($sql, "results");
							if(!$ret){
								$sql = $dsql->SetQuery("INSERT INTO `#@__job_company` (`cityid`, `title`, `logo`, `userid`, `people`, `contact`, `address`, `email`, `weight`, `state`, `pubdate`) VALUES ('$cityid', '$company', '$logo', '$uid', '$name', '$tel', '$address', '$email', '1', '1', '$time')");
								$dsql->dsqlOper($sql, "update");
							}

						//黄页
						}elseif($module == 'huangye'){

							$sql = $dsql->SetQuery("SELECT `id` FROM `#@__huangyelist` WHERE `admin` = $userid");
							$ret = $dsql->dsqlOper($sql, "results");
							if(!$ret){
								$sql = $dsql->SetQuery("INSERT INTO `#@__huangyelist` (`cityid`, `title`, `litpic`, `weight`, `address`, `person`, `tel`, `qq`, `email`, `arcrank`, `pubdate`, `userid`) VALUES ('$cityid', '$company', '$logo', '1', '$address', '$name', '$tel', '$qq', '$email', '1', '$time', '$userid')");
								$dsql->dsqlOper($sql, "update");
							}

						//美食外卖
						}elseif($module == 'waimai'){
                            include(HUONIAOINC . "/config/waimai.inc.php");
                            //基本设置
                            $fencheng_foodprice  = (int)$custom_fencheng_foodprice;
                            $fencheng_delivery   = (int)$custom_fencheng_delivery;
                            $fencheng_addservice = (int)$custom_fencheng_addservice;
                            $fencheng_zsb        = (int)$custom_fencheng_zsb;
                            $fencheng_dabao      = (int)$custom_fencheng_dabao;
                            $fencheng_discount   = (int)$custom_fencheng_discount;
                            $fencheng_promotion  = (int)$custom_fencheng_promotion;
                            $fencheng_firstdiscount = (int)$custom_fencheng_firstdiscount;
                            $fencheng_quan       = (int)$custom_fencheng_quan;
							$sql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_shop_manager` WHERE `userid` = $uid");
							$ret = $dsql->dsqlOper($sql, "results");
							if(!$ret){
//								$archives = $dsql->SetQuery("INSERT INTO `#@__waimai_shop` (`cityid`, `shopname`, `jointime`, `status`, `ordervalid`)	VALUES ('$cityid', '$company', '$time', 1, 1)");
                                $archives = $dsql->SetQuery("INSERT INTO `#@__waimai_shop` (`cityid`, `shopname`, `jointime`, `status`, `ordervalid`,`fencheng_foodprice`,`fencheng_addservice`,`fencheng_zsb`,`fencheng_dabao`,`fencheng_discount`,`fencheng_promotion`,`fencheng_firstdiscount`,`fencheng_quan`)	VALUES ('$cityid', '$company', '$time', 1, 1,'$fencheng_foodprice','$fencheng_addservice','$fencheng_zsb','$fencheng_dabao','$fencheng_discount','$fencheng_promotion','$fencheng_firstdiscount','$fencheng_quan')");
								$aid = $dsql->dsqlOper($archives, "lastid");
								if(is_numeric($aid)){
				          $sql = $dsql->SetQuery("INSERT INTO `#@__waimai_shop_manager` (`userid`, `shopid`, `pubdate`) VALUES ('$uid', '$aid', '$time')");
				          $dsql->dsqlOper($sql, "lastid");
								}
							}

						//自助建站
						}elseif($module == 'website'){

							$sql = $dsql->SetQuery("SELECT `id` FROM `#@__website` WHERE `userid` = $uid");
							$ret = $dsql->dsqlOper($sql, "results");
							if(!$ret){
								$sql = $dsql->SetQuery("INSERT INTO `#@__website` (`title`, `userid`, `weight`, `state`, `pubdate`) VALUES ('$company', '$uid', '1', '1', '$time')");
								$wid = $dsql->dsqlOper($sql, "lastid");
								if(is_numeric($wid)){
									//首页
									$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `title`, `sort`, `pubdate`) VALUES ('$wid', '首页', 'index', '首页', '1', '$time')");
									$dsql->dsqlOper($archives, "update");

									//新闻列表
									$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$wid', '新闻列表', 'news', '', '30', '新闻', '$time')");
									$dsql->dsqlOper($archives, "update");

									//新闻阅读
									$archives = $dsql->SetQuery("INSERT INTO `#@__website_design` (`projectid`, `name`, `alias`, `title`, `sort`, `appname`, `pubdate`) VALUES ('$wid', '新闻详细', 'newsd', '', '31', '新闻', '$time')");
									$dsql->dsqlOper($archives, "update");
								}
							}

						}
					}
				}

			}
		}

	}

	adminLog("审核商家入驻", join('，', $storeTitle));
	echo '{"state": 100, "info": '.json_encode("入驻成功！").'}';
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
		'ui/bootstrap.min.js',
		'ui/chosen.jquery.min.js',
		'admin/business/businessJoin.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."_type")));

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/business";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
