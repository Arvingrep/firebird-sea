<?php
/**
 * 添加团购信息
 *
 * @version        $Id: tuanAdd.php 2013-7-7 上午10:33:36 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/tuan";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "tuanAdd.html";

global $handler;
$handler = true;

$action    = "tuan";
$pagetitle = "新增团购";
$dopost    = $dopost ? $dopost : "save";        //操作类型 save添加 edit修改

$itemResults = array();
if($dopost == "edit"){
	checkPurview("editTuan");
}else{
	checkPurview("tuanAdd");
}

//模糊匹配会员
if($dopost == "checkStore"){
	$key = $_POST['key'];
	if(!empty($key)){
		$where = getCityFilter('store.`cityid`');
		if(!empty($id)){
			$where .= " AND `store`.id != $id";
		}
		$userSql = $dsql->SetQuery("SELECT `user`.company, `store`.id, `store`.stype FROM `#@__tuan_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.uid WHERE (`user`.username like '%$key%' OR `user`.company like '%$key%')".$where." LIMIT 0, 10");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			echo json_encode($userResult);
		}
	}
	die;
}

if($dopost != ""){
	$startdate     = $startdate == "" ? 0 : GetMkTime($startdate);			//开始时间
	$enddate       = $enddate == "" ? 0 : GetMkTime($enddate);					//结束时间
    $expire_type   = $expire_type ==""? 'static': $expire_type;        // 过期类型
	$expireddate   = $expireddate == "" ? 0 : GetMkTime($expireddate);	//过期时间
    $expire_limit   = $expire_limit =="" ? 0 : (int)$expire_limit;             // 过期天数
    $limit_day     = $limit_day =="" ? 0 : (int)$limit_day;                 // 每天限购数量
    $limit_start   = $limit_start=="" ? 0 : GetMkTime($limit_start);             // 限购开始
    $limit_end     = $limit_end =="" ? 0 : GetMkTime($limit_end);          // 限购结束时间
	$hourly        = (int)$hourly;
	$pubdate       = GetMkTime(time());                                 //发布时间
	$amount        = empty($amount) ? 0 : $amount;
	$freight       = empty($freight) ? 0 : $freight;
	$freeshi       = empty($freeshi) ? 0 : $freeshi;
	$flags         = isset($flags) ? join(',', $flags) : '';
	$rec           = (int)$rec;
	$pin           = (int)$pin;
	$istop         = (int)$istop;
	$pinprice      = (float)$pinprice;
	$pinpeople     = (int)$pinpeople;

	//对字符进行处理
	$title       = cn_substrR($title,100);
	$subtitle    = cn_substrR($subtitle,100);

	//获取当前管理员
	$adminid = $userLogin->getUserID();

	//获取分类下相应字段
	if(!empty($sid)){

		$sql = $dsql->SetQuery("SELECT `stype` FROM `#@__tuan_store` WHERE `id` = ".$sid);
		$results = $dsql->dsqlOper($sql, "results");
		if($results){
			$typeid = $results[0]['stype'];

			$checktype = $dsql->SetQuery("SELECT `parentid` FROM `#@__".$action."type` WHERE `id` = ".$typeid);
			$typeResults = $dsql->dsqlOper($checktype, "results");
			$tt = $typeResults[0]['parentid'] != 0 ? $typeResults[0]['parentid'] : $typeid;

			$infoitem = $dsql->SetQuery("SELECT `id`, `field`, `title`, `orderby`, `formtype`, `required`, `options`, `default` FROM `#@__".$action."typeitem` WHERE `tid` = ".$tt." ORDER BY `orderby` DESC");
			$itemResults = $dsql->dsqlOper($infoitem, "results");
		}

	}
}

//阅读权限-下拉菜单
$huoniaoTag->assign('arcrankList', array(0 => '等待审核', 1 => '审核通过', 2 => '审核拒绝'));
$huoniaoTag->assign('arcrank', 1);  //阅读权限默认审核通过

if($dopost == "edit"){

	$pagetitle = "修改团购信息";

	if($submit == "提交"){
		if($token == "") die('token传递失败！');

		//表单二次验证
		if($sid == 0 && trim($store) == ''){
			echo '{"state": 200, "info": "请选择团购商家"}';
			exit();
		}
		if($sid == 0){
			$userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__tuan_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.uid WHERE (`user`.username like '%$store%' OR `user`.company like '%$store%') AND `user`.mtype = 2");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "商家不存在，请在联想列表中选择1"}';
				exit();
			}
			$sid = $userResult[0]['id'];
		}else{
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `id` = ".$sid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "商家不存在，请在联想列表中选择2"}';
				exit();
			}
		}

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if(trim($subtitle) == ''){
			echo '{"state": 200, "info": "副标题不能为空"}';
			exit();
		}

		if($startdate != "" && $enddate != "" && $enddate - $startdate < 0){
			echo '{"state": 200, "info": "结束时间不能小于开始时间"}';
			exit();
		}

		if($tuantype == 1){
			if(trim($amount) == ''){
				echo '{"state": 200, "info": "请输入充值卡金额"}';
				exit();
			}
		}elseif($tuantype == 2){
			if(trim($freight) == ''){
				echo '{"state": 200, "info": "请输入运费"}';
				exit();
			}
			if(trim($freeshi) == ''){
				echo '{"state": 200, "info": "请输入免运费件数"}';
				exit();
			}
		}

		if($pin){
			if(empty($pinprice)){
				echo '{"state": 200, "info": "请输入拼团价格"}';
				exit();
			}
			$pinpeople = (int)$pinpeople;
			if(empty($pinpeople) || $pinpeople < 2){
				echo '{"state": 200, "info": "拼团人数最少为2人"}';
				exit();
			}
		}

		if($maxnum != 0 && $defbuynum > $maxnum){
			echo '{"state": 200, "info": "默认已购买数量不得大于最高团购数量"}';
			exit();
		}

		//验证字段内容
		if(count($itemResults) > 0){
			foreach ($itemResults as $key=>$value) {
				if($value["required"] == 1 && $_POST[$value["field"]] == ""){
					if($value["formtype"] == "text"){
						echo '{"state": 200, "info": "'.$value['title'].'不能为空"}';
					}else{
						echo '{"state": 200, "info": "请选择'.$value['title'].'"}';
					}
					exit();
				}
			}
		}

		// if(trim($body) == ''){
		// 	echo '{"state": 200, "info": "请输入团购详情"}';
		// 	exit();
		// }

		if($fx_reward){
			$tmp = $fx_reward;
			if(strstr($fx_reward, '%')){
				if(substr($fx_reward, -1) != '%'){
					echo '{"state": 200, "info": "分销佣金设置错误"}';
					exit();
				}
				$fx_reward = (float)$fx_reward.'%';
			}else{
				$fx_reward = (float)$fx_reward;
			}
			if(strlen($tmp) != strlen($fx_reward)){
				echo '{"state": 200, "info": "分销佣金设置错误"}';
				exit();
			}
		}

		//查询信息之前的状态
		$sql = $dsql->SetQuery("SELECT l.`arcrank`, l.`pubdate`, s.`uid` FROM `#@__".$action."list` l LEFT JOIN `#@__".$action."_store` s ON s.`id` = l.`sid` WHERE l.`id` = $id");
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			$arcrank_ = $ret[0]['arcrank'];
			$pubdate  = $ret[0]['pubdate'];
			$userid   = $ret[0]['uid'];

			//会员消息通知
			if($arcrank != $arcrank_){

				$status = "";

				//等待审核
				if($arcrank == 0){
					$status = "进入等待审核状态。";

				//已审核
				}elseif($arcrank == 1){
					$status = "已经通过审核。";

				//审核失败
				}elseif($arcrank == 2){
					$status = "审核失败。";
				}

				$param = array(
					"service"  => "member",
					"template" => "manage",
					"action"   => "tuan",
					"param"    => "state=".$arcrank
				);

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
        $archives = $dsql->SetQuery("UPDATE `#@__".$action."list` SET `sid` = '$sid', `title` = '$title', `subtitle` = '$subtitle', `startdate` = '$startdate', `enddate` = '$enddate', `hourly` = '$hourly', `minnum` = '$minnum', `maxnum` = '$maxnum', `limit_day`='$limit_day', `limit` = '$limit', `limit_start`='$limit_start', `limit_end`='$limit_end', `defbuynum` = '$defbuynum', `tuantype` = '$tuantype', `expire_type` = '$expire_type', `expireddate` = '$expireddate', `expire_limit` = $expire_limit, `amount` = '$amount', `freight` = '$freight', `freeshi` = '$freeshi', `litpic` = '$litpic', `pics` = '$imglist', `market` = '$market', `price` = '$price', `arcrank` = '$arcrank', `weight` = '$weight', `flag` = '$flags', `tips` = '$tips', `notice` = '$notice', `packtype` = '$packtype', `package` = '$package', `body` = '$body', `mbody` = '$mbody', `rec` = '$rec', `pin` = '$pin', `pinprice` = '$pinprice', `pinpeople` = '$pinpeople', `istop` = '$istop', `video`='$video', `fx_reward` = '$fx_reward',`is_tuikuan` = '$is_tuikuan' WHERE `id` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		if($results != "ok"){
			echo '{"state": 200, "info": "保存失败！"}';
			exit();
		}

		//先删除信息所属字段
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."item` WHERE `aid` = ".$id);
		$results = $dsql->dsqlOper($archives, "update");

		//保存字段内容
		if(count($itemResults) > 0){
			foreach ($itemResults as $key=>$value) {
				$val = $_POST[$value['field']];
				if($value['formtype'] == "checkbox"){
					if(is_array($val)){
						$val = join(",", $val);
					}
				}

				$infoitem = $dsql->SetQuery("INSERT INTO `#@__".$action."item` (`aid`, `iid`, `value`) VALUES (".$id.", ".$value['id'].", '".$val."')");
				$dsql->dsqlOper($infoitem, "update");
			}
		}

		adminLog("修改团购信息", $title);

		$param = array(
			"service"     => "tuan",
			"template"    => "detail",
			"id"          => $id
		);
		$url = getUrlPath($param);
        dataAsync("tuan",$id,"product");  // 更新团购信息
		echo '{"state": 100, "url": "'.$url.'"}';die;
		exit();

	}else{
		if(!empty($id)){

			//主表信息
			$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."list` WHERE `id` = ".$id);
			$results = $dsql->dsqlOper($archives, "results");

			//实际购买数量，不统计未付款和已退款的
			$ordersql = $dsql->SetQuery("SELECT SUM(`procount`) as countid FROM `#@__tuan_order` WHERE `proid` = ".$id." AND `orderstate` != 0 AND `orderstate` != 7");
			$ordernum = $dsql->dsqlOper($ordersql, "results");
			$buynum = $ordernum[0]['countid'];

			if(!empty($results)){

				$sid         = $results[0]['sid'];
				$title       = $results[0]['title'];
				$subtitle    = $results[0]['subtitle'];
				$startdate   = $results[0]['startdate'] == 0 ? "" : date('Y-m-d H:i:s', $results[0]['startdate']);
				$enddate     = $results[0]['enddate'] == 0 ? "" : date('Y-m-d H:i:s', $results[0]['enddate']);
				$hourly      = $results[0]['hourly'];
				$minnum      = $results[0]['minnum'];
				$maxnum      = $results[0]['maxnum'];
				$limit_day   = $results[0]['limit_day'];
				$limit       = $results[0]['limit'];
                $limit_start   = $results[0]['limit_start'] == 0 ? "" : date('Y-m-d H:i:s', $results[0]['limit_start']);
                $limit_end   = $results[0]['limit_end'] == 0 ? "" : date('Y-m-d H:i:s', $results[0]['limit_end']);
				$defbuynum   = $results[0]['defbuynum'];
				$buynum      = $buynum;
				$tuantype    = $results[0]['tuantype'];
                $expire_type = $results[0]['expire_type'];
				$expireddate = $results[0]['expireddate'] == 0 ? "" : date('Y-m-d H:i:s', $results[0]['expireddate']);
                $expire_limit = $results[0]['expire_limit'];
				$amount      = $results[0]['amount'];
				$freight     = $results[0]['freight'];
				$freeshi     = $results[0]['freeshi'];
				$litpic      = $results[0]['litpic'];
				$pics        = $results[0]['pics'];
				$imglist = array();
				if(!empty($pics)){
					$imglist = explode(",", $pics);
				}
				$market      = $results[0]['market'];
				$price       = $results[0]['price'];
				$arcrank     = $results[0]['arcrank'];
				$weight      = $results[0]['weight'];
				// $typeid      = $results[0]['typeid'];
				$flagitem    = explode(",", $results[0]['flag']);
				$tips        = $results[0]['tips'];
				$notice      = $results[0]['notice'];
				$packtype    = $results[0]['packtype'];
				$package     = $results[0]['package'];
				$body        = $results[0]['body'];
				$mbody       = $results[0]['mbody'];
				$rec         = $results[0]['rec'];
				$pin         = $results[0]['pin'];
				$pinprice    = $results[0]['pinprice'];
				$pinpeople   = $results[0]['pinpeople'];
				$istop		 = $results[0]['istop'];
				$video       = $results[0]['video'];
				$fx_reward   = $results[0]['fx_reward'];
				$is_tuikuan  = $results[0]['is_tuikuan'];

			}else{
				ShowMsg('要修改的信息不存在或已删除！', "-1");
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
		if($sid == 0 && trim($store) == ''){
			echo '{"state": 200, "info": "请选择团购商家"}';
			exit();
		}
		if($sid == 0){
			$userSql = $dsql->SetQuery("SELECT `store`.id FROM `#@__tuan_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.uid WHERE (`user`.username like '%$store%' OR `user`.company like '%$store%') AND `user`.mtype = 2");
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "商家不存在，请在联想列表中选择1"}';
				exit();
			}
			$sid = $userResult[0]['id'];
		}else{
			$userSql = $dsql->SetQuery("SELECT `id` FROM `#@__tuan_store` WHERE `id` = ".$sid);
			$userResult = $dsql->dsqlOper($userSql, "results");
			if(!$userResult){
				echo '{"state": 200, "info": "商家不存在，请在联想列表中选择2"}';
				exit();
			}
		}

		if(trim($title) == ''){
			echo '{"state": 200, "info": "标题不能为空"}';
			exit();
		}

		if(trim($subtitle) == ''){
			echo '{"state": 200, "info": "副标题不能为空"}';
			exit();
		}

		if($startdate != "" && $enddate != "" && $enddate - $startdate < 0){
			echo '{"state": 200, "info": "结束时间不能小于开始时间"}';
			exit();
		}

		if($tuantype == 1){
			if(trim($amount) == ''){
				echo '{"state": 200, "info": "请输入充值卡金额"}';
				exit();
			}
		}elseif($tuantype == 2){
			if(trim($freight) == ''){
				echo '{"state": 200, "info": "请输入运费"}';
				exit();
			}
			if(trim($freeshi) == ''){
				echo '{"state": 200, "info": "请输入免运费件数"}';
				exit();
			}
		}

		if($pin){
			if(empty($pinprice)){
				echo '{"state": 200, "info": "请输入拼团价格"}';
				exit();
			}
			$pinpeople = (int)$pinpeople;
			if(empty($pinpeople) || $pinpeople < 2){
				echo '{"state": 200, "info": "拼团人数最少为2人"}';
				exit();
			}
		}

		if($maxnum != 0 && $defbuynum > $maxnum){
			echo '{"state": 200, "info": "默认已购买数量不得大于最高团购数量"}';
			exit();
		}

		//验证字段内容
		if(count($itemResults) > 0){
			foreach ($itemResults as $key=>$value) {
				if($value["required"] == 1 && $_POST[$value["field"]] == ""){
					if($value["formtype"] == "text"){
						echo '{"state": 200, "info": "'.$value['title'].'不能为空"}';
					}else{
						echo '{"state": 200, "info": "请选择'.$value['title'].'"}';
					}
					exit();
				}
			}
		}

		// if(trim($body) == ''){
		// 	echo '{"state": 200, "info": "请输入团购详情"}';
		// 	exit();
		// }

		if($fx_reward){
			$tmp = $fx_reward;
			if(strstr($fx_reward, '%')){
				if(substr($fx_reward, -1) != '%'){
					echo '{"state": 200, "info": "分销佣金设置错误"}';
					exit();
				}
				$fx_reward = (float)$fx_reward.'%';
			}else{
				$fx_reward = (float)$fx_reward;
			}
			if(strlen($tmp) != strlen($fx_reward)){
				echo '{"state": 200, "info": "分销佣金设置错误"}';
				exit();
			}
		}

		$ip = GetIP();
		$ipAddr = getIpAddr($ip);

		//保存到主表
        $archives = $dsql->SetQuery("INSERT INTO `#@__".$action."list` (`sid`, `title`, `subtitle`, `startdate`, `enddate`, `hourly`, `minnum`, `maxnum`, `limit_day`, `limit`, `limit_start`,`limit_end`, `defbuynum`, `tuantype`, `expire_type`, `expireddate`, `expire_limit`, `amount`, `freight`, `freeshi`, `litpic`, `pics`, `market`, `price`, `arcrank`, `weight`, `flag`, `tips`, `notice`, `packtype`, `package`, `body`, `mbody`, `pubdate`, `admin`, `ip`, `ipaddr`, `rec`, `pin`, `pinprice`, `pinpeople`, `istop`, `video`, `fx_reward`,`is_tuikuan`) VALUES ('$sid', '$title', '$subtitle', '$startdate', '$enddate', '$hourly', '$minnum', '$maxnum', '$limit_day', '$limit', '$limit_start', '$limit_end','$defbuynum', '$tuantype', '$expire_type','$expireddate', '$expire_limit' ,'$amount', '$freight', '$freeshi', '$litpic', '$imglist', '$market', '$price', '$arcrank', '$weight', '$flags', '$tips', '$notice', '$packtype', '$package', '$body', '$mbody', '$pubdate', '$adminid', '$ip', '$ipAddr', '$rec', '$pin', '$pinprice', '$pinpeople', '$istop', '$video', '$fx_reward','$is_tuikuan')");
		$aid = $dsql->dsqlOper($archives, "lastid");

		if(is_numeric($aid)) {
            //保存字段内容
            if (count($itemResults) > 0) {
                foreach ($itemResults as $key => $value) {
                    $val = $_POST[$value['field']];
                    if ($value['formtype'] == "checkbox") {
                        if (is_array($val)) {
                            $val = join(",", $val);
                        }
                    }
                    $infoitem = $dsql->SetQuery("INSERT INTO `#@__" . $action . "item` (`aid`, `iid`, `value`) VALUES (" . $aid . ", " . $value['id'] . ", '" . $val . "')");
                    $dsql->dsqlOper($infoitem, "update");
                }
            }

            adminLog("发布团购信息", $title);

            $param = array(
                "service" => "tuan",
                "template" => "detail",
                "id" => $aid
            );
            $url = getUrlPath($param);
            dataAsync("tuan",$aid,"product");  // 新增团购信息
            echo '{"state": 100, "url": "' . $url . '"}';
            die;
        }else{
            echo '{"state": 200, "info": "发布失败！"}';
            exit();
        }

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

				array_push($list, '{"id": "'.$value["id"].'", "field": "'.$value["field"].'", "title": "'.$value["title"].'", "type": "'.$value["formtype"].'", "required": '.$value["required"].', "options": "'.$options.'", "default": "'.$value["default"].'", "value": "'.$itemVal.'"}');
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
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'ui/jquery.dragsort-0.5.1.min.js',
		'publicUpload.js',
		'admin/tuan/tuanAdd.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	require_once(HUONIAOINC."/config/tuan.inc.php");
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
	$huoniaoTag->assign('sid', $sid);

	if($dopost == "edit"){
		$userSql = $dsql->SetQuery("SELECT `user`.company FROM `#@__tuan_store` store LEFT JOIN `#@__member` user ON `user`.id = `store`.uid WHERE `store`.id = ".$sid);
		$userResult = $dsql->dsqlOper($userSql, "results");
		$huoniaoTag->assign('store', $userResult[0]['company']);
	}

	$huoniaoTag->assign('title', $title);
	$huoniaoTag->assign('subtitle', $subtitle);
	$huoniaoTag->assign('startdate', $startdate == 0 ? "" : $startdate);
	$huoniaoTag->assign('enddate', $enddate == 0 ? "" : $enddate);
	$huoniaoTag->assign('hourly', $hourly);
	$huoniaoTag->assign('minnum', $minnum);
	$huoniaoTag->assign('maxnum', $maxnum);
    $huoniaoTag->assign('limit_day', $limit_day == 0 ? "" : $limit_day);
    $huoniaoTag->assign('limit_start', $limit_start == 0 ? "" : $limit_start);
    $huoniaoTag->assign('limit_end', $limit_end == 0 ? "" : $limit_end);
	$huoniaoTag->assign('limit', $limit);
	$huoniaoTag->assign('defbuynum', $defbuynum);
	$huoniaoTag->assign('buynum', $buynum < 0 ? 0 : $buynum);
	$huoniaoTag->assign('tuantype', $tuantype);
    $huoniaoTag->assign('expire_type',$expire_type);
	$huoniaoTag->assign('expireddate', $expireddate == 0 ? "" : $expireddate);
	$huoniaoTag->assign('amount', $amount);
	$huoniaoTag->assign('freight', $freight);
	$huoniaoTag->assign('freeshi', $freeshi);
	$huoniaoTag->assign('litpic', $litpic);
	$huoniaoTag->assign('imglist', json_encode(!empty($imglist) ? $imglist : array()));
	$huoniaoTag->assign('market', $market == 0 ? "" : $market);
	$huoniaoTag->assign('price', $price == 0 ? "" : $price);
	$huoniaoTag->assign('arcrank', $arcrank == "" ? 1 : $arcrank);
	$huoniaoTag->assign('weight', $weight == "" ? 50 : $weight);

	$huoniaoTag->assign('flag',array('yexiao','yuyue','duotaocan','quan','dujia','baozhang','zhutui'));
	$huoniaoTag->assign('flagList',array('夜宵可用','免预约','多套餐','代金券','独家','保障','主推'));
	$huoniaoTag->assign('flags', empty($flagitem) ? "" : $flagitem);

	$huoniaoTag->assign('tips', $tips);


	$noticeArr = array();
	if(!empty($notice)){
		$notice = explode("|||", $notice);
		foreach ($notice as $key => $value) {
			$val = explode("$$$", $value);
			$noticeArr[$key]['title'] = $val[0];
			$noticeArr[$key]['note'] = $val[1];
		}
	}
	$huoniaoTag->assign('notice', $noticeArr);

	$packtype = empty($packtype) ? 1 : $packtype;
	$huoniaoTag->assign('packtype', $packtype);

	$packageArr = array();
	if(!empty($package)){
		$package = explode("|||", $package);

		if($packtype == 1){
			$val = explode("$$$", $package[0]);
			$packageArr[0] = $val[0];
			$packageArr[1] = $val[1];
			$packageArr[2] = $val[2];
			$packageArr[3] = $val[3];
		}elseif($packtype == 2){

			foreach ($package as $key => $value) {
				$val = explode("@@@", $value);
				$packageArr[$key]['title'] = $val[0];

				$tabs = explode("~~~", $val[1]);
				foreach ($tabs as $k => $v) {
					$tr = explode("$$$", $v);
					$packageArr[$key]['tr'][$k][0] = $tr[0];
					$packageArr[$key]['tr'][$k][1] = $tr[1];
					$packageArr[$key]['tr'][$k][2] = $tr[2];
					$packageArr[$key]['tr'][$k][3] = $tr[3];
				}
			}
		}
	}

	$huoniaoTag->assign('package', $packageArr);


	$huoniaoTag->assign('body', $body);
	$huoniaoTag->assign('mbody', $mbody);
	$huoniaoTag->assign('rec', $rec);
	$huoniaoTag->assign('pin', $pin);
	$huoniaoTag->assign('pinprice', $pinprice);
	$huoniaoTag->assign('pinpeople', $pinpeople);
	$huoniaoTag->assign('istop', $istop);
	$huoniaoTag->assign('video', $video);

	$huoniaoTag->assign('fx_reward', $fx_reward);

	// $huoniaoTag->assign('typeListArr', json_encode($dsql->getTypeList(0, $action."type")));

	$huoniaoTag->assign('tuantype', array('0',  '2'));
	$huoniaoTag->assign('tuantypenames',array('团购券',  '快递'));
	$huoniaoTag->assign('tuantypechecked', $tuantype == "" ? 0 : $tuantype);

    $huoniaoTag->assign('expire_values',array('static','limit'));
    $huoniaoTag->assign('expire_names',array('固定时间','指定天数'));
    $huoniaoTag->assign('expire_check',$expire_type==""?'static':$expire_type);
    $huoniaoTag->assign('expire_limit',$expire_limit==0?"":$expire_limit);

    $huoniaoTag->assign('is_tuikuan', array('0',  '1'));
    $huoniaoTag->assign('is_tuikuannames',array('支持',  '不支持'));
    $huoniaoTag->assign('is_tuikuanchecked', $is_tuikuan == "" ? 0 : $is_tuikuan);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/tuan";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
