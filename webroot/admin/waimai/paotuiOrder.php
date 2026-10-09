<?php
/**
 * 订单管理
 *
 * @version        $Id: order.php 2017-5-25 上午10:16:21 $
 * @package        HuoNiao.Order
 * @copyright      Copyright (c) 2013 - 2018, HuoNiao, Inc.
 * @link           https://www.ihuoniao.cn/
 */
define('HUONIAOADMIN', ".." );
require_once(dirname(__FILE__)."/../inc/config.inc.php");
$dsql = new dsql($dbo);
$userLogin = new userLogin($dbo);
$tpl = dirname(__FILE__)."/../templates/waimai";
$huoniaoTag->template_dir = $tpl; //设置后台模板目录
global  $cfg_pointRatio;
$dbname = "paotui_order";
$templates = "paotuiOrder.html";

checkPurview("paotuiOrder");


//确认订单
if($action == "confirm"){
    if(!empty($id)){

      $ids = explode(",", $id);
      foreach ($ids as $key => $value) {
          $date = GetMkTime(time());
          $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `state` = 3, `confirmdate` = '$date' WHERE `state` = 2 AND `id` = $value");
          $ret = $dsql->dsqlOper($sql, "update");

          //消息通知 & 打印
          // printerpaotuiOrder($value);
      }

      adminLog("确认跑腿订单", join('，', $ids));

      echo '{"state": 100, "info": "操作成功！"}';
      die;

    }else{
      echo '{"state": 200, "info": "信息ID传输失败！"}';
      exit();
    }

}

//成功订单
if($action == "ok"){
    if(!empty($id)){

        $inc = HUONIAOINC . "/config/waimai.inc.php";
        include $inc;
        $date = GetMkTime(time());

        //初始化日志
        include_once(HUONIAOROOT."/api/payment/log.php");
        $_paotuiOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/paotuiOrder/'.date('Y-m-d').'.log', true);

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `state` = 1, `okdate` = '$date' WHERE (`state` = 3 OR `state` = 4 OR `state` = 5) AND `id` in ($id)");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){

            //消息通知用户
            $ids = explode(",", $id);
            foreach ($ids as $key => $value) {
                $sql_ = $dsql->SetQuery("SELECT o.`uid`, o.`ordernum`, o.`okdate`,o.`uid`,o.`ordernum`,o.`amount`,o.`cityid`,o.`lng`,o.`lat`,o.`buylng`,o.`buylat`,o.`peidate`,o.`okdate`,o.`point`,o.`peisongid`,o.`tip`,o.`courierfencheng` FROM `#@__paotui_order` o WHERE o.`id` = $value");
                $ret_ = $dsql->dsqlOper($sql_, "results");
                if($ret_){
                    /*平台跑腿订单收入*/
                    $uid        = $ret_[0]['uid'];
                    $ordernum   = $ret_[0]['ordernum'];
                    $amount     = $ret_[0]['amount'];
                    $cityid     = $ret_[0]['cityid'];
                    $lng        = $ret_[0]['lng'];
                    $lat        = $ret_[0]['lat'];
                    $buylng     = $ret_[0]['buylng'];
                    $buylat     = $ret_[0]['buylat'];
                    $peidate    = $ret_[0]['peidate'];
                    $okdate     = $ret_[0]['okdate'];
                    $point      = $ret_[0]['point'];
                    $peisongid  = $ret_[0]['peisongid'];
                    $tip        = $ret_[0]['tip'];
                    $courierfencheng        = $ret_[0]['courierfencheng'];

                    $_paotuiOrderLog->DEBUG("订单信息:" . json_encode($ret_[0]));

                    $sql = $dsql->SetQuery("SELECT `id`, `lng`, `lat`,`cityid`,`getproportion`,`paotuiportion` FROM `#@__waimai_courier` WHERE `id` = $peisongid");
                    $ret = $dsql->dsqlOper($sql, "results");
                    $paotuiportion = 0.00;
                    if ($ret) {
                        $paotuiportion = $ret[0]['paotuiportion'];
                    }

//                    global $siteCityInfo;
//                    $cityid  = $siteCityInfo['cityid'];
//
//                    if($siteCityInfo['cityid'] == ''){
//                        $cityid = $cityid_;
//                    }elseif($cityid_ == ''){
//
//                        $usercityidsql = $dsql->SetQuery("SELECT `cityid` FROM `#@__member` WHERE `id` = '$uid'");
//
//                        $usercityidres = $dsql->dsqlOper($usercityidsql,"results");
//
//                        $cityid  = (int)$usercityidres[0]['cityid'];
//
//                    }
                    /*配送结算*/
                    /*商城距离用户*/
                    $shopjluser = getDistance($buylng, $buylat, $lng, $lat) / 1000;
                    /*骑手完成时间 从骑手接单时间开始计算*/
                    $qsoktime = ($okdate - $peidate) % 86400 / 60;

                    /*骑手额外所得*/
                    $waimaiorderprice = $custom_waimaiorderprice != '' ? unserialize($custom_waimaiorderprice) : array ();
                    /*外卖额外加成要求*/
                    $waimaadditionkm = $custom_waimaadditionkm != '' ? unserialize($custom_waimaadditionkm) : array ();

//                    $courierfencheng = $paotuiportion != '0.00' ? $paotuiportion : $customwaimaiCourierP;

                    $_paotuiOrderLog->DEBUG("订单总金额:" . $amount . "，小费：" . $tip . "，分成比例：" . $courierfencheng);

                    $courreward = ($amount - $tip) * $courierfencheng / 100;
                    sort($waimaadditionkm);
                    $satisfy = $additionprice = 0;
                    for ($i = 0; $i < count($waimaadditionkm); $i++) {
                        if ($shopjluser > $waimaadditionkm[$i][0] && $shopjluser <= $waimaadditionkm[$i][2] && $qsoktime <= $waimaadditionkm[$i][1]) {
                            $satisfy = 1;
                            break;
                        }
                    }

                    if ($satisfy == 1) {

                        for ($a = 0; $a < count($waimaiorderprice); $a++) {

                            if ($amount >= $waimaiorderprice[$a][0] && $amount <= $waimaiorderprice[$a][1]) {
                                $additionprice = $waimaiorderprice[$a][2];
                            }
                        }
                    }
                    $courierarr = array ();

                    $courierarr['peisongTotal']    = $amount;              /*配送费*/
                    $courierarr['courierfencheng'] = $courierfencheng;     /*骑手分成*/
                    $courierarr['shopjluser']      = $shopjluser;          /*商城距离用户*/
                    $courierarr['qsoktime']        = $qsoktime;            /*骑手完成用时*/
                    $courierarr['amount']          = $amount;              /*订单总金额*/
                    $courierarr['additionprice']   = $additionprice;       /*骑手加成所得*/
                    $courierarr['tip']             = $tip;                 /*小费*/

                    $_paotuiOrderLog->DEBUG("gebili:" . json_encode($courierarr));
                    
                    $courierarr = serialize($courierarr);

                    $courreward += $additionprice;
                    $courreward += $tip;    /*小费*/

                    $_paotuiOrderLog->DEBUG("骑手应得：((总金额(" . $amount . ") - 小费(" . $tip . ")) * 分成比例(" . $courierfencheng . " / 100)) + 加成(".$additionprice.") + 小费(".$tip.") = " . $courreward);

                    $waimaiordersql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `courier_gebili` = '$courierarr',`courier_get` = '$courreward'  WHERE `id` = '$id'");
                    $_paotuiOrderLog->DEBUG("waimaiordersql:" . $waimaiordersql);
                    $dsql->dsqlOper($waimaiordersql, "update");


                    $updatesql = $dsql->SetQuery("UPDATE `#@__waimai_courier` SET `money` = `money`+'$courreward' WHERE `id` = '$peisongid'");
                    $_paotuiOrderLog->DEBUG("updatesql:" . $updatesql);
                    $dsql->dsqlOper($updatesql, "update");

                    $selectsql = $dsql->SetQuery("SELECT `money` FROM  `#@__waimai_courier`  WHERE `id` = '$peisongid' AND $key = $key");           //查询骑手余额
                    $courieMoney = $dsql->dsqlOper($selectsql,"results");
                    $courierMoney = $courieMoney[0]['money'];
                    $date = GetMkTime(time());
                    $info ='跑腿收入-订单号-'.$ordernum;
                    //记录操作日志
                    $insertsql = $dsql->SetQuery("INSERT INTO  `#@__member_courier_money` (`userid`,`type`,`amount`,`info`,`date`,`balance`) VALUES ('$peisongid','1','$courreward','$info','$date','$courierMoney')");
                    $dsql->dsqlOper($insertsql,"update");

                    //初始化日志
                    include_once(HUONIAOROOT."/api/payment/log.php");
                    $_courierOrderLog= new CLogFileHandler(HUONIAOROOT . '/log/courierMoney/'.date('Y-m-d').'.log', true);
                    $_courierOrderLog->DEBUG('courierInsert:'.$insertsql);
                    $_courierOrderLog->DEBUG('跑腿收入:'.$courreward.'骑手账户余额剩余:'.$courierMoney);


                    global $cfg_fzwaimaiPaotuiFee;
                    global $userLogin;
                    //分站佣金
                    $fzFee = cityCommission($cityid,'waimaiPaotui');
                    $fztotalAmount_ = ($amount-$courreward) * $fzFee /100;

                    $fzarchives = $dsql->SetQuery("UPDATE `#@__site_city` SET `money` = `money` + '$fztotalAmount_' WHERE `cid` = '$cityid'");
                    $dsql->dsqlOper($fzarchives, "update");
                    $user  = $userLogin->getMemberInfo($uid);
                    $usermoney = $user['money'];
                    $pttotalAmount_ = (float)($amount-$courreward) - (float)$fztotalAmount_;
                    $money = sprintf('%.2f',($usermoney+$amount));
                    /*平台跑腿订单收入*/
                    $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`cityid`,`commission`,`ordertype`,`platform`,`showtype`,`ctype`,`balance`)
                        VALUES ('$uid', '1', '$amount', '外卖跑腿平台收入:$ordernum', '$date','$cityid','$fztotalAmount_','waimai','$pttotalAmount_','1','yongjin','$money')");
//                    $dsql->dsqlOper($archives, "update");
                    $lastid = $dsql->dsqlOper($archives, "lastid");
                    substationAmount($lastid,$cityid);


                    $data = $ret_[0];

                    $uid      = $data['uid'];
                    $ordernum = $data['ordernum'];
                    $okdate   = $data['okdate'];

                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "module"   => "paotui",
                        "id"       => $id
                    );

                    //自定义配置
                    $config = array(
                        "ordernum" => $ordernum,
                        "date" => date("Y-m-d H:i:s", $okdate),
                        "fields" => array(
                          'keyword1' => '订单号',
                          'keyword2' => '完成时间'
                        )
                    );

                    updateMemberNotice($uid, "会员-订单完成通知", $param, $config,'','',0,1);

                    adminLog("跑腿订单设为成功", $ordernum);
                }
            }


            echo '{"state": 100, "info": "操作成功！"}';
            exit();
        }else{
            echo '{"state": 200, "info": "操作失败！"}';
        exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
    exit();
    }
}


//无效订单
if($action == "failed"){
    if(!empty($id)){

      $ids = explode(",", $id);
      foreach ($ids as $key => $value) {
        $sql = $dsql->SetQuery("SELECT o.`uid`, o.`peisongid`, o.`ordernum` FROM `#@__paotui_order` o WHERE o.`id` = $value AND (o.`state` = 2 OR o.`state` = 3 OR o.`state` = 4 OR o.`state` = 5)");
        $ret = $dsql->dsqlOper($sql, "results");
        if($ret){
          $uid      = $data['uid'];
          $peisongid = $ret[0]['peisongid'];
          $ordernum = $ret[0]['ordernum'];

          if($peisongid > 0){
            // aliyunPush($peisongid, "您有一笔订单已取消，不必配送！", "订单号：".$ordernum, "peisongordercancel");
            sendapppush($peisongid, "您有一笔订单已取消，不必配送！", "订单号：".$ordernum, "peisongordercancel");
          }

          //消息通知用户
          $param = array(
              "service"  => "member",
              "type"     => "user",
              "template" => "orderdetail",
              "module"   => "paotui",
              "id"       => $value
          );

          //自定义配置
          $config = array(
              "ordernum" => $ordernum,
              "date" => date("Y-m-d H:i:s", time()),
              "info" => $note,
              "fields" => array(
                  'keyword1' => '订单编号',
                  'keyword2' => '取消时间',
                  'keyword3' => '取消原因'
              )
          );

          updateMemberNotice($uid, "会员-订单取消通知", $param, $config,'','',0,1);

          adminLog("跑腿订单设为无效", $ordernum);

        }

      }

      $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `state` = 7, `failed` = '$note', `failedadmin` = 1 WHERE `id` in ($id)");
      $ret = $dsql->dsqlOper($sql, "update");
      if($ret == "ok"){
        echo '{"state": 100, "info": "操作成功！"}';
        exit();
      }else{
        echo '{"state": 200, "info": "操作失败！"}';
        exit();
      }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
        exit();
    }
}


//设置配送员
if($action == "setCourier"){
    if(!empty($id) && $courier){

        $ids = explode(",", $id);

        $now = GetMkTime(time());
        $date = date("Y-m-d H:i:s", $now);

        $err = array();
        foreach ($ids as $key => $value) {

            $sql = $dsql->SetQuery("SELECT o.`ordernum`, o.`peisongid`, o.`peisongidlog` FROM `#@__$dbname` o WHERE o.`id` = $value");
            $ret = $dsql->dsqlOper($sql, "results");
            if(!$ret) break;

            $ordernum      = $ret[0]['ordernum'];
            $peisongid     = $ret[0]['peisongid'];
            $peisongidlog  = $ret[0]['peisongidlog'];

            // 没有变更
            if($courier == $peisongid) continue;

            $sql = $dsql->SetQuery("SELECT `id`, `name`, `phone`,`paotuiportion` FROM `#@__waimai_courier` WHERE `id` = $peisongid || `id` = $courier");
            $ret = $dsql->dsqlOper($sql, "results");
            if($ret){
                foreach ($ret as $k => $v) {
                    if($v['id'] == $peisongid){
                        $peisongname_ = $v['name'];
                        $peisongtel_ = $v['phone'];
                    }else{
                        $peisongname    = $v['name'];
                        $peisongtel     = $v['phone'];
                        $paotuiportion  = $v['paotuiportion'];
                    }
                }
            }

            if($peisongid){
                // 骑手变更记录
                $pslog = "此订单在 ".$date." 重新分配了配送员，原配送员是：".$peisongname_."（".$peisongtel_."），新配送员是:".$peisongname."（".$peisongtel."）<hr>" . $peisongidlog;
            }else{
                $pslog = "";
            }
            $inc = HUONIAOINC . "/config/waimai.inc.php";
            include $inc;
            $courierfencheng = $paotuiportion != '0.00' ? $paotuiportion : $custompaotuiCourierP ;

            $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `state` = 4, `peisongid` = '$courier', `peisongidlog` = '$pslog',`courierfencheng` = '$courierfencheng' WHERE (`state` = 3 OR `state` = 4 OR `state` = 5) AND `id` = $value");
            $ret = $dsql->dsqlOper($sql, "update");
            if($ret == "ok"){

                //推送消息给骑手
                // aliyunPush($courier, "您有新的跑腿订单", "订单号：".$ordernum, "newfenpeiorder");
                sendapppush($courier, "您有新的跑腿订单", "订单号：".$ordernum, "newfenpeiorder");
                // sendapppush($peisongid, "您有一笔订单已取消，不必配送！", "订单号：".$shopname.$ordernumstore, "", "peisongordercancel");

                if($peisongid){
                    // aliyunPush($peisongid, "您有跑腿订单被其他骑手派送", "订单号：".$ordernum, "peisongordercancel");
                    sendapppush($peisongid, "您有跑腿订单被其他骑手派送", "订单号：".$ordernum, "peisongordercancel");
                }

                adminLog("跑腿订单设置配送员", $ordernum . '=>' . $peisongname);

                //消息通知用户
                $sql_ = $dsql->SetQuery("SELECT o.`uid`, o.`pubdate`,o.`amount`, o.`shop`,c.`name`, c.`phone` FROM `#@__paotui_order` o LEFT JOIN `#@__waimai_courier` c ON c.`id` = o.`peisongid` WHERE o.`id` = $value");
                $ret_ = $dsql->dsqlOper($sql_, "results");
                if($ret_){
                    $data = $ret_[0];

                    $uid           = $data['uid'];
                    $pubdate       = $data['pubdate'];
                    $name          = $data['name'];
                    $phone         = $data['phone'];
                    $amount        = $data['amount'];
                    $shop          = $data['shop'];

                    $param = array(
                        "service"  => "member",
                        "type"     => "user",
                        "template" => "orderdetail",
                        "module"   => "paotui",
                        "id"       => $value
                    );

                    //自定义配置
                    $config = array(
                        "ordernum" => $ordernum,
                        "orderdate" => date("Y-m-d H:i:s", $pubdate),
                        "orderinfo"  => $shop,
                        "orderprice" => $amount,
                        "peisong" => $name . "，" . $phone,
                        "fields" => array(
                            'keyword1' => '订单号',
                            'keyword2' => '订单详情',
                            'keyword3' => '订单金额',
                            'keyword4' => '配送人员'
                        )
                    );

                    updateMemberNotice($uid, "会员-订单配送提醒", $param, $config,'','',0,1);
                }


            }else{
                array_push($err, $value);
            }

        }

        if($err){
            echo '{"state": 200, "info": "操作失败！"}';
            exit();
        }else{
            echo '{"state": 100, "info": "操作成功！"}';
            exit();
        }



    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
    exit();
    }
}


//取消配送员
if($action == "cancelCourier"){
    if(!empty($id)){

        $sql = $dsql->SetQuery("UPDATE `#@__$dbname` SET `state` = 3, `peisongid` = '0' WHERE (`state` = 4 OR `state` = 5) AND `id` in ($id)");
        $ret = $dsql->dsqlOper($sql, "update");
        if($ret == "ok"){

            adminLog("跑腿订单取消配送员", join('，', $id));

            echo '{"state": 100, "info": "操作成功！"}';
        exit();
        }else{
            echo '{"state": 200, "info": "操作失败！"}';
        exit();
        }

    }else{
        echo '{"state": 200, "info": "信息ID传输失败！"}';
    exit();
    }
}


// 退款
if($action == "refund"){

  $userid = $userLogin->getUserID();
  if($userid == -1){
    echo '{"state": 200, "info": "登陆超时"}';
    exit();
  }

  if(empty($id)){
    echo '{"state": 200, "info": "参数错误"}';
    exit();
  }

  $sql = $dsql->SetQuery("SELECT o.`state`, o.`paytype`, o.`uid`, o.`amount`,o.`payprice`, o.`ordernum` shopordernum, l.`ordernum`,o.`balance`,o.`point` FROM `#@__paotui_order` o LEFT JOIN `#@__pay_log` l ON l.`ordernum` = o.`ordernum` WHERE o.`state` = 7 AND o.`paytype` != 'delivery' AND o.`refrundstate` = 0 AND o.`amount` > 0 AND o.`id` = $id ORDER BY l.`id` DESC LIMIT 0,1");
  // echo $sql;die;
  $ret = $dsql->dsqlOper($sql, "results");

  if($ret){

    $value = $ret[0];
    $date  = GetMkTime(time());

    $uid           = $value['uid'];
    $state         = $value['state'];
    $paytype       = $value['paytype'];
    $amount        = $value['amount'];
    $ordernum      = $value['ordernum'];
    $shopordernum  = $value['shopordernum'];
    $payprice      = $value['payprice'];
    $balance       = $value['balance'];
    $point         = $value['point'];

	if (!testPurview("paotuiSucOrderRefund") && $state == 1) {
        // die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

	if (!testPurview("paotuiOrderRefund") && $state == 7) {
        // die('{"state": 200, "info": ' . json_encode("对不起，您无权使用此功能！") . '}');
    };

    $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `refrundstate` = 1, `refrunddate` = '$date', `refrundadmin` = $userid, `refrundfailed` = '' WHERE `id` = $id");
    $ret = $dsql->dsqlOper($sql, "update");
    if($ret != "ok"){
      echo '{"state": 200, "info": "操作失败！"}';
      exit();
    }


    // 余额支付
      $truemoneysy = $amount;

      if(!empty($balance)){

          $sql = $dsql->SetQuery("UPDATE `#@__member` SET `money` = `money` + $balance WHERE `id` = $uid");
          $dsql->dsqlOper($sql, "update");
          // 支付宝
      }
      if($point > 0){
          global  $userLoginp;
          $archives = $dsql->SetQuery("UPDATE `#@__member` SET `point` = `point` + '$point' WHERE `id` = '$uid'");
          $dsql->dsqlOper($archives, "update");
          $user  = $userLogin->getMemberInfo($uid);
          $userpoint = $user['point'];
//          $pointuser  = (int)($userpoint+$point);
          $info = "跑腿退款";
          //保存操作日志
          $archives = $dsql->SetQuery("INSERT INTO `#@__member_point` (`userid`, `type`, `amount`, `info`, `date`,`ctype`,`balance`) VALUES ('$uid', '1', '$point', '$info', ".GetMkTime(time()).",'tuihui','$userpoint')");
          $dsql->dsqlOper($archives, "update");
      }
      $peerpay = 0;
      $refrundno = '';
      $arr = adminRefund('paotui',$peerpay,$paytype,$payprice,$ordernum,$refrundno,$balance,$id);    //后台退款
      $r =$arr[0]['r'];
      $refrunddate = $arr[0]['refrunddate'];
      $refrundno   = $arr[0]['refrundno'];
      $refrundcode = $arr[0]['refrundcode'];
    if($r){

        $sql = $dsql->SetQuery("SELECT `pay_name` FROM `#@__site_payment` WHERE `pay_code` = '".$paytype."'");
        $ret = $dsql->dsqlOper($sql, "results");
        $pay_name = '';
        $pay_namearr = array();

        if(!empty($ret)){
            $pay_name    = $ret[0]['pay_name'];
        }else{
            $pay_name    = $ret[0]["paytype"];
        }

        if($pay_name){
            array_push($pay_namearr,$pay_name);
        }

        if($balance != ''){
            array_push($pay_namearr,'余额');
        }

        if ($point !=''){
            array_push($pay_namearr,'积分');
        }

        if($pay_namearr){
            $pay_name = join(',',$pay_namearr);
        }

        $paramUser = array(
            "service"  => "member",
            "type"     => "user",
            "template" => "orderdetail",
            "action"   => "paotui",
            "id"       => $id
        );
        $urlParam = serialize($paramUser);

        $tuikuan= array(
            'paytype'         => $pay_name,
            'truemoneysy'     => 0,
            'money_amount'    => $balance,
            'point'           => 0,
            'refrunddate'     => $date,
            'refrundno'       => 0
        );
        global  $userLogin;
        $tuikuanparam = serialize($tuikuan);
      //保存操作日志
        if($balance > 0) {
            $user = $userLogin->getMemberInfo($uid);
            $usermoney = $user['money'];
            $info = '跑腿退款：' . $shopordernum . '(余额:' . $balance . ',积分：' . $point . ',现金：' . $payprice . ')';
            $archives = $dsql->SetQuery("INSERT INTO `#@__member_money` (`userid`, `type`, `amount`, `info`, `date`,`ordertype`,`ctype`,`urlParam`,`ordernum`,`tuikuanparam`,`title`,`balance`) VALUES ('$uid', '1', '$amount', '$info', '$date','waimai','tuikuan','$urlParam','$ordernum','$tuikuanparam','跑腿退款','$usermoney')");
            $dsql->dsqlOper($archives, "update");
        }

      $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = $uid");
      $user = $dsql->dsqlOper($sql, "results");
      if($user){
        $param = array(
          "service" => "member",
          "type" => "user",
          "template" => "record"
        );

        //自定义配置
        $config = array(
            "username" => $user['username'],
            "order" => $shopname.$ordernumstore,
            "amount" => sprintf('%.2f',$truemoneysy),
            "fields" => array(
                'keyword1' => '退款状态',
                'keyword2' => '退款金额',
                'keyword3' => '审核说明'
            )
        );

        updateMemberNotice($uid, "会员-订单退款成功", $param, $config,'','',0,1);
      }

      adminLog("跑腿订单退款", $shopordernum);

      echo '{"state": 100, "info": "退款操作成功！"}';
    }else{
      $sql = $dsql->SetQuery("UPDATE `#@__paotui_order` SET `refrundstate` = 0, `refrunddate` = '', `refrundfailed` = '' WHERE `id` = $id");
      $ret = $dsql->dsqlOper($sql, "update");
      echo '{"state": 200, "info": "退款失败，错误码：'.$refrundcode.'"}';
    }

    exit();

  }else{
    echo '{"state": 200, "info": "操作失败，请检查订单状态！"}';
    exit();
  }

}

// $where2 = getCityFilter('`cityid`');
// if ($cityid){
//     $where2 = " AND `cityid` = $cityid";
//     $huoniaoTag->assign('cityid', $cityid);
// }

$where = getCityFilter('o.`cityid`');
$where2 = getCityFilter('`cityid`');
if ($cityid){
    $where .= getWrongCityFilter('o.`cityid`', $cityid);
    $where2 .= getWrongCityFilter('`cityid`', $cityid);
    $huoniaoTag->assign('cityid', $cityid);
}

$peisongids = array();
$sql = $dsql->SetQuery("SELECT `id`, `name` FROM `#@__waimai_courier` WHERE 1=1".$where2." ORDER BY `id`");
$ret = $dsql->dsqlOper($sql, "results");
if($ret){
    foreach ($ret as $key => $value) {
        array_push($peisongids, $value['id']);
    }
}

if(!empty($peisongids) && ($state == 4 && $state == 5 )){
    $where .= " AND o.`peisongid` in (".join(",", $peisongids).")";
}


//配送员
if(!empty($courier_id)){
    $where .= " AND o.`peisongid` = $courier_id";
    $huoniaoTag->assign('courier_id', $courier_id);
}


$state = empty($state) ? 3 : $state;

//订单编号
if(!empty($ordernum)){
  $where .= " AND o.`ordernum` like '%$ordernum%'";
}

//姓名
if(!empty($person)){
  $where .= " AND o.`person` = '%$person%'";
}

//电话
if(!empty($tel)){
  $where .= " AND o.`tel` like '%$tel%'";
}

//地址
if(!empty($address)){
  $where .= " AND o.`address` like '%$address%'";
}

//订单金额
if(!empty($amount)){
  $where .= " AND o.`amount` = '$amount'";
}


//订单状态
$where3 = '';
if($state !== ""){
    $where3= " AND o.`state` = '$state'";
}


if($keyword){
    $where .= " AND (o.`person`  like '%$keyword%' OR o.`ordernum`  like '%$keyword%' OR o.`tel`  like '%$keyword%')";
}


$where1 = "";
if (!empty($start_time)) {
    $start  = GetMkTime($start_time);
    $where1 = "AND o.`paydate` >= $start";
}

if (!empty($end_time)) {
    $end    = GetMkTime($end_time);
    $where1 = $where1 == "" ? "o.`paydate` <= $end" : ($where1 . " AND " . "o.`paydate` <= $end");
}
$pageSize = 15;

$sql = $dsql->SetQuery("SELECT o.`point`,o.`id`, o.`uid`,o.`cityid`,o.`ordernum`, o.`shop`, o.`type`, o.`price`, o.`buyaddress`, o.`state`, o.`person`, o.`tel`, o.`address`, o.`paytype`, o.`pubdate`, o.`okdate`, o.`freight`, o.`tip`, o.`amount`, o.`peisongid`, o.`peisongidlog`, o.`note`, o.`failed`, o.`refrundstate`, o.`refrunddate`, o.`refrundno`, o.`refrundfailed`, o.`refrundadmin`, o.`peerpay`, o.`totime`, o.`gettime` FROM `#@__$dbname` o WHERE 1 = 1".$where.$where1.$where3." ORDER BY o.`id` DESC");

//总条数
$totalCount = $dsql->dsqlOper($sql, "totalCount");
//总分页数
$totalPage = ceil($totalCount/$pageSize);

$p = (int)$p == 0 ? 1 : (int)$p;
$atpage = $pageSize * ($p - 1);
$results = $dsql->dsqlOper($sql." LIMIT $atpage, $pageSize", "results");

$list = array();
foreach ($results as $key => $value) {
  $list[$key]['id']         = $value['id'];
  $list[$key]['uid']        = $value['uid'];

  //用户名
  $userSql = $dsql->SetQuery("SELECT `username`, `nickname` FROM `#@__member` WHERE `id` = ". $value["uid"]);
  $username = $dsql->dsqlOper($userSql, "results");
  if(count($username) > 0){
      $list[$key]["username"] = $username[0]['nickname'] ?: $username[0]['username'];
  }else{
      $list[$key]["username"] = "未知";
  }

  $list[$key]['ordernum']     = $value['ordernum'];
  $list[$key]['shop']         = $value['shop'];
  $list[$key]['type']         = $value['type'];
  $list[$key]['price']        = $value['price'];
  $list[$key]['freight']      = $value['freight'];
  $list[$key]['tip']          = $value['tip'];
  $point                      = $value['point'] / $cfg_pointRatio;                  //积分
  $list[$key]['amount']       = $value['amount'];
  $list[$key]['address']      = $value['address'];
  $list[$key]['buyaddress']   = $value['buyaddress'];
  $list[$key]['state']        = $value['state'];
  $list[$key]['person']       = $value['person'];
  $list[$key]['tel']          = $value['tel'];
  $list[$key]['address']      = $value['address'];

  //判断日期是否为今天
  $dateData1 = GetMkTime(date('Y-m-d', time()));
  $dateData2 = GetMkTime(date('Y-m-d', $value['totime']));

  $list[$key]['totime']       = !$value['totime'] ? '尽快' : ($dateData1 == $dateData2 ? date("H:i", $value['totime']) : ("<font color='#ff0000'>" . date("Y-m-d H:i", $value['totime']) . '</font>'));
  
  $dateData1 = GetMkTime(date('Y-m-d', time()));
  $dateData2 = GetMkTime(date('Y-m-d', $value['gettime']));
  $list[$key]['gettime']      = $dateData1 == $dateData2 ? date("H:i", $value['gettime']) : ("<font color='#ff0000'>" . date("Y-m-d H:i", $value['gettime']) . '</font>');
  
  $list[$key]['cityName']     =  getSiteCityName($value['cityid']);
    $_paytype = '';
    $_paytypearr = array();
    $paytypearr = $value['paytype']!='' ? explode(',',$value['paytype']) : array();

//    if($paytypearr){
//        foreach ($paytypearr as $k => $v){
//            if($v !=''){
//                array_push($_paytypearr,getPaymentName($v));
//            }
//        }
//        if($_paytypearr){
//            $_paytype = join(',',$_paytypearr);
//        }
//    }

    if ($paytypearr) {
        foreach ($paytypearr as $k => $v) {
            if ($v != '') {
                array_push($_paytypearr, getPaymentName($v));
            }
        }
        if ($value['balance'] > 0){
            array_push ($_paytypearr,getPaymentName('money'));
        }
        if ($value['point'] > 0){
            array_push($_paytypearr,getPaymentName('integral'));
        }
        if ($_paytypearr) {
            $_paytype = join(',', array_unique($_paytypearr));
        }
    }

    if($value['peerpay'] > 0){
        $userinfo = $userLogin->getMemberInfo($value['peerpay']);
        if(is_array($userinfo)){
            $_paytype = '['.$userinfo['nickname'].']'.$_paytype.'代付';
        }else{
            $_paytype = '['.$value['peerpay'].']'.$_paytype.'代付';
        }
    }

  $list[$key]['paytype']       = $_paytype;
  // $list[$key]['paytype']      = $value['paytype'] == "wxpay" ? "微信支付" : ($value['paytype'] == "alipay" ? "支付宝" : ($value['paytype'] == "money" ? "余额支付" : ($value['paytype'] == "delivery" ? "货到付款" : $value['paytype']) ) );
  $list[$key]['pubdate']      = $value['pubdate'];
  $list[$key]['okdate']       = $value['okdate'];
  $list[$key]['peisongid']    = $value['peisongid'];
  $list[$key]['peisongidlog'] = $value['peisongidlog'];
  $list[$key]['note']         = $value['note'];
  $list[$key]['failed']       = $value['failed'];
  $list[$key]['refrundstate']  = $value['refrundstate'];
  $list[$key]['refrunddate']   = $value['refrunddate'];
  $list[$key]['refrundno']     = $value['refrundno'];
  $list[$key]['refrundfailed'] = $value['refrundfailed'];

  $paystate = "";
  // 如果订单状态为失败或取消，查询付款结果 0:未付款 1:已付款
  if($value['paytype'] == 'delivery'){
    $paystate = 0;
  }elseif($value['paytype'] == 'money'){
    $paystate = 1;
  }else{
    if($paystate == ""){
      $sql = $dsql->SetQuery("SELECT `state` FROM `#@__pay_log` WHERE `ordernum` = '".$value['ordernum']."' OR `body` = '".$value['ordernum']."' ORDER BY `id` DESC LIMIT 0,1");
      $ret = $dsql->dsqlOper($sql, "results");
      if($ret){
        $paystate = $ret[0]['state'];
      }else{
        $paystate = 0;
      }
    }
  }
  $list[$key]['paystate']     = $paystate;

  $sql = $dsql->SetQuery("SELECT `username` FROM `#@__member` WHERE `id` = ".$value['refrundadmin']);
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){
    $list[$key]['refrundadmin'] = $ret[0]['username'];
  }else{
    $list[$key]['refrundadmin'] = $value['refrundadmin'];
  }


  $sql = $dsql->SetQuery("SELECT `name`, `phone` FROM `#@__waimai_courier` WHERE `id` = ".$value['peisongid']);
  $ret = $dsql->dsqlOper($sql, "results");
  if($ret){
      $list[$key]['peisongname'] = $ret[0]['name'];
      $list[$key]['peisongtel'] = $ret[0]['phone'];
  }
}

$huoniaoTag->assign("state", $state);
$huoniaoTag->assign("list", $list);
$huoniaoTag->assign('keyword', $keyword);
$huoniaoTag->assign("start_time", $start_time);
$huoniaoTag->assign("end_time", $end_time);


$pagelist = new pagelist(array(
  "list_rows"   => $pageSize,
  "total_pages" => $totalPage,
  "total_rows"  => $totalCount,
  "now_page"    => $p
));
$huoniaoTag->assign("pagelist", $pagelist->show());


//查询待确认的订单
$sql = $dsql->SetQuery("SELECT `id` FROM `#@__paotui_order` WHERE `state` = 2");
$ret = $dsql->dsqlOper($sql, "totalCount");
$huoniaoTag->assign("state2", $ret);

//查询已确定的订单
$sql = $dsql->SetQuery("SELECT count(o.`id`) totalCount FROM `#@__paotui_order` o WHERE o.`state` = 3 AND o.`del` = 0 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state3", (int)$ret[0]['totalCount']);

//查询已接单的订单
$sql = $dsql->SetQuery("SELECT count(o.`id`) totalCount FROM `#@__paotui_order` o WHERE o.`state` = 4 AND o.`del` = 0 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state4", (int)$ret[0]['totalCount']);

//查询配送中的订单
$sql = $dsql->SetQuery("SELECT count(o.`id`) totalCount FROM `#@__paotui_order` o WHERE o.`state` = 5 AND o.`del` = 0 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state5", (int)$ret[0]['totalCount']);

//查询成功的订单
$sql = $dsql->SetQuery("SELECT count(o.`id`) totalCount FROM `#@__paotui_order` o WHERE o.`state` = 1 AND o.`del` = 0 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state1", (int)$ret[0]['totalCount']);

//查询失败的订单
$sql = $dsql->SetQuery("SELECT count(o.`id`) totalCount FROM `#@__paotui_order` o WHERE o.`state` = 7 AND o.`del` = 0 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state7", (int)$ret[0]['totalCount']);

//查询取消的订单
$sql = $dsql->SetQuery("SELECT count(o.`id`) totalCount FROM `#@__paotui_order` o WHERE o.`state` = 6 AND o.`del` = 0 ".$where);
$ret = $dsql->dsqlOper($sql, "results");
$huoniaoTag->assign("state6", (int)$ret[0]['totalCount']);


$huoniaoTag->assign('city', $adminCityArr);


//验证模板文件
if(file_exists($tpl."/".$templates)){

    //css
  $cssFile = array(
    'ui/jquery.chosen.css',
    'admin/jquery-ui.css',
    'admin/styles.css',
    'admin/chosen.min.css',
    'admin/ace-fonts.min.css',
    'admin/select.css',
    'admin/ace.min.css',
    'admin/animate.css',
    'admin/font-awesome.min.css',
    'admin/simple-line-icons.css',
    'admin/font.css',
    // 'admin/app.css'
  );
  $huoniaoTag->assign('cssFile', includeFile('css', $cssFile));

    $where = getCityFilter('s.`cityid`');
    $where2 = getCityFilter('`cityid`');

    if ($cityid){
        $where .= getWrongCityFilter('s.`cityid`', $cityid);
        $where2 .= getWrongCityFilter('`cityid`', $cityid);
        $huoniaoTag->assign('cityid', $cityid);
    }

    //配送员
    $courier = array();
    $sql = $dsql->SetQuery("SELECT `id`, `name`, `cityid` FROM `#@__waimai_courier` WHERE `state` = 1 AND `quit` = 0 ".$where2."  ORDER BY `id` ASC");
    $ret = $dsql->dsqlOper($sql, "results");
    if($ret){
        foreach ($ret as $key => $value) {
            array_push($courier, array(
                "id" => $value['id'],
                "name" => $value['name'],
                "cityid" => $value['cityid'],
                "cityname" => getSiteCityName($value['cityid'])
            ));
        }
    }

    //按城市排序
    $count = array();
    foreach ($courier as $key => &$_data) {
        $count[$key] = $_data['cityid'];
    }
    unset($_data); // 释放引用变量
    
    // 按数量从多到少排序
    array_multisort($count, SORT_ASC, $courier);
    
    $huoniaoTag->assign("courier", $courier);

    //js
  $jsFile = array(
    'ui/bootstrap.min.js',
    'ui/chosen.jquery.min.js',
    'ui/jquery-ui.min.js',
    'ui/jquery.form.js',
    'ui/jquery-ui-timepicker-addon.js',
    'admin/waimai/paotuiOrder.js'
  );
  $huoniaoTag->assign('jsFile', includeFile('js', $jsFile));

  $huoniaoTag->display($templates);
}else{
  echo $templates."模板文件未找到！";
}
