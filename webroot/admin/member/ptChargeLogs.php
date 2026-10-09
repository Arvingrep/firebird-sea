<?php
/**
 * 现金消费记录
 *
 * @version        $Id: platForm.php 2015-11-11 上午09:37:12 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("ptChargeLogs");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "ptChargeLogs.html";

$action = "pay_log";

$typeallarr = array();
$archives = $dsql->SetQuery("SELECT `id`, `pay_code`, `pay_name`, `pay_desc` FROM `#@__site_payment` WHERE `state` = 1 ORDER BY `weight`, `id` DESC");
$results = $dsql->dsqlOper($archives, "results");
if($results){
    foreach ($results as $key=>$val){
        $typeallarr[$val['pay_code']] = $val['pay_name'];
    }
}

//模块
$mosql = $dsql->SetQuery("SELECT  `name` , `subject`  FROM `#@__site_module`");
$mores = $dsql->dsqlOper($mosql, "results");
$leimuallarr['business'] = '商家相关';
$leimuallarr['member'] = '会员相关';
$leimuallarr2 = array_column($mores,'subject','name');
$leimuallarr = array_merge($leimuallarr,$leimuallarr2);

//获取所有的支付方式
$paytypes = $dsql->getArrList($dsql::SetQuery("select `pay_code`,`pay_name` from `#@__site_payment`"));
$paytypes = array_column($paytypes,'pay_name','pay_code');

if($dopost == "getList" || $do == "export"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where = " AND `state` = 1 AND `paytype` != 'money'";

	//关键词
	if(!empty($sKeyword)){
		$where .= " AND (`body` like '%$sKeyword%' OR `ordernum` = '$sKeyword' OR `uid` = '$sKeyword' OR `transaction_id` = '$sKeyword')";
	}

	if($start != ""){
		$where .= " AND `pubdate` >= ". GetMkTime($start." 00:00:00");
	}

	if($end != ""){
		$where .= " AND `pubdate` <= ". GetMkTime($end." 23:59:59");
	}

    if($leimutype!=''){
        $where .= " AND `ordertype` = '".$leimutype."'";
    }

    if($paytype!=''){
        $where .= " AND `paytype` = '".$paytype."'";
    }

	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` where `pt_charge`>0".$where);

	$pageObj = $dsql->getPage($page,$pagestep,$archives." ORDER BY `id` DESC");

	$totalLess = $dsql->getOne($dsql::SetQuery("select sum(`pt_charge`) from `#@__{$action}` where `pt_charge`>0".$where)) ?: 0;

	if(count($pageObj['list']) > 0){
		foreach ($pageObj['list'] as $key=> & $value) {
            $value['ordertype'] = $leimuallarr[$value['ordertype']];
            $value['userid'] = $value['uid'];
            $username = $dsql::SetQuery("select `username`,`nickname` from `#@__member` where `id`={$value['uid']}");
            $userDetail = $dsql->getArr($username);
            $value['username'] = !empty($userDetail['nickname']) ? ($userDetail['nickname'] ?? '未知') : $userDetail['username'];
            $value['info'] = substr($value['body'], 0, 2) == 'a:' ? json_encode(unserialize($value['body']), JSON_UNESCAPED_UNICODE) : $value['body'];
            $value['date'] = date("Y-m-d H:i:s",$value['pubdate']);
            $value['paytype'] = $paytypes[$value['paytype']] ?? $value['paytype'];
		}
		unset($value);
        if($do != "export") {
            $pageObj['state'] = 100;
            $pageObj['totalLess'] = $totalLess;
            echo json_encode($pageObj);die;
        }
	}else{
        if($do != "export") {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . 1 . ', "totalCount": ' . 0 . ', "state0": ' . 0 . ', "state1": ' . 0 . '}, "totalAdd": ' . 0 . ', "totalLess": ' . $totalLess . '}';
        }
	}
    if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '类目'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '会员信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '手续费'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '交易方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '第三方订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '时间'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";

        $filePath = $folder.iconv("utf-8","gbk//IGNORE","平台手续费明细.csv");
//        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($pageObj['list'] as $data){

            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordertype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['userid']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['username']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['info']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['pt_charge']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['paytype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['transaction_id']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['date']));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 平台手续费明细.csv");
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
		adminLog("删除现金消费记录", $id);
		echo '{"state": 100, "info": '.json_encode("删除成功！").'}';
	}
	die;

}
$huoniaoTag->assign('leimuallarr',$leimuallarr);
$huoniaoTag->assign("typeallarr", $typeallarr);

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
        'ui/clipboard.min.js',
		'admin/member/ptChargeLogs.js'
	);
	$huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

	$huoniaoTag->assign('cityArr', $userLogin->getAdminCity());
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
	$huoniaoTag->display($templates);
}else{
	echo $templates."模板文件未找到！";
}
