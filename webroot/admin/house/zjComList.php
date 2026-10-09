<?php
/**
 * 管理中介公司
 *
 * @version        $Id: zjComList.php 2014-1-19 上午11:28:16 $
 * @package        HuoNiao.House
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("zjComList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/house";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "zjComList.html";

$tab = "house_zjcom";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($adminCity) {
        $where .= getWrongCityFilter('`cityid`', $adminCity);
    }

	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";
	}

	if($sFlag != ""){
		$where .= " AND `flag` = $sFlag";
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

	$where .= " order by `weight` desc, `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `cityid`, `title`, `userid`, `tel`, `address`, `state`, `flag`, `weight`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];

			$list[$key]["userid"] = $value["userid"];
			if($value["userid"] == 0){
				$list[$key]["username"] = $value["username"];
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username[0]["username"];
			}

			$list[$key]["tel"] = $value["tel"];
			$list[$key]["address"] = $value["address"];
			$list[$key]["state"] = $value["state"];
			$list[$key]["flag"] = $value["flag"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

            $cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;

			$param = array(
				"service"     => "house",
				"template"    => "store-detail",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "zjComList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("zjComDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			$archives = $dsql->SetQuery("SELECT * FROM `#@__house_zjuser` WHERE `zjcom` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			foreach($results as $val_){
				//删除小区 start
				$archives = $dsql->SetQuery("SELECT * FROM `#@__house_community` WHERE `userid` = ".$val_['id']);
				$results = $dsql->dsqlOper($archives, "results");

				foreach($results as $v){
					//删除二手房
					$archives = $dsql->SetQuery("SELECT * FROM `#@__house_sale` WHERE `communityid` = ".$v['id']);
					$results = $dsql->dsqlOper($archives, "results");

					foreach($results as $k_ => $v_){
						$archives = $dsql->SetQuery("SELECT * FROM `#@__house_sale` WHERE `id` = ".$v_['id']);
						$results = $dsql->dsqlOper($archives, "results");

						//删除缩略图
						delPicFile($results[0]['litpic'], "delThumb", "house");

                        //删除视频
                        delPicFile($results[0]['video'], "delVideo", "house");
            
                        //删除全景
                        if($results[0]['qj_type'] == 0){
                            delPicFile($results[0]['qj_file'], "delQuanj", "house");
                        }

						//删除内容图片
						$body = $results[0]['note'];
						if(!empty($body)){
							delEditorPic($body, "house");
						}

						//图集
						$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housesale' AND `aid` = ".$v_['id']);
						$results = $dsql->dsqlOper($archives, "results");

						//删除图片文件
						if(!empty($results)){
							$atlasPic = "";
							foreach($results as $key => $value){
								$atlasPic .= $value['picPath'].",";
							}
							delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
						}

						$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housesale' AND `aid` = ".$v_['id']);
						$results = $dsql->dsqlOper($archives, "update");

						//删除表
						$archives = $dsql->SetQuery("DELETE FROM `#@__house_sale` WHERE `id` = ".$v_['id']);
						$results = $dsql->dsqlOper($archives, "update");
					}

					//删除租房
					$archives = $dsql->SetQuery("SELECT * FROM `#@__house_zu` WHERE `communityid` = ".$v['id']);
					$results = $dsql->dsqlOper($archives, "results");

					foreach($results as $k_ => $v_){
						$archives = $dsql->SetQuery("SELECT * FROM `#@__house_zu` WHERE `id` = ".$v_['id']);
						$results = $dsql->dsqlOper($archives, "results");

						//删除缩略图
						array_push($title, $results[0]['title']);
						delPicFile($results[0]['litpic'], "delThumb", "house");

                        //删除视频
                        delPicFile($results[0]['video'], "delVideo", "house");
            
                        //删除全景
                        if($results[0]['qj_type'] == 0){
                            delPicFile($results[0]['qj_file'], "delQuanj", "house");
                        }

						//删除内容图片
						$body = $results[0]['note'];
						if(!empty($body)){
							delEditorPic($body, "house");
						}

						//图集
						$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housezu' AND `aid` = ".$v_['id']);
						$results = $dsql->dsqlOper($archives, "results");

						//删除图片文件
						if(!empty($results)){
							$atlasPic = "";
							foreach($results as $key => $value){
								$atlasPic .= $value['picPath'].",";
							}
							delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
						}

						$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housezu' AND `aid` = ".$v_['id']);
						$results = $dsql->dsqlOper($archives, "update");

						//删除表
						$archives = $dsql->SetQuery("DELETE FROM `#@__house_zu` WHERE `id` = ".$v_['id']);
						$results = $dsql->dsqlOper($archives, "update");
					}


					$archives = $dsql->SetQuery("SELECT * FROM `#@__house_community` WHERE `id` = ".$v['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除小区缩略图
					delPicFile($results[0]['litpic'], "delThumb", "house");

					//删除户型
					$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_apartment` WHERE `action` = 'community' AND `loupan` = ".$v['id']);
					$results = $dsql->dsqlOper($archives, "results");
					if($results){
						foreach($results as $apartment){
							$archives = $dsql->SetQuery("SELECT * FROM `#@__house_apartment` WHERE `id` = ".$apartment['id']);
							$results = $dsql->dsqlOper($archives, "results");

							//删除缩略图
							array_push($title, $results[0]['title']);
							delPicFile($results[0]['litpic'], "delThumb", "house");

							//图集
							$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'apartmentcommunity' AND `aid` = ".$apartment['id']);
							$results = $dsql->dsqlOper($archives, "results");

							//删除图片文件
							if(!empty($results)){
								$atlasPic = "";
								foreach($results as $key => $value){
									$atlasPic .= $value['picPath'].",";
								}
								delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
							}

							$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'apartmentcommunity' AND `aid` = ".$apartment['id']);
							$results = $dsql->dsqlOper($archives, "update");

							//删除户型表
							$archives = $dsql->SetQuery("DELETE FROM `#@__house_apartment` WHERE `id` = ".$apartment['id']);
							$results = $dsql->dsqlOper($archives, "update");
						}
					}

					//删除相册
					$archives = $dsql->SetQuery("SELECT `id` FROM `#@__house_album` WHERE `action` = 'community' AND `loupan` = ".$v['id']);
					$results = $dsql->dsqlOper($archives, "results");
					if($results){
						foreach($results as $album){
							$archives = $dsql->SetQuery("SELECT * FROM `#@__house_album` WHERE `id` = ".$album['id']);
							$results = $dsql->dsqlOper($archives, "results");

							//删除缩略图
							array_push($title, $results[0]['title']);
							delPicFile($results[0]['litpic'], "delThumb", "house");

							//图集
							$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'albumcommunity' AND `aid` = ".$album['id']);
							$results = $dsql->dsqlOper($archives, "results");

							//删除图片文件
							if(!empty($results)){
								$atlasPic = "";
								foreach($results as $key => $value){
									$atlasPic .= $value['picPath'].",";
								}
								delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
							}

							$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'albumcommunity' AND `aid` = ".$album['id']);
							$results = $dsql->dsqlOper($archives, "update");

							//删除相册表
							$archives = $dsql->SetQuery("DELETE FROM `#@__house_album` WHERE `id` = ".$album['id']);
							$results = $dsql->dsqlOper($archives, "update");
						}
					}

					//删除评论
					$archives = $dsql->SetQuery("SELECT `id` FROM `#@__housecommon` WHERE `action` = 'community' AND `aid` = ".$v['id']);
					$results = $dsql->dsqlOper($archives, "results");
					if($results){
						foreach($results as $common){
							$archives = $dsql->SetQuery("DELETE FROM `#@__housecommon` WHERE `id` = ".$common['id']);
							$results = $dsql->dsqlOper($archives, "update");
						}
					}

					//删除新房源通知
					$archives = $dsql->SetQuery("DELETE FROM `#@__house_notice` WHERE `action` = 'community' AND `aid` = ".$v['id']);
					$results = $dsql->dsqlOper($archives, "update");

					//删除小区
					$archives = $dsql->SetQuery("DELETE FROM `#@__house_community` WHERE `id` = ".$v['id']);
					$results = $dsql->dsqlOper($archives, "update");
				}
				//删除小区 end

				//删除写字楼
				$archives = $dsql->SetQuery("SELECT * FROM `#@__house_xzl` WHERE `userid` = ".$val_['id']);
				$results = $dsql->dsqlOper($archives, "results");
				foreach($results as $value){
					//删除缩略图
					delPicFile($value['litpic'], "delThumb", "house");

                    //删除视频
                    delPicFile($results[0]['video'], "delVideo", "house");
        
                    //删除全景
                    if($results[0]['qj_type'] == 0){
                        delPicFile($results[0]['qj_file'], "delQuanj", "house");
                    }

					//删除内容图片
					$body = $value['note'];
					if(!empty($body)){
						delEditorPic($body, "house");
					}

					//图集
					$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housexzl' AND `aid` = ".$value['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除图片文件
					if(!empty($results)){
						$atlasPic = "";
						foreach($results as $key => $v_){
							$atlasPic .= $_['picPath'].",";
						}
						delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
					}

					$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housexzl' AND `aid` = ".$value['id']);
					$results = $dsql->dsqlOper($archives, "update");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__house_xzl` WHERE `id` = ".$value['id']);
					$dsql->dsqlOper($archives, "update");
				}


				//删除商铺
				$archives = $dsql->SetQuery("SELECT * FROM `#@__house_sp` WHERE `userid` = ".$val_['id']);
				$results = $dsql->dsqlOper($archives, "results");
				foreach($results as $value){
					//删除缩略图
					delPicFile($value['litpic'], "delThumb", "house");

                    //删除视频
                    delPicFile($results[0]['video'], "delVideo", "house");
        
                    //删除全景
                    if($results[0]['qj_type'] == 0){
                        delPicFile($results[0]['qj_file'], "delQuanj", "house");
                    }

					//删除内容图片
					$body = $value['note'];
					if(!empty($body)){
						delEditorPic($body, "house");
					}

					//图集
					$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housesp' AND `aid` = ".$value['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除图片文件
					if(!empty($results)){
						$atlasPic = "";
						foreach($results as $key => $v_){
							$atlasPic .= $_['picPath'].",";
						}
						delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
					}

					$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housesp' AND `aid` = ".$value['id']);
					$results = $dsql->dsqlOper($archives, "update");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__house_sp` WHERE `id` = ".$value['id']);
					$dsql->dsqlOper($archives, "update");
				}


				//删除厂房
				$archives = $dsql->SetQuery("SELECT * FROM `#@__house_cf` WHERE `userid` = ".$val_['id']);
				$results = $dsql->dsqlOper($archives, "results");
				foreach($results as $value){
					//删除缩略图
					delPicFile($value['litpic'], "delThumb", "house");

                    //删除视频
                    delPicFile($results[0]['video'], "delVideo", "house");
        
                    //删除全景
                    if($results[0]['qj_type'] == 0){
                        delPicFile($results[0]['qj_file'], "delQuanj", "house");
                    }

					//删除内容图片
					$body = $value['note'];
					if(!empty($body)){
						delEditorPic($body, "house");
					}

					//图集
					$archives = $dsql->SetQuery("SELECT `picPath` FROM `#@__house_pic` WHERE `type` = 'housecf' AND `aid` = ".$value['id']);
					$results = $dsql->dsqlOper($archives, "results");

					//删除图片文件
					if(!empty($results)){
						$atlasPic = "";
						foreach($results as $key => $v_){
							$atlasPic .= $_['picPath'].",";
						}
						delPicFile(substr($atlasPic, 0, strlen($atlasPic)-1), "delAtlas", "house");
					}

					$archives = $dsql->SetQuery("DELETE FROM `#@__house_pic` WHERE `type` = 'housecf' AND `aid` = ".$value['id']);
					$results = $dsql->dsqlOper($archives, "update");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__house_cf` WHERE `id` = ".$value['id']);
					$dsql->dsqlOper($archives, "update");
				}

				$archives = $dsql->SetQuery("SELECT * FROM `#@__house_zjuser` WHERE `id` = ".$val_['id']);
				$results = $dsql->dsqlOper($archives, "results");

				//删除缩略图
				array_push($title, $results[0]['title']);
				delPicFile($results[0]['litpic'], "delThumb", "house");

				//删除内容图片
				$body = $results[0]['note'];
				if(!empty($body)){
					delEditorPic($body, "house");
				}

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__house_zjuser` WHERE `id` = ".$val_['id']);
				$results = $dsql->dsqlOper($archives, "update");
			}


			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['litpic'], "delThumb", "house");

			//删除内容图片
			$body = $results[0]['note'];
			if(!empty($body)){
				delEditorPic($body, "house");
			}

			//删除域名配置
			$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = 'house' AND `part` = '$tab' AND `iid` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
				// 清除缓存
				checkCache("house_zjcom_list", $val);
				clearCache("house_zjcom_detail", $val);
				clearCache("house_zjcom_total", "key");
				$async[] = $val;
			}
		}
		dataAsync("house",$async,"zjCom");  // 删除中介公司
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除中介公司信息", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("zjComEdit")){
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
				clearCache("house_zjcom_detail", $val);
				// 取消审核
				if($state != 1 && $state_ == 1){
					checkCache("house_zjcom_list", $val);
					clearCache("house_zjcom_total", "key");
				}elseif($state == 1 && $state_ != 1){
					updateCache("house_zjcom_list", 300);
					clearCache("house_zjcom_total", "key");
				}
				$async[] = $val;
			}
		}
		dataAsync("house",$async,"zjCom");  // 中介公司修改状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新中介公司状态", $id."=>".$state);
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
		'ui/bootstrap.min.js',
		'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
		'admin/house/zjComList.js'
	);
	$huoniaoTag->assign('notice', $notice);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/house";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
