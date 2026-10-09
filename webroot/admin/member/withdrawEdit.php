<?php
/**
 * 查看修改提现详细信息
 *
 * @version   $Id: withdrawEdit.php 2013-12-11 上午10:53:46 $
 * @package   HuoNiao.Member
 * @copyright Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link      https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', "..");
require_once dirname(__FILE__)."/../inc/config.inc.php";
checkPurview("withdraw");
$dsql = new dsql($dbo);
$tpl = dirname(__FILE__)."/../templates/member";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
$templates = "withdrawEdit.html";
global  $cfg_withdrawFee;
$action     = "member_withdraw";
$pagetitle  = "提现详细信息";
$dopost     = $dopost ? $dopost : "edit";

if($dopost != "") {
    //对字符进行处理
    $note   = cn_substrR($note, 200);
    $time   = GetMkTime(time());
}

if($dopost == "edit") {

    if($submit == "提交") {

        //表单二次验证
        if ($auditstate == "") {
            if(trim($state) == '') {
                echo '{"state": 200, "info": "请选择更新到的状态"}';
                exit();
            }


            if(trim($note) == '') {
                echo '{"state": 200, "info": "请输入提现结果"}';
                exit();
            }

        }

        $note  =trim($note);
        if($auditstate !='') {
            if ($auditstate ==1) {
                $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET  `state` = '0',`auditstate` = '$auditstate' WHERE `id` = ".$id);

            }else{

                if($action == "member_withdraw") {
                    $sql = $dsql->SetQuery("SELECT `uid`, `amount`, `type`,`usertype`,`point`  FROM `#@__".$action."` WHERE `id` = ".$id);
                }else{
                    $sql = $dsql->SetQuery("SELECT `uid`, `amount` FROM `#@__".$action."` WHERE `id` = ".$id);
                }
                $ret = $dsql->dsqlOper($sql, "results");
                if($ret) {
                    $uid    = $ret[0]['uid'];
                    $amount = $ret[0]['amount'];
                    $drawtype = $ret[0]['type'] ? $ret[0]['type'] : '';
                    $usertype = $ret[0]['usertype'] ? $ret[0]['usertype'] : '';
                    $point = $ret[0]['point'] ? $ret[0]['point'] : 0;
                }
                if ($drawtype == 0) {
                    //审核拒绝
                    $sql = $dsql->SetQuery("SELECT `uid`, `amount`,`point` FROM `#@__".$action."` WHERE `id` = ".$id);
                    $ret = $dsql->dsqlOper($sql, "results");
                    $amount = $ret[0]['amount'];
                    $point = $ret[0]['point'];
                    $uid    = $ret[0]['uid'];

                    $param = array(
                     "service"  => "member",
                     "type"     => "user",
                     "template" => "withdraw_log_detail",
                     "id"       => $id
                    );
                    //自定义配置
                    $config = array(
                     "username" => $username,
                     "amount" => $amount,
                     "date" => date("Y-m-d H:i:s", $time),
                     "info" => $note,
                     "fields" => array(
                      'keyword1' => '提现金额',
                      'keyword2' => '提现时间',
                      'keyword3' => '提现状态'
                     )
                    );

                    //增加交易记录

                    if ($usertype == 0) {
                        /*普通用户*/
                        global $userLogin;
                        $user      = $userLogin->getMemberInfo($uid);
                        $usermoney = $user['money'];
                        $money     = sprintf('%.2f', ($usermoney + $amount));
                        $title     = '提现退回';
                        $archives  = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`title`,`ordernum`,`balance`,`pid`) VALUES ('$uid', '1', '$amount', '$title', '$time','member','tixian','$title','$ordernum','$money','$id')");
                        $dsql->dsqlOper($archives, "update");

                        //更新账户余额
                        $archivess = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount', `freeze` = `freeze` - '$amount' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archivess, "update");

                        //积分退回
                        if($point>0){
                            $archivess = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$uid'");
                            $dsql->dsqlOper($archivess, "update");

                            $userpoint = (int)$dsql->getOne($dsql::SetQuery("select `point` from `#@__member` where `id`=".$uid));
                            $archives  = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '1', '$point', '$title', '$time','tixian','$userpoint')");
                            $dsql->dsqlOper($archives, "update");
                        }

                    } else {
                        /*骑手*/
                        $archivess = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = `money` + '$amount' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archivess, "update");

                        $selectsql = $dsql->SetQuery("SELECT `money` FROM  `#@__waimai_courier`  WHERE `id` = '$uid'");           //查询骑手余额
                        $courieMoney = $dsql->dsqlOper($selectsql,"results");
                        $courierMoney = $courieMoney[0]['money'];
                        $date = GetMkTime(time());
                        $info = '提现退回-'.$note;
                        //记录操作日志
                        $insertsql = $dsql->SetQuery("INSERT INTO  `#@__member_courier_money` (`userid`,`type`,`amount`,`info`,`date`,`balance`,`cattype`) VALUES ('$uid','1','$amount','$info','$date','$courierMoney','1')");
                        $dsql->dsqlOper($insertsql,"update");

                        //同步提现记录的状态
                        $sql = $dsql->SetQuery("UPDATE `#@__member_courier_money` SET `status` = 3 WHERE `wid` = {$id}");
                        $dsql->dsqlOper($sql, "update");

                        //初始化日志
                        include_once(HUONIAOROOT."/api/payment/log.php");
                        $_courierLog= new CLogFileHandler(HUONIAOROOT . '/log/courierMoney/'.date('Y-m-d').'.log', true);
                        $_courierLog->DEBUG('courierInsert:'.$insertsql);
                        $_courierLog->DEBUG('骑手提现撤回:'.$amount.'骑手账户剩余:'.$courierMoney);

                    }
                }elseif($drawtype == 1) {
                    $archives = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member`  WHERE `id` = '$uid'");
                    $res = $dsql->dsqlOper($archives, "results");
                    $cityid = $res[0]['mgroupid'];
                    $archives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$amount' WHERE `cid` = '$cityid'");
                    $dsql->dsqlOper($archives, "update");

                    //增加操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`,`substation`) VALUES ('$uid', '1', '$amount', '提现退回', '$time','$cityid','$amount','member','','1','tixian','','')");
                    $lastid   = $dsql->dsqlOper($archives, "lastid");
                    substationAmount($lastid, $cityid);

                    //积分退回
                    if($point>0){
                        $archivess = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archivess, "update");

                        $userpoint = (int)$dsql->getOne($dsql::SetQuery("select `point` from `#@__member` where `id`=".$uid));
                        $archives  = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '1', '$point', '提现退回', '$time','tixian','$userpoint')");
                        $dsql->dsqlOper($archives, "update");
                    }
                }
                
                updateMemberNotice($uid, "会员-提现申请审核失败", $param, $config);
                $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET  `state` = '$auditstate',`auditstate` = '$auditstate' ,`note` = '$note', `rdate` = '$time' WHERE `id` = ".$id);

            }


        }else{
            $archives = $dsql->SetQuery("UPDATE `#@__".$action."` SET `note` = '$note', `state` = '$state', `rdate` = '$time' WHERE `id` = ".$id);

        }

        //保存
        $results = $dsql->dsqlOper($archives, "update");

        if($results != "ok") {
            echo '{"state": 200, "info": "保存失败！"}';
            exit();
        }

        if($action == "member_withdraw") {
            $sql = $dsql->SetQuery("SELECT `uid`, `amount`, `type`,`usertype`,`point`  FROM `#@__".$action."` WHERE `id` = ".$id);
        }else{
            $sql = $dsql->SetQuery("SELECT `uid`, `amount` FROM `#@__".$action."` WHERE `id` = ".$id);
        }
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret) {
            $uid    = $ret[0]['uid'];
            $amount = $ret[0]['amount'];
            $drawtype = $ret[0]['type'] ? $ret[0]['type'] : '';
            $usertype = $ret[0]['usertype'] ? $ret[0]['usertype'] : '';
            $point = $ret[0]['point'] ? $ret[0]['point'] : 0;

            $param = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "withdraw_log_detail",
            "id"       => $id
            );

            //自定义配置
            $config = array(
            "username" => $username,
            "amount" => $amount,
            "date" => date("Y-m-d H:i:s", $time),
            "info" => $note,
            "fields" => array(
            'keyword1' => '提现金额',
            'keyword2' => '提现时间',
            'keyword3' => '提现状态'
            )
            );
            global  $userLogin;
            //提现成功，减少会员的冻结金额，并且增加明细日志
            if($state == 1) {
                if($drawtype == 0 && $usertype == 0) {
                    $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$amount' WHERE `id` = '$uid'");
                    $dsql->dsqlOper($archives, "update");
                }


                // 申请提现时已经增加过日志，这里不再重复记录
                // $user  = $userLogin->getMemberInfo($uid);
                // $usermoney = $user['money'];
                //
                // $money = sprintf('%.2f',($usermoney - $amount));


                // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`,`pid`) VALUES ('$uid', '0', '$amount', '提现', '$time','member','tixian','$money','$id')");
                //
                // $aid = $dsql->dsqlOper($archives, "lastid");
                //手动提现，记录手续费
                $orderDetail = $dsql->getArr($dsql::SetQuery("select `shouxuprice` 'proportion',`ordernum` from `#@__member_withdraw` where `id`={$id}"));
                $proportion = $orderDetail['proportion'];
                $ordernum = $orderDetail['ordernum'];
                //手动提现，可能没有订单号，如果之前没有生成订单号，直接生成一个
                if(empty($ordernum)){
                    $ordernum = create_ordernum();
                }
                //如果有手续费，既然已经提现成功，记录下来
                if(!empty($proportion)){
                    $sql = $dsql::SetQuery("select `cityid` from `#@__member` where `id`={$uid}");
                    $cityid = (int)$dsql->getOne($sql);
                    $time = time();
                    $info = '提现手续费，提现金额：' . $amount . '，备注：' . $note;
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`ordernum`) VALUES ('{$uid}', '1', '{$amount}', '$info', '$time','$cityid','0','siteConfig',$proportion,'1','tixian','{$ordernum}')");
                    $lastid = $dsql->dsqlOper($archives, "lastid");
                }

                //如果是骑手，同步提现记录的状态
                if ($usertype == 1) {
                    //同步提现记录的状态
                    $sql = $dsql->SetQuery("UPDATE `#@__member_courier_money` SET `status` = 2 WHERE `wid` = {$id}");
                    $dsql->dsqlOper($sql, "update");
                }


                updateMemberNotice($uid, "会员-提现申请审核通过", $param, $config);


                //提现失败，减少会员的冻结金额，增加可用余额
            }elseif($state == 2) {
                if($drawtype == 0 ) {
                    if ($usertype == 0) {
                        // 提现失败，记录交易记录
                        $user      = $userLogin->getMemberInfo($uid);
                        $usermoney = $user['money'];
                        $money     = sprintf('%.2f', ($usermoney + $amount));
                        $archives  = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`,`pid`) VALUES ('$uid', '1', '$amount', '提现退回', '$time','member','tixian','$money','$id')");
                        $dsql->dsqlOper($archives, "update");

                        //更新账户余额
                        $archives = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + '$amount', `freeze` = `freeze` - '$amount' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archives, "update");

                        updateMemberNotice($uid, "会员-提现申请审核失败", $param, $config);

                        //积分退回
                        if($point>0){
                            $archivess = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$uid'");
                            $dsql->dsqlOper($archivess, "update");

                            $userpoint = (int)$dsql->getOne($dsql::SetQuery("select `point` from `#@__member` where `id`=".$uid));
                            $archives  = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '1', '$point', '提现退回', '$time','tixian','$userpoint')");
                            $dsql->dsqlOper($archives, "update");
                        }
                    } else {
                        /*骑手*/
                        $archivess = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = `money` + '$amount' WHERE `id` = '$uid'");
                        $dsql->dsqlOper($archivess, "update");
                        $selectsql = $dsql->SetQuery("SELECT `money` FROM  `#@__waimai_courier`  WHERE `id` = '$uid'");           //查询骑手余额
                        $courieMoney = $dsql->dsqlOper($selectsql,"results");
                        $courierMoney = $courieMoney[0]['money'];
                        $date = GetMkTime(time());
                        $info = '提现退回-'.$note;
                        //记录操作日志
                        $insertsql = $dsql->SetQuery("INSERT INTO  `#@__member_courier_money` (`userid`,`type`,`amount`,`info`,`date`,`balance`,`cattype`) VALUES ('$uid','1','$amount','$info','$date','$courierMoney','1')");
                        $dsql->dsqlOper($insertsql,"update");

                        //同步提现记录的状态
                        $sql = $dsql->SetQuery("UPDATE `#@__member_courier_money` SET `status` = 3 WHERE `wid` = {$id}");
                        $dsql->dsqlOper($sql, "update");

                        //初始化日志
                        include_once(HUONIAOROOT."/api/payment/log.php");
                        $_courierOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/courierMoney/'.date('Y-m-d').'.log', true);
                        $_courierOrderLog->DEBUG('courierInsert:'.$insertsql);
                        $_courierOrderLog->DEBUG('骑手提现撤回:'.$amount.'骑手账户剩余:'.$courierMoney);
                    }
                }elseif($drawtype == 1) {
                    $archives = $dsql->SetQuery("SELECT `mgroupid` FROM `#@__member`  WHERE `id` = '$uid'");
                    $res = $dsql->dsqlOper($archives, "results");
                    $cityid = $res[0]['mgroupid'];
                    $archives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$amount' WHERE `cid` = '$cityid'");
                    $dsql->dsqlOper($archives, "update");

                    //增加提现操作日志
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`,`substation`) VALUES ('$uid', '1', '$amount', '提现退回', '$time','$cityid','$amount','siteConfig','','1','tixian','','')");
                    $lastid = $dsql->dsqlOper($archives, "lastid");
                    substationAmount($lastid, $cityid);

                }

            }

        }



        adminLog("更新提现状态", $id);

        echo '{"state": 100, "info": "修改成功！"}';
        exit();

    }else{
        if(!empty($id)) {

            //主表信息
            $archives = $dsql->SetQuery("SELECT * FROM `#@__".$action."` WHERE `id` = ".$id);
            $results = $dsql->dsqlOper($archives, "results");

            if(!empty($results)) {

                $uid        = $results[0]["uid"];
                $usertype   = $results[0]["usertype"] ;
                //用户名
                if ($usertype == 0) {
                    $userSql  = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = " . $uid);
                    $username = $dsql->dsqlOper($userSql, "results");
                    if (count($username) > 0) {
                        $username = $username[0]['username'];
                    } else {
                        $username = "未知";
                    }
                }else{
                    $couriersql = $dsql->SetQuery("SELECT `name` FROM `#@__waimai_courier` WHERE `id` = " . $uid);

                    $courierres = $dsql->dsqlOper($couriersql,"results");

                    if ($courierres) {
                        $username = "骑手：".$courierres[0]['name'];
                    } else {
                        $username = "未知";
                    }
                }

                $bank       = $results[0]["bank"];
                $bankName   = $results[0]["bankName"];
                $cardnum    = $results[0]["cardnum"];
                $cardname   = $results[0]["cardname"];
                $amount     = $results[0]["amount"];
                $tdate      = date('Y-m-d H:i:s', $results[0]["tdate"]);
                $state      = $results[0]["state"];
                $auditstate = $results[0]["auditstate"];
                $rdate      = $results[0]["rdate"];
                $note       = $results[0]["note"];
                $type       = $results[0]["type"];
                $price      = $results[0]["price"];
                $amount_    = $results[0]["shouxuprice"];
                $shouxu     = sprintf("%.2f", $amount_);     //手续费
                $jifen     = $results[0]['point'];     //积分
                $receipt    = $results[0]['receipt'];
                $receipting    = $results[0]['receipting'];
                $receipt_fail_reason    = $results[0]['receipt_fail_reason'];
                if (testPurview("withdrawtransfer")) {

                    $withdrawtransfer = "1";
                }else{

                    $withdrawtransfer = "0";
                }


                if (testPurview("withdrawaudit")) {

                    $withdrawaudit = "1";
                }else{

                    $withdrawaudit = "0";
                }

                $source = $results[0]["source"]; //来源，0网页端 1小程序 2APP

            }else{
                ShowMsg('要修改的信息不存在或已删除！', "-1");
                die;
            }

        }else{
            ShowMsg('要修改的信息参数传递失败，请联系管理员！', "-1");
            die;
        }
    }

    //付款
}elseif($dopost == "transfers") {

    if(!testPurview("withdrawtransfer")) {
        echo '{"state": 200, "info": "对不起，您无权使用此功能！"}';
    }

    if($id) {
        $ret = transfers($id);

        adminLog("操作提现打款", $id);
        
        echo $ret;

    }else{
        echo '{"state": 200, "info": "请选择要操作的信息！"}';
    }
    die;
}
elseif($dopost=="applyReceipt"){
    //根据id查询订单信息
    $sql = $dsql::SetQuery("select * from `#@__member_withdraw` where `id`=$id");
    $orderDetail = $dsql->getArr($sql);
    $bank = $orderDetail['bank'];
    //开始申请电子回单...
    if($bank=="alipay"){
        include_once HUONIAOROOT."/api/payment/alipay/alipayTransfers.php";
        $alipayTransfer = new alipayTransfers();
        $order = array(
            'id'=>$id,
            'order_id'=>$orderDetail['note'],
        );
        $res = $alipayTransfer->applyIncubating($order);
    }
    elseif($bank=="weixin"){
        include HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php";  //加载函数
        $wxpayTransfers = new wxpayTransfers();
        /*0-普通用户,1-骑手*/
        if ($orderDetail['usertype'] == 0) {
            $sql = $dsql->SetQuery("SELECT `realname`, `wechat_openid`, `wechat_mini_openid` FROM `#@__member` WHERE `id` = " . $orderDetail['uid']);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $realname           = $ret[0]['realname'];
                $wechat_openid      = $ret[0]['wechat_openid'];
                $wechat_mini_openid = $ret[0]['wechat_mini_openid'];
            }
        } else {
            $Sql = $dsql->SetQuery("SELECT `name`,`openid` FROM `#@__waimai_courier` WHERE 1=1 AND `id` = " . $orderDetail['uid']);
            $Res = $dsql->dsqlOper($Sql, "results");
            if ($Res) {
                $realname           = $Res[0]['name'];
                $wechat_openid      = '';
                $wechat_mini_openid = $Res[0]['openid'];
            }
        }

        $appId = $wxpayTransfers->appId;
        $app_appId = $wxpayTransfers->app_appId;

        //通过小程序直接登录的，会没有openid，只有mini_openid，这时openid要用小程序的，appid也要用小程序的
        if(!$wechat_openid && $wechat_mini_openid){
            include(HUONIAOINC."/config/wechatConfig.inc.php");
            $wechat_openid = $wechat_mini_openid;
            $app_appId = $cfg_miniProgramAppid;
            $appId = $cfg_miniProgramAppid;
        }

        //请求微信接口，判断转账成功或失败
        $withdrawApply = array(
            'real_name'=>$realname,
            'left_money'=>$orderDetail['amount'],  //金额，单位：分，函数内部还会 * 100
            'batch_no'=>$orderDetail['ordernum'],  //只有一笔，则ordernum是总单号和第一批单号
            'sn'=>$orderDetail['ordernum']
        );
        $userAuth = array(
            'openid'=>$wechat_openid
        );
        //先使用网页，然后使用app
        $pcConfig = array(
            'app_id'=>$appId,
            'cert_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/apiclient_cert.pem',
            'key_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/apiclient_key.pem',
            'mch_id'=>$wxpayTransfers->mch_id,
            'app_key'=>$wxpayTransfers->key,
            'id'=>$orderDetail['id']
        );
        $res = $wxpayTransfers->v3_queryReceipt($withdrawApply,$userAuth,$pcConfig);
        if($res['state']!=100){  //说明未成功，再尝试一次app
            $appConfig = array(
                'app_id'=>$app_appId,
                'cert_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/app/apiclient_cert.pem',
                'key_path'=>HUONIAOROOT.'/api/payment/wxpay/cert/app/apiclient_key.pem',
                'mch_id'=>$wxpayTransfers->app_mch_id,
                'app_key'=>$wxpayTransfers->app_key,
                'id'=>$orderDetail['id']
            );
            $res = $wxpayTransfers->v3_queryReceipt($withdrawApply,$userAuth,$appConfig);
        }
    }
    //返回结果
    echo json_encode($res);die;
}


//自动转账
function transfers($id)
{

    global $dsql;
    global $cfg_withdrawFee;

    $sql = $dsql->SetQuery("SELECT `uid`, `bank`, `cardnum`, `cardname`, `amount`,`type`,`usertype`,`source` FROM `#@__member_withdraw` WHERE `id` = $id AND `state` = 0");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret) {

        $uid      = $ret[0]['uid'];
        $bank     = $ret[0]['bank'];
        $cardnum  = $ret[0]['cardnum'];
        $cardname = $ret[0]['cardname'];
        $amount   = $ret[0]['amount'];
        $drawtype = $ret[0]['type'];
        $usertype = $ret[0]['usertype'];
        $source = $ret[0]['source'];

        $ordernum = create_ordernum();

        //验证类型
        $realname = $wechat_openid = $wechat_mini_openid = '';

        /*0-普通用户,1-骑手*/
        if ($usertype == 0) {
            $sql = $dsql->SetQuery("SELECT `realname`, `wechat_openid`, `wechat_mini_openid`, `wechat_app_openid` FROM `#@__member` WHERE `id` = " . $uid);
            $ret = $dsql->dsqlOper($sql, "results");
            if ($ret) {
                $realname           = $ret[0]['realname'];
                $wechat_openid      = $ret[0]['wechat_openid'];
                $wechat_mini_openid = $ret[0]['wechat_mini_openid'];
                $wechat_app_openid = $ret[0]['wechat_app_openid'];

                if ($bank == 'weixin' && !$wechat_openid && !$wechat_mini_openid) {
                    return '{"state": 200, "info": "提现会员需要先绑定微信账号"}';
                }

                if ($bank == 'weixin' && $source == 2 && !$wechat_app_openid) {
                    return '{"state": 200, "info": "提现会员需要先绑定微信账号"}';
                }
            }
        } else {

            $Sql = $dsql->SetQuery("SELECT `name`,`openid` FROM `#@__waimai_courier` WHERE 1=1 AND `id` = " . $uid);
            $Res = $dsql->dsqlOper($Sql, "results");

            if ($Res) {
                $realname           = $Res[0]['name'];
                $wechat_openid      = '';
                $wechat_mini_openid = $Res[0]['openid'];
                $wechat_app_openid = '';

                if ($bank == 'weixin' && ((!$wechat_openid && $usertype !=1 && !$wechat_mini_openid) || ($usertype == 1 && !$wechat_mini_openid))) {
                    return '{"state": 200, "info": "提现会员需要先绑定微信账号"}';
                }

            }
        }

        if($bank != 'weixin' && $bank != 'alipay') {
            return '{"state": 200, "info": "不支持银行卡在线转账！"}';
        }else{

            //分站提现不需要手续费
            if ($usertype == 0 && $drawtype != 1) {
                $amount_ = $cfg_withdrawFee ? $amount * (100 - $cfg_withdrawFee) / 100 : $amount;
            } else {
                $amount_ = $amount;
            }
            $amount_ = sprintf("%.2f", $amount_);

            //微信提现
            if($bank == "weixin") {
                $order = array(
                'ordernum' => $ordernum,
                'openid' => $wechat_openid,
                'wechat_mini_openid' => $wechat_mini_openid,
                'name' => $realname,
                'amount' => $amount_,
                'wid'=>$id,
                'wechat_app_openid' => $wechat_app_openid,
                );

                include_once HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php";
                $wxpayTransfers = new wxpayTransfers();
                $return = $wxpayTransfers->transfers($order);

                if($return['state'] != 100) {

                    //如果返回值带有不重复字段noretry，则直接打印结果
                    if (isset($return['noretry']) && $return['noretry'] == 1) {
                        return json_encode($return);
                    } else {
                        // 加载支付方式操作函数
                        loadPlug("payment");
                        $payment = get_payment("wxpay");
                        //如果网页支付配置的账号失败了，使用APP支付配置的账号重试
                        if($payment['APP_APPID']){
                            include_once HUONIAOROOT."/api/payment/wxpay/wxpayTransfers.php";
                            $wxpayTransfers = new wxpayTransfers();
                            $return = $wxpayTransfers->transfers($order, true);
                            if($return['state'] != 100) {
                                return json_encode($return);
                            }
                        }else{
                            return json_encode($return);
                        }
                    }

                }
            }else{

                if($realname != $cardname) {
                    return '{"state": 200, "info": "申请失败，提现到的账户真实姓名与实名认证信息不一致！"}';
                }
                $order = array(
                'userid' => $uid,
                'ordernum' => $ordernum,
                'account' => $cardnum,
                'name' => $cardname,
                'amount' => $amount_,
                'id' => $id,
                );

                include_once HUONIAOROOT."/api/payment/alipay/alipayTransfers.php";
                $alipayTransfers = new alipayTransfers();
                $return = $alipayTransfers->transfers($order);

                if($return['state'] != 100) {
                    return json_encode($return);
                }
            }


            $rdate = $return['date'];
            $payment_no = $return['payment_no'];
            $processing = (int)$return['processing'];  //等于1说明在打款中

            $note = $payment_no;
            global  $userLogin;

            //只有余额提现才需要变更账户余额和交易日志
            if(!$drawtype) {
                //扣除冻结金额
                $archives = $dsql->SetQuery("UPDATE `#@__member` SET `freeze` = `freeze` - '$amount' WHERE `id` = '$uid'");
                $dsql->dsqlOper($archives, "update");

                // 申请提现时已经增加过日志，这里不再重复记录
                // $user  = $userLogin->getMemberInfo($uid);
                // $usermoney = $user['money'];
                // $money = sprintf('%.2f',($usermoney - $amount));

                // $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`balance`,`pid`) VALUES ('$uid', '0', '$amount', '$_note', '$rdate','member','tixian','$money','$id')");
                //
                // $dsql->dsqlOper($archives, "update");

            }

            //更新记录状态
            if($processing){
                $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `note` = '$note', `rdate` = '$rdate' WHERE `id` = $id");
            }else{
                $sql = $dsql->SetQuery("UPDATE `#@__member_withdraw` SET `state` = 1, `note` = '$note', `rdate` = '$rdate' WHERE `id` = $id");
            }
            $dsql->dsqlOper($sql, "update");

            //查询提现手续费
            $orderDetail = $dsql->getArr($dsql::SetQuery("select `shouxuprice` 'proportion',`ordernum` from `#@__member_withdraw` where `id`=$id"));
            $proportion = $orderDetail['proportion'];
            $ordernum = $orderDetail['ordernum'];
            //如果有手续费，既然已经提现成功，记录下来
            if(!empty($proportion) && !$processing){
                $sql = $dsql::SetQuery("select `cityid` from `#@__member` where `id`={$uid}");
                $cityid = (int)$dsql->getOne($sql);
                $time = time();
                $info = '提现手续费，提现金额：' . $amount . '，流水号：' . $note;
                $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`ordernum`) VALUES ('{$uid}', '1', '$amount', '$info', '$time','$cityid','0','member',$proportion,'1','tixian','{$ordernum}')");
                $lastid = $dsql->dsqlOper($archives, "lastid");
            }


            //自定义配置
            $param = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "withdraw_log_detail",
            "id"       => $id
            );

            $config = array(
            "username" => $realname,
            "amount" => $amount,
            "date" => date("Y-m-d H:i:s", $rdate),
            "info" => $note,
            "fields" => array(
            'keyword1' => '提现金额',
            'keyword2' => '提现时间',
            'keyword3' => '提现状态'
            )
            );

            updateMemberNotice($uid, "会员-提现申请审核通过", $param, $config);

            return '{"state": 100, "info": "操作成功！"}';

        }

    }else{
        return '{"state": 200, "info": "信息不存在，或已经操作过！"}';
    }
}

//验证模板文件
if(file_exists($tpl."/".$templates)) {

    //js
    $jsFile = array(
    'ui/jquery.dragsort-0.5.1.min.js',
    'admin/member/withdrawEdit.js'
    );
    $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

    $huoniaoTag->assign('action', $action);
    $huoniaoTag->assign('pagetitle', $pagetitle);
    $huoniaoTag->assign('dopost', $dopost);
    $huoniaoTag->assign('id', $id);
    $huoniaoTag->assign('uid', $uid);
    $huoniaoTag->assign('username', $username);
    $huoniaoTag->assign('bank', $bank);
    $huoniaoTag->assign('bankName', $bankName);
    $huoniaoTag->assign('cardnum', $cardnum);
    $huoniaoTag->assign('cardname', $cardname);
    $huoniaoTag->assign('amount', $amount);
    $huoniaoTag->assign('tdate', $tdate);
    $huoniaoTag->assign('state', $state);
    $huoniaoTag->assign('auditstate', $auditstate);
    $huoniaoTag->assign('note', $note);
    $huoniaoTag->assign('type', $type);
    $huoniaoTag->assign('price', $price);
    $huoniaoTag->assign('shouxu', $shouxu);
    $huoniaoTag->assign('jifen', $jifen);
    $huoniaoTag->assign('usertype', $usertype);
    $huoniaoTag->assign('receipt', $receipt);
    $huoniaoTag->assign('receipting', $receipting);
    $huoniaoTag->assign('receipt_fail_reason', $receipt_fail_reason);

    $huoniaoTag->assign('withdrawtransfer', $withdrawtransfer); //打款
    $huoniaoTag->assign('withdrawaudit', $withdrawaudit); // 审核
    $huoniaoTag->assign('rdate', $rdate == 0 ? 0 : date("Y-m-d H:i:s", $rdate));

    $huoniaoTag->assign('source', $source);

    $huoniaoTag->compile_dir = HUONIAOROOT."/templates_c/admin/member";  //设置编译目录
    $huoniaoTag->display($templates);
}else{
    echo $templates."模板文件未找到！";
}
