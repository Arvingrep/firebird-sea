<?php
/**
 * 添加商品
 *
 * @version        $Id: integralAdd.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Article
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/integral";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "integralAdd.html";

$action = "integral";


$dopost = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

if($dopost == "edit"){
	checkPurview("integralEdit");
}else{
	checkPurview("integralAdd");
}
$pagetitle     = "发布商品";

if($submit == "提交"){

	//对字符进行处理
	$title       = cn_substrR($title,60);
	$color       = cn_substrR($color,6);
	$rebate      = (int)$rebate;
	$repoint     = (int)$repoint;

	//获取当前管理员
	$adminid = $userLogin->getUserID();
}
if(empty($click)) $click = mt_rand(50, 200);

//页面标签赋值
$huoniaoTag->assign('dopost', $dopost);

if(!empty($flag)){
	$flags = join(",", $flag);
}


if($dopost == "edit"){

	$pagetitle = "修改信息";

	if($submit == "提交"){
		if($token == "") die('token传递失败！');
		if($id == "") die('要修改的信息ID传递失败！');

        //表单二次验证
        if(empty($cityid)){
            echo '{"state": 200, "info": "请选择城市"}';
            exit();
        }

        $adminCityIdsArr = explode(',', $adminCityIds);
        if(!in_array($cityid, $adminCityIdsArr)){
            echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
            exit();
        }

		if(trim($title) == ''){
			echo '{"state": 200, "info": "商品名称不能为空"}';
			exit();
		}

		if($typeid == ''){
			echo '{"state": 200, "info": "请选择商品分类"}';
			exit();
		}

		$mprice = (float)$mprice;
		$price = (float)$price;


		$point = (int)$point;
		// if(empty($point)){
		// 	echo '{"state": 200, "info": "请填写商品积分"}';
		// 	exit();
		// }

		if(empty($mprice)){
			$mprice = $price;
		}

		$delivery = (int)$delivery;
		$freight = (float)$freight;
		$state = (int)$state;
		$inventory = (int)$inventory;

		//保存到主表
		$archives = $dsql->SetQuery("UPDATE `#@__".$action."_product` SET `video`='$video',`cityid` = '$cityid', `title` = '$title', `description` = '$description', `color` = '$color', `typeid` = '$typeid', `flag` = '$flags', `weight` = '$weight', `litpic` = '$litpic', `pics` = '$imglist', `mprice` = '$mprice', `price` = '$price', `point` = '$point', `body` = '$body', `mbody` = '$mbody', `inventory` = '$inventory', `click` = '$click', `delivery` = '$delivery', `freight` = '$freight', `state` = '$state', `rebate` = '$rebate', `repoint` = '$repoint' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo $archives;die;
			echo '{"state": 200, "info": "商品保存失败！"}';
			exit();
		}

		adminLog("修改积分商城商品信息", $title);

		$param = array(
			"service"     => $action,
			"template"    => "detail",
			"id"          => $id
		);
		$url = getUrlPath($param);
        dataAsync("integral",$id);  // 积分商城、商品、编辑
		echo '{"state": 100, "url": "'.$url.'"}';die;
		exit();

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."_product` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			if(!empty($results)){

				$title       = $results[0]['title'];
				$typeid      = $results[0]['typeid'];
				$flag        = $results[0]['flag'];
				$weight      = $results[0]['weight'];
				$litpic      = $results[0]['litpic'];
				$pics        = $results[0]['pics'];
				$description = $results[0]['description'];
				$body        = $results[0]['body'];
				$mbody       = $results[0]['mbody'];
				$click       = $results[0]['click'];
				$color       = $results[0]['color'];
				$mprice      = $results[0]['mprice'];
				$price       = $results[0]['price'];
				$delivery    = $results[0]['delivery'];
				$freight     = $results[0]['freight'];
				$point       = $results[0]['point'];
				$sale        = $results[0]['sale'];
				$inventory   = $results[0]['inventory'];
				$state       = $results[0]['state'];
				$pubdate     = date('Y-m-d H:i:s', $results[0]['pubdate']);
                $cityid      = $results[0]['cityid'];
                $video       = $results[0]['video'];
                $rebate      = $results[0]['rebate'];
                $repoint     = $results[0]['repoint'];

				$imglist = array();
				if(!empty($pics)){
					$imglist = explode(",", $pics);
				}

				global $data;
				$data = "";
				$typename = getParentArr($action."_type", $results[0]['typeid']);
				$typename = join(" > ", array_reverse(parent_foreach($typename, "typename")));

			}else{
				ShowMsg('要修改的商品不存在或已删除！', "-1");
				die;
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
        if(empty($cityid)){
            echo '{"state": 200, "info": "请选择城市"}';
            exit();
        }

        $adminCityIdsArr = explode(',', $adminCityIds);
        if(!in_array($cityid, $adminCityIdsArr)){
            echo '{"state": 200, "info": "要发布的城市不在授权范围"}';
            exit();
        }

		if(trim($title) == ''){
			echo '{"state": 200, "info": "商品名称不能为空"}';
			exit();
		}

		if($typeid == ''){
			echo '{"state": 200, "info": "请选择商品分类"}';
			exit();
		}

		$mprice = (float)$mprice;
		$price = (float)$price;

		$point = (int)$point;
		// if(empty($point)){
		// 	echo '{"state": 200, "info": "请填写商品积分"}';
		// 	exit();
		// }
		// if(empty($price)){
		// 	$price = $point / $cfg_pointRatio;
		// }else{
		// 	if($price < $point / $cfg_pointRatio){
		// 		echo '{"state": 200, "info": "商品价格低于积分所能兑换金额"}';
		// 		exit();
		// 	}
		// }
		if(empty($mprice)){
			$mprice = $price;
		}

		$delivery = (int)$delivery;
		$freight = (float)$freight;
		$state = (int)$state;
		$inventory = (int)$inventory;

		$pubdate = GetMkTime(time());       //发布时间


		//保存到主表
		$archives = $dsql->SetQuery("INSERT INTO `#@__".$action."_product` (`video`, `cityid`, `title`, `description`, `flag`, `weight`, `litpic`, `pics`, `typeid`, `body`, `mbody`, `click`, `color`, `mprice`, `price`, `point`, `sales`, `inventory`, `delivery`, `freight`, `state`, `pubdate`, `admin`, `rebate`, `repoint`) VALUES ('$video', '$cityid', '$title', '$description', '$flags', '$weight', '$litpic', '$imglist', '$typeid', '$body', '$mbody', '$click', '$color', '$mprice', '$price', '$point', 0, '$inventory', '$delivery', '$freight', '$state', '$pubdate', '$adminid', '$rebate', '$repoint')");

		$aid = $dsql->dsqlOper($archives, "lastid");
		if(is_numeric($aid)){

			adminLog("添加积分商城商品", $title);

			$param = array(
				"service"     => "integral",
				"template"    => "detail",
				"id"          => $aid,
			);
			$url = getUrlPath($param);
            dataAsync("integral",$aid); // 积分商城、商品、新增
			echo '{"state": 100, "url": "'.$url.'"}';
			die;

		}else{
			echo $archives;die;
			echo '{"state": 200, "info": "商品发布失败！"}';
			die;
		}

	}

}elseif($dopost == "getTree"){
	$options = $dsql->getOptionList($pid, $action);
	echo json_encode($options);die;
}
//css
$cssFile = array(
    'ui/jquery.chosen.css',
    'admin/chosen.min.css'
);
$huoniaoTag->assign('cssFile', includeFile('css', $cssFile));
//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.colorPicker.js',
		'ui/jquery.dragsort-0.5.1.min.js',
        'ui/chosen.jquery.min.js',
		'publicUpload.js',
		'admin/integral/integralAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/".$action.".inc.php");

	global $customUpload;
	if($customUpload == 1){
		global $custom_thumbSize;
		global $custom_thumbType;
		global $custom_atlasSize;
		global $custom_atlasType;
		$huoniaoTag->assign('thumbSize', $custom_thumbSize);
		$huoniaoTag->assign('thumbType', "*.".str_replace("|", ";*.", $custom_thumbType));
		$huoniaoTag->assign('atlasSize', $custom_atlasSize);
		$huoniaoTag->assign('atlasType', "*.".str_replace("|", ";*.", $custom_atlasType));
	}


	$huoniaoTag->assign('action', $action);
	$huoniaoTag->assign('pagetitle', $pagetitle);
	$huoniaoTag->assign('dopost', $dopost);
	$huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('cityid', (int)$cityid);
	$huoniaoTag->assign('title', htmlentities($title, ENT_NOQUOTES, "utf-8"));
	$huoniaoTag->assign('typeid', empty($typeid) ? "0" : $typeid);
	$huoniaoTag->assign('typename', empty($typename) ? "选择分类" : $typename);
	$huoniaoTag->assign('weight', $weight == "" ? "50" : $weight);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('description', $description);
	$huoniaoTag->assign('body', $body);
	$huoniaoTag->assign('mbody', $mbody);
	$huoniaoTag->assign('imglist', json_encode(!empty($imglist) ? $imglist : array()));
	$huoniaoTag->assign('click', $click);
	$huoniaoTag->assign('color', $color);
	$huoniaoTag->assign('mprice', $mprice);
	$huoniaoTag->assign('price', $price);
	$huoniaoTag->assign('point', $point);
	$huoniaoTag->assign('sale', $sale);
	$huoniaoTag->assign('delivery', $delivery);
	$huoniaoTag->assign('freight', $freight);
	$huoniaoTag->assign('inventory', $inventory);
	$huoniaoTag->assign('video', $video);
	$huoniaoTag->assign('rebate', (int)$rebate);
	$huoniaoTag->assign('repoint', (int)$repoint);
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);
	$huoniaoTag->assign('pubdate', empty($pubdate) ? date("Y-m-d H:i:s",time()) : $pubdate);

	//状态
	$huoniaoTag->assign('stateopt', array('0', '1', '2'));
	$huoniaoTag->assign('statenames',array('待审核','已上架','已下架'));
	$huoniaoTag->assign('state', $state == "" ? 1 : $state);

	//其它属性
	$huoniaoTag->assign('flagopt', array('0', '1', '2'));
	$huoniaoTag->assign('flagnames',array('推荐','特价','热卖'));
	$huoniaoTag->assign('flag', empty($flag) ? "" : explode(",", $flag));

	$huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."_type")));
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/integral";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
