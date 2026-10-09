<?php
/**
 * 财务分账记录
 *
 * @version        $Id: shareAllocation.php 2020-11-21 上午11:28:19 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("shareAllocation");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "shareAllocation.html";

$action = "business_shareallocation";

if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	//关键词
	if(!empty($sKeyword)){
		$where1 = array();
		$where1[] = "s.`title` like '%$sKeyword%'";
		$where1[] = "s.`ordernum` like '%$sKeyword%'";
		$where1[] = "s.`subMerId` like '%$sKeyword%'";
		$where1[] = "s.`subMerPrtclNo` like '%$sKeyword%'";
		$where1[] = "s.`seqNo` like '%$sKeyword%'";
		$where1[] = "s.`subOrderNo` like '%$sKeyword%'";
		$where1[] = "s.`subOrderTrxid` like '%$sKeyword%'";

		//检索会员表和商家表
		$userSql = $dsql->SetQuery("SELECT b.`id` FROM `#@__business_list` b LEFT JOIN `#@__member` m ON m.`id` = b.`uid` WHERE m.`username` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%' OR m.`company` like '%$sKeyword%' OR m.`phone` like '%$sKeyword%' OR b.`title` like '%$sKeyword%'");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
				$where1[] = "s.`bid` in (".join(",", $userid).")";
			}
		}

		$where .= " AND (".join(" OR ", $where1).")";

	}

	if ($cityid) {
        $where .= getWrongCityFilter('b.`cityid`', $cityid);
    }

	if ($platform) {
        $where .= " AND s.`platform` = '$platform'";
    }

	if($start != ""){
		$where .= " AND s.`pubdate` >= ". GetMkTime($start." 00:00:00");
	}

	if($end != ""){
		$where .= " AND s.`pubdate` <= ". GetMkTime($end." 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT s.`id` FROM `#@__".$action."` s LEFT JOIN `#@__business_list` b ON b.`id` = s.`bid` WHERE s.`totalAmount` > 0 AND b.`id` > 0".$where);

	//成功
	$state1 = $dsql->dsqlOper($archives.$where." AND s.`state` = 1", "totalCount");
	//失败
	$state0 = $dsql->dsqlOper($archives.$where." AND s.`state` = 0", "totalCount");

	//类型
	if($state !== ""){
		$where .= " AND s.`state` = '$state'";
	}
	$where .= " order by s.`id` desc";

	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	if($state !== ""){

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}

	}

	$atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT s.`id`, s.`platform`, s.`bid`, s.`title`, s.`ordernum`, s.`orderdata`, s.`totalAmount`, s.`amount`, s.`subMerId`, s.`subMerPrtclNo`, s.`seqNo`, s.`subOrderNo`, s.`subOrderTrxid`, s.`pubdate`, s.`state`, s.`info`, b.`title` storename, b.`uid`, b.`cityid`, m.`username`, m.`nickname`, m.`company` FROM `#@__".$action."` s LEFT JOIN `#@__business_list` b ON b.`id` = s.`bid` LEFT JOIN `#@__member` m ON m.`id` = b.`uid` WHERE s.`totalAmount` > 0 AND b.`id` > 0".$where);
	$results = $dsql->dsqlOper($archives, "results");

	$list = array();

	if(count($results) > 0){
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["platform"] = getPaymentName($value["platform"]);
			$list[$key]["bid"] = $value["bid"];
			$list[$key]["storename"] = $value["storename"];
			$list[$key]["title"] = $value["title"];
			$list[$key]["ordernum"] = $value["ordernum"];

			$_orderdata = array();
			$orderdata = $value["orderdata"] ? unserialize($value["orderdata"]) : array();
			if($orderdata){
				foreach ($orderdata as $k => $v) {
					array_push($_orderdata, $k . '：' . strip_tags($v));
				}
			}
			$list[$key]["orderdata"] = join('<br />', $_orderdata);
			$list[$key]["totalAmount"] = $value["totalAmount"];
			$list[$key]["amount"] = $value["amount"];
			$list[$key]["subMerId"] = $value["subMerId"];
			$list[$key]["subMerPrtclNo"] = $value["subMerPrtclNo"];
			$list[$key]["seqNo"] = $value["seqNo"];
			$list[$key]["subOrderNo"] = $value["subOrderNo"];
			$list[$key]["subOrderTrxid"] = $value["subOrderTrxid"];
			$list[$key]["pubdate"] = $value["pubdate"];
			$list[$key]["state"] = (int)$value["state"];
			$list[$key]["info"] = $value["info"];
			$list[$key]["uid"] = $value["uid"];
			$list[$key]["username"] = $value["company"] ? $value["company"] : ($value["nickname"] ? $value["nickname"] : $value["username"]);

			$list[$key]["cityid"] = $value["cityid"];
			$cityname = getSiteCityName($value['cityid']);
            $list[$key]['cityname'] = $cityname;

		}

		if(count($list) > 0){
	        if($do != "export"){
				echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.'}, "list": '.json_encode($list).'}';
			}
		}else{
		    if($do != "export"){
				echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.'}}';
			}
		}

	}else{
        if($do != "export"){
			echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.'}}';
		}
	}


	//导出数据
	if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '分账平台'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商家会员ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商家名称'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '商户号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '协议编号(工行E商通专用)'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单标题'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '平台订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '第三方支付平台订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '分账金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '平台分账订单号(工行E商通专用)'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '第三方支付平台分账订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '分账时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '备注'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder."财务分账记录数据.csv";
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
	      $arr = array();
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['cityname']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['platform']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['uid']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['storename']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['subMerId']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['subMerPrtclNo']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['title']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['ordernum']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['seqNo']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['totalAmount']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['subOrderNo']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['subOrderTrxid']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', date('Y-m-d H:i:s', $data['pubdate'])));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', !$data['state'] ? '失败' : '成功'));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['info']));

          //写入文件
          fputcsv($file, $arr);
	    }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 财务分账记录数据.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);

    }

	die;

//删除
}elseif($dopost == "del"){
	if($id == "") die;
	$each = explode(",", $id);
	$error = array();
	foreach($each as $val){
		$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
		$results = $dsql->dsqlOper($archives, "update");
		if($results != "ok"){
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除分账记录", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

//调整分账金额
}elseif($dopost == "updateAmount"){
    if($id == "") die;
    
    $sql = $dsql->SetQuery("SELECT `ordernum`, `amount` FROM `#@__".$action."` WHERE `id` = " . $id);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){

        $ordernum = $ret[0]['ordernum'];
        $_amount = $ret[0]['amount'];

        $amount = sprintf("%.2f", $amount);
        $sql = $dsql->SetQuery("UPDATE `#@__".$action."` SET `amount` = '$amount' WHERE `id` = " . $id);
        $dsql->dsqlOper($sql, "update");

        adminLog("修改分账金额", '分账订单：' . $id . '('.$ordernum.')' . '：原金额：' . $_amount . '，新金额：' . $amount);
        echo '{"state": 100, "info": '.json_encode("调整成功！").'}';
        die;

    }else{
        echo '{"state": 200, "info": '.json_encode("分账订单不存在或已经删除，请刷新后重试！").'}';
        die;
    }

//失败重试
}elseif($dopost == "retry"){

	if($id == "") die;

	$sql = $dsql->SetQuery("SELECT `platform`, `bid`, `title`, `ordernum`, `orderdata`, `totalAmount`, `amount`, `subMerId`, `subMerPrtclNo`, `seqNo` FROM `#@__".$action."` WHERE `id` = " . $id);
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$platform = $ret[0]['platform'];
		$bid = $ret[0]['bid'];
		$title = $ret[0]['title'];
		$ordernum = $ret[0]['ordernum'];
		$orderdata = $ret[0]['orderdata'] ? unserialize($ret[0]['orderdata']) : array();
		$totalAmount = $ret[0]['totalAmount'];
		$amount = $ret[0]['amount'];
		$subMerId = $ret[0]['subMerId'];
		$subMerPrtclNo = $ret[0]['subMerPrtclNo'];
		$seqNo = $ret[0]['seqNo'];

		if($subMerId == ''){
			echo '{"state": 200, "info": '.json_encode("二级商户信息为空，分账失败！").'}';die;
		}

		// if($amount <= 0){
		// 	echo '{"state": 200, "info": '.json_encode("分账金额不得为0").'}';die;
		// }

		if($platform == 'rfbp_icbc'){
			$order = array(
				"bid" => $bid,
				"ordertitle" => $title,
				"ordernum" => $ordernum,
				"orderdata" => $orderdata,
				"totalAmount" => $totalAmount,
				"amount" => $amount,
				"icbc_subMerId" => $subMerId,
				"icbc_subMerPrtclNo" => $subMerPrtclNo,
				"channelPayOrderNo" => $seqNo
			);
			require_once(HUONIAOROOT."/api/payment/rfbp_icbc/rfbp_shareAllocation.php");
			$rfbp_shareAllocation = new rfbp_shareAllocation();
			$ret = $rfbp_shareAllocation->shareAllocation($order);

		}elseif($platform == 'wxpay'){
			$order = array(
				"bid" => $bid,
				"ordertitle" => $title,
				"ordernum" => $ordernum,
				"orderdata" => $orderdata,
				"totalAmount" => $totalAmount,
				"amount" => $amount,
				"submchid" => $subMerId,
				"transaction_id" => $seqNo
			);
			require_once(HUONIAOROOT."/api/payment/wxpay/wxpayProfitsharing.php");
			$wxpayProfitsharing = new wxpayProfitsharing();
			$ret = $wxpayProfitsharing->profitsharing($order);

			$amount = sprintf("%.2f", $totalAmount-$amount);  //这里需要反算一下，因为正常的分账是给服务商分钱，比如：订单1元，平台抽10%，平台得0.1，商家得0.9，正常的分账那里是用的0.1用于转给服务商；  分账错误后，这里重试的话，也是用的0.1，但是下方在扣除用户余额时，要用0.9，才是正常的。

		}elseif($platform == 'alipay'){
			$order = array(
				"bid" => $bid,
				"ordertitle" => $title,
				"ordernum" => $ordernum,
				"orderdata" => $orderdata,
				"totalAmount" => $totalAmount,
				"amount" => $amount,
				"alipay_pid" => $subMerId,
				"alipay_app_auth_token" => $subMerPrtclNo,
				"transaction_id" => $seqNo
			);
			require_once(HUONIAOROOT."/api/payment/alipay/alipayProfitsharing.php");
			$alipayProfitsharing = new alipayProfitsharing();
			$ret = $alipayProfitsharing->profitsharing($order);			
		}

		//重试不管成功还是失败，都需要将上次失败的记录删除掉，不然会重复创建分账记录
		$sql = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = $id");
		$dsql->dsqlOper($sql, "update");

		//成功后，减少用户余额并增加提现记录
		if($ret['state'] == 1){
			$orderid = $ret['orderid'];
			$sql = $dsql->SetQuery("SELECT `uid` FROM `#@__business_list` WHERE `id` = $bid");
			$ret = $dsql->dsqlOper($sql, "results");
			if($ret){
                $time  = GetMktime(time());

                $uid = $ret[0]['uid'];

				$archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` - '$amount' WHERE `id` = '$uid'");
				$dsql->dsqlOper($archives, "update");
				global $userLogin;
                $user  = $userLogin->getMemberInfo($uid);
                $usermoney = $user['money'];
//                $money =  sprintf('%.2f',($usermoney - $amount));
				$info   = "系统自动分账，订单号：" . $orderid;
				$title_ = '外卖自动分账';
				$archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`balance`) VALUES ('$uid', '0', '$amount', '$info', '$time','waimai','tixian','$title_','$orderid','$usermoney')");
				$dsql->dsqlOper($archives, "update");
			}

			echo '{"state": 100, "info": '.json_encode("分账成功！").'}';
		}else{
			echo '{"state": 200, "info": '.json_encode($ret['info']).'}';
		}
		die;


	}else{
		echo '{"state": 200, "info": '.json_encode("分账订单不存在或已经删除！").'}';
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
		'ui/bootstrap-datetimepicker.min.js',
		'ui/chosen.jquery.min.js',
		'admin/member/shareAllocation.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
