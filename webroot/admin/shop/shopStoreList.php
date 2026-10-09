<?php
/**
 * 管理商城店铺
 *
 * @version        $Id: shopStoreList.php 2014-2-11 下午17:26:10 $
 * @package        HuoNiao.Shop
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("shopStoreList");
$dsql  = new dsql($dbo);
$tpl   = dirname(__FILE__)."/../templates/shop";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shopStoreList.html";

$tab = "shop_store";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

    $where = getCityFilter('`cityid`');

    if ($cityid) {
        $where .= getWrongCityFilter('`cityid`', $cityid);
    }

	if($sKeyword != ""){

        $_where = array();
        array_push($_where, "`title` like '%$sKeyword%' OR `tel` like '%$sKeyword%' OR `referred` like '%$sKeyword%' OR `address` like '%$sKeyword%'");

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

	if($shoptype != ""){
		$where .= " AND `shoptype` = $shoptype";
	}

	if($sIndustry != ""){
		$where .= " AND `industry` = $sIndustry";
	}

	if($sAddr != ""){
		if($dsql->getTypeList($sAddr, "shopaddr")){
			$lower = arr_foreach($dsql->getTypeList($sAddr, "shopaddr"));
			$lower = $sAddr.",".join(',',$lower);
		}else{
			$lower = $sAddr;
		}
		$where .= " AND `addrid` in ($lower)";
	}

	if($sCerti != "" && $sCerti !=3){
		$where .= " AND `certi` = $sCerti";
	}

	if ($sCerti == 3){
        $where .= " AND `psaudit` = 1";
    }

	if($sDelivery != ""){
		$where .= " AND `".$sDelivery."` = 1";
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

	$where .= " order by `pubdate` desc";

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `title`, `logo`, `cityid`, `industry`, `userid`, `contact`, `tel`, `state`, `certi`, `weight`, `pubdate`, `psaudit`, `express`, `merchant_deliver`, `distribution`, `shoptype`, `refuse` FROM `#@__".$tab."` WHERE 1 = 1".$where);
	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["logo"] = getFilePath($value["logo"]);

			$list[$key]["cityid"] = $value["cityid"];
            $list[$key]["cityname"] = getSiteCityName($value["cityid"]);

			$list[$key]["industryid"] = $value["industry"];

			//行业
			$typeSql = $dsql->SetQuery("SELECT `typename` FROM `#@__shop_type` WHERE `id` = ". $value["industry"]);
			$typename = $dsql->getTypeName($typeSql);
			$list[$key]["industry"] = $typename ? $typename[0]['typename'] : '';

			$list[$key]["userid"] = $value["userid"];
			if($value["userid"] == 0){
				$list[$key]["username"] = '<font color="gray">未绑定会员</font>';
			}else{
				$userSql = $dsql->SetQuery("SELECT `id`, `username`, `nickname` FROM `#@__member` WHERE `id` = ". $value['userid']);
				$username = $dsql->getTypeName($userSql);
				$list[$key]["username"] = $username ? ($username[0]["nickname"] ? $username[0]["nickname"] : $username[0]["username"]) : '<font color="red">会员异常</font>';
			}

            $list[$key]["contact"] = $value["tel"];
            $list[$key]["state"]   = $value["state"];
            $list[$key]["refuse"]  = $value["refuse"];
            $list[$key]["certi"]   = $value["certi"];
            $list[$key]["weight"]  = $value["weight"];
            $list[$key]["psaudit"] = $value["psaudit"];
            $list[$key]["shoptype"] = (int)$value["shoptype"];
            $list[$key]["pubdate"] = date('Y-m-d H:i:s', $value["pubdate"]);

            $delivery = array();
            if($value["express"]){
                array_push($delivery, '快递配送');
            }
            if($value["merchant_deliver"]){
                array_push($delivery, '商家自送');
            }
            if($value["distribution"]){
                array_push($delivery, '平台配送');
            }
            $list[$key]["delivery"] = join('、', $delivery);

			$param = array(
				"service"  => "shop",
				"template" => "store-detail",
				"id"       => $value['id']
			);
			$list[$key]["url"] = getUrlPath($param);

            //查询店铺商品数量
            $sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__shop_product` WHERE `store` = ".$value['id']);
            $_count = (int)$dsql->getOne($sql);
            $list[$key]["proCount"] = $_count;

            //查询店铺订单数量
            $sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__shop_order` WHERE `store` = ".$value['id']);
            $_count = (int)$dsql->getOne($sql);
            $list[$key]["orderCount"] = $_count;

            //查询分类数量
            $sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__shop_category` WHERE `type` = ".$value['id']);
            $_count = (int)$dsql->getOne($sql);
            $list[$key]["categoryCount"] = $_count;

            //查询运费模板数量
            $sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__shop_logistictemplate` WHERE `sid` = ".$value['id']);
            $_count = (int)$dsql->getOne($sql);
            $list[$key]["logisticCount"] = $_count;

            //查询分店数量
            $sql = $dsql->SetQuery("SELECT count(`id`) FROM `#@__shop_branch_store` WHERE `branchid` = ".$value['id']);
            $_count = (int)$dsql->getOne($sql);
            $list[$key]["branchCount"] = $_count;

		}

		if(count($list) > 0){
			echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}, "shopStoreList": '.json_encode($list).'}';
		}else{
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
		}

	}else{
		echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "totalGray": '.$totalGray.', "totalAudit": '.$totalAudit.', "totalRefuse": '.$totalRefuse.'}}';
	}
	die;

//删除
}elseif($dopost == "del"){
	if(!testPurview("shopStoreDel")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};
	if($id != ""){

		$each = explode(",", $id);
		$error = array();
		$title = array();
		foreach($each as $val){

			//删除下属商品 start
			$archives = $dsql->SetQuery("SELECT * FROM `#@__shop_product` WHERE `store` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			foreach($results as $k => $v){
				//删除评论
				$archives = $dsql->SetQuery("DELETE FROM `#@__shop_common` WHERE `aid` = ".$v['id']);
				$dsql->dsqlOper($archives, "update");

				//删除缩略图
				delPicFile($v['litpic'], "delThumb", "shop");

				//删除图集
				$pics = explode(",", $v['pics']);
				foreach($pics as $k_ => $v_){
					delPicFile($v_, "delAtlas", "shop");

				}

				//删除内容图片
				$body = $v['body'];
				if(!empty($body)){
					delEditorPic($body, "shop");
				}

				//删除表
				$archives = $dsql->SetQuery("DELETE FROM `#@__shop_product` WHERE `id` = ".$v['id']);
				$dsql->dsqlOper($archives, "update");
			}
			//删除下属商品 end

			//删除下属分类
			$archives = $dsql->SetQuery("DELETE FROM `#@__shop_category` WHERE `type` = ".$val);
			$dsql->dsqlOper($archives, "update");


			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$tab."` WHERE `id` = ".$val);
			$results = $dsql->dsqlOper($archives, "results");

			//删除缩略图
			array_push($title, $results[0]['title']);
			delPicFile($results[0]['logo'], "delLogo", "shop");

			//删除内容图片
			$body = $results[0]['note'];
			if(!empty($body)){
				delEditorPic($body, "shop");
			}

			//删除域名配置
			$archives = $dsql->SetQuery("DELETE FROM `#@__domain` WHERE `module` = 'shop' AND `part` = '$tab' AND `iid` = ".$val);
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
			adminLog("删除商城店铺", join(", ", $title));
			echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
		}
		die;

	}
	die;

//更新状态
}elseif($dopost == "updateState"){
	if(!testPurview("shopStoreEdit")){
		die('{"state": 200, "info": '.json_encode("对不起，您无权使用此功能！").'}');
	};

    //超管一键审核通过所有待审信息
    if($manage){

        $id = array();
        $sql = $dsql->SetQuery("SELECT `id` FROM `#@__".$tab."` WHERE `state` = 0" . getCityFilter('`cityid`'));
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $id = array_column($ret, 'id');
        }
        $id = join(',', $id);

    }
    
	$each = explode(",", $id);
	$error = array();
	if($id != ""){
	    if ((int)$leixing == 0) {
            foreach ($each as $val) {

                $sql = $dsql->SetQuery("SELECT `title`, `state`, `userid` FROM `#@__".$tab."` WHERE `id` = ".$val);
                $res = $dsql->dsqlOper($sql, "results");
                if(!$res) continue;
                $title = $res[0]['title'];
                $state_ = $res[0]['state'];
                $userid = $res[0]['userid'];

                $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET `state` = " . $state . " WHERE `id` = " . $val);
                $results  = $dsql->dsqlOper($archives, "update");
                if ($results != "ok") {
                    $error[] = $val;
                }else{
                    
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
                            "action"   => "shop"
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
                    
                    dataAsync("shop",$val,"store");  // 在线商城，商店，更新状态
                }
            }
            if (!empty($error)) {
                echo '{"state": 200, "info": ' . json_encode($error) . '}';
            } else {
                adminLog("更新商城店铺状态", $id . "=>" . $state);
                echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';
            }
        } else {

	        $Sql = $dsql->SetQuery("SELECT `id`,`merchant_deliver`,`distribution` FROM `#@__" . $tab . "` WHERE 1=1 AND `id` = '$id'");
	        $Res = $dsql->dsqlOper($Sql, "results");

	        if ($Res) {
	            $updatestr = '';

                if ($Res[0]['merchant_deliver'] == 1) {
                    $updatestr = '`distribution` = 1,`merchant_deliver` = 0';
                } else {
                    $updatestr = '`merchant_deliver` = 1,`distribution` = 0';
                }

                $archives = $dsql->SetQuery("UPDATE `#@__" . $tab . "` SET $updatestr ,`psaudit` = 0 WHERE `id` = ".$id);
                $results  = $dsql->dsqlOper($archives, "update");

                if ($results != 'ok') {
                    echo '{"state": 200, "info": 更新失败}';
                } else {
                    echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';
                }
            }
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
        'ui/chosen.jquery.min.js',
		'admin/shop/shopStoreList.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->assign('sCerti', $sCerti);
    $huoniaoTag->assign('cityid', (int)$cityid);
    $huoniaoTag->assign("keywords", $keywords);

    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->assign('addrListArr', json_encode($dsql->getTypeList(0, "shopaddr")));
	$huoniaoTag->assign('industryListArr', json_encode(getTypeList(0, "shop_type")));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/shop";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}

//获取行业分类列表
function getTypeList($id, $tab){
	global $dsql;
	$sql = $dsql->SetQuery("SELECT `id`, `parentid`, `typename` FROM `#@__".$tab."` WHERE `parentid` = $id ORDER BY `weight`");
	$results = $dsql->dsqlOper($sql, "results");
	if($results){
		return $results;
	}else{
		return '';
	}
}
