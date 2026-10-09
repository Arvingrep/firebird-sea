<?php
/**
 * 管理自助建站
 *
 * @version        $Id: website.php 2014-6-16 下午15:22:13 $
 * @package        HuoNiao.Website
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("website");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/website";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "website.html";

$tab = "website";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

    //城市
    if($adminCity){
        global $data;
        $data = '';
        $cityAreaData = $dsql->getTypeList($adminCity, 'site_area');
        $cityAreaIDArr = parent_foreach($cityAreaData, 'id');
        $cityAreaIDs = join(',', $cityAreaIDArr);
        if($cityAreaIDs){
            $where2 = " AND `addr` in ($cityAreaIDs)";
        }else{
            $where2 = " 3 = 4";
        }
    }else{
        //城市管理员
        if($userType == 3){
            if($adminAreaIDs){
                $where2 = " AND `addr` in ($adminAreaIDs)";
            }else{
                $where2 = " AND 1 = 2";
            }
        }
    }
    $userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE 1=1".$where2);
    $userResult = $dsql->dsqlOper($userSql, "results");
    if($userResult){
        $userid = array();
        foreach($userResult as $key => $user){
            array_push($userid, $user['id']);
        }
        $where .= " AND `userid` in (".join(",", $userid).")";
    }
	if($sKeyword != ""){
		$where .= " AND `title` like '%$sKeyword%'";

		$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%'".$where2);
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
				$where .= " OR `userid` in (".join(",", $userid).")";
			}
		}

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
	$archives = $dsql->SetQuery("SELECT `id`, `domaintype`, `title`, `userid`, `state`, `weight`, `pubdate` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];

			$RenrenCrypt = new RenrenCrypt();
			$projectid   = base64_encode($RenrenCrypt->php_encrypt($value["id"]));
			$list[$key]["projectid"] = $projectid;

			$list[$key]["title"] = $value["title"];

			$list[$key]["userid"] = $value["userid"];
			$userSql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ". $value['userid']);
			$username = $dsql->getTypeName($userSql);
			if($username){
				$list[$key]["username"] = $username[0]["username"];
			}else{
				$list[$key]["username"] = '无';
			}

			$list[$key]["state"] = $value["state"];
			$list[$key]["weight"] = $value["weight"];
			$list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

			$customDomain = "";
			$getDomain = getDomain("website", "website", $value['id']);
			if($getDomain && $getDomain['state'] == 1){
				$customDomain = $cfg_secureAccess . $getDomain['domain'];
			}
			if($customDomain && $value['domaintype']){
				$list[$key]["url"] = $customDomain;
			}else{
				$param = array(
					"service"      => "website",
					"template"     => "site".$value['id']
				);
				$list[$key]["url"] = getUrlPath($param);
			}
		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "website": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("websiteDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			//删除下属信息 start
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."_design` WHERE `projectid` = ".$val);
			$dsql->dsqlOper($archives, "update");
			//删除下属信息 end

			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除域名配置
			$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = 'website' AND `part` = '$tab' AND `iid` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			//更新规则文件
			updateHtaccess();

			//删除新闻分类
			$archives = $dsql->SetQuery("DELETE FROM `#@__website_articletype` WHERE `website` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			//删除新闻
			$archives = $dsql->SetQuery("SELECT * FROM `#@__website_article` WHERE `website` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if(count($results) > 0){
				foreach($results as $key => $val_){

					//删除内容图片
					$body = $val_['body'];
					if(!empty($body)){
						delEditorPic($body, "website");
					}

					delPicFile($val_['litpic'], "delThumb", "website");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__website_article` WHERE `id` = ".$val_['id']);
					$results = $dsql->dsqlOper($archives, "update");

				}
			}

			//删除活动
			$archives = $dsql->SetQuery("SELECT * FROM `#@__website_events` WHERE `website` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if(count($results) > 0){
				foreach($results as $key => $val_){

					//删除内容图片
					$body = $val_['body'];
					if(!empty($body)){
						delEditorPic($body, "website");
					}

					delPicFile($val_['litpic'], "delThumb", "website");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__website_events` WHERE `id` = ".$val_['id']);
					$results = $dsql->dsqlOper($archives, "update");

				}
			}

			//删除产品分类
			$archives = $dsql->SetQuery("DELETE FROM `#@__website_producttype` WHERE `website` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");

			//删除产品
			$archives = $dsql->SetQuery("SELECT * FROM `#@__website_product` WHERE `website` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if(count($results) > 0){
				foreach($results as $key => $val_){

					//删除内容图片
					$body = $val_['body'];
					if(!empty($body)){
						delEditorPic($body, "website");
					}

					delPicFile($val_['litpic'], "delThumb", "website");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__website_product` WHERE `id` = ".$val_['id']);
					$results = $dsql->dsqlOper($archives, "update");

				}
			}

			//删除案例
			$archives = $dsql->SetQuery("SELECT * FROM `#@__website_case` WHERE `website` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if(count($results) > 0){
				foreach($results as $key => $val_){

					//删除内容图片
					$body = $val_['body'];
					if(!empty($body)){
						delEditorPic($body, "website");
					}

					delPicFile($val_['litpic'], "delThumb", "website");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__website_case` WHERE `id` = ".$val_['id']);
					$results = $dsql->dsqlOper($archives, "update");

				}
			}

			//删除视频
			$archives = $dsql->SetQuery("SELECT * FROM `#@__website_video` WHERE `website` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if(count($results) > 0){
				foreach($results as $key => $val_){

					//删除内容图片
					$body = $val_['body'];
					if(!empty($body)){
						delEditorPic($body, "website");
					}

					delPicFile($val_['litpic'], "delThumb", "website");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__website_video` WHERE `id` = ".$val_['id']);
					$results = $dsql->dsqlOper($archives, "update");

				}
			}

			//删除全景
			$archives = $dsql->SetQuery("SELECT * FROM `#@__website_360qj` WHERE `website` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");
			if(count($results) > 0){
				foreach($results as $key => $val_){

					//删除内容图片
					$body = $val_['body'];
					if(!empty($body)){
						delEditorPic($body, "website");
					}

					delPicFile($val_['litpic'], "delThumb", "website");

					//删除表
					$archives = $dsql->SetQuery("DELETE FROM `#@__website_360qj` WHERE `id` = ".$val_['id']);
					$results = $dsql->dsqlOper($archives, "update");

				}
			}

			//删除留言
			$archives = $dsql->SetQuery("DELETE FROM `#@__website_guest` WHERE `website` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");


			//删除表
			$archives = $dsql->SetQuery("DELETE FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}
		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{
			adminLog("删除自助建站", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("websiteEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
		foreach($each as $val){
			$archives = $dsql->SetQuery("UPDATE `#@__".$tab."` SET `state` = ".$state." WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "update");
			if($results != "ok"){
				$error[] = $val;
			}

			//消息通知
			$sql = $dsql->SetQuery("SELECT `module`, `part`, `iid`, `refund` FROM `#@__domain` WHERE `id` = $val");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
				$module = $ret[0]['module'];
				$part   = $ret[0]['part'];
				$iid    = $ret[0]['iid'];
				$refund = $ret[0]['refund'];

				$getDomain = getDomain($value['module'], $value['part'], $value['iid']);
				$domain = $getDomain['domain'];

				$notify = $state == 1 ? "会员-域名绑定成功" : "会员-域名绑定失败";

				//自助建站
				if($module == "website"){
					$sql = $dsql->SetQuery("SELECT `title`, `userid` FROM `#@__website` WHERE `id` = $iid");
					$ret = $dsql->dsqlOper($sql, "results");
					if($ret){
						$title = $ret[0]['title'];
						$userid = $ret[0]['userid'];

						$param = array(
							"service"  => "member",
							"template" => "config",
							"action"   => "website"
						);

					}
				}

				//自定义配置
	            $config = array(
	                "title" => $title,
	                "domain" => $domain,
	                "refund" => $refund,
	                "fields" => array(
	                    'keyword1' => '店铺名称',
	                    'keyword2' => '绑定域名',
	                    'keyword3' => '审核状态'
	                )
	            );

				updateMemberNotice($userid, $notify, $param, $config);
			}

		}
		if(!empty($error)){
			echo '{"state": 200, "info": '.json_encode($error).'}';
		}else{

			//更新规则文件
			// updateHtaccess();

			adminLog("更新自助建站状态", $id."=>".$state);
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
		'admin/website/website.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, "website_type")));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));

	$huoniaoTag->assign('notice', $notice);

	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/website";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
