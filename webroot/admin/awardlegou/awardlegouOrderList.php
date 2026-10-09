<?php
/**
 * 管理团购订单
 *
 * @version        $Id: tuanOrderList.php 2013-12-9 下午21:11:13 $
 * @package        HuoNiao.Tuan
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once(dirname(__FILE__) . "/../inc/config.inc.php");
checkPurview("awardlegouOrderList");
$dsql                     = new dsql($dbo);
$tpl                      = dirname(__FILE__) . "/../templates/awardlegou";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates                = "awardlegouOrderList.html";

$action = "awardlegou_order";

/*这里已中奖人的订单号为查询主条件显示的是发起人的订单号*/
if ($dopost == "getList" || $do == "export") {
    $pagestep = $pagestep == "" ? 10 : $pagestep;
    $page     = $page == "" ? 1 : $page;

    $where = " AND `is_wining` = 1";

    $where2 = getCityFilter('store.`cityid`');

    if ($adminCity) {
        $where2 .= getWrongCityFilter('store.`cityid`', $adminCity);
    }

    $sidArr  = array();
    $userSql = $dsql->SetQuery("SELECT `store`.id  FROM `#@__business_list` store WHERE 1=1" . $where2);
    $results = $dsql->dsqlOper($userSql, "results");
    foreach ($results as $key => $value) {
        $sidArr[$key] = $value['id'];
    }
    if (!empty($sidArr)) {
        $where3 = " AND `sid` in (" . join(",", $sidArr) . ")";
    } else {
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        die;
    }

    $proSql    = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__awardlegou_list` WHERE 1=1" . $where3);
    $proResult = $dsql->dsqlOper($proSql, "results");
    if ($proResult) {
        $proid = array();
        foreach ($proResult as $key => $pro) {
            array_push($proid, $pro['id']);
        }
        if (!empty($proid)) {
            $where .= " AND `proid` in (" . join(",", $proid) . ")";
        }
    }else{
        echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": 0, "totalCount": 0, "totalGray": 0, "totalAudit": 0, "totalRefuse": 0}}';
        die;
    }

    if ($sKeyword != "") {

        $where .= " AND (`ordernum` like '%$sKeyword%'";
        $huoniaoTag->assign('sKeyword', $sKeyword);
        $proSql    = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__awardlegou_list` WHERE `title` like '%$sKeyword%'" . $where3);
        $proResult = $dsql->dsqlOper($proSql, "results");
        if ($proResult) {
            $proid = array();
            foreach ($proResult as $key => $pro) {
                array_push($proid, $pro['id']);
            }
            if (!empty($proid)) {
                $where .= " OR `proid` in (" . join(",", $proid) . ")";
            }
        }

        $userSql    = $dsql->SetQuery("SELECT `id`, `username` FROM `#@__member` WHERE `username` like '%$sKeyword%'");
        $userResult = $dsql->dsqlOper($userSql, "results");
        if ($userResult) {
            $userid = array();
            foreach ($userResult as $key => $user) {
                array_push($userid, $user['id']);
            }
            if (!empty($userid)) {
                $where .= " OR `userid` in (" . join(",", $userid) . "))";
            }
        } else {
            $where .= " ) ";
        }

    }
    if ($start != "") {
        $where .= " AND `orderdate` >= " . GetMkTime($start . " 00:00:00");
    }

    if ($end != "") {
        $where .= " AND `orderdate` <= " . GetMkTime($end . " 23:59:59");
    }

    $archives = $dsql->SetQuery("SELECT `id` FROM `#@__" . $action . "` WHERE 1 = 1");

    //总条数
    $totalCount = $dsql->dsqlOper($archives . $where, "totalCount");
    //总分页数
    $totalPage = ceil($totalCount / $pagestep);
    //未付款
    $state0 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 0", "totalCount");
    //未使用,已付款
    $state1 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 1", "totalCount");
    //已过期
    $state2 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 2", "totalCount");
    //成功
    $state3 = $dsql->dsqlOper($archives . "  AND `orderstate` = 3", "totalCount");
    //已退款
    $state4 = $dsql->dsqlOper($archives . $where . " AND `ret-state` = 1", "totalCount");
    //待发货
    $state5 = $dsql->dsqlOper($archives . "  AND `pinstate` = 1  AND `exp-date` = 0 AND `is_wining` = 1", "totalCount");
    //已发货
    $state6 = $dsql->dsqlOper($archives . "  AND `pinstate` = 1  AND `orderstate` = 6 AND `exp-date` != 0 AND `is_wining` = 1", "totalCount");
    //交易关闭
    $state7 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 7", "totalCount");

    /*申请退款*/
    $state8 = $dsql->dsqlOper($archives . $where . " AND  `ret-state` = 1", "totalCount");

    /*待付运费*/
    $state9 = $dsql->dsqlOper($archives . $where . " AND `orderstate` = 9", "totalCount");

    if ($state != "") {


        if ($state != "" && $state != 4 && $state != 5 && $state != 6 && $state != 8) {
            $where .= " AND `orderstate` = " . $state;
        }

        //退款
        if ($state == 4) {
            $where .= " AND `ret-state` = 1";
        }

        if ($state == 3) {
            $where .= " AND `orderstate` = 3";
        }
        //已发货
        if ($state == 6) {
            $where .= " AND `pinstate` = 1  AND `orderstate` = 6 AND `exp-date` != 0 AND `is_wining` = 1";
        }

        if ($state == 5) {
            $where .= " AND `pinstate` = 1  AND `exp-date` = 0 AND `is_wining` = 1";
        }

        if($state == 8){
            $where .= " AND `ret-state` = 1";
        }

        if($state == 9){
            $where .= " AND `orderstate` = 9";
        }

        if ($state == 0) {
            $totalPage = ceil($state0 / $pagestep);
        } elseif ($state == 1) {
            $totalPage = ceil($state1 / $pagestep);
        } elseif ($state == 2) {
            $totalPage = ceil($state2 / $pagestep);
        } elseif ($state == 3) {
            $totalPage = ceil($state3 / $pagestep);
        } elseif ($state == 4) {
            $totalPage = ceil($state4 / $pagestep);
        }elseif ($state == 5) {
               $totalPage = ceil($state5/ $pagestep);
        } elseif ($state == 6) {
            $totalPage = ceil($state6 / $pagestep);
        } elseif ($state == 7) {
            $totalPage = ceil($state7 / $pagestep);
        }elseif ($state == 8) {
            $totalPage = ceil($state8 / $pagestep);
        }elseif ($state == 9) {
            $totalPage = ceil($state9 / $pagestep);
        }
    }

//    $where      .= " AND `pintype` = 1 order by `id` desc";
    $where      .= " order by `id` desc";
    $totalPrice = 0;

    //计算总价
    $sql = $dsql->SetQuery("SELECT SUM(`amount` * `procount`) as price FROM `#@__" . $action . "` WHERE 1 = 1" . $where);
    $ret = $dsql->dsqlOper($sql, "results");
    if ($ret) {
        $totalPrice = (float)$ret[0]['price'];
    }

    $totalPrice = sprintf("%.2f", $totalPrice);


    $atpage = $pagestep * ($page - 1);
    if ($do != "export") {
        $where .= " LIMIT $atpage, $pagestep";
        # code...
    }
    $archives = $dsql->SetQuery("SELECT `id`, `ordernum`, `userid`, `proid`, `amount`,`point`, `procount`,`pinid`,`orderstate`, `ret-state`, `exp-date`, `usercontact`, `orderdate`, `paytype`, `paydate`,`refrundtype`,`is_paytuikuanlogtic`,`pinstate`,`exp-date`,`is_wining`,`ret-state`,`ret-expnumber`,`ret-expcompany` FROM `#@__" . $action . "` WHERE 1 = 1" . $where);
//     echo $archives;die;
    $results = $dsql->dsqlOper($archives, "results");

    $list = array();

    if (count($results) > 0) {
        foreach ($results as $key => $value) {
            $list[$key]["id"]       = $value["id"];
            $list[$key]["ordernum"] = $value["ordernum"];
            if( $value['pintype'] ==0){
                $pnumbersql = $dsql->SetQuery("SELECT `oid` FROM `#@__awardlegou_pin` WHERE  `id` = '".$value['pinid']."'");
                $pnumberres = $dsql->dsqlOper($pnumbersql,"results");
                if($pnumberres){
                    $list[$key]['ordernum']   = $pnumberres[0]['oid'];
                }
            }
            $list[$key]["userid"]   = $value["userid"];
            $list[$key]["paydate"]  = $value["paydate"];

            $list[$key]["retExpnumber"]  = $value["ret-expnumber"];
            $list[$key]["retExpcompany"]  = $value["ret-expcompany"];
            $list[$key]["pinstate"]  = $value["pinstate"];
            $list[$key]["exp-date"]  = $value["exp-date"];
            $list[$key]["is_wining"] = $value["is_wining"];

            $list[$key]["is_paytuikuanlogtic"]  = $value["is_paytuikuanlogtic"];

            //用户名
            $nickname = $name = $phone = '';
            $userSql  = $dsql->SetQuery("SELECT `nickname`, `realname`, `phone` FROM `#@__member` WHERE `id` = " . $value["userid"]);
            $username = $dsql->dsqlOper($userSql, "results");
            if (count($username) > 0) {
                $nickname = $username[0]['nickname'];
                $name     = $username[0]['realname'];
                $phone    = $username[0]['phone'];
            }
            $list[$key]["nickname"] = $nickname;
            $list[$key]["name"]     = $name;
            $list[$key]["phone"]    = $phone;

            $list[$key]["proid"] = $value["proid"];

            //乐购商品
            $proSql  = $dsql->SetQuery("SELECT `id`, `title` FROM `#@__awardlegou_list` WHERE `id` = " . $value["proid"]);
            $proname = $dsql->dsqlOper($proSql, "results");
            if (count($proname) > 0) {
                $list[$key]["proname"] = $proname[0]['title'];
            } else {
                $list[$key]["proname"] = "未知";
            }

            $param                = array(
                "service"  => "awardlegou",
                "template" => "detail",
                "id"       => $proname[0]['id']
            );
            $list[$key]['prourl'] = getUrlPath($param);


            global  $cfg_pointRatio;
            //计算订单价格
            $list[$key]["orderprice"]  = sprintf("%.2f", $value['amount']) - ($value['point']!=0 ? $value['point']/$cfg_pointRatio : 0);
            $list[$key]["point"]       =  $value['point'];
            $list[$key]["orderstate"]  = $value["orderstate"];
            $list[$key]["retState"]    = $value["ret-state"];
            $list[$key]["expDate"]     = $value["exp-date"];
            $list[$key]["usercontact"] = $value["usercontact"];
            $list[$key]["orderdate"]   = date('Y-m-d H:i:s', $value["orderdate"]);

            //主表信息
            $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '" . $value["paytype"] . "'");
            $ret = $dsql->dsqlOper($sql, "results");
            if (!empty($ret)) {
                $list[$key]["paytype"] = $ret[0]['pay_name'];
            } else {
                $list[$key]["paytype"] = strpos($value["paytype"],'money')!=='false' ? '余额支付' : $value["paytype"];
            }

            /*中奖会员信息*/

            $zjusersql = $dsql->SetQuery("SELECT m.`username`,m.`nickname` FROM `#@__awardlegou_order` o LEFT  JOIN `#@__member` m ON o.`userid` = m.`id` WHERE o.`pinid` = '".$value["id"]."' AND `is_wining` = 1");

            $zjuserres = $dsql->dsqlOper($zjusersql,"results");

            $zjusername = '';
            if($zjuserres ){
                $zjusername = $zjuserres[0]['username'] ? $zjuserres[0]['username'] : $zjuserres[0]['nickname'] ;
            }
            $list[$key]["zjusername"] = $zjusername;
        }

        if (count($list) > 0) {
            if ($do != "export") {
                echo '{"state": 100, "info": ' . json_encode("获取成功") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . ', "state2": ' . $state2 . ', "state3": ' . $state3 . ', "state5": ' . $state5 . ', "state6": ' . $state6 . ', "state7": ' . $state7 . ', "state8": ' . $state8 . ', "state9": ' . $state9 . '}, "totalPrice": ' . $totalPrice . ', "tuanOrderList": ' . json_encode($list) . '}';
            }
        } else {
            if ($do != "export") {
                echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . ', "state2": ' . $state2 . ', "state3": ' . $state3 . ', "state5": ' . $state5 . ', "state6": ' . $state6 . ', "state7": ' . $state7 . ', "state8": ' . $state8 . ', "state9": ' . $state9 . '}, "totalPrice": ' . $totalPrice . '}';
            }
        }

    } else {
        if ($do != "export") {
            echo '{"state": 101, "info": ' . json_encode("暂无相关信息") . ', "pageInfo": {"totalPage": ' . $totalPage . ', "totalCount": ' . $totalCount . ', "state0": ' . $state0 . ', "state1": ' . $state1 . ', "state2": ' . $state2 . ', "state3": ' . $state3 . ', "state5": ' . $state5 . ', "state6": ' . $state6 . ', "state7": ' . $state7 . ', "state8": ' . $state8 . ', "state9": ' . $state9 . '}, "totalPrice": ' . $totalPrice . '}';
        }
    }


    if ($do == "export") {

        $tit = array();
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单号'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '用户名'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '团购活动'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '订单金额'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '下单时间'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '支付方式'));
        array_push($tit, iconv('utf-8', 'gb2312//IGNORE', '状态'));

        $folder   = HUONIAOROOT . "/uploads/siteConfig/file/";
        $filePath = $folder . "会员数据.csv";
        MkdirAll($folder);
        $file = fopen($filePath, "w");

        //表头
        fputcsv($file, $tit);

        foreach ($list as $data) {
            switch ($data['orderstate']) {
                case '0':
                    $state = '未付款';
                    break;
                case '1':
                    $state = '已付款';
                    break;
                case '2':
                    $state = '已过期';
                    break;
                case '3':
                    $state = '交易成功';
                    break;
                case '4':
                    $state = '退款中';
                    break;
                case '6':
                    if ($data['retState'] == 1) {
                        $state = '申请退款';
                        //未申请退款
                    } else {
                        $state = "已发货";
                    }
                    break;
                case '7':
                    $state = '退款成功';
                    break;
            }

            $arr = array();
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['ordernum']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', '昵称:' . $data['nickname'] . ",姓名:" . $data['name'] . "手机号:" . $data['phone']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['proname']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['orderprice']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['orderdate']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $data['paytype']));
            array_push($arr, iconv('utf-8', 'gb2312//IGNORE', $state));

            //写入文件
            fputcsv($file, $arr);
        }

        header("Content-type:application/octet-stream");
        header("Content-Disposition:attachment;filename = 团购订单.csv");
        header("Accept-ranges:bytes");
        header("Accept-length:" . filesize($filePath));
        readfile($filePath);

    }
    die;

//删除
} elseif ($dopost == "del") {
    if (!testPurview("delTuanOrder")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if ($id == "") die;
    $each  = explode(",", $id);
    $error = array();
    foreach ($each as $val) {
        $archives = $dsql->SetQuery("SELECT `id`, `ordernum`, `userid`, `proid`, `procount`, `orderprice`, `orderstate`, `paydate` FROM `#@__" . $action . "` WHERE `id` = " . $val);
        $results  = $dsql->dsqlOper($archives, "results");

        $orderid    = $results[0]['id'];
        $ordernum   = $results[0]['ordernum'];
        $orderprice = $results[0]['orderprice'];
        $userid     = $results[0]["userid"];
        $proid      = $results[0]["proid"];
        $procount   = $results[0]["procount"];
        $orderstate = $results[0]["orderstate"];
        $paydate    = $results[0]['paydate'];

        //退款
        if ($orderstate != 0 && $orderstate != 3 && $orderstate != 7 && ($orderstate == 2 && $paydate != 0)) {
            //团购商品
            $proSql  = $dsql->SetQuery("SELECT `tuantype`, `buynum` FROM `#@__tuanlist` WHERE `id` = " . $proid);
            $proname = $dsql->dsqlOper($proSql, "results");

            $tuantype = $proname[0]['tuantype'];
            $buynum   = $proname[0]['buynum'];

            //会员信息
            $userSql    = $dsql->SetQuery("SELECT `money` FROM `#@__member` WHERE `id` = " . $userid);
            $userResult = $dsql->dsqlOper($userSql, "results");
            global  $userLogin;
            if ($userResult) {

                //会员帐户充值
                $price     = $userResult[0]['money'] + $orderprice * $procount;
                $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = " . $price . " WHERE `id` = " . $userid);
                $dsql->dsqlOper($userOpera, "update");
                $user  = $userLogin->getMemberInfo($userid);
                $usermoney = $user['money'];
                //记录退款日志
                $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`) VALUES ('$userid', '1', '$orderprice', '团购退款：$ordernum', " . GetMkTime(time()) . ",'tuan','tuikuan','$usermoney')");
                $dsql->dsqlOper($logs, "update");

            }

            //更新团购已购买数量
            if ($buynum < 2) {
                $proSql = $dsql->SetQuery("UPDATE `#@__tuanlist` SET `buynum` = 0 WHERE `id` = " . $proid);
                $dsql->dsqlOper($proSql, "update");
            } else {
                $proSql = $dsql->SetQuery("UPDATE `#@__tuanlist` SET `buynum` = `buynum` - " . $procount . " WHERE `id` = " . $proid);
                $dsql->dsqlOper($proSql, "update");
            }

            //删除团购券
            if ($tuantype == 0) {
                $archives = $dsql->SetQuery("DELETE FROM `#@__tuanquan` WHERE `orderid` = " . $orderid);
                $results  = $dsql->dsqlOper($archives, "update");
            }
        }

        $archives = $dsql->SetQuery("DELETE FROM `#@__" . $action . "` WHERE `id` = " . $val);
        $results  = $dsql->dsqlOper($archives, "update");
        if ($results != "ok") {
            $error[] = $val;
        }
    }
    if (!empty($error)) {
        echo '{"state": 200, "info": ' . json_encode($error) . '}';
    } else {
        adminLog("删除团购订单", $id);
        echo '{"state": 100, "info": ' . json_encode("删除成功！") . '}';
    }
    die;

//付款
} elseif ($dopost == "payment") {
    if (!testPurview("refundTuanOrder")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if (!empty($id)) {
        $archives = $dsql->SetQuery("SELECT `ordernum`, `userid`, `proid`, `procount`, `orderprice`, `orderstate` FROM `#@__" . $action . "` WHERE `id` = " . $id);
        $results  = $dsql->dsqlOper($archives, "results");

        if ($results) {
            $ordernum   = $results[0]['ordernum'];
            $orderprice = $results[0]['orderprice'];
            $userid     = $results[0]["userid"];
            $proid      = $results[0]["proid"];
            $procount   = $results[0]["procount"];
            $orderstate = $results[0]["orderstate"];

            if ($orderstate == 0) {
                //团购商品
                $proSql  = $dsql->SetQuery("SELECT l.`title`, l.`enddate`, l.`maxnum`, l.`limit`, l.`defbuynum`, l.`buynum`, l.`tuantype`, l.`freight`, l.`freeshi`, l.`expireddate`, s.`uid` FROM `#@__tuanlist` l LEFT JOIN `#@__tuan_store` s ON s.`id` = l.`sid` WHERE l.`id` = " . $proid);
                $proname = $dsql->dsqlOper($proSql, "results");

                if (!$proname) {
                    echo '{"state": 200, "info": ' . json_encode("商品不存在，付款失败！") . '}';
                    die;
                }

                $title       = $proname[0]['title'];
                $uid         = $proname[0]['uid'];
                $enddate     = $proname[0]['enddate'];
                $maxnum      = $proname[0]['maxnum'];
                $limit       = $proname[0]['limit'];
                $defbuynum   = $proname[0]['defbuynum'];
                $buynum      = $proname[0]['buynum'];
                $expireddate = $proname[0]['expireddate'];
                $totalBuy    = $defbuynum + $buynum + $procount;

                if ($limit != 0 && $procount > $limit) {
                    echo '{"state": 200, "info": ' . json_encode("购买数量超过商家限制，付款失败！") . '}';
                    die;
                }

                if ($maxnum != 0 && $maxnum < $totalBuy) {
                    echo '{"state": 200, "info": ' . json_encode("库存不足，付款失败！") . '}';
                    die;
                }

                if ($proname[0]['tuantype'] == 2) {
                    if ($results[0]["procount"] < $proname[0]["freeshi"]) {
                        $orderprice = $orderprice + $proname[0]['freight'];
                    }
                }

                if (GetMkTime(time()) > $enddate) {
                    echo '{"state": 200, "info": ' . json_encode("此团购商品已经过期，无法付款，请确认后操作！") . '}';
                    die;
                } else {

                    //会员信息
                    $userSql    = $dsql->SetQuery("SELECT `username`, `money` FROM `#@__member` WHERE `id` = " . $userid);
                    $userResult = $dsql->dsqlOper($userSql, "results");

                    if ($userResult) {

                        if ($userResult[0]['money'] > $orderprice) {
                            //扣除会员帐户
                            $price     = $userResult[0]['money'] - $orderprice;
                            $userOpera = $dsql->SetQuery("UPDATE `#@__member` SET `money` = " . $price . " WHERE `id` = " . $userid);
                            $dsql->dsqlOper($userOpera, "update");

                            //记录消费日志
                            $paramUser = array(
                                "service"  => "member",
                                "type"     => "user",
                                "template" => "orderdetail",
                                "action"   => "tuan",
                                "id"       => $id
                            );
                            $urlParam  = serialize($paramUser);

                            $sql = $dsql->SetQuery("SELECT `id` FROM `#@__pay_log` WHERE `body` = '$ordernum' AND `state` = 1");
                            $ret = $dsql->dsqlOper($sql, "results");
                            $pid = '';
                            if ($ret) {
                                $pid = $ret[0]['id'];
                            }

                            $sql = $dsql->SetQuery("SELECT `company`, `nickname` FROM `#@__member` WHERE `id` = $uid");
                            $ret = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                $shopname = $ret[0]['company'] ? $ret[0]['company'] : $ret[0]['nickname'];
                            }
                            global  $userLogin;
                            $user  = $userLogin->getMemberInfo($userid);
                            $usermoney = $user['money'];
                            $title = '团购消费-' . $shopname;
                            $logs  = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`pid`,`urlParam`,`title`,`ordernum`,`balance`) VALUES (" . $userid . ", " . $orderprice . ", 0, '团购消费：" . $ordernum . "', " . GetMkTime(time()) . ",'tuan','xiaofei','$pid','$urlParam','$title','$ordernum','$usermoney')");
                            $dsql->dsqlOper($logs, "update");

                            //更新团购已购买数量
                            $proSql = $dsql->SetQuery("UPDATE `#@__tuanlist` SET `buynum` = `buynum` + $procount WHERE `id` = " . $proid);
                            $dsql->dsqlOper($proSql, "update");

                            //更新订单状态
                            $orderOpera = $dsql->SetQuery("UPDATE `#@__" . $action . "` SET `orderstate` = 1, `paydate` = " . GetMkTime(time()) . " WHERE `id` = " . $id);
                            $dsql->dsqlOper($orderOpera, "update");


                            //生成团购券
                            if ($proname[0]['tuantype'] == 0) {
                                $sqlQuan  = array();
                                $carddate = GetMkTime(time());
                                for ($i = 0; $i < $procount; $i++) {
                                    $cardnum     = genSecret(12, 1);
                                    $sqlQuan[$i] = "('$id', '$cardnum', '$carddate', 0, '$expireddate')";
                                }

                                $sql = $dsql->SetQuery("INSERT INTO `#@__tuanquan` (`orderid`, `cardnum`, `carddate`, `usedate`, `expireddate`) VALUES " . join(",", $sqlQuan));
                                $dsql->dsqlOper($sql, "update");
                            }


                            //支付成功，会员消息通知

                            $paramBusi = array(
                                "service"  => "member",
                                "template" => "orderdetail",
                                "action"   => "tuan",
                                "id"       => $id
                            );

                            //自定义配置
                            $config = array(
                                "username" => $userResult[0]['username'],
                                "order"    => $ordernum,
                                "amount"   => $orderprice,
                                "fields"   => array(
                                    'keyword1' => '商品信息',
                                    'keyword2' => '订单金额',
                                    'keyword3' => '订单状态'
                                )
                            );

                            updateMemberNotice($userid, "会员-订单支付成功", $paramUser, $config, '', '', 0, 1);


                            //获取会员名
                            $username = "";
                            $sql      = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
                            $ret      = $dsql->dsqlOper($sql, "results");
                            if ($ret) {
                                $username = $ret[0]['username'];
                            }

                            //自定义配置
                            $config = array(
                                "username" => $username,
                                "title"    => $title,
                                "order"    => $ordernum,
                                "amount"   => $amount,
                                "fields"   => array(
                                    'keyword1' => '订单编号',
                                    'keyword2' => '商品名称',
                                    'keyword3' => '订单金额',
                                    'keyword4' => '付款状态',
                                    'keyword5' => '付款时间'
                                )
                            );

                            updateMemberNotice($uid, "会员-商家新订单通知", $paramBusi, $config, '', '', 0, 1);


                            adminLog("为会员手动支付团购订单", $ordernum);

                            echo '{"state": 100, "info": ' . json_encode("付款成功！") . '}';
                            die;

                        } else {
                            echo '{"state": 200, "info": ' . json_encode("会员帐户余额不足，请先进行充值！") . '}';
                            die;
                        }

                    } else {
                        echo '{"state": 200, "info": ' . json_encode("会员不存在，无法继续支付！") . '}';
                        die;
                    }

                }
            } else {
                echo '{"state": 200, "info": ' . json_encode("此订单不是未付款状态，请确认后操作！") . '}';
                die;
            }
        } else {
            echo '{"state": 200, "info": ' . json_encode("订单不存在，请刷新页面！") . '}';
            die;
        }

    } else {
        echo '{"state": 200, "info": ' . json_encode("订单ID为空，操作失败！") . '}';
        die;
    }

//退款
} elseif ($dopost == "refund") {
    if (!testPurview("refundTuanOrder")) {
        die('{"state": 200, "info": ' . json_encode('对不起，您无权使用此功能！') . '}');
    }
    if (!empty($id)) {
        $archives = $dsql->SetQuery("SELECT o.`id`, o.`ordernum`, o.`userid`, o.`balance`, o.`point`, o.`payprice`,o.`paytype`,o.`refrundno`,o.`rewardtype`,o.`hongbaomoney`,o.`reward`,o.`orderstate`,l.`title`,s.`title` shopname,s.`uid` FROM `#@__awardlegou_order` o LEFT JOIN `#@__awardlegou_list` l ON o.`proid` = l.`id` LEFT JOIN `#@__business_list` s ON l.`sid` = s.`id` WHERE o.`id` = " . $id);

        $results  = $dsql->dsqlOper($archives, "results");

        if ($results) {

            $orderid      = $results[0]['id'];         //需要退回的订单ID
            $ordernum     = $results[0]['ordernum'];   //需要退回的订单号
            $userid       = $results[0]['userid'];     //需要退回的会员ID
            $uid          = $results[0]['uid'];        //商家会员ID
            $balance      = $results[0]['balance'];    //余额支付
            $point        = $results[0]['point'];      //积分支付
            $payprice     = $results[0]['payprice'];   //实际支付
            $shopname     = $results[0]['shopname'];   //运费
            $goodtitle    = $results[0]['title'];   //运费
            $paytype      = $results[0]["paytype"];
            $refrundno    = $results[0]["refrundno"];
            $rewardtype   = $results[0]["rewardtype"];
            $orderstate   = $results[0]["orderstate"];
            $hongbaomoney = $results[0]["hongbaomoney"];
            $reward       = $results[0]["reward"];
            global $cfg_pointRatio;
            $orderTotalAmount = $balance + $payprice + $point / $cfg_pointRatio;
            $freezemoney      = $balance + $payprice;
            $totalPoint       = 0;
            if ($orderstate ==7){
                die('{"state": 200, "info": ' . json_encode('对不起，订单状态异常！') . '}');
            }
            //混合支付退款
            $refrunddate = GetMkTime(time());

            global $cfg_pointRatio;
            $peerpay = 0;
            $arr = adminRefund('awardlegou',$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id);    //后台退款
            $r =$arr[0]['r'];
            $refrunddate = $arr[0]['refrunddate'];
            $refrundno   = $arr[0]['refrundno'];
            $refrundcode = $arr[0]['refrundcode'];
            if ($r) {

                $pointinfo   = '有奖乐购订单退回：$ordernum';
                $balanceinfo = '有奖乐购订单退款：$ordernum';
                global $cfg_pointName;
                global $userLogin;
                if ($point != 0) {
                    $pointinfo = '有奖乐购退回：('.$cfg_pointName.'退款:' . $point . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $shopname . '-' . $goodtitle . '-' . $ordernum;
                    $archives  = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$userid'");
                    $dsql->dsqlOper($archives, "update");
                    $userinfo = $userLogin->getMemberInfo($userid);
                    $userpoint = $userinfo['point'];
//                    $pointuser   = (int)($userpoint+$point);
                    //保存操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$userid', '1', '$point', '$pointinfo', " . GetMkTime(time()) . ",'tuihui','$userpoint')");
                    $dsql->dsqlOper($archives, "update");
                }
                if ($balance != '0') {
                    $pay_name = '';
                    $pay_namearr = array();
                    $paramUser = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "action"   => "awardlegou",
                        "id"       => $id
                    );
                    $urlParam = serialize($paramUser);

                    $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$paytype."'");
                    $ret = $dsql->dsqlOper($sql, "results");
                    if(!empty($ret)){
                        $pay_name    = $ret[0]['pay_name'];
                    }else{
                        $pay_name    = $ret[0]["paytype"];
                    }

                    if($pay_name){
                        array_push($pay_namearr,$pay_name);
                    }

                    if($balance != ''){
                        array_push($pay_namearr,"余额");
                    }

                    if($point != ''){
                        array_push($pay_namearr,"积分");
                    }

                    if($pay_namearr){
                        $pay_name = join(',',$pay_namearr);
                    }

                    $tuikuan= array(
                        'paytype'               => $pay_name,
                        'truemoneysy'           => $payprice,
                        'money_amount'          => $balance,
                        'point'                 => $totalPoint,
                        'refrunddate'           => $refrunddate,
                        'refrundno'             => $refrundno
                    );
                    global  $userLogin;
                    $tuikuanparam = serialize($tuikuan);
                    $balanceinfo = '有奖乐购订单退款：('.$cfg_pointName.'退款:' . $point . ',现金退款：' . $payprice . ',余额退款：' . $balance . ')：' . $shopname . '-' . $goodtitle . '-' . $ordernum;
                    $userOpera   = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + " . $balance . " WHERE `id` = " . $userid);
                    $dsql->dsqlOper($userOpera, "update");
                    $user  = $userLogin->getMemberInfo($userid);
                    $usermoney = $user['money'];
//                    $money  = sprintf('%.2f',($usermoney+$balance));
                    //记录退款日志
                    $logs = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `amount`, `type`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES (" . $userid . ", " . $balance . ", 1, '$balanceinfo', " . GetMkTime(time()) . ",'awardlegou','tuikuan','$urlParam','$ordernum','$tuikuanparam','有奖乐购消费','$usermoney')");
                    $dsql->dsqlOper($logs, "update");

                }
                /*商家扣除冻结金额*/
                $usersql = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - $freezemoney WHERE `id` = " . $userid);
                $dsql->dsqlOper($usersql, "update");

                $now        = GetMkTime(time());
                $orderOpera = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `orderstate` = 7, `ret-ok-date` = " . GetMkTime(time()) . ",`refrunddate` = '" . $refrunddate . "',`refrundamount` = '$orderTotalAmount', `refrundno` = '$refrundno' WHERE `id` = " . $id);
                $dsql->dsqlOper($orderOpera, "update");

                //获取会员名
                $username = "";
                $sql      = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = $userid");
                $ret      = $dsql->dsqlOper($sql, "results");
                if ($ret) {
                    $username = $ret[0]['nickname'] ? $ret[0]['nickname'] : $ret[0]['username'];
                }

                $param     = array(
                    "service"  => "member",
                    "template" => "orderdetail",
                    "action"   => "awardlegou",
                    "id"       => $orderid
                );
                $rewardtype   = $results[0]["rewardtype"];
                $hongbaomoney = $results[0]["hongbaomoney"];
                $reward       = $results[0]["reward"] !='' ? unserialize($results[0]["reward"]) : array();
                $rewardtitle  = $reward ? $reward['title'] : '';

                if($rewardtype == 0){
                    $note = '很遗憾您未购得商品'.$goodtitle.'，费用已全额退回到您的账户，同时您已获得随机奖品'.$rewardtitle.'，已发放至您的订单，点击进行查看~';
                }else{
                    $note = '很遗憾您未购得商品'.$goodtitle.'，费用已全额退回到您的账户，同时您已获得随机红包'.$hongbaomoney.'，已发放至您的账户，点击领取~';

                }
                //自定义配置
                $config = array(
                    "username" => $username,
                    "order"    => $ordernum,
                    "amount"   => $orderTotalAmount,
                    "note"     => $note,
                    "fields"   => array(
                        'reason' => '退款原因',
                        'refund' => '退款金额'
                    )
                );

                updateMemberNotice($userid, "有奖乐购-失败退款通知", $param, $config, '', '', 0, 1);

                /*商家通知*/
                $paramBusi = array(
                    "service"  => "member",
                    "template" => "orderdetail",
                    "action"   => "awardlegou",
                    "id"       => $orderid
                );

                $config = array(
                    "username" => $username,
                    "order" => $ordernum,
                    "amount" => $orderTotalAmount,
                    "info" => "活动完成该用户未获得购买权",
                    "fields" => array(
                        'keyword1' => '退款原因',
                        'keyword2' => '退款金额'
                    )
                );

                updateMemberNotice($uid, "会员-订单退款通知", $paramBusi, $config,'','',0,1);

                global $siteCityInfo;
                $cityName = $siteCityInfo['name'];
                $cityid   = $siteCityInfo['cityid'];

                $usernamesql = $dsql->SetQuery("SELECT `username`,`nickname` FROM `#@__member` WHERE `id` = '".$userid."'");
                $usernameres = $dsql->dsqlOper($usernamesql,'results');

                $username = '';
                if($usernameres){
                    $username = $usernameres[0]['username'] == '' ?  $usernameres[0]['nickname'] : $usernameres[0]['nickname'] ;
                }
                /*后台管理员通知*/
//                getModuleTitle()
//                $param = array(
//                    'type'     => '', //区分佣金 给分站还是平台发送 1分站 2平台
//                    'cityid' => $cityid,
//                    'notify' => '管理员消息通知',
//                    'fields' =>array(
//                        'contentrn'  => $cityName.'分站——awardlegou模块——用户:'.$username.' 未获得购买权限商品全额退款',
//                        'date' => date("Y-m-d H:i:s", time()),
//                    )
//                );
//                updateAdminNotice("awardlegou", "detail",$param);
                echo '{"state": 100, "info": ' . json_encode("操作成功，款项已退还至会员帐户！") . '}';
                die;

            } else {
                echo '{"state": 200, "info": ' . json_encode($refrundcode) . '}';
                die;
            }
        } else {
            echo '{"state": 200, "info": ' . json_encode("订单不存在，请刷新页面！") . '}';
            die;
        }

    } else {
        echo '{"state": 200, "info": ' . json_encode("订单ID为空，操作失败！") . '}';
        die;
    }
}elseif($dopost == "revoke"){
//    if(!testPurview("shopOrderEdit")){
//        die('{"state": 200, "info": '.json_encode('对不起，您无权使用此功能！').'}');
//    }
    if($id == "") die;

    //判断是否已经发货
    /*$expdate = 0;
    $sql = $dsql->SetQuery("SELECT `exp-date` FROM `#@__awardlegou_order` WHERE `id` = " . $id);
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        $expdate = $ret[0]['exp-date'];
    }
    if($expdate){*/
        $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `ret-state` = 0,`ret-type` ='',`ret-note` ='',`ret-date` ='',`ret-pics` ='' WHERE `id` = " . $id);
//    }else{
//        $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `orderstate` = 1, `ret-state` = 0 WHERE `id` = " . $id);
//    }
    $ret = $dsql->dsqlOper($sql, "update");

    if($ret != 'ok'){
        echo '{"state": 200, "info": '.json_encode($ret).'}';
    }else{
        adminLog("撤销有奖乐购订单退款申请", $id);
        echo '{"state": 100, "info": '.json_encode("撤销成功！").'}';
    }
    die;


//付款
    /**
     * 付款业务逻辑
     * 1. 验证订单状态，只有状态为未付款时才可以往下进行
     * 2. 验证订单中的商品：1. 订单中含有不存在或已经下架的商品
     *                    2. 订单中的商品库存不足
     * 3. 会员账户余额，不足需要先到会员管理页面充值
     * 4. 上面三种都通过之后就可以进行支付成功后的操作：
     * 5. 更新订单的支付方式
     * 6. 更新订单中商品的已售数量、库存（包括不同规格的库存）
     * 7. 扣除会员账户余额并做相关记录
     * 8. 更新订单状态为已付款
     * 9. 后续操作（如：发送短信通知等）
     */
}elseif ($dopost == "agree"){

    if($id == "") die;

    $time = time();
    $sql = $dsql->SetQuery("UPDATE `#@__awardlegou_order` SET `orderstate` = 9,`tongyidate` = '$time' WHERE `id` = " . $id);
    $ret = $dsql->dsqlOper($sql, "update");

    if($ret != 'ok'){
        echo '{"state": 200, "info": '.json_encode($ret).'}';
    }else{
        adminLog("同意有奖乐购订单退款申请", $id);
        echo '{"state": 100, "info": '.json_encode("撤销成功！").'}';
    }
    die;


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
        'ui/bootstrap-datetimepicker.min.js',
        'ui/chosen.jquery.min.js',
        'admin/awardlegou/awardlegouOrderList.js'
    );
    $huoniaoTag->assign('notice', $notice);
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));
    $sql = $dsql->SetQuery("SELECT SUM(`commission`) as allcommission  FROM `#@__member_money` WHERE cityid =  $adminCity AND ordertype = tuan" . $wheretime);
    $huoniaoTag->assign('cityList', json_encode($adminCityArr));
    $huoniaoTag->compile_dir = HUONIAOROOT . "/templates_c/admin/awardlegou";  //设置编译目录
    $huoniaoTag->display($templates);
} else {
    echo $templates . "模板文件未找到！";
}
