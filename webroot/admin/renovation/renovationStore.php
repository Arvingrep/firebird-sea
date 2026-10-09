<?php
/**
 * 管理装修公司
 *
 * @version        $Id: renovationStore.php 2014-3-5 下午13:20:15 $
 * @package        HuoNiao.Renovation
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("renovationStore");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/renovation";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "renovationStore.html";

$tab = "renovation_store";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($cityid) {
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

    if($sKeyword != ""){

        $_where = array();
        array_push($_where, "`company` like '%$sKeyword%' OR `contact` like '%$sKeyword%' OR `people` like '%$sKeyword%' OR `address` like '%$sKeyword%'");

		$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `company` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
                array_push($_where, "`userid` in (".join(",", $userid).")");
			}
		}

		$where .= " AND (".join(" OR ", $_where).")";
	}

	if($sCerti != ""){
		$where .= " AND `certi` = $sCerti";
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
	$archives = $dsql->SetQuery("SELECT `id`, `company`, `logo`, `addrid`, `userid`, `contact`, `state`, `certi`, `weight`, `pubdate`, `refuse` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["company"] = $value["company"];
			$list[$key]["logo"] = $value["logo"];

			$list[$key]["addrid"] = $value["addrid"];

            //地区
            $addrname = $value["addrid"];
            if($addrname){
                $addrname = getPublicParentInfo(array('tab' => 'site_area', 'id' => $addrname, 'type' => 'typename', 'split' => ' '));
            }
            $list[$key]["addrname"] = $addrname;

            $list[$key]["userid"] = $value["userid"];
			if($value["userid"] == 0){
				$list[$key]["username"] = $value["username"];
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username[0]["username"];
			}

			$list[$key]["contact"] = $value["contact"];
			$list[$key]["state"] = $value["state"];
            $list[$key]["refuse"]  = $value["refuse"];
			$list[$key]["certi"] = $value["certi"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$param = array(
				"service"     => "renovation",
				"template"    => "company-detail",
				"id"          => $value['id']
			);
			$list[$key]['url'] = getUrlPath($param);
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "renovationStore": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("renovationStoreDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$async = array();
		$title = array();
		foreach($each as $val){

			//删除促销 start
			$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_storesale` WHERE `store` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			foreach($results as $k => $v){
				//删除内容图片
				$body = $v['body'];
				if(!empty($body)){
					delEditorPic($body, "renovation");
				}

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_storesale` WHERE `id` = ".$v['id']);
				$dsql->dsqlOper($archives, "update");
			}
			//删除俏销 end


			//删除团队 start
			$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_team` WHERE `company` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			foreach($results as $k => $v){

				//删除作品 start
				$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_case` WHERE `designer` = ".$v['id']);
				$results = $dsql->dsqlOper($archives, "results");

				foreach($results as $k_ => $v_){
					//删除缩略图
					delPicFile($v_['litpic'], "delThumb", "renovation");

					//删除图集
					$pics = explode(",", $v_['pics']);
					foreach($pics as $k__ => $v__){
						delPicFile($v__, "delAtlas", "renovation");
					}

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_case` WHERE `id` = ".$v_['id']);
					$dsql->dsqlOper($archives, "update");
				}
				//删除作品 end

				//删除日记 start
				$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_diary` WHERE `designer` = ".$v['id']);
				$results = $dsql->dsqlOper($archives, "results");

				foreach($results as $k_ => $v_){

					//删除日记列表 start
					$archives = $dsql->SetQuery("SELECT * FROM `#@__renovation_diarylist` WHERE `diary` = ".$v_['id']);
					$results = $dsql->dsqlOper($archives, "results");

					foreach($results as $k__ => $v__){
						//删除内容图片
						$body = $v__['body'];
						if(!empty($body)){
							delEditorPic($body, "renovation");
						}

						//删除表
						$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_diarylist` WHERE `id` = ".$v__['id']);
						$dsql->dsqlOper($archives, "update");
					}
					//删除日记列表end

					//删除缩略图
					delPicFile($v_['litpic'], "delThumb", "renovation");

					//删除户型图
					$pics = explode(",", $v_['unitspic']);
					foreach($pics as $k__ => $v__){
						delPicFile($v__, "delCard", "renovation");
					}

					//删除现场图
					$pics = $v_['pics'];
					$pics = explode("||", $pics);
					foreach ($pics as $key => $value) {
						$pic = explode("##", $value);
						delPicFile($pic[0], "delAtlas", "renovation");
					}

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_diary` WHERE `id` = ".$v_['id']);
					$dsql->dsqlOper($archives, "update");
				}
				//删除日记 end

				//删除缩略图
				delPicFile($results[0]['photo'], "delPhoto", "renovation");

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_team` WHERE `id` = ".$v['id']);
				$results = $dsql->dsqlOper($archives, "update");
			}
			//删除团队 end

			//删除留言
			$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_guest` WHERE `company` = ".$val);
			$dsql->dsqlOper($archives, "update");

			//删除预约
			$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_rese` WHERE `company` = ".$val);
			$dsql->dsqlOper($archives, "update");

			//删除预约参观
			$archives = $dsql->SetQuery("DELETE FROM `#@__renovation_visit` WHERE `company` = ".$val);
			$dsql->dsqlOper($archives, "update");

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['logo'], "delLogo", "renovation");

			//删除资质
			$pics = explode("||", $results[0]['certs']);
			foreach($pics as $k_ => $v_){
				$p = explode("##", $v_);
				delPicFile($p[0], "delAtlas", "renovation");
			}

			//删除内容图片
			$body = $results[0]['body'];
			if(!empty($body)){
				delEditorPic($body, "renovation");
			}

			//删除域名配置
			$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = 'renovation' AND `part` = '$tab' AND `iid` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
            }
		}
		dataAsync("renovation",$async,"store");  // 装修门户、商店、删除
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除装修公司", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("renovationStoreEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	$async = array();
	if($id != ""){
		foreach($each as $val){

            $sql = $dsql->SetQuery("SELECT `company`, `state`, `userid` FROM `#@__".$tab."` WHERE `id` = ".$val);
            $res = $dsql->dsqlOper($sql, "results");
            if(!$res) continue;
            $title = $res[0]['company'];
            $state_ = $res[0]['state'];
            $userid = $res[0]['userid'];
            
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}else{
			    $async[] = $val;
                    
                //失败原因
                if($state == 2){
                    $archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `refuse` = '$refuse' WHERE `id` = ".$val);
                    $results = $dsql->dsqlOper($archives, "update");
                }

                //会员消息通知
                if($state != $state_){

                    $status = "";

                    //等待审核
                    if($state == 0){
                        $status = "进入等待审核状态。";

                    //已审核
                    }elseif($state == 1){
                        $status = "已经通过审核。";

                    //审核失败
                    }elseif($state == 2){
                        $status = "审核失败，" . $refuse;
                    }

                    $param = array(
                        "service"  => "member",
                        "template" => "config",
                        "action"   => "renovation"
                    );

                    //获取会员名
                    $username = "";
                    $sql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if($ret){
                        $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                    }

                    //自定义配置
                    $config = array(
                        "username" => $username,
                        "title" => $title,
                        "status" => $status,
                        "date" => date("Y-m-d H:i:s", GetMkTime(time())),
                        "fields" => array(
                            'keyword1' => '店铺名称',
                            'keyword2' => '审核结果',
                            'keyword3' => '处理时间'
                        )
                    );

                    updateMemberNotice($userid, "会员-店铺审核通知", $param, $config);

                }
            }
		}
		dataAsync("renovation",$async,"store");  // 装修门户-商店-修改状态
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("更新装修公司状态", $id."=>".$state);
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
		'admin/renovation/renovationStore.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "renovationaddr")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/renovation";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
