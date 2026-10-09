<?php
/**
 * 提现管理
 *
 * @version        $Id: withdraw.php 2015-11-11 上午09:37:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("withdraw");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "withdraw.html";
global  $cfg_withdrawFee;

$action = "member_withdraw";
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = "";

	//关键词
	if(!empty($sKeyword)){

		$where1 = array();
		$where1[] = "`bank` like '%$sKeyword%' OR `bankName` like '%$sKeyword%' OR `cardnum` like '%$sKeyword%' OR `cardname` like '%$sKeyword%' OR `note` like '%$sKeyword%'";

		$userSql = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%' OR `nickname` like '%$sKeyword%' OR `phone` like '%$sKeyword%' ");
		$userResult = $dsql->dsqlOper($userSql, "results");
		if($userResult){
			$userid = array();
			foreach($userResult as $key => $user){
				array_push($userid, $user['id']);
			}
			if(!empty($userid)){
				$where1[] = "`uid` in (".join(",", $userid).")";
			}
		}

		$courierSql = $dsql->SetQuery("SELECT `id` FROM `#@__waimai_courier` WHERE `username` like '%$sKeyword%' OR `name`like '%$sKeyword%'  OR `phone` like '%$sKeyword%' ");

        $courierRes = $dsql->dsqlOper($courierSql, "results");
        if($courierRes){
            $courierid = array();
            foreach($courierRes as $key => $user){
                array_push($courierid, $user['id']);
            }
            if(!empty($courierid)){
                $where1[] = "`uid` in (".join(",", $courierid).") AND `usertype` = 1";
            }
        }

		$where .= " AND (".join(" OR ", $where1).")";

	}

	//类型
	if($type != ""){

		//银行卡
		if($type == 1){
			$where .= " AND `bank` not in('alipay','weixin')";

		//支付宝
		}elseif($type == 2){
			$where .= " AND `bank` = 'alipay'";

		//微信
		}elseif ($type == 3) {
			$where .= " AND `bank` = 'weixin'";
		}
	}

	 if ($couriertype !='') {

         if ($couriertype == 1) {
             $where .= " AND `usertype` = 1";
         } elseif ($couriertype == 2) {
             $where .= " AND `type` = 0 AND `usertype` = 0";
         } elseif ($couriertype == 3) {
             $where .= " AND `type` = 2 AND `usertype` = 0";
         } elseif ($couriertype == 4) {
             $where .= " AND `type` = 1 AND `usertype` = 0";
         }
     }

	if($start != ""){
		$where .= " AND `tdate` >= ". GetMkTime($start." 00:00:00");
	}

	if($end != ""){
		$where .= " AND `tdate` <= ". GetMkTime($end." 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT `id` FROM `#@__".$action."` WHERE 1 = 1".$where);

	//总条数
	$totalCount = $dsql->dsqlOper($archives, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//审核中
	$state0 = $dsql->dsqlOper($archives." AND `state` = 0" , "totalCount");
	//成功
	$state1 = $dsql->dsqlOper($archives." AND `state` = 1", "totalCount");
	//失败
	$state2 = $dsql->dsqlOper($archives." AND `state` = 2", "totalCount");
	//微信打款中
	$state3 = $dsql->dsqlOper($archives." AND `state` = 3", "totalCount");

	if($state != ""){
		$where .= " AND `state` = " . $state;

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
        }
	}

	$where .= " order by `id` desc";
	$totalPrice  = 0;
    $totalAmount = 0;
    $totalShouxu = 0;
	//计算总价  // 实际到账总价
	$sql = $dsql->SetQuery("SELECT SUM(`amount`) as amount ,SUM(`price`) as price,SUM(`shouxuprice`) as shouxuprice FROM `#@__".$action."` WHERE 1 = 1".$where);
	$ret = $dsql->dsqlOper($sql, "results");
	if($ret){
		$totalPrice  = (float)$ret[0]['price'];
        $totalAmount = (float)$ret[0]['amount'];
        $totalShouxu = (float)$ret[0]['shouxuprice'];


    }

	$totalPrice  = sprintf("%.2f", $totalPrice);
    $totalAmount = sprintf("%.2f", $totalAmount);
    $totalShouxu = sprintf("%.2f", $totalShouxu);



    $atpage = $pagestep*($page-1);
	$where .= " LIMIT $atpage, $pagestep";
	$archives = $dsql->SetQuery("SELECT `id`, `uid`, `bank`, `cardnum`, `cardname`, `amount`, `tdate`, `state`,`auditstate`, `type`,`proportion`,`price`,`note`,`usertype`,`shouxuprice` FROM `#@__".$action."` WHERE 1 = 1".$where);

	$results = $dsql->dsqlOper($archives, "results");

	$list = array();

	if (testPurview("withdrawtransfer")) {

			$withdrawtransfer = "1";
	}else{

			$withdrawtransfer = "0";
	}
	if(count($results) > 0){
		foreach ($results as $key=>$value) {
			$list[$key]["id"] = $value["id"];
			$list[$key]["uid"] = $value["uid"];
			$list[$key]["bank"] = $value["bank"];
            if ($value["usertype"] == 0 && $value['type'] == 1) {
                $userSql  = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $value["uid"]." AND `mtype` = 3 ");
                $username = $dsql->dsqlOper($userSql, "results");
                $list[$key]["cityid"] = $username[0]['mgroupid'];
            }
			//用户名
            if ($value["usertype"] == 0) {
                $userSql  = $dsql->SetQuery("SELECT `nickname`, `username` FROM `#@__member` WHERE `id` = " . $value["uid"]);
                $username = $dsql->dsqlOper($userSql, "results");
                if (count($username) > 0) {
                    $list[$key]["username"] = trim($username[0]['nickname']) != '' && $username[0]['nickname'] != 'ㅤ' ? $username[0]['nickname'] : $username[0]['username'];
                } else {
                    $list[$key]["username"] = "未知";
                }
            } else {
                $couriersql = $dsql->SetQuery("SELECT `name`, `cityid` FROM `#@__waimai_courier` WHERE `id` = " . $value["uid"]);
                $courierres = $dsql->dsqlOper($couriersql,"results");
                if ($courierres) {
                    $list[$key]["username"] = "骑手：".$courierres[0]['name'].'（'.getSiteCityName($courierres[0]['cityid']).'）';
                } else {
                    $list[$key]["username"] = "未知";
                }


            }

            $list[$key]["bank"]             = $value["bank"];
            $list[$key]["cardnum"]          = $value["cardnum"];
            $list[$key]["cardname"]         = $value["cardname"];
            $list[$key]["amount"]           = $value["amount"];
            $list[$key]["tdate"]            = date('Y-m-d H:i:s', $value["tdate"]);
            $list[$key]["state"]            = $value["state"];
            $list[$key]["auditstate"]       = $value["auditstate"];
            $list[$key]["type"]             = $value["type"];
            $list[$key]["usertype"]         = $value["usertype"];
            $list[$key]["withdrawtransfer"] = $withdrawtransfer;
            $list[$key]["proportion"]       = $value["proportion"];
            $list[$key]["price"]            = $value["price"];
            $list[$key]["note"]             = $value["note"];
            $proportion                     = $value["proportion"] ? $value["proportion"] : 0;
            // $list[$key]["shouxu"]           = sprintf("%.2f", $value["amount"] * $proportion / 100);
            $list[$key]["shouxu"]           = $value["shouxuprice"];

        }

		if(count($list) > 0){
		    if ($do != 'export'){
                echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.'},"totalShouxu": '.$totalShouxu.',"totalAmount": '.$totalAmount.',"totalPrice": '.$totalPrice.', "list": '.json_encode($list).'}';
            }

		}else{
		    if ($do != "export"){
                echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.'},"totalShouxu": '.$totalShouxu.',"totalAmount": '.$totalAmount.', "totalPrice": '.$totalPrice.'}';
            }

		}

	}else{
	    if ($do !="export"){
            echo '{"state": 101, "info": '.json_encode("暂无相关信息").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.'},"totalShouxu": '.$totalShouxu.', "totalAmount": '.$totalAmount.', "totalPrice": '.$totalPrice.'}';
        }

	}

    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '类型'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '申请会员'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '申请时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '提现账号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '手续费'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '实际到账'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '备注'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder."提现数据.csv";
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
            if ($data['type'] == 0){
                $data['type'] = '余额';
            }elseif ($data['type'] == 1){
                $data['type'] = '分站';
            }elseif ($data['type'] == 2){
                $data['type'] = '推荐奖金';
            }else{
                $data['type'] = '其他';
            }

            if ($data['bank'] == 'alipay'){
                $data['bank'] = '支付宝';
            }elseif($data['bank'] == 'weixin'){
                $data['bank'] = '微信';
            }
            if ($data['state'] == 0 && $data['auditstate'] == 0){
                $data['state'] = '审核中';
            }elseif($data['state'] == 0 && $data['auditstate'] == 1){
                $data['state'] = '审核通过,待打款';
            }elseif($data['state'] == 1){
                $data['state'] = '成功';
            }elseif($data['state'] == 2){
                $data['state'] = '失败';

            }
            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['type']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['tdate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['cardname'].$data['bank']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['shouxu']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['price']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['state']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['note']));



            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 提现数据.csv");
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

		$sql = $dsql->SetQuery("SELECT `state` FROM `#@__".$action."` WHERE `id` = ".$val);
		$ret = $dsql->dsqlOper($sql, "results");
		if($ret){

			if($ret[0]['state'] == 0){
				$error[] = $val;
			}else{
				$archives = $dsql->SetQuery("DELETE FROM `#@__".$action."` WHERE `id` = ".$val);
				$results = $dsql->dsqlOper($archives, "update");
				if($results != "ok"){
					$error[] = $val;
				}
			}
		}else{
			$error[] = $val;
		}
	}
	if(!empty($error)){
		echo '{"state": 200, "info": '.json_encode($error).'}';
	}else{
		adminLog("删除提现记录", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

}

//验证模板文件
if(file_exists($tpl."/".$templates)){

	//js
	$jsFile = array(
		'ui/bootstrap.min.js',
		'ui/bootstrap-datetimepicker.min.js',
		'admin/member/withdraw.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('notice', $notice);
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
