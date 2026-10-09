<?php
/**
 * 任务管理
 *
 * @version        $Id: taskList.php 2022-08-21 上午10:08:16 $
 * @package        HuoNiao.Task
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__)."/../inc/config.inc.php");
checkPurview("taskList");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/task";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录

$db = "task_list";
$templates = "taskList.html";

//获取任务列表
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
				$where .= " AND l.`uid` = $id";
			}
		}
		if(!$isId){
            if(is_numeric($sKeyword)){
				$where .= " AND l.`id` = $sKeyword";
			}else{
			    $where .= " AND (m.`username` like '%$sKeyword%' OR m.`nickname` like '%$sKeyword%' OR m.`realname` like '%$sKeyword%' OR m.`phone` like '%$sKeyword%' OR m.`company` like '%$sKeyword%' OR l.`project` like '%$sKeyword%' OR l.`title` like '%$sKeyword%')";
            }
		}

	}

    //会员等级
	if($level){
		$where .= " AND tm.`level` = ".$level;
	}

    //任务类型
	if($typeid){
		$where .= " AND l.`typeid` = ".$typeid;
	}

    //发布时间
	if($start != ""){
		$where .= " AND l.`pubdate` >= ". GetMkTime($start);
	}

	if($end != ""){
		$where .= " AND l.`pubdate` <= ". GetMkTime($end . " 23:59:59");
	}

	//金额区间搜索
    if($startMoney != ""){
        $where .= " AND l.`price` >= ". (float)$startMoney;
    }

    if($endMoney != ""){
        $where .= " AND l.`price` <= ". (float)$endMoney;
    }

	$archives = $dsql->SetQuery("SELECT l.`id` FROM `#@__".$db."` l LEFT JOIN `#@__member` m ON m.`id` = l.`uid` LEFT JOIN `#@__task_member` tm ON tm.`uid` = l.`uid` WHERE m.`id` IS NOT NULL");

	//总条数
	$totalCount = $dsql->dsqlOper($archives.$where, "totalCount");
	//总分页数
	$totalPage = ceil($totalCount/$pagestep);
    //未付款
	$state01 = $dsql->dsqlOper($archives." AND l.`state` = 0 AND l.`haspay` = 0".$where, "totalCount");
	//未审核
	$state0 = $dsql->dsqlOper($archives." AND l.`state` = 0 AND l.`haspay` = 1".$where, "totalCount");
	//已审核
	$state1 = $dsql->dsqlOper($archives." AND l.`state` = 1 AND l.`finish` = 0".$where, "totalCount");
	//拒绝审核
	$state2 = $dsql->dsqlOper($archives." AND l.`state` = 2".$where, "totalCount");
	//已暂停
	$state3 = $dsql->dsqlOper($archives." AND l.`state` = 3".$where, "totalCount");
	//已冻结
	$state4 = $dsql->dsqlOper($archives." AND l.`state` = 4".$where, "totalCount");
	//已结束
	$state5 = $dsql->dsqlOper($archives." AND l.`state` = 1 AND l.`finish` = 1".$where, "totalCount");
	//推荐
	$state6 = $dsql->dsqlOper($archives." AND l.`isbid` = 1".$where, "totalCount");
	//极速
	$state7 = $dsql->dsqlOper($archives." AND l.`sh_time` <= 60".$where, "totalCount");

    if($state != ""){

        if($state === '01'){
            $where .= " AND l.`state` = 0 AND l.`haspay` = 0";
        }else if($state != 5 && $state != 6 && $state != 7){
            $where .= " AND l.`state` = $state AND l.`haspay` = 1 AND l.`finish` = 0";
        }else if($state == 5){
            $where .= " AND l.`state` = 1 AND l.`finish` = 1";
        }else if($state == 6){
            $where .= " AND l.`isbid` = 1";
        }else if($state == 7){
            $where .= " AND l.`sh_time` <= 60";
        }

		if($state == '01'){
			$totalPage = ceil($state01/$pagestep);
		}elseif($state == 0){
			$totalPage = ceil($state0/$pagestep);
		}elseif($state == 1){
			$totalPage = ceil($state1/$pagestep);
		}elseif($state == 2){
			$totalPage = ceil($state2/$pagestep);
		}elseif($state == 3){
			$totalPage = ceil($state3/$pagestep);
		}elseif($state == 4){
			$totalPage = ceil($state4/$pagestep);
		}elseif($state == 5){
			$totalPage = ceil($state5/$pagestep);
		}elseif($state == 6){
			$totalPage = ceil($state6/$pagestep);
		}elseif($state == 7){
			$totalPage = ceil($state7/$pagestep);
		}
	}

    if($state == 0 && $state != ''){
        $order .= " ORDER BY CASE WHEN `vip` > 0 THEN 1 ELSE 0 END DESC, l.`id` DESC";
    }else{
        $order .= " ORDER BY l.`id` DESC";
    }

	$atpage = $pagestep*($page-1);
    $time = time();
	$archives = $dsql->SetQuery("SELECT l.`id`, l.`uid`, m.`nickname`, m.`photo`, m.`promotion`, l.`project`, l.`typeid`, t.`typename`, t.`icon`, l.`title`, l.`tj_time`, l.`sh_time`, l.`number`, l.`price`, l.`mprice`, l.`fabu_fee`, l.`quota`, l.`note`, l.`pubdate`, l.`state`, l.`review`, l.`haspay`, l.`finish`, l.`audit_time`, l.`refresh_time`, l.`isbid`, l.`bid_began_time`, l.`bid_end_time`, l.`isfirst`, l.`js_began_time`, l.`js_end_time`, (SELECT `id` FROM `#@__task_member` WHERE `uid` = l.`uid` AND `end_time` > $time) as `vip` FROM `#@__task_list` l LEFT JOIN `#@__task_type` t ON t.`id` = l.`typeid` LEFT JOIN `#@__member` m ON m.`id` = l.`uid` LEFT JOIN `#@__task_member` tm ON tm.`uid` = l.`uid` WHERE m.`id` IS NOT NULL".$where.$order." LIMIT $atpage, $pagestep");
	$results = $dsql->dsqlOper($archives, "results");
	$list = array();
	if($results && is_array($results)){
        foreach ($results as $key => $value) {
            $list[$key]["id"]        = (int)$value["id"];
            $list[$key]["uid"]       = (int)$value["uid"];
            $list[$key]["nickname"]  = $value["nickname"];
            $list[$key]["photo"]     = getFilePath($value["photo"]);
            $list[$key]["promotion"] = $value["promotion"];
            $list[$key]["project"]   = $value["project"];
            $list[$key]["typeid"]    = (int)$value["typeid"];
            $list[$key]["typename"]  = $value["typename"];
            $list[$key]["typeicon"]  = getFilePath($value["icon"]);
            $list[$key]["title"]     = $value["title"];
            $list[$key]["tj_time"]   = (int)$value["tj_time"];
            // $list[$key]["sh_time"]   = (int)$value["sh_time"];
            $list[$key]["number"]    = (int)$value["number"];

            //判断极速审核是否开始
            if($value['sh_time'] <= 60){
                if($value['js_began_time'] < $time && $value['js_end_time'] > $time){
                    $list[$key]["sh_time"]   = (int)$value["sh_time"];
                }else{
                    $list[$key]["sh_time"]   = (int)$value["js_sh_time_bak"];
                }

                $list[$key]["js_began_time"] = (int)$value["js_began_time"];
                $list[$key]["js_end_time"] = (int)$value["js_end_time"];
                $list[$key]["js_sh_time"] = (int)$value["sh_time"];
            }else{
                $list[$key]["sh_time"]   = (int)$value["sh_time"];
            }

            //外显金额扣除平台佣金
            $list[$key]["price"]     = floatval($value["price"]);
            $list[$key]["mprice"]    = floatval($value["mprice"]);
            $list[$key]["fabu_fee"]  = $value['fabu_fee'];
            $list[$key]['fabu_fee_amount'] = $value['mprice'] > 0 ? floatval(sprintf('%.2f', $value['mprice'] - $value["price"])) : 0;

            // $list[$key]["price"]     = floatval($value["price"]);
            $list[$key]["quota"]     = (int)$value["quota"];
            $list[$key]["note"]      = $value["note"];
            $list[$key]["pubdate"]   = (int)$value["pubdate"];
            $list[$key]["finish"]         = (int)$value["finish"];
            $list[$key]["refresh_time"]   = (int)$value["refresh_time"];
            $list[$key]["isbid"]          = (int)$value["isbid"];
            $list[$key]["bid_began_time"] = (int)$value["bid_began_time"];
            $list[$key]["bid_end_time"]   = (int)$value["bid_end_time"];
            $list[$key]["isfirst"]        = (int)$value["isfirst"];
            // $list[$key]["js_began_time"]  = (int)$value["js_began_time"];
            // $list[$key]["js_end_time"]    = (int)$value["js_end_time"];
            $list[$key]["state"] = (int)$value["state"];
            $list[$key]["review"] = $value["review"];
            $list[$key]["haspay"] = (int)$value["haspay"];
            $list[$key]["audit_time"] = (int)$value["audit_time"];

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

            //任务领取、完成情况统计
            $statistics = array();
            $sql = $dsql->SetQuery("SELECT (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` != 4) as `used`, (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` = 2) as `valid`, (SELECT AVG(`tj_time` - `lq_time`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND (`state` = 1 OR `state` = 2)) as `avg_time`, (SELECT AVG(`sh_time` - `tj_time`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` = 2) as `avg_audit`");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                $data = $ret[0];
                $statistics = array(
                    'used' => (int)$data['used'],  //占用名额
                    'valid' => (int)$data['valid'],  //有效名额
                    'avg_time' => (int)($data['avg_time']/60),  //提交平均用时
                    'avg_audit' => (int)($data['avg_audit']/60)  //审核平均用时
                );

                $ongoing = $fail = $review = 0;
                $sql = $dsql->SetQuery("SELECT (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND (`state` = 0 OR `state` = 1 OR `state` = 3)) as `ongoing`, (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` = 3) as `fail`, (SELECT COUNT(`id`) FROM `#@__task_order` WHERE `tid` = ".$value['id']." AND `state` = 1) as `review`");
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret){
                    $ongoing = $ret[0]['ongoing'];
                    $fail = $ret[0]['fail'];
                    $review = $ret[0]['review'];
                }

                $statistics['ongoing'] = (int)$ongoing;
                $statistics['fail'] = (int)$fail;
                $statistics['review'] = (int)$review;
            }
            $list[$key]['statistics'] = $statistics;
        }
		if(count($list) > 0){
			if($do != "export"){
				echo '{"state": 100, "info": '.json_encode("获取成功").', "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state01": '.$state01.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.', "state5": '.$state5.', "state6": '.$state6.', "state7": '.$state7.'}, "taskList": '.json_encode($list).'}';
			}
		}else{
			if($do != "export"){
                echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state01": '.$state01.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.', "state5": '.$state5.', "state6": '.$state6.', "state7": '.$state7.'}, "info": '.json_encode("暂无相关信息").'}';
			}
		}
	}else{
        if($do != "export"){
            echo '{"state": 101, "pageInfo": {"totalPage": '.$totalPage.', "totalCount": '.$totalCount.', "state01": '.$state01.', "state0": '.$state0.', "state1": '.$state1.', "state2": '.$state2.', "state3": '.$state3.', "state4": '.$state4.', "state5": '.$state5.', "state6": '.$state6.', "state7": '.$state7.'}, "info": '.json_encode("暂无相关信息").'}';
		}
	}
	die;

//获取指定ID信息详情
}elseif($dopost == "getDetail"){
	if($id == "") die;
	$archives = $dsql->SetQuery("SELECT * FROM `#@__".$db."` WHERE `id` = ".$id);
	$results = $dsql->dsqlOper($archives, "results");
    if($results){
        $steps = $results[0]['steps'];
        $steps = $steps ? json_decode($steps, true) : array();
        $results[0]['steps'] = $steps;

        $steps_last_edit = $results[0]['steps_last_edit'];
        $steps_last_edit = $steps_last_edit ? json_decode($steps_last_edit, true) : array();
        $results[0]['steps_last_edit'] = $steps_last_edit;

        $results[0]['tj_time'] = FormatSecond($results[0]['tj_time'] * 60);

        $sh_time = $results[0]['sh_time'];

        if($results[0]['js_sh_time_bak'] > 0){

            //极速审核时长
            $js_sh_time = $sh_time;

            //默认审核时长
            $sh_time = $results[0]['js_sh_time_bak'];

        }
        $results[0]['sh_time'] = FormatSecond($sh_time * 60);
        $results[0]['js_sh_time'] = FormatSecond($js_sh_time * 60);
        $results[0]['js_began_time'] = (int)$results[0]['js_began_time'];
        $results[0]['js_end_time'] = (int)$results[0]['js_end_time'];

        $js_log = $results[0]['js_log'];
        $js_log = $js_log ? array_reverse(json_decode($js_log, true)) : array();
        $results[0]['js_log'] = $js_log;
        

        $results[0]['pay_type'] = getPaymentName($results[0]['pay_type']);

        $results[0]['fabu_fee_amount'] = $results[0]['mprice'] > 0 ? floatval(sprintf('%.2f', $results[0]['mprice'] - $results[0]["price"])) : 0;
    }
	echo json_encode($results);die;

//更新任务状态
}elseif($dopost == 'updateState'){

    $type = (int)$type;
    $ids  = strstr(',', $ids) ? $ids : (int)$ids;
    $note = trim($note);
    $date = GetMkTime(time());
    
    if(!$type){
        echo '{"state": 200, "info": '.json_encode("请选择要操作的类型！").'}';die;
    }
    
    if(!$ids){
        echo '{"state": 200, "info": '.json_encode("请选择要操作的任务！").'}';die;
    }

    //审核拒绝和冻结任务需要原因
    if(($type == 2 || $type == 4) && !$note){
        echo '{"state": 200, "info": '.json_encode("请输入操作原因！").'}';die;
    }

    //平台说明
    if($type == 6 && !$note){
        echo '{"state": 200, "info": '.json_encode("请填写平台说明！").'}';die;
    }

    //审核通过
    if($type == 1){

        //只操作指定ID并且是已经支付的待审和拒绝审核状态的任务，同时把审核说明清空。
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `state` = 1, `review` = '', `audit_time` = '$date', `steps_last_edit` = '' WHERE `id` IN ($ids) AND ((`state` = 0 AND `haspay` = 1) OR `state` = 2)");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){

            //通知商家
            global $cfg_miniProgramAppid;
            $param = 'wxMiniprogram://'.$cfg_miniProgramAppid.'?//pages/packages/task/taskmanage/taskmanage?index=1';

            $sql = $dsql->SetQuery("SELECT `title`, `uid` FROM `#@__task_list` WHERE `id` IN ($ids)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                foreach($ret as $key => $val){
                    
                    $config = array(
                        "first" => "您的任务已审核通过",
                        "content" => $val['title'],
                        "date" => date("Y-m-d H:i:s", $date),
                        "status" => "任务进行中",
                        "color" => "",
                        "remark" => "点击查看！",
                        "fields" => array(
                            'keyword1' => '任务信息',
                            'keyword2' => '提交时间',
                            'keyword3' => '当前状态'
                        )
                    );
        
                    updateMemberNotice($val['uid'], "会员-任务提醒", $param, $config);

                }
            }

            adminLog("审核通过任务", $ids);
            echo '{"state": 100, "info": '.json_encode("操作成功！").'}';die;
        }else{
            echo $ret;die;
        }

    //审核拒绝
    }elseif($type == 2){

        //只操作指定ID并且是已经支付的待审状态的任务，同时更新审核说明
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `state` = 2, `review` = '$note', `audit_time` = '$date' WHERE `id` IN ($ids) AND `state` = 0 AND `haspay` = 1");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){

            //通知商家
            global $cfg_miniProgramAppid;
            $param = 'wxMiniprogram://'.$cfg_miniProgramAppid.'?//pages/packages/task/taskmanage/taskmanage';

            $sql = $dsql->SetQuery("SELECT `title`, `uid` FROM `#@__task_list` WHERE `id` IN ($ids)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                foreach($ret as $key => $val){
                    
                    $config = array(
                        "first" => "您的任务审核被拒绝",
                        "content" => $val['title'],
                        "date" => date("Y-m-d H:i:s", $date),
                        "status" => $note,
                        "color" => "",
                        "remark" => "点击查看！",
                        "fields" => array(
                            'keyword1' => '任务信息',
                            'keyword2' => '提交时间',
                            'keyword3' => '当前状态'
                        )
                    );
        
                    updateMemberNotice($val['uid'], "会员-任务提醒", $param, $config);

                }
            }

            adminLog("审核拒绝任务", $ids . '=>' . $note);
            echo '{"state": 100, "info": '.json_encode("操作成功！").'}';die;
        }else{
            echo $ret;die;
        }

    //删除任务
    }elseif($type == 3){

        //只操作指定ID并且是未审核和拒绝审核状态的任务
        $sql = $dsql->SetQuery("SELECT `id`, `title`, `uid`, `amount`, `haspay`, `state` FROM `#@__task_list` WHERE `id` IN ($ids) AND (`state` = 0 OR `state` = 2)");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
            $id = $ret[0]['id'];
            $title = $ret[0]['title'];
            $uid = $ret[0]['uid'];
            $amount = $ret[0]['amount'];
            $haspay = $ret[0]['haspay'];
            $state = $ret[0]['state'];

            $tuikuan = '无退款';

            $sql = $dsql->SetQuery("DELETE FROM `#@__task_list` WHERE `id` = $id");
            $ret = $dsql->dsqlOper($sql, "update");
            if($ret == 'ok'){

                //退款到账户余额
                if($haspay == 1){

                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $amount WHERE `id` = ".$uid);
                    $dsql->dsqlOper($archives, "update");

                    $userinfo  = $userLogin->getMemberInfo($uid);
                    $usermoney = $userinfo['money'];
                    $info = '取消任务退款';

                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`, `montype`, `ordertype`, `ctype`, `balance`) VALUES ('$uid', 1, '$amount', '$info', '$date', '1', 'task', 'chongzhi', '$usermoney')");
	                $dsql->dsqlOper($archives, "update");

                    $tuikuan = '有退款' . $amount . '元 ';

                    //自定义配置
                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "point"
                    );

                    $config = array(
                        "username" => $userinfo['nickname'],
                        "amount" => '+'.$amount,
                        "money" => $usermoney,
                        "date" => date("Y-m-d H:i:s", $date),
                        "info" => $info,
                        "fields" => array(
                            'keyword1' => '变动类型',
                            'keyword2' => '变动金额',
                            'keyword3' => '变动时间',
                            'keyword4' => '帐户余额'
                        )
                    );

                    updateMemberNotice($uid, "会员-帐户资金变动提醒", $param, $config);
                }

                adminLog("删除任务", $id . '=>' . $title . '=>' . $tuikuan);
                echo '{"state": 100, "info": '.json_encode("操作成功！").'}';die;
            }else{
                echo $ret;die;
            }
        }else{
            echo '{"state": 200, "info": '.json_encode("没有符合删除要求的任务！").'}';die;
        }
        die;

    //冻结任务
    }elseif($type == 4){

        //只操作指定ID并且是审核通过或者已暂停状态的任务，同时更新审核说明
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `state` = 4, `review` = '$note', `audit_time` = '$date' WHERE `id` IN ($ids) AND (`state` = 1 OR `state` = 3) AND `finish` = 0");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){

            
            //通知商家
            global $cfg_miniProgramAppid;
            $param = 'wxMiniprogram://'.$cfg_miniProgramAppid.'?//pages/packages/task/taskmanage/taskmanage?index=2';

            $sql = $dsql->SetQuery("SELECT `title`, `uid` FROM `#@__task_list` WHERE `id` IN ($ids)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                foreach($ret as $key => $val){
                    
                    $config = array(
                        "first" => "您的任务被管理员冻结",
                        "content" => $val['title'],
                        "date" => date("Y-m-d H:i:s", $date),
                        "status" => $note,
                        "color" => "",
                        "remark" => "点击查看！",
                        "fields" => array(
                            'keyword1' => '任务信息',
                            'keyword2' => '提交时间',
                            'keyword3' => '当前状态'
                        )
                    );
        
                    updateMemberNotice($val['uid'], "会员-任务提醒", $param, $config);

                }
            }


            adminLog("冻结任务", $ids . '=>' . $note);
            echo '{"state": 100, "info": '.json_encode("操作成功！").'}';die;
        }else{
            echo $ret;die;
        }

    //取消冻结
    }elseif($type == 5){

        //只操作指定ID并且是已冻结状态的任务，同时把审核说明清空。
        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `state` = 1, `review` = '', `audit_time` = '$date' WHERE `id` IN ($ids) AND `state` = 4");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){

            //通知商家
            global $cfg_miniProgramAppid;
            $param = 'wxMiniprogram://'.$cfg_miniProgramAppid.'?//pages/packages/task/taskmanage/taskmanage';

            $sql = $dsql->SetQuery("SELECT `title`, `uid` FROM `#@__task_list` WHERE `id` IN ($ids)");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){

                foreach($ret as $key => $val){
                    
                    $config = array(
                        "first" => "您的任务被管理员取消冻结",
                        "content" => $val['title'],
                        "date" => date("Y-m-d H:i:s", $date),
                        "status" => "任务状态正常",
                        "color" => "",
                        "remark" => "点击查看！",
                        "fields" => array(
                            'keyword1' => '任务信息',
                            'keyword2' => '提交时间',
                            'keyword3' => '当前状态'
                        )
                    );
        
                    updateMemberNotice($val['uid'], "会员-任务提醒", $param, $config);

                }
            }

            adminLog("取消冻结任务", $ids);
            echo '{"state": 100, "info": '.json_encode("操作成功！").'}';die;
        }else{
            echo $ret;die;
        }

    //平台说明
    }elseif($type == 6){

        $sql = $dsql->SetQuery("UPDATE `#@__task_list` SET `platform_tips` = '$note' WHERE `id` IN ($ids)");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == 'ok'){
            adminLog("更新任务悬赏平台说明", $ids . '=>' . $note);
            echo '{"state": 100, "info": '.json_encode("操作成功！").'}';die;
        }else{
            echo $ret;die;
        }

    }


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
        'admin/task/taskList.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
	$huoniaoTag->assign('notice', $notice);

	$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__task_member_level` ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($sql, "results");
	$levelList = array();
	if($results){
		$levelList = $results;
	}
	$huoniaoTag->assign('levelList', $levelList);
	$huoniaoTag->assign('levelListArr', json_encode($levelList));

	$sql = $dsql->SetQuery("SELECT `id`, `typename` FROM `#@__task_type` ORDER BY `weight` ASC");
	$results = $dsql->dsqlOper($sql, "results");
	$typeList = array();
	if($results){
		$typeList = $results;
	}
	$huoniaoTag->assign('typeList', $typeList);
	$huoniaoTag->assign('typeListArr', json_encode($typeList));
    
	$huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/task";  //设置编译目录
	$huoniaoTag->display($templates);

}else{
	echo $templates."模板文件未找到！";
}
