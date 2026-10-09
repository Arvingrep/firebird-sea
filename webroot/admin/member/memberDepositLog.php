<?php
/**
 * 用户管理
 *
 * @version        $Id: memberDepositLog.php 2014-11-15 上午10:03:17 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2015, HuoNiao, Inc.
 * @link           http://www.huoniao.co/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("memberDepositLog");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "member_money";



$templates = "memberDepositLog.html";

//js
$jsFile = array(
	'ui/bootstrap.min.js',
	'ui/bootstrap-datetimepicker.min.js',
	'ui/jquery-ui-selectable.js',
	'admin/member/memberDepositLog.js'
);
$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));


// 获取充值记录
if($dopost == "getList" || $do == "export"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	//
	$where = " AND l.`type` = 1 AND l.`info` LIKE '%充值%'";

	if($sKeyword != ""){
		$where .= " AND m.`username` LIKE '%$sKeyword%'";
	}

	if($mtype != ""){
		$where .= " AND m.`mtype` = ".$mtype;
	}

	if($start != ""){
		$where .= " AND l.`date` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND l.`date` <= ". GetMkTime($end." 23:59:59");
	}



	$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__".$db."` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1 = 1");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);

	//总金额
	$sql = $dsql->SetQuery("SELECT SUM(amount) amount FROM `#@__".$db."` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1 = 1".$where);
	// echo $sql;die;
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$totalMoney = $ret[0]['amount'];
	}else{
		$totalMoney = 0;
	}

	//微信付款总金额
	$sql = $dsql->SetQuery("SELECT SUM(amount) amount FROM `#@__".$db."` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1 = 1".$where." AND l.`info` LIKE '%wxpay%'");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$totalWxpayMoney = empty($ret[0]['amount']) ? 0 : $ret[0]['amount'];
	}else{
		$totalWxpayMoney = 0;
	}

	//支付宝付款总金额
	$sql = $dsql->SetQuery("SELECT SUM(l.`amount`) amount FROM `#@__".$db."` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1 = 1".$where." AND l.`info` LIKE '%alipay%'");
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$totalAlipayMoney = empty($ret[0]['amount']) ? 0 : $ret[0]['amount'];
	}else{
		$totalAlipayMoney = 0;
	}


	$where .= " order by l.`id` desc";

	$atpage = $pagestep*($page-1);
	if ($do != "export") {

		$where .= " LIMIT $atpage, $pagestep";

	}
	$archives = $dsql->SetQuery("SELECT l.`id`, l.`userid`, l.`amount`, l.`date`, l.`info`, m.`mtype`, m.`username`, m.`nickname`, m.`realname`, m.`photo`, m.`sex`, m.`money`, m.`point`, m.`regtime`, m.`email`, m.`emailCheck`, m.`phone`, m.`phoneCheck` FROM `#@__".$db."` l LEFT JOIN `#@__member` m ON m.`id` = l.`userid` WHERE 1 = 1".$where);


	$results = $dsql->dsqlOper($archives, "results");

	if(count($results) > 0){
		$list = array();
		foreach ($results as $key=>$value) {
			$list[$key]["id"]         = $value["id"];
			$list[$key]["userid"]     = $value["userid"];
			$list[$key]["mtype"]      = $value["mtype"];
			$list[$key]["username"]   = $value["username"];
			$list[$key]["nickname"]   = $value["nickname"];
			$list[$key]["realname"]   = $value["realname"];
			$list[$key]["email"]      = $value["email"];
			$list[$key]["emailCheck"] = $value["emailCheck"];
			$list[$key]["phone"]      = $value["phone"];
			$list[$key]["phoneCheck"] = $value["phoneCheck"];
			$list[$key]["photo"]      = $value["photo"];
			$list[$key]["sex"]        = $value["sex"] ? "男" : "女";
			$list[$key]["money"]      = $value["money"];
			$list[$key]["point"]      = $value["point"];
			$list[$key]["amount"]     = $value["amount"];
			$list[$key]["date"]       = date("Y-m-d H:i:s", $value["date"]);
			$list[$key]["regtime"]    = date("Y-m-d H:i:s", $value["regtime"]);

			$paytype				  = explode(";", $value['info'])[1];
			$list[$key]["paytype"]    = $paytype;

			// 查询该用户充值总额
			// $sql = $dsql->SetQuery("SELECT SUM(amount) amount FROM `#@__".$db."` WHERE `userid` = ".$value["userid"] . " AND `info` LIKE '%账户充值%'");
			// $ret = $dsql->dsqlOper($sql, "results");
			// if($ret){
			// 	$deposit = $ret[0]['amount'];
			// }else{
			// 	$deposit = 0;
			// }

			// $list[$key]["deposit"]    = $deposit;

		}

		if(count($list) > 0){
			if($do != "export"){
				echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "memberDepositLog": '.json_encode($list).', "money": {"totalMoney": '.$totalMoney.', "totalWxpayMoney": '.$totalWxpayMoney.', "totalAlipayMoney": '.$totalAlipayMoney.'}}';
			}
		}else{
			if($do != "export"){
				echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").', "money": {"totalMoney": '.$totalMoney.', "totalWxpayMoney": '.$totalWxpayMoney.', "totalAlipayMoney": '.$totalAlipayMoney.'}}';
			}
		}
	}else{
		if($do != "export"){
			echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.'}, "info": '.json_encode("暂无相关信息").'}';
		}
	}



	if($do == "export"){
        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '昵称/真名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '邮箱/电话'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '充值金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '余额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder."会员数据.csv";
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
        	switch ($data['paytype']) {
	       case 'wxpay':
				$paytype = '微信';
				break;
			case 'alipay':
				$paytype = '支付宝';
				break;
			default:
				$paytype = $data['paytype'];
	       }



	      $arr = array();
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['id']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['nickname']."/".$data['realname']."【".$data['sex']."】"));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['email']."/".$data['phone']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['money']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $paytype));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['date']));

          //写入文件
          fputcsv($file, $arr);
	    }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 会员充值记录.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);

    }
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
