<?php
/**
 * 管理楼盘
 *
 * @version        $Id: loupanList.php 2014-1-9 下午20:53:13 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("loupanList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "loupanList.html";

$tab = "house_loupan";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($cityid) {
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

	if($sKeyword != ""){
		$where .= " AND (`title` like '%$sKeyword%' OR `titlealias` like '%$sKeyword%' )";
	}
	if($sAddr != ""){
		if($dsql->getTypeList($sAddr, "houseaddr")){
			$lower = arr_foreach($dsql->getTypeList($sAddr, "houseaddr"));
			$lower = $sAddr.",".join(',',$lower);
		}else{
			$lower = $sAddr;
		}
		$where .= " AND `addrid` in ($lower)";
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE 1 = 1");

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

	if($property !== ""){
		if(is_numeric($property)){
			$where .= " AND `salestate` = $property";
		}elseif($property == "hot"){
			$where .= " AND `hot` = 1";
		}elseif($property == "rec"){
			$where .= " AND `rec` = 1";
		}elseif($property == "tuan"){
			$where .= " AND `tuan` = 1";
		}

		$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
		$totalPage = ceil($totalCount/$pagestep);
	}

	$where .= " order by `id` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `litpic`, `addrid`, `userid`, `weight`, `price`, `ptype`, `views`, `state`, `salestate`, `pubdate`, `hot`, `rec`, `tuan`,`manageuid` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["manageuid"] = $value["manageuid"];
			$list[$key]["litpic"] = $value["litpic"];
			$list[$key]["addrid"] = $value["addrid"];

			//地区
            $addrname = $value['addrid'];
            if($addrname){
                $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
            }
			$list[$key]["addrname"] = $addrname;

			$list[$key]["userid"] = $value["userid"];


			if($value['manageuid'] != ''){
				//会员
//				$gwSql = $dsql->SetQuery("SELECT `userid` FROM `#@__house_gw` WHERE `id` IN (".$value['userid'].")");
//				$gwname = $dsql->dsqlOper($gwSql, "results");
//				if($gwname){
//					foreach ($gwname as $k => $v) {
						$userSql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ". $value['manageuid']);
						$res     = $dsql->dsqlOper($userSql,'results');
						$username = $res[0]['nickname'] ? $res[0]['nickname'] : $res[0]['username'];
//					}
//				}
			}
			$list[$key]["username"] = $username;

			$list[$key]["weight"] = $value["weight"];
			$list[$key]["price"] = $value["price"];
			$list[$key]["ptype"] = $value["ptype"];
			$list[$key]["views"] = $value["views"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["salestate"] = $value["salestate"];
			$list[$key]["hot"] = $value["hot"];
			$list[$key]["rec"] = $value["rec"];
			$list[$key]["tuan"] = $value["tuan"];
			$list[$key]["date"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"  => "house",
				"template" => "loupan-detail",
				"id"       => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);

		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "loupanList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("loupanDel")){
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

			array_push($title, $results[0]['title']);

			//删除楼盘缩略图
			delPicFile($results[0]['litpic'], "delThumb", "house");

            //banner
			delPicFile($results[0]['banner'], "delAtlas", "house");

            //删除带访确认单
            $visitConfirmPrintTemplate = $results[0]['visitConfirmPrintTemplate'];
            if($visitConfirmPrintTemplate){
                $visitConfirmPrintTemplate = unserialize($visitConfirmPrintTemplate);
                if(is_array($visitConfirmPrintTemplate) && $visitConfirmPrintTemplate['image']){
                    delPicFile($visitConfirmPrintTemplate['image'], "delCard", "house");
                }
            }

			//删除沙盘
			$archives = $dsql->SetQuery("SELECT `litpic` FROM `#@__house_shapan` WHERE `loupan` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
                delPicFile($results[0]['litpic'], "delCard", "house");
                $archives = $dsql->SetQuery("DELETE FROM `#@__house_shapan` WHERE `loupan` = ".$val);
                $results = $dsql->dsqlOper($archives, "update");
			}

			//删除全景
			$archives = $dsql->SetQuery("SELECT `id`, `litpic`, `typeid`, `file` FROM `#@__house_360qj` WHERE `loupan` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $common){
                    delPicFile($common['litpic'], "delThumb", "house");
                    if($common['typeid'] == 0){
                        delPicFile($common['file'], "delQuanj", "house");
                    }
				}
                $archives = $dsql->SetQuery("DELETE FROM `#@__house_360qj` WHERE `loupan` = ".$val);
                $results = $dsql->dsqlOper($archives, "update");
			}

			//删除视频
			$archives = $dsql->SetQuery("SELECT `id`, `litpic`, `videotype`, `videourl` FROM `#@__house_loupanvideo` WHERE `loupan` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $common){
                    delPicFile($common['litpic'], "delThumb", "house");
                    if($common['videotype'] == 0){
                        delPicFile($common['videourl'], "delVideo", "house");
                    }
				}
                $archives = $dsql->SetQuery("DELETE FROM `#@__house_loupanvideo` WHERE `loupan` = ".$val);
                $results = $dsql->dsqlOper($archives, "update");
			}

			//删除房源
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_listing` WHERE `loupan` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
                foreach($results as $listing){
                    $archives = $dsql->SetQuery("SELECT * FROM `#@__house_listing` WHERE `id` = ".$listing['id']);
                    $results = $dsql->dsqlOper($archives, "results");

                    //删除缩略图
                    array_push($title, $results[0]['title']);
                    delPicFile($results[0]['litpic'], "delThumb", "house");

                    //删除内容图片
                    $body = $results[0]['note'];
                    if(!empty($body)){
                        delEditorPic($body, "house");
                    }

                    //图集
                    $archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'listing' AND `aid` = ".$listing['id']);
                    $results = $dsql->dsqlOper($archives, "results");

                    //删除图片文件
                    if(!empty($results)){
                        $atlasPic = "";
                        foreach($results as $key => $value){
                            $atlasPic .= $value['picPath'].",";
                        }
                        delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
                    }

                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'listing' AND `aid` = ".$listing['id']);
                    $results = $dsql->dsqlOper($archives, "update");

                    //删除降价通知
                    $archives = $dsql->SetQuery("DELETE FROM `#@__house_notice` WHERE `action` = 'loupan' AND `htype` = 1 AND `aid` = ".$listing['id']);
                    $results = $dsql->dsqlOper($archives, "update");
                }

                //删除房源表
                $archives = $dsql->SetQuery("DELETE FROM `#@__house_listing` WHERE `loupan` = ".$val);
                $results = $dsql->dsqlOper($archives, "update");
            }

			//删除户型
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_apartment` WHERE `action` = 'loupan' AND `loupan` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $apartment){
					$archives = $dsql->SetQuery("SELECT * FROM `#@__house_apartment` WHERE `id` = ".$apartment['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除缩略图
					array_push($title, $results[0]['title']);
					delPicFile($results[0]['litpic'], "delThumb", "house");

					//图集
					$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'apartmentloupan' AND `aid` = ".$apartment['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除图片文件
					if(!empty($results)){
						$atlasPic = "";
						foreach($results as $key => $value){
							$atlasPic .= $value['picPath'].",";
						}
						delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
					}

					$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'apartmentloupan' AND `aid` = ".$apartment['id']);
					$results = $dsql->dsqlOper($archives, "update");
				}

                //删除户型表
                $archives = $dsql->SetQuery("DELETE FROM `#@__house_apartment` WHERE `action` = 'loupan' AND `loupan` = ".$val);
                $results = $dsql->dsqlOper($archives, "update");
			}

			//删除相册
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_album` WHERE `action` = 'loupan' AND `loupan` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $album){
					$archives = $dsql->SetQuery("SELECT * FROM `#@__house_album` WHERE `id` = ".$album['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除缩略图
					array_push($title, $results[0]['title']);
					delPicFile($results[0]['litpic'], "delThumb", "house");

					//图集
					$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = ".$album['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除图片文件
					if(!empty($results)){
						$atlasPic = "";
						foreach($results as $key => $value){
							$atlasPic .= $value['picPath'].",";
						}
						delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
					}

					$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'albumloupan' AND `aid` = ".$album['id']);
					$results = $dsql->dsqlOper($archives, "update");
				}

                //删除相册表
                $archives = $dsql->SetQuery("DELETE FROM `#@__house_album` WHERE `action` = 'loupan' AND `loupan` = ".$val);
                $results = $dsql->dsqlOper($archives, "update");
			}

			//删除评论
			$archives = $dsql->SetQuery("DELETE FROM `#@__housecommon` WHERE `action` = 'loupan' AND `aid` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");

			//删除资讯
			$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_loupannews` WHERE `loupan` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if($results){
				foreach($results as $news){
					$archives = $dsql->SetQuery("SELECT * FROM `#@__house_loupannews` WHERE `id` = ".$news['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除内容图片
					$body = $results[0]['body'];
					if(!empty($body)){
						delEditorPic($body, "house");
					}
				}
			}

            //删除资讯
            $archives = $dsql->SetQuery("DELETE FROM `#@__house_loupannews` WHERE `loupan` = ".$val);
            $results = $dsql->dsqlOper($archives, "update");

			//删除降价通知
			$archives = $dsql->SetQuery("DELETE FROM `#@__house_notice` WHERE `action` = 'loupan' AND `htype` = 0 AND `aid` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			//删除团购报名
			$archives = $dsql->SetQuery("DELETE FROM `#@__house_loupantuan` WHERE `aid` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			//删除楼盘
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				checkCache("house_loupan_list", $val);
				clearCache("house_loupan_detail", $val);
				clearCache("house_loupan_total", "key");
                $async[] = $val;
			}
		}
        dataAsync("house",$async,"loupan");  // 楼盘、删除
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除楼盘信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("loupanEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){
			$sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$tab."` WHERE `id` = ".$val);
			$res = $dsql->dsqlOper($sql, "results");
			if(!$res) continue;
			$state_ = $res[0]['state'];

			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				clearCache("house_loupan_detail", $val);
				// 取消审核
				if($state != 1 && $state_ == 1){
					checkCache("house_loupan_list", $val);
					clearCache("house_loupan_total", "key");
				}elseif($state == 1 && $state_ != 1){
					updateCache("house_loupan_list", 300);
					clearCache("house_loupan_total", "key");
				}
				$async[] = $val;
			}
		}
        dataAsync("house",$async,"loupan"); // 楼盘、修改状态

		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新楼盘状态", $id."=>".$state);
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
		'admin/house/loupanList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "houseaddr")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
