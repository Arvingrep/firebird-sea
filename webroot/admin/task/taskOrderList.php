<?php
/**
 * 订单管理
 *
 * @version        $Id: taskOrderList.php 2022-08-21 下午19:59:21 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskOrderList");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "task_order";
$templates = "taskOrderList.html";

//获取订单列表
if($dopost == "getList"){
	$pagestep = $pagestep == "" ? 10 : $pagestep;
	$page     = $page == "" ? 1 : $page;

	$where  = "";

    if($sKeyword != ""){
        $sKeyword = trim($sKeyword);
		$isId = false;
		if(substr($sKeyword, 0, 1) == '#'){
			$id = substr($sKeyword, 1);
			if(is_numeric($id)){
				$isId = true;
				$where .= " AND o.`uid` = $id";
			}
		}
		if(!$isId){
            if(is_numeric($sKeyword)){
				$where .= " AND o.`tid` = $sKeyword";
			}else{
			    $where .= " AND (m.`username` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%' OR m.`realname` like '%$sKeyword%' OR m.`phone` like '%$sKeyword%' OR m.`company` like '%$sKeyword%' OR l.`project` like '%$sKeyword%' OR l.`title` like '%$sKeyword%' OR o.`ordernum` like '%$sKeyword%')";
            }
		}

	}

    //发布时间
	if($start != ""){
		$where .= " AND o.`lq_time` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND o.`lq_time` <= ". GetMkTime($end . " 23:59:59");
	}

	$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__".$db."` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` LEFT JOIN `#@__member` m ON m.`id` = o.`uid` LEFT JOIN `#@__task_member` tm ON tm.`uid` = o.`uid` WHERE m.`id` IS NOT NULL");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
	//待提交
	$state0 = $dsql->dsqlOper($archives." AND o.`state` = 0".$where, "totalCount");
	//审核中
	$state1 = $dsql->dsqlOper($archives." AND o.`state` = 1".$where, "totalCount");
	//已通过
	$state2 = $dsql->dsqlOper($archives." AND o.`state` = 2".$where, "totalCount");
	//未通过
	$state3 = $dsql->dsqlOper($archives." AND o.`state` = 3".$where, "totalCount");
	//已失效
	$state4 = $dsql->dsqlOper($archives." AND o.`state` = 4".$where, "totalCount");

    if($state != ""){

        $where .= " AND o.`state` = $state";

		if($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
		}elseif($state == 4){
			$totalPage = ceil($state4/$pagestep);
		}
	}

    $order .= " ORDER BY o.`id` DESC";

	$atpage = $pagestep*($page-1);
    $time = time();
	$archives = $dsql->SetQuery("SELECT o.`id`, o.`uid`, o.`tid`, o.`sid`, o.`ordernum`, o.`price`, o.`mprice`, o.`fabu_fee`, o.`task_fee`, o.`task_fee_amount`, o.`lq_time`, o.`tj_time`, o.`sh_time`, o.`sh_explain`, o.`state`, o.`tj_data`, o.`tj_log`, m.`nickname`, m.`photo`, m.`promotion`, l.`project`, l.`typeid`, t.`typename`, t.`icon`, l.`title`, l.`number`, (SELECT `id` FROM `#@__task_member` WHERE `uid` = o.`uid` AND `end_time` > $time) as `vip` FROM `#@__task_order` o LEFT JOIN `#@__task_list` l ON l.`id` = o.`tid` LEFT JOIN `#@__task_type` t ON t.`id` = l.`typeid` LEFT JOIN `#@__member` m ON m.`id` = o.`uid` LEFT JOIN `#@__task_member` tm ON tm.`uid` = o.`uid` WHERE m.`id` IS NOT NULL".$where.$order." LIMIT $atpage, $pagestep");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array();
	if($results && is_array($results)){
        foreach ($results as $key => $value) {
            $list[$key]["id"]        = (int)$value["id"];
            $list[$key]["uid"]       = (int)$value["uid"];
            $list[$key]["tid"]       = (int)$value["tid"];
            $list[$key]["sid"]       = (int)$value["sid"];
            $list[$key]["ordernum"]  = $value["ordernum"];

            $price = floatval($value["price"]);

            $list[$key]["price"]     = $price;

            //计算比正常价多拿了多少
            $mprice = floatval($value["mprice"]);
            $fabu_fee = floatval($value["fabu_fee"]);
            $task_fee = floatval($value["task_fee"]);
            
            //订单金额 - 默认赏金
            // $price_add = sprintf("%.2f", $price - ($mprice * (100-$fabu_fee) / 100));
            // $list[$key]['price_add'] = $mprice ? floatval($price_add) : 0;

            //多拿了多少
            $list[$key]['price_add'] = floatval($value['task_fee_amount']);

            $list[$key]["lq_time"]   = (int)$value["lq_time"];
            $list[$key]["tj_time"]   = (int)$value["tj_time"];
            $list[$key]["sh_time"]   = (int)$value["sh_time"];
            $list[$key]["sh_explain"] = $value["sh_explain"];
            $list[$key]["state"]     = (int)$value["state"];
            $list[$key]["tj_data"]   = $value["tj_data"] ? json_decode($value["tj_data"], true) : array();
            $list[$key]["tj_log"]    = $value["tj_log"] ? json_decode($value["tj_log"], true) : array();
            $list[$key]["nickname"]  = $value["nickname"];
            $list[$key]["photo"]     = getFilePath($value["photo"]);
            $list[$key]["promotion"] = $value["promotion"];
            $list[$key]["project"]   = $value["project"];
            $list[$key]["typeid"]    = (int)$value["typeid"];
            $list[$key]["typename"]  = $value["typename"];
            $list[$key]["typeicon"]  = getFilePath($value["icon"]);
            $list[$key]["title"]     = $value["title"];
            $list[$key]["number"]    = (int)$value["number"];

            //会员等级信息
            $level = array();
            if($value['vip']){
                $sql = $dsql->SetQuery("SELECT l.`typename`, l.`icon`, l.`bgcolor`, l.`fontcolor` FROM `#@__task_member_level` l LEFT JOIN `#@__task_member` m ON m.`level` = l.`id` WHERE m.`uid` = " . $value['uid']);
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $data = $ret[0];
                    $level = array(
                        'name' => $data['typename'],
                        'icon' => getFilePath($data['icon']),
                        'bgcolor' => $data['bgcolor'],
                        'fontcolor' => $data['fontcolor']
                    );
                }
            }
            $list[$key]['level'] = $level;
        }
		if(count($list) > 0){
			if($do != "export"){
				echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.'}, "taskOrderList": '.json_encode($list).'}';
			}
		}else{
			if($do != "export"){
                echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.'}, "info": '.json_encode("暂无相关信息").'}';
			}
		}
	}else{
        if($do != "export"){
            echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.'}, "info": '.json_encode("暂无相关信息").'}';
		}
	}
	die;

//获取指定ID信息详情
}elseif($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
    if($results){
        $tj_data = $results[0]['tj_data'];
        $tj_data = $tj_data ? json_decode($tj_data) : array();
        $results[0]['tj_data'] = $tj_data;

        $tj_log = $results[0]['tj_log'];
        $tj_log = $tj_log ? json_decode($tj_log) : array();
        $results[0]['tj_log'] = array_reverse($tj_log);
    }
	echo json_encode($results);die;

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
        'ui/jquery-ui-selectable.js',
        'ui/chosen.jquery.min.js',
        'admin/task/taskOrderList.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
