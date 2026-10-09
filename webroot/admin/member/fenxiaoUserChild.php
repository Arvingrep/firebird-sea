<?php

/**
 * 分销商管理
 *
 * @version        $Id: fenxiaoUser.php 2014-11-15 上午10:03:17 $
 * @package        HuoNiao.Member
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("fenxiaoUser");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__) . "/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "fenxiaoUser.html";

$cfg_fenxiaoLevel = unserialize($cfg_fenxiaoLevel);

if ($action == "getList") {

    $where = " AND m.`id` != ''";

    if (empty($pid)) {
        $where .= " AND 1 = 2";
    } else {
        $where .= " AND m.`from_uid` = $pid";
    }

    //城市管理员，只能管理管辖城市的会员
    if ($userType == 3) {
        // $sql = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member` WHERE `id` = " . $userLogin->getUserID());
        // $ret = $dsql->dsqlOper($sql, "results");
        // if($ret){
        //   $adminCityID = $ret[0]['mgroupid'];
        //
        //   global $data;
        //   $data = '';
        //   $adminAreaData = $dsql->getTypeList($adminCityID, 'site_area');
        //   $adminAreaIDArr = parent_foreach($adminAreaData, 'id');
        //   $adminAreaIDs = join(',', $adminAreaIDArr);
        //   if($adminAreaIDs){
        //     $where .= " AND m.`cityid` in ($adminAreaIDs)";
        //   }else{
        //     $where .= " AND 1 = 2";
        //   }
        // }
        $where .= getCityFilter('m.`cityid`');
    }

    //城市
    if ($cityid) {
        // global $data;
        // $data = '';
        // $cityAreaData = $dsql->getTypeList($cityid, 'site_area');
        // $cityAreaIDArr = parent_foreach($cityAreaData, 'id');
        // $cityAreaIDs = join(',', $cityAreaIDArr);
        // if($cityAreaIDs){
        // 	$where .= " AND m.`cityid` in ($cityAreaIDs)";
        // }else{
        // 	$where .= " 3 = 4";
        // }
        $where .= getWrongCityFilter('m.`cityid`', $cityid);
    }

    if ($sKeyword) {
        if ((int)$sKeyword) {
            $uid = " || m.`id` = " . (int)$sKeyword;
        } else {
            $uid = "";
        }
        $where .= " AND (m.`username` LIKE '%$sKeyword%' || m.`nickname` LIKE '%$sKeyword%' || m.`email` LIKE '%$sKeyword%' || m.`phone` LIKE '%$sKeyword%'" . $uid . ")";
    }

    if ($type != '') {
        $where .= " AND f.`level` = $type";
    }

    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;


    $list = array();

    //待审核
    $archives = $dsql->SetQuery("SELECT COUNT(f.`id`) total FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` WHERE f.`state` = 0" . $where);
    $result = $dsql->dsqlOper($archives, "results");
    $totalGray = $result[0]['total'];
    // 已审核
    $archives = $dsql->SetQuery("SELECT COUNT(f.`id`) total FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` WHERE f.`state` = 1" . $where);
    $result = $dsql->dsqlOper($archives, "results");
    $totalAudit = $result[0]['total'];
    // 审核拒绝
    $archives = $dsql->SetQuery("SELECT COUNT(f.`id`) total FROM `#@__member_fenxiao_user` f LEFT JOIN `#@__member` m  ON m.`id` = f.`uid` WHERE f.`state` = 2" . $where);
    $result = $dsql->dsqlOper($archives, "results");
    $totalRefuse = $result[0]['total'];


    $left = "";
    $left = " LEFT JOIN `#@__member_fenxiao_user` f ON f.`uid` = m.`id`";
    if ($state != "") {
        $where .= " AND f.`state` = $state";
    }
    $archives = $dsql->SetQuery("SELECT COUNT(m.`id`) total FROM `#@__member` m $left WHERE 1 = 1" . $where);
    //总条数
    $result = $dsql->dsqlOper($archives, "results");
    $totalCount = $result[0]['total'];
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);

    $atpage = $pagestep * ($page - 1);
    $limit = " LIMIT $atpage, $pagestep";
    $archives = $dsql->SetQuery("SELECT f.`id`, f.`level`, f.`backcount`, m.`id` uid, m.`mtype`, m.`username`, m.`nickname`, m.`realname`, m.`from_uid`, m.`cityid`, m2.`username` recuser, m2.`nickname` recname, m2.`mtype` from_mtype, f.`state`, f.`pubdate`, f.`phone` FROM `#@__member` m LEFT JOIN `#@__member_fenxiao_user` f ON m.`id` = f.`uid` LEFT JOIN `#@__member` m2  ON m2.`id` = m.`from_uid` WHERE 1 = 1" . $where);
    $order = " ORDER BY f.`id` DESC, m.`id` DESC";
    $results  = $dsql->dsqlOper($archives . $order . $limit, "results");

    if ($results) {
        // print_r($results);die;
        foreach ($results as $key => $value) {
            $list[$key]['id'] = (int)$value['id'];
            $list[$key]['userid'] = $value['uid'];
            $list[$key]['mtype'] = $value['mtype'];
            $list[$key]['username'] = $value['username'];
            $list[$key]['nickname'] = $value['nickname'];
            $list[$key]['realname'] = $value['realname'];
            $list[$key]['state'] = (int)$value['state'];
            $list[$key]['pubdate'] = $value['pubdate'] != null ? $value['pubdate'] : '';
            $list[$key]['phone'] = ($cfg_fenxiaoType ? '<code class="backcount" title="应返次数：' . $cfg_fenxiaoLevel[$value['level']]['count'] . '，已返次数：' . (int)$value['backcount'] . '" data-level="' . $value['level'] . '" data-total="' . (int)$cfg_fenxiaoLevel[$value['level']]['count'] . '" data-back="' . $cfg_fenxiaoLevel[$value['level']]['back'] . '" data-count="' . (int)$value['backcount'] . '"><i class="icon-pencil"></i> ' . $cfg_fenxiaoLevel[$value['level']]['name'] . '</code>&nbsp;' : '') . $value['phone'];

            $list[$key]['phone_'] = $value['phone'];

            if($cfg_fenxiaoType){
                $list[$key]['yingfan'] = $cfg_fenxiaoLevel[$value['level']]['count'];
                $list[$key]['yifan'] = (int)$value['backcount'];
                $list[$key]['fanxian'] = $cfg_fenxiaoLevel[$value['level']]['back'];
                $list[$key]['levelname'] = $cfg_fenxiaoLevel[$value['level']]['name'];
            }

            if ($value['cityid']) {
                $cityInfoArr = getPublicParentInfo(array('tab' => 'site_area', 'id' => $value['cityid'], 'type' => 'typename'));
                $cityInfoArr = explode(',', $cityInfoArr);
                $list[$key]['city'] = $cityInfoArr[0];
            } else {
                $list[$key]['city'] = '';
            }

            $from_uid = (int)$value['from_uid'];
            if ($from_uid) {
                $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_fenxiao_user` WHERE `uid` = $from_uid");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $list[$key]['from_uid'] = $from_uid;
                    $list[$key]['from_mtype'] = (int)$value['from_mtype'];
                    $list[$key]['recuser'] = $value['recname'] ? $value['recname'] : $value['recuser'];
                }
            }

            $sql = $dsql->SetQuery("SELECT SUM(`amount`) total FROM `#@__member_fenxiao` WHERE `uid` = " . $value['uid']);
            $res = $dsql->dsqlOper($sql, "results");
            $list[$key]['amount'] = $res[0]['total'] ? $res[0]['total'] : '0.00';

            $sql = $dsql->SetQuery("SELECT COUNT(`id`) total FROM `#@__member` WHERE `from_uid` = " . $value['uid']);
            $res = $dsql->dsqlOper($sql, "results");
            $list[$key]['child'] = $res[0]['total'] ? (int)$res[0]['total'] : 0;
        }

        if (count($list) > 0) {
	        if($do != "export"){
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}, "fenxiaoUser": ' . json_encode($list) . '}';
            }
        } else {
	        if($do != "export"){
                echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "totalGray": ' . $totalGray . ', "totalAudit": ' . $totalAudit . ', "totalRefuse": ' . $totalRefuse . '}, "info": ' . json_encode("暂无相关信息") . '}';
            }
        }
    } else {
        if($do != "export"){
            echo '{"state": 101, "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . '}, "info": ' . json_encode("暂无相关信息") . '}';
        }
    }


	//导出数据
	if($do == "export"){

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '城市'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户昵称'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '真实姓名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '联系电话'));

        if($cfg_fenxiaoType){
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '等级'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '每月返现'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '应返次数'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '应返金额'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '已返次数'));
            array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '已返金额'));
        }

        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '入驻时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '推荐人ID'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '推荐人信息'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '下线人数'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '佣金总额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));

        $folder = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder."分销商数据.csv";
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach($list as $data){
	      $arr = array();
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['city']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['userid']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['nickname']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['realname']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', "\t".$data['phone_']));

          if($cfg_fenxiaoType){
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['levelname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['fanxian']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['yingfan']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', sprintf("%.2f", $data['yingfan'] * $data['fanxian'])));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['yifan']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', sprintf("%.2f", $data['yifan'] * $data['fanxian'])));
          }

	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', date('Y-m-d H:i:s', $data['pubdate'])));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['from_uid']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['recuser']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['child']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['amount']));
	      array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['id'] ? ($data['state'] == 0 ? '待审' : ($data['state'] == 1 ? '正常' : '拒绝')) : '非分销商'));

          //写入文件
          fputcsv($file, $arr);
	    }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 分销商数据.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:".filesize($filePath));
        readfile($filePath);

    }

    die;
}

if ($action == 'updateState') {
    if (!testPurview("fenxiaoUserReview")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $each = explode(",", $id);
    $error = array();

    global $handler;
    global  $userLogin;
    $handler = true;

    if ($id != "") {

        foreach ($each as $val) {

            //更新记录状态
            $archives = $dsql->SetQuery("UPDATE `#@__member_fenxiao_user` SET `state` = $arcrank WHERE `id` = " . $val);
            $results = $dsql->dsqlOper($archives, "update");
            if ($results != "ok") {
                $error[] = $val;
            }

            if ($arcrank == 1) {
                //会员-分销商审核通知
                $to = '';
                $uid = $from_uid = 0;
                $sql = $dsql->SetQuery("SELECT m.`id`, m.`username`, m.`nickname`, m.`from_uid` FROM `#@__member` m LEFT JOIN `#@__member_fenxiao_user` f ON f.`uid` = m.`id` WHERE f.`id` = $val");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $uid = $ret[0]['id'];
                    $to = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                    $from_uid = $ret[0]['from_uid'];
                }

                //会员通知
                $param = array(
                    "service"  => "member",
                    "type" => "user",
                    "template" => "fenxiao"
                );

                //自定义配置
                $config = array(
                    "username" => $to,
                    "fields" => array(
                        'keyword1' => '信息标题',
                        'keyword2' => '审核时间',
                        'keyword3' => '进展状态'
                    )
                );

                updateMemberNotice($uid, "会员-分销商审核通知", $param, $config);
                $info = "成功邀请分销商入驻获得佣金，被邀请人：" . $to;  //账户充值

                //防止来回重复审核
                $chong = $dsql->SetQuery("SELECT `status`, `level` FROM `#@__member_fenxiao_user`  WHERE `id` = " . $val);
                $chresult = $dsql->dsqlOper($chong, "results");
                if ($chresult && $chresult[0]['status'] == 0) {
                    //查找推荐人
                    //   if($cfg_fenxiaoRecAmount > 0){
                    $sql = $dsql->SetQuery("SELECT m.`username`, m.`nickname` FROM `#@__member` m LEFT JOIN `#@__member_fenxiao_user` f ON f.`uid` = m.`id` WHERE m.`id` = $from_uid AND f.`id` != ''");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if ($ret) {
                        $from = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];

                        $price = (float)$cfg_fenxiaoLevel[$results[0]['level']]['amount'];

                        $cfg_fenxiaoHjType  = (int)$cfg_fenxiaoHjType;
                        $cfg_fenxiaoRecAmount = (float)$cfg_fenxiaoRecAmount;
                        $cfg_fenxiaoRecAmountPercent = (int)$cfg_fenxiaoRecAmountPercent;
                        if ($cfg_fenxiaoHjType == 1) {
                            $cfg_fenxiaoRecAmount = ($price * $cfg_fenxiaoRecAmountPercent) / 100;
                        }


                        if ($cfg_fenxiaoRecAmount > 0) {
                            //会员-分销商推荐注册成功通知

                            global $cfg_fenxiaoRecAmount;  //邀请入驻得佣金
                            global  $userLogin;
                            $toinfo = $dsql->SetQuery("SELECT `userid` FROM `#@__member_money`  WHERE `userid` = '$from_uid' AND `info` ='$info' AND `ordertype` = 'member' AND `ctype` = 'yongjin'");
                            $rep = $dsql->dsqlOper($toinfo, "results");
                            if (empty($rep)) {
                                //奖励推荐人
                                $date = time();
                                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$cfg_fenxiaoRecAmount' WHERE `id` = '$from_uid'");
                                $dsql->dsqlOper($archives, "update");
                                $uinfo = $dsql->SetQuery("SELECT `money` FROM `#@__member`  WHERE `id` = " . $from_uid);
                                $userinfo = $dsql->dsqlOper($uinfo, "results");
                                $usermoney = $userinfo[0]['money'] ? $userinfo[0]['money'] : 0;
                                //                  $money =  sprintf('%.2f',($usermoney + $cfg_fenxiaoRecAmount));
                                //保存操作日志
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`) VALUES ('$from_uid', '1', '$cfg_fenxiaoRecAmount', '$info', '$date','member','yongjin','$usermoney')");
                                $dsql->dsqlOper($archives, "update");
                                //防止来回重复审核
                                $archives = $dsql->SetQuery("UPDATE `#@__member_fenxiao_user` SET `status` = '1' WHERE `id` = " . $val);
                                $results = $dsql->dsqlOper($archives, "update");

                                $product = serialize(array());
                                $ordernum = "邀请".$cfg_fenxiaoName."入驻";
                                $archives = $dsql->SetQuery("INSERT INTO `#@__member_fenxiao` (`module`, `uid`, `byuid`, `child`, `ordernum`, `level`, `amount`, `pubdate`, `product`, `fee`) VALUES ('member', $from_uid, $uid, $uid, '$ordernum', '1', '$cfg_fenxiaoRecAmount', '$date', '$product', '100')");
                                $dsql->dsqlOper($archives, "update");

                                //会员通知
                                $param = array(
                                    "service" => "member",
                                    "type" => "user",
                                    "template" => "fenxiao"
                                );

                                //自定义配置
                                $config = array(
                                    "from" => $from,
                                    "to" => $to,
                                    "amount" => $cfg_fenxiaoRecAmount,
                                    "fields" => array(
                                        'keyword1' => '推荐人',
                                        'keyword2' => '被推荐人'
                                    )
                                );

                                updateMemberNotice($from_uid, "会员-分销商推荐注册成功通知", $param, $config);
                            }
                        }
                    }
                    //   }
                }
            }
        }
        if (!empty($error)) {
            echo '{"state": 200, "info": ' . json_encode($error) . '}';
        } else {
            adminLog("更新分销商状态", $id . "=>" . $arcrank);
            echo '{"state": 100, "info": ' . json_encode("修改成功！") . '}';
        }
    }
    die;
} elseif ($action == 'del') {
    if (empty($id)) die('{"state": 200, "info": ' . json_encode("您没有选择任何信息！") . '}');
    if (!testPurview("fenxiaoUserDelete")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    $sql = $dsql->SetQuery("DELETE FROM `#@__member_fenxiao_user` WHERE `id` IN (" . $id . ")");
    $res = $dsql->dsqlOper($sql, "update");
    if ($res == 'ok') {
        die('{"state": 100, "info": ' . json_encode("操作成功") . '}');
    } else {
        die('{"state": 200, "info": ' . json_encode("操作失败，请重试！") . '}');
    }
} elseif ($action == "add") {
    if (!testPurview("fenxiaoUserAdd")) {
        die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };
    if (empty($id)) die('{"state": 200, "info": ' . json_encode("请输入用户id") . '}');
    $sql = $dsql->SetQuery("SELECT `id` FROM `#@__member_fenxiao_user` WHERE `uid` = $id");
    $res = $dsql->dsqlOper($sql, "results");
    if ($res) {
        die('{"state": 200, "info": ' . json_encode("用户已经是分销商") . '}');
    }
    $sql = $dsql->SetQuery("SELECT `id`, `mtype`, `state`, `phone`, `from_uid`, `nickname`, `username` FROM `#@__member` WHERE `id` = $id");
    $res = $dsql->dsqlOper($sql, "results");
    if ($res) {
        if ($res[0]['mtype'] != 1 && $res[0]['mtype'] != 2) die('{"state": 200, "info": ' . json_encode("用户所在组无法进行此操作") . '}');
        if ($res[0]['state'] != 1) die('{"state": 200, "info": ' . json_encode("用户状态异常") . '}');
        $pubdate = time();
        $phone = $res[0]['phone'];
        $from_uid = $res[0]['from_uid'];
        $to = $res[0]['nickname'] ? $res[0]['nickname'] : $res[0]['username'];
        $sql = $dsql->SetQuery("INSERT INTO `#@__member_fenxiao_user` (`uid`, `phone`, `state`, `pubdate`) VALUES ($id, '$phone', 1, $pubdate)");
        $res = $dsql->dsqlOper($sql, "lastid");
        if ($res && is_numeric($res)) {

            //会员-分销商审核通知

            //会员通知
            $param = array(
                "service"  => "member",
                "type" => "user",
                "template" => "fenxiao"
            );

            //自定义配置
            $config = array(
                "username" => $to,
                "fields" => array(
                    'keyword1' => '信息标题',
                    'keyword2' => '审核时间',
                    'keyword3' => '进展状态'
                )
            );

            updateMemberNotice($id, "会员-分销商审核通知", $param, $config);

            //查找推荐人
            if ($cfg_fenxiaoRecAmount > 0) {
                $sql = $dsql->SetQuery("SELECT m.`username`, m.`nickname` FROM `#@__member` m LEFT JOIN `#@__member_fenxiao_user` f ON f.`uid` = m.`id` WHERE m.`id` = $from_uid AND f.`id` != ''");
                $ret = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $from = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];

                    //会员-分销商推荐注册成功通知

                    global $cfg_fenxiaoRecAmount;  //邀请入驻得佣金
                    global  $userLogin;
                    //奖励推荐人
                    $date = time();
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$cfg_fenxiaoRecAmount' WHERE `id` = '$from_uid'");
                    $dsql->dsqlOper($archives, "update");
                    $user  = $userLogin->getMemberInfo($from_uid);
                    $usermoney = $user['money'];
                    //            $money =  sprintf('%.2f',($usermoney + $cfg_fenxiaoRecAmount));
                    //保存操作日志
                    $info = "成功邀请分销商入驻获得佣金，被邀请人：" . $to;  //账户充值
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`) VALUES ('$from_uid', '1', '$cfg_fenxiaoRecAmount', '$info', '$date','member','yongjin','$usermoney')");
                    $dsql->dsqlOper($archives, "update");

                    //会员通知
                    $param = array(
                        "service"  => "member",
                        "type" => "user",
                        "template" => "fenxiao"
                    );

                    //自定义配置
                    $config = array(
                        "from" => $from,
                        "to" => $to,
                        "amount" => $cfg_fenxiaoRecAmount,
                        "fields" => array(
                            'keyword1' => '推荐人',
                            'keyword2' => '被推荐人'
                        )
                    );

                    updateMemberNotice($from_uid, "会员-分销商推荐注册成功通知", $param, $config);
                }
            }

            die('{"state": 100, "info": ' . json_encode("添加成功") . '}');
        } else {
            die('{"state": 200, "info": ' . json_encode("添加失败，请重试") . '}');
        }
    } else {
        die('{"state": 200, "info": ' . json_encode("用户不存在") . '}');
    }
}

//验证模板文件
if (file_exists($tpl . "/" . $templates)) {

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
        'ui/jquery-ui-selectable.js',
        'admin/member/fenxiaoUser.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $huoniaoTag->assign('cityArr', $userLogin->getAdminCity());

    $huoniaoTag->assign('fenxiaoType', $cfg_fenxiaoType);
    $huoniaoTag->assign('fenxiaoLevel', $cfg_fenxiaoLevel);
    $huoniaoTag->assign('notice', $notice);
    $huoniaoTag->assign('pid', (int)$pid);
    $huoniaoTag->assign('cfg_fenxiaoType', (int)$cfg_fenxiaoType);

    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
